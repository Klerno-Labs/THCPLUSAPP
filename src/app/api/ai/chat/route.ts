import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { openai, BUDTENDER_SYSTEM_PROMPT } from "@/lib/openai";
import { prisma } from "@/lib/db";
import { chatMessageSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// ─── POST: AI Chat (Streaming) ──────────────────────────
// Rate limiting should be applied via middleware or edge config
export async function POST(request: NextRequest) {
  try {
    // Allow anonymous chat but derive customerId from session if authenticated
    const session = await auth();

    const body = await request.json();
    const parsed = chatMessageSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: parsed.error.flatten(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message, sessionId, language } = parsed.data;

    // If authenticated, always use session user ID — ignore body's customerId to prevent spoofing
    const customerId = session?.user?.id ?? parsed.data.customerId ?? null;

    // ── Fetch current product catalog ──
    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });

    const catalogContext = products
      .map(
        (p) =>
          `- ${p.name} (ID: ${p.id}) | $${p.price.toFixed(2)} | ${
            p.category.nameEn
          }${p.strainType ? ` | ${p.strainType}` : ""}${
            p.thcPercentage ? ` | THC: ${p.thcPercentage}%` : ""
          }${p.cbdPercentage ? ` | CBD: ${p.cbdPercentage}%` : ""}${
            p.weight ? ` | ${p.weight}` : ""
          }${
            language === "es" && p.descriptionEs
              ? ` | ${p.descriptionEs}`
              : p.descriptionEn
              ? ` | ${p.descriptionEn}`
              : ""
          }`
      )
      .join("\n");

    // ── Load recent chat history (last 10 messages) ──
    const whereClause = customerId
      ? { customerId }
      : sessionId
      ? { sessionId }
      : null;

    let previousMessages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [];

    if (whereClause) {
      const history = await prisma.chatHistory.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      previousMessages = history
        .reverse()
        .map((h) => ({
          role: h.role as "user" | "assistant" | "system",
          content: h.content,
        }));
    }

    // ── Build system prompt with language and catalog ──
    const languageInstruction =
      language === "es"
        ? "\n\nIMPORTANT: Respond in Spanish (Espanol). The customer prefers Spanish."
        : "";

    const systemPrompt = `${BUDTENDER_SYSTEM_PROMPT}${languageInstruction}\n\nCURRENT PRODUCT CATALOG:\n${catalogContext}`;

    // ── Build messages array ──
    const messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [
      { role: "system", content: systemPrompt },
      ...previousMessages,
      { role: "user", content: message },
    ];

    // ── Define tools for function calling ──
    const tools: Array<{
      type: "function";
      function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
      };
    }> = [
      {
        type: "function",
        function: {
          name: "addToCart",
          description:
            "Add a product to the customer's cart. Use this when the customer confirms they want to add a specific product.",
          parameters: {
            type: "object",
            properties: {
              productId: {
                type: "string",
                description: "The ID of the product to add",
              },
              quantity: {
                type: "number",
                description: "The quantity to add (default 1)",
              },
            },
            required: ["productId"],
          },
        },
      },
    ];

    // ── Call OpenAI with streaming ──
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // ── Save user message to history ──
    const saveMsgPromise = prisma.chatHistory.create({
      data: {
        customerId: customerId || null,
        sessionId: sessionId || null,
        role: "user",
        content: message,
      },
    });

    // ── Build streaming response ──
    const encoder = new TextEncoder();
    let fullResponse = "";
    const toolCalls: Array<{
      id: string;
      function: { name: string; arguments: string };
    }> = [];

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            // Handle text content
            if (delta?.content) {
              fullResponse += delta.content;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", content: delta.content })}\n\n`
                )
              );
            }

            // Handle tool calls
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (tc.index !== undefined) {
                  if (!toolCalls[tc.index]) {
                    toolCalls[tc.index] = {
                      id: tc.id || "",
                      function: { name: "", arguments: "" },
                    };
                  }
                  if (tc.id) toolCalls[tc.index].id = tc.id;
                  if (tc.function?.name)
                    toolCalls[tc.index].function.name = tc.function.name;
                  if (tc.function?.arguments)
                    toolCalls[tc.index].function.arguments +=
                      tc.function.arguments;
                }
              }
            }

            // Handle finish reason
            if (chunk.choices[0]?.finish_reason === "tool_calls") {
              for (const tc of toolCalls) {
                if (tc.function.name === "addToCart") {
                  try {
                    const args = JSON.parse(tc.function.arguments);
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: "function_call",
                          name: "addToCart",
                          arguments: {
                            productId: args.productId,
                            quantity: args.quantity || 1,
                          },
                        })}\n\n`
                      )
                    );
                  } catch {
                    console.error("Failed to parse tool call arguments");
                  }
                }
              }
            }
          }

          // Save assistant response to history
          if (fullResponse) {
            await saveMsgPromise;
            await prisma.chatHistory.create({
              data: {
                customerId: customerId || null,
                sessionId: sessionId || null,
                role: "assistant",
                content: fullResponse,
              },
            });
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (err) {
          console.error("Stream processing error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Stream processing failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    const errStatus = error?.status || error?.response?.status;
    console.error("POST /api/ai/chat error:", errMsg, "| status:", errStatus, "| key set:", !!process.env.OPENAI_API_KEY);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat message",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

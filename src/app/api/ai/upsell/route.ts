import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { openai, UPSELL_SYSTEM_PROMPT } from "@/lib/openai";
import { createHash } from "crypto";
import type { AiUpsellSuggestion } from "@/types/app.types";

// ─── POST: AI Upsell Suggestions ────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItemIds } = body as { cartItemIds: string[] };

    if (
      !cartItemIds ||
      !Array.isArray(cartItemIds) ||
      cartItemIds.length === 0
    ) {
      return NextResponse.json(
        { error: "cartItemIds array is required" },
        { status: 400 }
      );
    }

    // ── Generate cache key from sorted cart IDs ──
    const sortedIds = [...cartItemIds].sort().join(",");
    const hash = createHash("sha256").update(sortedIds).digest("hex");
    const cacheKey = `upsell:${hash}`;

    // ── Check Vercel KV cache first (graceful when KV not configured) ──
    try {
      const { kv } = await import("@vercel/kv");
      const cached = await kv.get<AiUpsellSuggestion[]>(cacheKey);
      if (cached) {
        return NextResponse.json({
          suggestions: cached,
          source: "cache",
        });
      }
    } catch {
      // KV not configured — skip cache lookup
    }

    // ── Fetch cart items ──
    const cartProducts = await prisma.product.findMany({
      where: { id: { in: cartItemIds } },
      include: { category: true },
    });

    if (cartProducts.length === 0) {
      return NextResponse.json(
        { error: "No valid products found in cart" },
        { status: 400 }
      );
    }

    // ── Fetch top 20 products for recommendations ──
    const topProducts = await prisma.product.findMany({
      where: {
        inStock: true,
        id: { notIn: cartItemIds },
      },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
      take: 20,
    });

    // ── Build prompt context ──
    const cartContext = cartProducts
      .map(
        (p) =>
          `- ${p.name} | $${p.price.toFixed(2)} | ${p.category.nameEn}${
            p.strainType ? ` | ${p.strainType}` : ""
          }`
      )
      .join("\n");

    const catalogContext = topProducts
      .map(
        (p) =>
          `- ${p.name} (ID: ${p.id}) | $${p.price.toFixed(2)} | ${
            p.category.nameEn
          }${p.strainType ? ` | ${p.strainType}` : ""}${
            p.thcPercentage ? ` | THC: ${p.thcPercentage}%` : ""
          }${
            p.descriptionEn ? ` | ${p.descriptionEn.slice(0, 100)}` : ""
          }`
      )
      .join("\n");

    const userPrompt = `CUSTOMER'S CART:\n${cartContext}\n\nAVAILABLE PRODUCTS:\n${catalogContext}\n\nSuggest 1-2 complementary products as a JSON array: [{ "productId": "...", "name": "...", "reason": "..." }]`;

    // ── Call GPT-4o ──
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: UPSELL_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";

    let suggestions: AiUpsellSuggestion[] = [];
    try {
      const parsed = JSON.parse(rawContent);
      const rawSuggestions = parsed.suggestions || parsed;

      if (Array.isArray(rawSuggestions)) {
        // Enrich suggestions with price and imageUrl from DB
        const suggestedIds = rawSuggestions.map(
          (s: { productId: string }) => s.productId
        );
        const suggestedProducts = await prisma.product.findMany({
          where: { id: { in: suggestedIds } },
        });
        const productMap = new Map(
          suggestedProducts.map((p) => [p.id, p])
        );

        suggestions = rawSuggestions
          .filter((s: { productId: string }) =>
            productMap.has(s.productId)
          )
          .map((s: { productId: string; name: string; reason: string }) => {
            const product = productMap.get(s.productId)!;
            return {
              productId: s.productId,
              name: product.name,
              reason: s.reason,
              price: product.price,
              imageUrl: product.imageUrl || undefined,
            };
          });
      }
    } catch {
      console.error("Failed to parse AI upsell response:", rawContent);
    }

    // ── Cache in Vercel KV for 1 hour (graceful when KV not configured) ──
    if (suggestions.length > 0) {
      try {
        const { kv } = await import("@vercel/kv");
        await kv.set(cacheKey, suggestions, { ex: 3600 });
      } catch {
        // KV not configured — skip caching
      }
    }

    return NextResponse.json({
      suggestions,
      source: "ai",
    });
  } catch (error) {
    console.error("POST /api/ai/upsell error:", error);
    return NextResponse.json(
      { error: "Failed to generate upsell suggestions" },
      { status: 500 }
    );
  }
}

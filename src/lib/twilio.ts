import twilio from "twilio";

function getClient() {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN
  ) {
    return null;
  }
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

interface SendSmsParams {
  to: string;
  body: string;
}

export async function sendSms({ to, body }: SendSmsParams) {
  const client = getClient();
  if (!client) {
    console.log("[Twilio] SMS skipped (not configured):", { to, body: body.slice(0, 50) });
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const createParams: Record<string, string> = { body, to };

    // Prefer Messaging Service SID (handles number rotation + compliance)
    if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      createParams.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    } else if (process.env.TWILIO_PHONE_NUMBER) {
      createParams.from = process.env.TWILIO_PHONE_NUMBER;
    } else {
      console.log("[Twilio] SMS skipped (no from number or messaging service):", { to });
      return { success: false, error: "No sender configured" };
    }

    const message = await client.messages.create(createParams);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("Twilio SMS error:", error);
    return { success: false, error };
  }
}

export function getOrderReadySms(
  orderNumber: string,
  language: string = "en"
): string {
  if (language === "es") {
    return `Tu pedido THC Plus #${orderNumber} está listo! Ven al mostrador con tu ID. ¡Hasta pronto! 🌿`;
  }
  return `Your THC Plus order #${orderNumber} is ready! Head to the counter and bring your ID. See you soon! 🌿`;
}

export function getOrderConfirmedSms(
  orderNumber: string,
  language: string = "en"
): string {
  if (language === "es") {
    return `Tu pedido THC Plus #${orderNumber} ha sido confirmado. Te notificaremos cuando esté listo para recoger. 🌿`;
  }
  return `Your THC Plus order #${orderNumber} has been confirmed. We'll notify you when it's ready for pickup. 🌿`;
}

export function getOrderCancelledSms(
  orderNumber: string,
  language: string = "en"
): string {
  if (language === "es") {
    return `Tu pedido THC Plus #${orderNumber} ha sido cancelado. Visítanos para hacer un nuevo pedido. 🌿`;
  }
  return `Your THC Plus order #${orderNumber} has been cancelled. Visit us to place a new order. 🌿`;
}

export function getOrderExpiredSms(
  orderNumber: string,
  language: string = "en"
): string {
  if (language === "es") {
    return `Tu pedido THC Plus #${orderNumber} ha expirado porque no fue recogido a tiempo. Puedes hacer un nuevo pedido en cualquier momento. 🌿`;
  }
  return `Your THC Plus order #${orderNumber} has expired as it wasn't picked up in time. Feel free to place a new order anytime. 🌿`;
}

export function getPromotionSms(
  title: string,
  body: string,
  language: string = "en"
): string {
  if (language === "es") {
    return `THC Plus: ${title}\n${body}\n\nResponde STOP para darte de baja.`;
  }
  return `THC Plus: ${title}\n${body}\n\nReply STOP to unsubscribe.`;
}

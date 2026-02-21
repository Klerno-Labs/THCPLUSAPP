import twilio from "twilio";

function getClient() {
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
  try {
    const message = await getClient().messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
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

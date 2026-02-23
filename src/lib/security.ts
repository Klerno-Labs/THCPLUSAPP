// Rate limit configuration
export const RATE_LIMITS = {
  orders: { maxRequests: 3, windowMs: 3600000 }, // 3 per hour
  auth: { maxRequests: 5, windowMs: 900000 },     // 5 per 15 min
  api: { maxRequests: 60, windowMs: 60000 },       // 60 per min
} as const;

// Sanitize user input - strip HTML tags
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

// Validate cron secret from request headers
export function validateCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret === "dev-cron-secret") return false;
  return authHeader === `Bearer ${cronSecret}`;
}

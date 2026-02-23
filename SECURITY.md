# Pre-Launch Security Checklist

## Secret Rotation (DO BEFORE GO-LIVE)
- [ ] Generate new NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Generate new CRON_SECRET: `openssl rand -base64 32`
- [ ] Rotate database password in Neon dashboard
- [ ] Rotate Pusher keys in Pusher dashboard
- [ ] Verify OpenAI API key has spending limits set
- [ ] Verify Twilio credentials are production-ready
- [ ] Ensure .env.local is in .gitignore (verify: `git status` should NOT show it)

## Vercel Environment Variables
Set these in Vercel dashboard (Settings > Environment Variables):
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL (set to your production domain)
- CRON_SECRET
- PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
- NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER
- OPENAI_API_KEY
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID, TWILIO_PHONE_NUMBER
- KV_REST_API_URL, KV_REST_API_TOKEN, KV_REST_API_READ_ONLY_TOKEN
- BLOB_READ_WRITE_TOKEN

## Vercel Cron Jobs
Add to vercel.json:
```json
{
  "crons": [
    { "path": "/api/cron/expire-orders", "schedule": "0 */4 * * *" },
    { "path": "/api/cron/expire-deals", "schedule": "0 * * * *" },
    { "path": "/api/cron/expire-redemptions", "schedule": "0 6 * * *" },
    { "path": "/api/cron/loyalty-tiers", "schedule": "0 2 * * 0" },
    { "path": "/api/cron/ai-insights", "schedule": "0 3 * * 1" }
  ]
}
```

## Post-Deploy Verification
- [ ] Test customer signup flow
- [ ] Test guest order flow
- [ ] Test admin login (owner@thcplus.com)
- [ ] Verify product images load
- [ ] Test SMS notifications (place order, check phone)
- [ ] Verify cron jobs are scheduled in Vercel dashboard

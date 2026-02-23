# THC Plus - Store Owner Admin Guide

## Getting Started

### Admin Login
1. Go to `yoursite.com/admin/login`
2. Enter your staff email and password
3. Default credentials (change these after first login):
   - **Owner**: owner@thcplus.com / thcplus2024
   - **Manager**: manager@thcplus.com / staff2024
   - **Staff**: staff@thcplus.com / staff2024

### Staff Roles
| Role | Can Do |
|------|--------|
| **OWNER** | Everything - manage staff, view analytics, manage products, handle orders |
| **MANAGER** | Manage products, handle orders, view analytics, manage customers |
| **STAFF** | Handle orders, view products, basic customer interactions |

---

## Dashboard Overview (`/admin`)

The dashboard shows real-time stats:
- **Today's orders** and revenue
- **Active orders** that need attention
- **Recent orders** list with status
- **Quick actions** to manage the store

---

## Managing Orders

### Order Flow
1. Customer places order online (status: **PENDING**)
2. Staff confirms the order (status: **CONFIRMED**)
3. Staff prepares the order (status: **PREPARING**)
4. Order is ready for pickup (status: **READY**)
5. Customer picks up (status: **PICKED_UP**)

### Order Statuses
| Status | Meaning | Action |
|--------|---------|--------|
| PENDING | New order, not yet reviewed | Confirm or cancel |
| CONFIRMED | Accepted, waiting to prepare | Start preparing |
| PREPARING | Being assembled | Mark as ready |
| READY | Waiting for customer pickup | Mark picked up when customer arrives |
| PICKED_UP | Complete | No action needed |
| CANCELLED | Order was cancelled | No action needed |
| EXPIRED | Auto-expired (not picked up in time) | No action needed |

### Auto-Expiration
Orders that are not picked up are automatically expired by a cron job that runs every 4 hours. This keeps the queue clean.

---

## Managing Products (`/admin/products`)

### Adding a Product
1. Click "Add Product"
2. Fill in: name, category, price, description
3. Optional: THC%, CBD%, strain type, weight, image
4. Set stock status (in stock / out of stock)
5. Toggle "Featured" to show on homepage
6. Save

### Editing Products
- Click any product row to edit
- Update price, stock, description, image, etc.
- Changes appear immediately on the customer site

### Product Images
- Upload images through the product form
- Recommended: square images, at least 500x500px
- Supported formats: JPG, PNG, WebP

---

## Managing Categories

Products are organized into categories:
- Flower (Exotic, Premium, Budget)
- Concentrates
- Pre-Rolls
- Edibles
- Vapes
- Accessories

Categories are shown in the menu filter on the customer site.

---

## Deals & Promotions

### Current Active Deal
- **Pre-Roll Buy 2 Get 1 Free**: Customers who add 3+ pre-rolls to their order get the cheapest one free. This shows as a badge on product cards and a discount in the cart.

### Managing Deals (`/admin/deals`)
- Create time-limited deals
- Set deal type (percentage off, fixed amount, BOGO)
- Target specific categories or products
- Set start and end dates
- Deals auto-expire via cron job

### Promotions (`/admin/promotions`)
- Create promo codes for targeted discounts
- Track usage and redemptions

---

## Loyalty Program

### How It Works
- Customers earn **1 point per item** when their order is picked up
- Points accumulate toward tier status and rewards

### Loyalty Tiers
| Tier | Points Required | Benefits |
|------|----------------|----------|
| SEEDLING | 0 | Basic rewards |
| GROWER | 25 | Unlock concentrate rewards |
| CULTIVATOR | 100 | Unlock flower rewards |
| MASTER_GROWER | 500 | All rewards unlocked |

Tiers are recalculated weekly by a cron job.

### Rewards Catalog
| Reward | Cost | Min Tier |
|--------|------|----------|
| Free Preroll | 25 pts | SEEDLING |
| Free Edible | 50 pts | SEEDLING |
| Free 1g Concentrate | 75 pts | GROWER |
| Free 1/8 Flower | 150 pts | CULTIVATOR |

### Redemptions (`/admin/redemptions`)
- View all pending redemptions
- **Fulfill**: When customer picks up their free item, mark as fulfilled
- **Cancel**: If needed, cancel and points are auto-refunded
- Unfulfilled redemptions auto-expire after 7 days (points refunded)

---

## Customer Management (`/admin/customers`)

- View all registered customers
- See order history, loyalty points, tier
- Search by name or phone
- View customer details and activity

---

## Analytics (`/admin/analytics`)

- **Revenue charts**: Daily, weekly, monthly trends
- **Order volume**: Track how many orders per period
- **Top products**: See what's selling best
- **Customer stats**: New vs returning customers
- **Export data**: Download order and analytics CSV reports from `/admin/export`

---

## Staff Management (`/admin/staff`)

Owner-only feature:
- Add new staff members (email, name, password, role)
- Edit staff roles
- Deactivate staff accounts
- Staff can only log in at `/admin/login`

---

## Notifications

### SMS Notifications (via Twilio)
- Customers receive SMS when order status changes (confirmed, ready, etc.)
- Requires Twilio account with SMS-capable number
- Configure in `.env.local`:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`

### Real-time Updates (via Pusher)
- Admin dashboard updates in real-time when new orders come in
- No page refresh needed
- Configure in `.env.local`:
  - `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
  - `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`

---

## Store Information

### Hours (shown to customers)
- Mon-Sat: 10:00 AM - 9:00 PM
- Sunday: 11:00 AM - 7:00 PM

### Location
5235 N Shepherd Dr, Houston, TX 77018

### Contact
Phone: 346-762-7482

To update store info, edit `src/app/layout.tsx` (structured data) and `src/components/customer/HomeHero.tsx`.

---

## Deployment Checklist

Before going live on Vercel:

### Environment Variables (set in Vercel dashboard)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your production URL (e.g., `https://order.thcplus.com`) |
| `CRON_SECRET` | Secret for cron job authentication |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |
| `PUSHER_APP_ID` | Pusher app ID |
| `PUSHER_KEY` | Pusher key |
| `PUSHER_SECRET` | Pusher secret |
| `PUSHER_CLUSTER` | Pusher cluster |
| `NEXT_PUBLIC_PUSHER_KEY` | Same as PUSHER_KEY |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Same as PUSHER_CLUSTER |
| `OPENAI_API_KEY` | For AI chat and insights (optional) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN (optional) |

### Cron Jobs
Vercel cron jobs are configured in `vercel.json`:
- **expire-orders**: Every 4 hours
- **expire-deals**: Every hour
- **expire-redemptions**: 6 AM daily
- **loyalty-tiers**: 2 AM every Sunday
- **ai-insights**: 3 AM every Monday

### Post-Deploy Verification
1. Visit the homepage - hero and products should load
2. Browse the menu, add items to cart
3. Create a test customer account
4. Place a test order
5. Log into `/admin/login` with your credentials
6. Confirm and fulfill the test order
7. Check that product images load correctly
8. Test SMS notifications (if Twilio is configured)

---

## Troubleshooting

### Products not showing images
- Check that images are in `/public/products/`
- Image filenames must match what's in the database
- Run `npx dotenv-cli -e .env.local -- npx prisma db seed` to re-seed with correct paths

### Orders not expiring
- Check that `CRON_SECRET` is set in Vercel environment variables
- Verify cron jobs are configured in `vercel.json`
- Cron jobs only run on Vercel Pro/Enterprise plans

### Customer can't sign up
- Check `DATABASE_URL` is correct and database is accessible
- Check Neon dashboard for connection issues

### Admin can't log in
- Verify staff user exists: check Neon dashboard or run seed
- Password is hashed - if forgotten, re-seed or manually reset in database

### SMS not sending
- Verify Twilio credentials in environment variables
- Check Twilio dashboard for error logs
- Ensure phone number is SMS-capable

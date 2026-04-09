# Eden Valley

> **Discover your true cognitive nature. Find your complement. Build the impossible.**

Eden Valley is a cognitive matching platform that identifies and connects founders according to their cognitive DNA - distinguishing **Architects** (thinkers, mapmakers) from **Builders** (doers, executors). Inspired by legendary duos like Wozniak & Jobs, Walt & Roy Disney.

## 🚀 Production

**Live URL:** https://edenvalley.at.eu.org

**Admin Dashboard:** https://edenvalley.at.eu.org/admin (token: `eden-valley-admin-secret-token`)

## ✨ Features

### 🧠 Cognitive Diagnostic
- 8-question test based on cognitive psychology
- Scoring algorithm differentiating Thinker vs Doer
- Personalized result with emotional storytelling (Pain → Relief → Revelation)

### 🔐 Signup System with Admin Validation
- User registration with Neon PostgreSQL database
- Admin validation required before account activation
- Neon Auth integration for post-validation login

### 💳 Priority Fast-Track ($49)
- Stripe Payment Link integration
- Automatic 72-hour SLA guarantee
- Refund if SLA missed

### 📧 Automated Emails
- Resend integration for transactional emails
- Welcome emails on validation
- Payment confirmation emails

### 🌐 Internationalization (i18n)
- Support for 7 languages: EN, FR, ES, RU, AR, ZH, JA
- Automatic browser language detection

### 🎵 Premium Audio Experience
- Procedural ambient music (Web Audio API)
- Interactive feedback sounds

### 🔗 Referral System
- Personalized invitation links
- Referral tracking

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router DOM 6 |
| **Database** | PostgreSQL (Neon) |
| **Auth** | Neon Auth |
| **Payments** | Stripe |
| **Email** | Resend |
| **Deployment** | Vercel |

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**

## 🚀 Installation

```bash
git clone https://github.com/Eden-Valley/edenvalley.git
cd edenvalley
npm install
npm run dev
```

## 🔧 Environment Variables

Create `.env.local`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...

# Email
RESEND_API_KEY=re_...

# Admin
ADMIN_TOKEN=your-admin-token

# Cron
CRON_SECRET=your-cron-secret

# Auth
VITE_NEON_AUTH_URL=https://...
```

## 🌐 API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/stats` | GET | User count stats |
| `/api/founders` | POST | Submit founder profile |
| `/api/funders` | POST | Submit funder profile |
| `/api/admin/profiles` | GET | List all profiles (admin) |
| `/api/validate-user` | POST | Validate user profile (admin) |
| `/api/cron/process-refunds` | POST | Process refunds (cron) |
| `/api/stripe/webhook` | POST | Stripe webhook handler |

## 🔒 Security

- ✅ Environment variables excluded from git
- ✅ Input validation
- ✅ Admin token authentication
- ✅ Stripe webhook signature verification

## 👥 Team

- **Founder:** [Kelly Kheir](https://github.com/kellykheir)

## 📞 Contact

contact@edenvalley.com

---

<p align="center">
  <strong>Eden Valley</strong> — Find your half. Build the empire.
</p>

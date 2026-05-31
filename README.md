# Eden Valley

> **From idea to company. One platform. Zero friction.**

Eden Valley is a full-stack company building platform that matches **Thinkers** (visionaries, often ADHD/neurodivergent) with **Doers** (executors, builders), then provides AI-powered tools for every step — from ideation to code to content to funding.

**Mission:** Enable the world's greatest creative geniuses to bring their ideas into reality.

---

## 🚀 Production

**Live URL:** https://edenvalley.at.eu.org  
**Admin Dashboard:** https://edenvalley.at.eu.org/admin

---

## 🧠 Platform Pillars

### 1. Blueprint Studio (Pischon AI)
Conversational AI that guides Thinkers to structure their idea into a visual, ADHD-friendly Blueprint — cards, not documents.

### 2. Euphrates (Matching Engine)
Algorithm matches Thinker ↔ Doer by cognitive complementarity. After match, Lead Doer can recruit additional team members (10% equity pool).

### 3. Pischon AI (Full-Stack Assistant)
- **Coding Agent** — generates MVP for software projects
- **Distribution Strategist** — go-to-market + content strategy
- **Content Creator** — connects to gen models via MCP (video, image, music)
- **Execution Engine** — micro-tasks, dopamine-friendly deadlines

### 4. Havila (2-Phase Funding)
- **Phase 1: Crowdfunders** — support from team formation to MVP/GTM
- **Phase 2: VC/Angels** — invest after validated traction
- Crowdfunders get 20% of 1% of raised funds

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router DOM 6 |
| **Database** | PostgreSQL (Neon) |
| **Auth** | Neon Auth + Magic Links |
| **Payments** | Stripe |
| **Email** | Resend |
| **AI** | LLM (GPT-4/Claude) + RAG |
| **Content** | MCP Gateway (Runway, Midjourney, etc.) |
| **Deployment** | Vercel |

---

## ✨ Current Features (Validation Phase)

- ✅ Cognitive diagnostic test (Thinker vs Doer)
- ✅ Signup with admin validation flow
- ✅ Stripe $49 priority fast-track
- ✅ Automated emails (accept, reject, refund)
- ✅ Admin dashboard for profile review
- ✅ 7-language i18n (EN, FR, ES, RU, AR, ZH, JA)
- ✅ Procedural ambient audio
- ✅ GoFundMe crowdfunding widget

---

## 🗺️ Roadmap

| Sprint | Focus |
|--------|-------|
| 1-2 | Security + Member Dashboard + Blueprint CRUD |
| 3-4 | Blueprint Studio UI + Pischon conversational guide |
| 5-6 | Euphrates matching + Team assembly |
| 7-8 | Coding Agent + MCP Gateway |
| 9-10 | Havila Crowd Phase 1 + VC Phase 2 |
| 11-12 | Pischon Distribution + Content + Memory |

---

## 📦 Installation

```bash
git clone https://github.com/Eden-Valley/edenvalley.git
cd edenvalley
npm install
npm run dev
```

### Environment Variables

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

# Auth (Neon)
VITE_NEON_AUTH_URL=https://...
```

---

## 📁 Project Structure

```
api/                  # Vercel Serverless API
├── index.ts          # Production API (580 lines, needs refactor)
├── server.js         # Local dev Express server
└── package.json
src/
├── pages/            # React pages (Home, Auth, Admin, Test, etc.)
├── components/       # UI components (shadcn-based)
├── hooks/            # Custom hooks (audio, scroll, i18n)
├── i18n/             # 7-language internationalization
├── lib/              # Utilities
├── services/         # API services
└── audio/            # Procedural audio engine
```

---

## 🔒 Security

- ✅ `.gitignore` excludes secrets
- ✅ SQL injection protection (parameterized queries)
- ✅ Stripe webhook signature verification
- ⚠️ Known issues: `Math.random()` in token generation, no rate limiting, no input validation library — see FUNDRAISING_PLAN.md sprint 1

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| `edenvalley.md` | Master Plan v2 — full platform architecture |
| `EXECUTIVE_SUMMARY.md` | For investors and backers |
| `FUNDRAISING_PLAN.md` | $150K raise details + 2-phase funding model |
| `T&D_paradigm.md` | Thinker & Doer cognitive research |

---

## 👥 Team

- **Founder:** [Kelly Kheir](https://github.com/kellykheir)

---

## 📞 Contact

**Live:** https://edenvalley.at.eu.org

---

<p align="center">
  <strong>Eden Valley</strong> — Find your half. Build the empire.
</p>

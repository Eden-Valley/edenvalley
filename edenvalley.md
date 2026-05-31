# Eden Valley — Master Plan v2
## Full-Stack Company Building Platform for Neurodivergent Founders

---

## Executive Summary

**Mission:** Enable the world's greatest creative geniuses to bring their ideas into reality by matching them with execution partners wired for implementation, then providing AI-powered tools for every step — from idea to code to content to funding.

**Vision:** A full-stack platform where neurodivergent visionaries (ADHD/Autism/Dyslexia) find their execution counterpart, build their product (software or not), create their content strategy, and access funding — all in one ecosystem.

**Positioning:** The world's first neurodivergent startup incubator — where executive dysfunction meets execution excellence, and where AI bridges the gap from ideation to distribution.

---

## 1. The Problem

### Executive Dysfunction

**Executive dysfunction** is the inability to move from idea to concrete action. It's not laziness. It's neurological.

### The 5 ADHD Barriers

| Barrier | Symptom | Startup Impact |
|---------|---------|----------------|
| **Task Initiation** | Can't start despite motivation | Idea stays in head or notes |
| **Working Memory** | Forgets priority when switching | Loses strategic thread |
| **Dopamine Regulation** | Needs artificial urgency to act | Procrastinates until crisis |
| **Emotion Regulation** | Intense frustration paralyzes | Abandons at first obstacle |
| **Time Blindness** | Can't feel time passing | Missed deadlines, broken promises |

### The Key Stat

> **Entrepreneurs are 6x more likely to have ADHD** than the general population — but **80%** have professional difficulties related to executive dysfunction.

### The Missing Pieces

Current platforms only solve **one** piece:
- CoFoundersLab → Matching only
- Y Combinator → Funding only
- Upwork → Freelancers only
- No-code tools → Building only

**None** provide the full chain: **Idea → Match → Build → Content → Distribution → Funding**

---

## 2. The Solution: Eden Valley Platform

### The Four Rivers (Platform Pillars)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   VISIONNAIRE (ADHD/INTJ)              BÂTISSEUR (Executor/Doer)        │
│         ↓                                       ↓                       │
│   ┌─────────────────┐              ┌────────────────────┐               │
│   │  BLUEPRINT       │              │  TEAM ASSEMBLY     │               │
│   │  STUDIO          │              │  + EXECUTION        │              │
│   │  (Pischon guide) │              │  (recruit team)     │              │
│   └────────┬────────┘              └────────┬───────────┘               │
│            └──────────────┬─────────────────┘                           │
│                           ↓                                             │
│                    ┌──────────────┐                                     │
│                    │  EUPHRATES   │                                     │
│                    │   MATCHING   │                                     │
│                    └──────┬───────┘                                     │
│                           ↓                                             │
│                    ┌──────────────┐                                     │
│                    │  PISCHON AI  │ ← Team Assistant                    │
│                    │  + CODING    │ ← Vibecoding Agent                 │
│                    │  + DISTRIB   │ ← Content/Distribution Strategy     │
│                    └──────┬───────┘                                     │
│                           ↓                                             │
│                    ┌──────────────┐                                     │
│                    │   HAVILA     │                                     │
│                    │   FUNDING    │                                     │
│                    ├──────────────┤                                     │
│                    │ CROWD phase1 │ ← From team formation               │
│                    │ VC/Angel ph2 │ ← After MVP/GTM ready              │
│                    └──────────────┘                                     │
│                                                                          │
│   ──────────── MCP ECOSYSTEM ────────────                               │
│   Gen Video │ Gen Image │ AI Models │ Grants/Partners                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Blueprint Studio (For Thinkers/ADHD)

### Concept

A **Blueprint** is not a business plan. It's a **neurodivergent-friendly visual canvas** that captures the essence of an idea without overwhelming detail.

Pischon guides the Visionnaire through a **conversation**, not a form:

```
Pischon: "What's your idea in one sentence?"
You: "A platform connecting street musicians to producers"

Pischon: "Interesting! Why YOU?"
         "What do you see that others don't?"
         "What's your natural hyperfocus area here?"

→ Gradually, Pischon structures automatically:

┌─────────────────────────────────────┐
│  BLUEPRINT : StreetConnect          │
│                                     │
│  🎯 Vision: Democratize street      │
│     music talent discovery          │
│                                     │
│  🔥 Problem: 80% of street          │
│     musicians have no online        │
│     visibility                      │
│                                     │
│  💡 Solution: Geo-tagged app        │
│     for performance discovery       │
│                                     │
│  🧠 ADHD Superpower: Pattern        │
│     detection of high-traffic       │
│     locations                       │
│                                     │
│  🏗️ Milestones:                    │
│     S1: MVP mobile (scan+profile)   │
│     S2: Matching algorithm          │
│     S3: Payment tipping             │
└─────────────────────────────────────┘
```

### Visual Design (ADHD-Optimized)

- **Card-based** — each section is a movable card, not endless scroll
- **Auto-save** — every character saved instantly (fear of losing work)
- **Hyperfocus mode** — full screen, no notifications, Pomodoro timer
- **Progress gamification** — visual progress, not percentages
- **Pischon assists** — "Stuck? Here are 3 questions to ask yourself..."

### Blueprint Schema

```json
{
  "id": "uuid",
  "visionnaire_id": "uuid",
  "status": "draft | published | matched | building | funded",
  "core": {
    "one_liner": "string (max 280)",
    "problem": "string (max 500)",
    "solution": "string (max 500)",
    "why_me": "string (max 500)",
    "adhd_superpower": "string"
  },
  "execution": {
    "milestones": [
      { "name": "string", "deadline": "date", "key_result": "string" }
    ],
    "resources_needed": ["string"],
    "doer_qualities_required": ["string"],
    "is_software": "boolean"
  },
  "funding": {
    "target": "number",
    "use_of_funds": "string",
    "traction": "string"
  }
}
```

---

## 4. Euphrates — Matching Engine

### Principle

Always **opposites**: Thinker ↔ Doer. Never same-type matching. The algorithm finds **cognitive complementarity**.

### Input Data

| Source | Data |
|--------|------|
| Cognitive test | Thinker/Doer + confidence score |
| Blueprint | Sector, stage, needs |
| User profile | Skills, experience, availability |
| Preferences | Team size, remote/onsite |

### Algorithm

```
Match Score = 
  (type_complementarity × 0.35) +
  (sector_alignment × 0.25) +
  (skill_gap_fill × 0.25) +
  (availability_match × 0.15)
```

### Matching Flow

```
1. Visionnaire publishes Blueprint
2. Doers browse and apply to Blueprints
3. Pischon helps filter: "This Doer shipped 3 similar projects"
4. Visionnaire chooses ↔ Doer accepts
5. Co-founder contract generated (42.5/42.5)
6. TEAM CREATED → status "Matched"
7. Access to Havila Crowd Phase 1 opens
```

---

## 5. Team Assembly (Post-Match)

After the core match, the Doer (Lead Bâtisseur) can **recruit the rest of the team**:

```
┌────────────────────────────────────────────────────┐
│  Core Team (after Euphrates match)                  │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ VISIONNAIRE  │  │ BÂTISSEUR   │                │
│  │ (42.5%)      │  │ Lead Doer    │                │
│  │              │  │ (42.5%)      │                │
│  └──────────────┘  └──────┬───────┘                │
│                            ↓                        │
│  ┌──────────────────────────────────────────┐       │
│  │  TEAM DOERS (10% equity pool)             │       │
│  │  ├─ Frontend developer                    │       │
│  │  ├─ UI/UX Designer                       │       │
│  │  ├─ Growth marketer                      │       │
│  │  ├─ Data scientist                       │       │
│  │  └─ Content / Social media               │       │
│  └──────────────────────────────────────────┘       │
└────────────────────────────────────────────────────┘
```

Tools for the Lead Doer:
- Publish **mission offers** on the platform
- Browse **Doer profiles** by skill
- Propose **equity shares** from the 10% pool
- Pischon coordinates task assignment

---

## 6. Pischon AI — The All-in-One Assistant

### Architecture

```
┌──────────────────────────────────────────┐
│           PISCHON AI CORE                │
├──────────────────────────────────────────┤
│  LLM (GPT-4/Claude) + RAG (Blueprints)   │
│  + Memory Layer (decision history)       │
│  + Task Engine (micro-tasks)             │
├──────────────────────────────────────────┤
│  Specialized Modules:                    │
│                                          │
│  1. BLUEPRINT STUDIO                     │
│     → Conversational guide               │
│     → Visual card-based editor           │
│     → Standard format export             │
│                                          │
│  2. CODING AGENT                         │
│     → For software projects              │
│     → MVP code generation                │
│     → GitHub integration                 │
│     → "Vibecode" the product             │
│                                          │
│  3. EXECUTION ENGINE                     │
│     → Milestones → micro-tasks           │
│     → Dopamine-friendly deadlines        │
│     → Progress tracking                  │
│     → Context reminders                  │
│                                          │
│  4. DISTRIBUTION STRATEGIST              │
│     → Go-to-market plan                  │
│     → Content strategy                   │
│     → Social media calendar              │
│     → SEO/ASO basics                     │
│                                          │
│  5. CONTENT CREATOR (via MCP)            │
│     → Gen-video model connection         │
│     → Gen-image model connection         │
│     → Marketing asset generation         │
│     → Video scripts, visuals, copy       │
│                                          │
│  6. MEMORY & CONTEXT                     │
│     → Decision history                   │
│     → "Why did we choose this?"          │
│     → Recurring blockage patterns        │
│                                          │
└──────────────────────────────────────────┘
```

### Coding Agent — Details

For **software projects**, Pischon's coding agent:

```
Blueprint: "Street musician discovery app"

Pischon Coding Agent:
1. Analyze Blueprint → technical specs
2. Generate stack: React Native + Supabase + Stripe
3. Create GitHub repo with structure
4. Scaffold MVP: auth, profiles, matching
5. Lead Doer (or dev Doer) takes over
6. Iterate: "add chat", "change theme", "add payment"
```

For **non-software projects** (restaurant, fashion, event):
- Visual Blueprint serves as **clear specification document**
- Pischon generates **detailed spec docs**
- No coding needed → focus on business execution

### MCP Ecosystem

Pischon connects to external models via **MCP (Model Context Protocol)**:

```
Pischon ←→ MCP Gateway ←→ Gen Video (Runway/Pika)
                         ←→ Gen Image (Midjourney/DALL-E)
                         ←→ Gen Music (ElevenLabs/Suno)
                         ←→ Gen Voice (ElevenLabs)
                         ←→ Analytics (Mixpanel/PostHog)
                         ←→ CRM (HubSpot)
                         ←→ Grants APIs

Example:
"Pischon, generate a 30s pitch video for my Blueprint"
→ Pischon analyzes Blueprint
→ Sends prompt to Runway via MCP
→ Gets video back
→ Team can tweet / TikTok / LinkedIn it
```

---

## 7. The Full "Zero to Company" Flow

```
                    LANDING PAGE (/)
                         │
                    ┌────┴────┐
                    │         │
               "I FOUND"  "I FUND"
                    │         │
              COGNITIVE TEST   │
                    │         │
            ┌───────┴──────┐  │
            │              │  │
         THINKER        DOER  │
            │              │  │
     BLUEPRINT STUDIO    APPLY│
       (Pischon guide)   TO  │
            │           BLUEP│
            │           RINTS │
            └──────┬───────┘  │
                   │          │
              EUPHRATES       │
              MATCHING        │
                   │          │
         ┌─────────┴────────┐ │
         │                  │ │
    THINKER + DOER     RECRUIT
    = CORE TEAM        MORE DOERS
    (42.5/42.5)        (10% pool)
         │                  │
         └────────┬─────────┘
                  │
         ┌────────┴────────┐
         │                 │
    SOFTWARE?         NON-SOFTWARE?
         │                 │
    PISCHON CODING   BLUEPRINT VISUAL
    AGENT → MVP     → Clear specs
         │                 │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │                 │
    PISCHON DISTRIBUTION STRATEGIST
    → Go-to-market plan
    → Content strategy
    → Video/image assets via MCP
    → Social media calendar
                  │
         ┌────────┴────────┐
         │                 │
    HAVILA FUNDING
    ─────────────────────
    PHASE 1 : CROWDFUNDERS
    → From team formation
    → Support the project
    → Early access: "I back this team"
    → Until MVP / Go-to-Market ready
    ─────────────────────
    PHASE 2 : VC / ANGELS
    → Validated team
    → Product with traction/users
    → Visible only after Phase 1
                  │
                  ↓
           COMPANY BUILT
           via Eden Valley
     (Full-stack: idea → code → content → funding)
```

---

## 8. Havila — Two-Phase Funding

### The Problem It Solves

VCs don't want ideas. They want **teams that have already built something**.

Crowdfunders want to **support early** and be **recognized**.

### Solution

```
PHASE 1 : CROWDFUNDING (from team formation)
────────────────────────────────────────────────────
When: As soon as Thinker + Doer are matched
What: Crowdfunders see the team + Blueprint
Why:
- Team needs cash to start (tools, hosting, etc.)
- Social validation: "X people believe in this"
- Reward: early access, naming, merch, 20% of 1% of raised

Rewards:
├─ $10  : "Supporter" → newsletter + updates
├─ $50  : "Backer" → early access + Wall of Supporters
├─ $100 : "Builder" → + T-shirt + Discord access
├─ $500 : "Visionary" → + 1:1 call + naming in Blueprint
└─ $1000: "Founder's Circle" → + 20% of 1% of raised funds

PHASE 2 : VC / ANGELS (after MVP/GTM ready)
────────────────────────────────────────────────────
When: MVP shipped, first users, traction
What: VCs see structured teams with:
- Validated Blueprint
- Functional MVP (software) or clear specs (non-software)
- Distribution strategy ready (Pischon)
- Marketing content generated (MCP)
- Early crowdfunders = social proof
Why VCs love it:
- Pre-built team (Thinker + Doer already in place)
- Co-founder conflict risk reduced
- Product started (not just slides)
- Community validation
```

### Havila Dashboard

```
For the team:
/team/{id}/havila
├── Funding Progress: "$2,500 / $50,000 raised"
├── Crowdfunders list: "24 backers"
├── Rewards management
└── "Ready for VCs?" → checklist

For the crowdfunder:
/fund/crowd/explore
├── Browse Phase 1 teams
├── Filter by sector, stage
├── Back a team
└── Track their progress

For the VC:
/fund/pro/explore
├── Browse Phase 2 teams only
├── Due diligence pack (Pischon generated)
├── Team interview booking
└── Investment terms
```

---

## 9. What Pischon + MCP Enables: Full-Stack Company Building

A company created via Eden Valley has EVERYTHING:

| Need | Pischon Solution |
|------|------------------|
| **Idea → Structure** | Blueprint Studio |
| **Co-founder** | Euphrates Matching |
| **Team** | Team Assembly (10% pool) |
| **Code (software)** | Coding Agent → MVP |
| **Specs (non-software)** | Visual Blueprint → Documents |
| **Distribution strategy** | Pischon Distribution Strategist |
| **Video content** | MCP → Runway/Pika |
| **Image content** | MCP → Midjourney/DALL-E |
| **Music content** | MCP → Suno/ElevenLabs |
| **Social media calendar** | Pischon Content Scheduler |
| **Pitch deck** | Pischon generates from Blueprint |
| **Budget / Finance** | Pischon Financial Planner |
| **Early funding** | Havila Crowd Phase 1 |
| **Scale funding** | Havila VC Phase 2 |
| **Grants / Partners** | Pischon Grants Finder (API) |

> **One platform. One team. Zero friction. From idea to company.**

---

## 10. Team Structure & Equity

### Roles

**1. The Visionnaire (1 per startup) — 42.5%**
- Owner of the idea and strategic Blueprint
- Responsible for vision, innovation, product decisions
- Often neurodivergent (ADHD/Autism/Dyslexia)

**2. The Lead Doer (1 per startup) — 42.5%**
- Co-founder with equal decision power
- Responsible for execution, operations, team assembly
- Recruits and coordinates other Doers

**3. Other Doers (0 to N per startup) — 10% pool**
- NOT co-founders — join as team members
- Pool distributed by contribution (2-4 year vesting)
- Can be: developers, designers, marketers, ops

### Complete Equity Structure

```
┌─────────────────────────────────────────────────────────┐
│                    EQUITY TOTAL                         │
├─────────────────────────────────────────────────────────┤
│  Visionnaire          │  42.5%  │ Co-founder            │
│  Lead Doer            │  42.5%  │ Co-founder            │
│  ─────────────────────┼─────────┼───────────────────────│
│  Pool Team Doers      │  10%    │ For other Doers       │
│  Eden Valley          │   5%    │ Incubator             │
├─────────────────────────────────────────────────────────┤
│  TOTAL                │ 100%    │                       │
└─────────────────────────────────────────────────────────┘
```

---

## 11. Business Model

### Revenue Per Startup

| Source | Amount | Detail |
|--------|--------|--------|
| **Eden Valley Equity** | **5%** of startup | Taken at incorporation, locked by smart contract |
| **Team Doers Pool** | **10%** of startup | For team members (2-4 year vesting) |
| **Funds Raised** | **1%** of funds raised | Per funding round |
| **of which crowdfunder return** | **20%** of that 1% | Returned to early crowdfunders |

### Example

- Startup raises $1M → Eden Valley takes 1% = $10K
- 20% of $10K = $2K returned to crowdfunders
- Eden Valley keeps $8K + 5% equity in the startup
- Other Doers share the 10% pool based on contribution

### AI / MCP Revenue

- Usage-based for gen models (markup on API costs)
- Partnerships with MCP providers (revenue share)
- Government grants for neurodiversity + tech R&D

---

## 12. Costs & Funding Necessity

### Why We Need Funding

| Item | Monthly Cost | Why |
|------|-------------|-----|
| **LLM API** (GPT-4/Claude) | $2K-5K | Pischon + Coding Agent |
| **Gen models** (via MCP) | $1K-3K | Video, image per team |
| **Vector DB** (Pinecone) | $500-1K | RAG + Memory |
| **Infra** (Vercel + Neon) | $200-500 | Scaling |
| **Devs** | $10K-20K | 2-3 developers |
| **Total** | ~$15K-30K/mo | |

### Partnerships / Grants

- **Open source AI grants** (if we open-source Pischon core)
- **MCP provider partnerships** (revenue share)
- **Government innovation grants** (neurodiversity + tech)
- **Accelerator programs** (OpenAI, Microsoft for Startups)

---

## 13. Current State (Validation Phase)

**What exists in production today:**

```
Landing (/) → Cognitive test → Thinker/Doer result → Signup form (Neon DB)
                                                    → Stripe $49 priority
                                                    → Admin review → Email magic link → Auth
```

**Stack:** React 18 + Vite + Tailwind/shadcn + Neon DB + Stripe + Resend + Vercel

**What's missing:** After validation → `/auth` → lands on **public homepage**. No dashboard, no tools, no matching. It's a lead collection site, not a platform.

---

## 14. Execution Roadmap

### Sprint 1-2: Stabilization + Security
```
🔴 Fix vulnerabilities (crypto tokens, rate limiting, input validation)
🔴 Basic member dashboard after /auth
🔴 Blueprint CRUD (API + DB)
🟡 Refactor API (currently 580 lines of if/else)
```

### Sprint 3-4: Blueprint + Pischon Base
```
🔴 Blueprint Studio UI (visual cards)
🔴 Pischon conversational MVP (guide creation)
🔴 Blueprint standard format export
🟡 Zod schemas validation
```

### Sprint 5-6: Euphrates + Team Assembly
```
🔴 Matching algorithm (sector + type)
🔴 Profile discovery UI
🔴 Request system (apply/accept)
🔴 Team assembly (publish offers, 10% pool)
🔴 Notifications
```

### Sprint 7-8: Coding Agent + MCP
```
🔴 Coding Agent MVP (basic project generation)
🔴 GitHub integration
🔴 MCP Gateway (model connections)
🔴 Basic gen content (image + video)
```

### Sprint 9-10: Havila Funding
```
🔴 Havila Crowd Phase 1
🔴 Rewards system
🔴 Multiple Stripe Payment Links
🔴 Crowdfunder dashboard
🔴 Havila Pro Phase 2 (VC filter)
```

### Sprint 11-12: Pischon Deep
```
🔴 Distribution Strategist
🔴 Content Calendar/Generator
🔴 Grants Finder (partner APIs)
🔴 Memory Layer (full RAG)
🔴 Mobile PWA
```

### Phase 2: After Funding ($150K+)
```
🔴 Dedicated Pischon team
🔴 Native mobile app
🔴 On-chain smart contracts
🔴 Physical sanctuary booking
🔴 Genesis summit
```

---

## 15. Competitive Differentiation

| | Traditional Incubators | CoFoundersLab | Eden Valley |
|---|---|---|---|
| **Matching** | None | Skills-based | Passion + cognitive complement |
| **Post-match support** | Mentorship | None | Pischon AI (24/7) |
| **Building tools** | None | None | Coding Agent + MCP |
| **Content/Distribution** | None | None | Pischon Strategist + MCP Gen |
| **Funding** | Demo day | None | Havila 2-phase (Crowd → VC) |
| **Equity** | 7% YC | None | 5% + 10% team pool |
| **Neurodivergent focus** | None | None | Core identity |
| **Mobile-first** | No | No | PWA then native |

---

## 16. Success Metrics

### Phase 1: Validation (Current)
- 10+ validated founder pairs
- 2+ teams ready for funding showcase
- 100+ email captures

### Phase 2: Crowdfunding
- $150K raised
- 500+ backers
- 25+ teams in beta

### Phase 3: Scale
- 100+ active founding teams
- 5+ funded ventures
- 2+ exits or significant funding rounds

### Phase 4: Sanctuary
- Physical campus operational
- 50+ resident Visionnaires/year
- 1000+ neurodivergent founders empowered
- $1B+ value created by alumni

---

## 17. Vision: The Physical Sanctuary (Future)

### 2030 and Beyond

Eden Valley evolves from digital platform to **physical sanctuary** — a place where the world's greatest neurodivergent geniuses come to let their creativity flourish.

### The Physical Space
- **Location:** Nature-surrounded campus (mountains, forest, or coastal)
- **Design:** ADHD-friendly architecture — natural light, movement spaces, quiet pods, sensory-friendly environments
- **Amenities:**
  - Hyperfocus chambers (soundproof, no interruptions)
  - Collaboration ateliers for Visionnaire-Doer pairs
  - Makers labs with cutting-edge tools
  - Wellness center (executive function coaching, meditation, exercise)
  - Funding pavilion for investor showcases

### The Community
- **Residents:** Visionnaires living on-campus during ideation phases
- **Execution Partners:** Lead Doers and team members co-located or remote
- **Global Network:** Virtual access for international members
- **Alumni Network:** Graduated founders mentoring new pairs

### The Annual Gathering
- **"The Genesis"** — yearly summit where Visionnaires present blueprints
- **Live Matching** — Lead Doers choose their Visionnaire partners in real-time
- **Funding Festival** — Investors commit to showcased, structured teams
- **Creation Marathon** — 72-hour hyperfocus sessions to launch MVPs

---

*Master Plan v2 — Eden Valley*
*Updated: May 2026*
*Positioning: Full-Stack Company Building Platform for Neurodivergent Founders*
*From Idea → Blueprint → Match → Code → Content → Distribution → Funding*

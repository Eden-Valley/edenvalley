# Phases 3-6: Remaining Dashboard Features — Design Doc

> **Goal:** Build the remaining 4 dashboard features (Find Match, My Team, Funding, Pischon AI) following the same patterns as Phases 1-2.

**Architecture:** Each phase is an independent page under `/dashboard/*` wired via React Router. New API types + services in `api.ts`. Mock API updated per phase. Follow existing patterns: shadcn/ui, lucide-react, dark theme, Vitest + RTL tests.

**Tech Stack:** React 18, TypeScript, React Router 6, shadcn/ui, Tailwind CSS, Vitest + RTL

---

## Phase 3: Find Match (Euphrates) — `/dashboard/match`

**MVP Scope:**
- Page showing user's match status (unmatched/pending/matched)
- "Find a Match" button that simulates matching
- List of suggested matches (Thinker ↔ Doer)
- Accept/Decline actions on suggestions
- Profile summary card (role, skills, vision snippet)

**API:**
- `GET /api/match/status` — returns `{ status: 'unmatched'|'pending'|'matched', match?: MatchProfile }`
- `GET /api/match/suggestions` — returns `MatchProfile[]`
- `POST /api/match/request/:userId` — request match
- `POST /api/match/accept/:matchId` — accept match
- `POST /api/match/decline/:matchId` — decline match

**Components:**
- `MatchStatusCard.tsx` — Shows current match status with action button
- `MatchProfileCard.tsx` — Profile card for a potential match
- `MatchRequestsList.tsx` — List of incoming/outgoing requests

**Tests:** Status display, suggestion rendering, accept/decline callbacks

---

## Phase 4: My Team — `/dashboard/team`

**MVP Scope:**
- Team roster view (list of team members)
- Invite members by email (simulated)
- Role management (Lead Doer, Contributor, Advisor)
- Equity pool display (10% total)
- Only available after matched

**API:**
- `GET /api/team` — returns `TeamMember[]`
- `POST /api/team/invite` — invite member `{ email, role }`
- `DELETE /api/team/members/:userId` — remove member

**Components:**
- `TeamRoster.tsx` — Grid/list of team member cards
- `TeamMemberCard.tsx` — Avatar, name, role, equity
- `InviteMemberForm.tsx` — Email + role selector dialog
- `EquityPoolBar.tsx` — Visual equity distribution

**Tests:** Roster rendering, invite flow, member removal

---

## Phase 5: Funding (Havila) — `/dashboard/havila`

**MVP Scope:**
- Dashboard showing funding progress
- Phase 1: Crowdfunding goal + progress bar
- Phase 2: VC/Angel pipeline (placeholder)
- "Launch Campaign" button (simulated)
- Backer list display
- Only accessible after Blueprint + Match completed

**API:**
- `GET /api/funding` — returns `{ phase, goal, raised, backers[], investors[] }`
- `POST /api/funding/launch` — launch crowdfunding campaign

**Components:**
- `FundingOverview.tsx` — Phase progress + goal tracker
- `FundingProgressBar.tsx` — Visual progress toward goal
- `BackerList.tsx` — List of supporters
- `LaunchCampaignButton.tsx` — CTA with validation checks

**Tests:** Progress display, campaign launch button states

---

## Phase 6: Pischon AI — `/dashboard/pischon`

**MVP Scope:**
- AI chat interface with tool selection
- Preset tool buttons: "Coding Agent", "Strategy", "Content", "Execute"
- Chat message list with user/bot messages
- Text input + send
- Simulated AI responses (mock API)

**API:**
- `POST /api/pischon/chat` — send message `{ message, tool }`, returns `{ reply }`

**Components:**
- `ChatMessage.tsx` — Single message bubble (user vs AI styling)
- `ChatInput.tsx` — Text input + send button
- `ToolSelector.tsx` — Tool preset buttons
- `PischonChat.tsx` — Main chat container

**Tests:** Message rendering, send flow, tool selection

---

## File Structure

```
src/
  pages/dashboard/
    Match.tsx                 ← Phase 3
    Team.tsx                  ← Phase 4
    Havila.tsx                ← Phase 5
    Pischon.tsx               ← Phase 6
  components/
    MatchStatusCard.tsx       ← Phase 3
    MatchProfileCard.tsx      ← Phase 3
    TeamRoster.tsx            ← Phase 4
    TeamMemberCard.tsx        ← Phase 4
    InviteMemberForm.tsx      ← Phase 4
    EquityPoolBar.tsx         ← Phase 4
    FundingOverview.tsx       ← Phase 5
    FundingProgressBar.tsx    ← Phase 5
    BackerList.tsx            ← Phase 5
    ChatMessage.tsx           ← Phase 6
    ChatInput.tsx             ← Phase 6
    ToolSelector.tsx          ← Phase 6
    PischonChat.tsx           ← Phase 6
  test/
    Match.test.tsx            ← Phase 3
    MatchStatusCard.test.tsx  ← Phase 3
    MatchProfileCard.test.tsx ← Phase 3
    Team.test.tsx             ← Phase 4
    TeamMemberCard.test.tsx   ← Phase 4
    InviteMemberForm.test.tsx ← Phase 4
    Havila.test.tsx           ← Phase 5
    FundingOverview.test.tsx  ← Phase 5
    Pischon.test.tsx          ← Phase 6
    ChatMessage.test.tsx      ← Phase 6
    ChatInput.test.tsx        ← Phase 6
    ToolSelector.test.tsx     ← Phase 6
```

## Modified Files (Per Phase)

```
src/App.tsx                  ← Add route per phase
src/services/api.ts          ← Add types + service per phase
mock-api.mjs                 ← Add endpoints per phase
src/pages/dashboard/DashboardHome.tsx  ← Remove coming-soon per phase
```

## Testing Strategy

- Unit tests per component (render, interactions, callbacks)
- Page-level integration tests (mock API, verify state transitions)
- All existing tests must pass (currently 54 passing)
- Each phase adds ~5-15 new tests

## Non-Goals

- Real database persistence (mock API only)
- Real AI integration for Pischon (simulated responses)
- Payment processing for Havila
- Real-time notifications for match requests
- Email delivery for team invites

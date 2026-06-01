# Phase 1: Auth Infrastructure + Dashboard Layout — Design Doc

> **Goal:** Build the authenticated member area so that after login/magic link, users land on a dashboard instead of the public homepage.

**Architecture:** React Context for auth state + ProtectedRoute wrapper + DashboardLayout with sidebar navigation. API route for current user profile. No additional dependencies beyond existing stack (React Router, Neon Auth, shadcn).

**Tech Stack:** React 18, TypeScript, React Router 6, Neon Auth, shadcn/ui (Sidebar, Avatar, DropdownMenu), Tailwind CSS

---

## 1. Current Problem

After login or magic link verification, users are redirected to `/` (the public Home page). There is:
- No authenticated session tracking beyond localStorage
- No member layout or navigation
- No way to distinguish "marketing visitor" from "member"
- `/auth` page handles both sign-in and token verification but then redirects to `/`

## 2. What We're Building

### AuthProvider (React Context)

A context that wraps the entire app and provides:
- `user` — current user object `{ id, email, firstName, role, language }` or null
- `isAuthenticated` — boolean
- `isLoading` — boolean (for initial session check)
- `signOut()` — clears session, redirects to `/auth`
- `refreshUser()` — re-fetches user data from API

**On mount:**
1. Check localStorage for `eden-user-id` and `eden-email`
2. If found, call `GET /api/me` to get full user profile
3. If API succeeds, set user
4. If API fails (401), clear localStorage, set user to null
5. While loading, show nothing (or skeleton)

### ProtectedRoute Component

A wrapper that:
- If `isLoading` → show loading spinner
- If `!isAuthenticated` → redirect to `/auth`
- If `isAuthenticated` → render children inside DashboardLayout

### DashboardLayout

A persistent layout with:
- **Sidebar** (left, collapsible) with navigation:
  - Dashboard (home)
  - My Blueprint
  - Find Match
  - My Team
  - Funding (Havila)
  - Pischon AI
  - Settings
- **Top bar** with user avatar + dropdown (profile, sign out)
- **Main content area** (routes rendered here)
- Styled consistently with existing design system (dark theme, Cormorant headers, DM Sans body)

### Dashboard Home (`/dashboard`)

The landing page after login:
- Welcome message with user's first name
- Quick stats: "Your Blueprint", "Match Status", "Team", "Funding"
- Recent activity / notifications
- Quick actions: "Edit Blueprint", "Find a Match", "View Team"

### API: `GET /api/me`

Returns the authenticated user's profile:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "thinker",
  "language": "en",
  "isValidated": true,
  "hasBlueprint": false,
  "matchStatus": "unmatched"
}
```

**Implementation:** Reads `Authorization: Bearer <userId>` header (simple token-based, same pattern as admin). Queries `users` + `profiles` tables.

### Route Structure Changes

**Before:**
```
/  → Home (public)
/auth → Auth page
/admin → Admin panel
```

**After:**
```
/  → Home (public)
/auth → Auth page
/admin → Admin panel
/dashboard → Dashboard Home (protected)
/dashboard/blueprint → Blueprint Studio (protected) [Phase 2]
/dashboard/match → Euphrates Matching (protected) [Phase 2]
/dashboard/team → Team Assembly (protected) [Phase 2]
/dashboard/havila → Havila Funding (protected) [Phase 2]
/dashboard/pischon → Pischon AI (protected) [Phase 2]
```

**Guest route fix:** Update `/auth` to redirect authenticated users to `/dashboard` instead of `/`.

### Post-Auth Redirect Fix

Currently, after magic link verification:
```typescript
localStorage.setItem('eden-user-id', data.userId);
localStorage.setItem('eden-email', data.email);
// ... then navigates to '/'
```

Change to: navigate to `/dashboard`.

Similarly, after sign-in:
```typescript
// currently navigates to '/'
navigate('/dashboard');
```

## 3. Component Tree

```
<App>
  <QueryClientProvider>
    <TooltipProvider>
      <LanguageProvider>
        <AudioProvider>
          <CustomCursor />
          <LoadingScreen />
          <AuthProvider>               ← NEW
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>     ← NEW
                    <DashboardLayout>  ← NEW
                      <Dashboard />    ← NEW
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                {/* Future: /dashboard/* routes */}
              </Routes>
            </BrowserRouter>
          </AuthProvider>
          <Analytics />
        </AudioProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
</App>
```

## 4. Data Flow

```
User logs in / verifies magic link
  → Auth page stores userId, email in localStorage
  → Redirects to /dashboard
  → AuthProvider detects localStorage on mount
  → GET /api/me with Authorization: Bearer <userId>
  → If 200: setUser(data)
  → If 401: clear localStorage, redirect to /auth
  → Dashboard renders user-specific content

User clicks "Sign Out"
  → authClient.signOut()
  → localStorage.clear()
  → setUser(null)
  → navigate('/auth')
```

## 5. API Changes

### New Endpoint: `GET /api/me`

In `api/index.ts`, add before the 404 catch-all:

```typescript
if (pathname === '/api/me' && method === 'GET') {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = authHeader.split(' ')[1];
  const sql = getSql();
  const user = await sql`
    SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.language, u.is_validated,
      COALESCE(p.status, 'unmatched') as match_status
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = ${userId}
    LIMIT 1
  `;
  // hasBlueprint will be checked via a separate query or added when blueprints table exists (Phase 2)
  if (user.length === 0) {
    return res.status(401).json({ error: 'User not found' });
  }
  return res.status(200).json({
    id: user[0].id,
    email: user[0].email,
    firstName: user[0].first_name,
    lastName: user[0].last_name,
    role: user[0].role,
    language: user[0].language,
    isValidated: user[0].is_validated,
    hasBlueprint: user[0].has_blueprint,
    matchStatus: user[0].match_status
  });
}
```

## 6. New Files

```
src/
  contexts/
    AuthContext.tsx         ← NEW: AuthProvider + useAuth hook
  components/
    ProtectedRoute.tsx      ← NEW: Route guard wrapper
    DashboardLayout.tsx     ← NEW: Sidebar + topbar layout
  pages/
    dashboard/
      DashboardHome.tsx     ← NEW: Main dashboard page
  lib/
    api.ts                  ← EXISTING: add fetchMe() function
```

## 7. Modified Files

```
src/
  App.tsx                   ← MODIFY: wrap with AuthProvider, add protected routes
  pages/Auth.tsx            ← MODIFY: redirect to /dashboard instead of /
  api/index.ts              ← MODIFY: add GET /api/me endpoint
```

## 8. Error States

| State | Handling |
|-------|----------|
| AuthProvider initial load | Show full-screen loading spinner until auth resolves |
| API /api/me 401 | Clear localStorage, redirect /auth |
| API /api/me network error | Show "Connection error" toast, allow retry |
| ProtectedRoute loading | Show DashboardLayout skeleton |
| Dashboard API error | Show error state with retry button |
| Sign out failure | Force clear localStorage anyway |

## 9. Dashboard Home Mock Content

Until Phase 2 features are built, Dashboard Home shows:
- Welcome card: "Welcome back, {firstName}! Your journey continues..."
- Status cards (placeholder):
  - "Your Blueprint" → "Not yet created. Start structuring your vision."
  - "Find a Match" → "No match yet. Explore potential co-founders."
  - "Your Team" → "Build your team after finding a match."
  - "Funding" → "Complete your Blueprint + Match to unlock funding."
- Each card has a button that shows "Coming soon" toast for Phase 2 features

## 10. Testing Strategy

- **Unit:** AuthContext provides correct values based on localStorage + API
- **Unit:** ProtectedRoute redirects when unauthenticated
- **Unit:** DashboardLayout renders sidebar navigation
- **Integration:** Full flow: login → redirect to /dashboard → see welcome message
- **API:** GET /api/me returns correct user data

## 11. Non-Goals (Phase 2+)

- Blueprint creation (Phase 2)
- Matching algorithm (Phase 2)
- Team management (Phase 3)
- Havila funding (Phase 4)
- Pischon AI interface (Phase 5)

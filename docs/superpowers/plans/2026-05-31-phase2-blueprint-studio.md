# Blueprint Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the My Blueprint page where Thinkers structure their idea into a visual card-based blueprint.

**Architecture:** Page at `/dashboard/blueprint` with card-based editor. Each card = one section (Vision, Problem, Solution, Market, etc.). Cards can be added, edited, reordered, and deleted. Data persisted via API. The dashboard status card removes "coming soon" for Blueprint and navigates to the editor.

**Tech Stack:** React 18, TypeScript, React Router 6, shadcn/ui (Card, Dialog, Button, Input, Textarea), Tailwind CSS, Vitest + RTL

---

## File Map

**New files:**
- `src/pages/dashboard/BlueprintEditor.tsx` — Main blueprint page
- `src/components/BlueprintCard.tsx` — Single editable card component
- `src/components/BlueprintCardForm.tsx` — Add/edit card dialog form
- `src/test/BlueprintEditor.test.tsx` — Tests for blueprint editor
- `src/test/BlueprintCard.test.tsx` — Tests for card component
- `src/test/BlueprintCardForm.test.tsx` — Tests for card form dialog

**Modified files:**
- `src/services/api.ts` — Add `Blueprint` type, `fetchBlueprint()`, `saveBlueprint()`, `updateBlueprintCard()`, `deleteBlueprintCard()`
- `src/contexts/AuthContext.tsx` — Add `hasBlueprint` to `User` interface
- `src/components/DashboardHome.tsx` — Remove coming-soon for Blueprint card, navigate to `/dashboard/blueprint`
- `src/App.tsx` — Add route for `/dashboard/blueprint`
- `mock-api.mjs` — Add blueprint CRUD endpoints

---

### Task 1: Blueprint API types and service

**Files:**
- Modify: `src/services/api.ts`
- Test: (types only, no test needed)

- [ ] **Step 1: Add Blueprint and BlueprintCard types to api.ts**

```typescript
// Add after the User interface (line 108)

export interface BlueprintCard {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Blueprint {
  id: string;
  userId: string;
  cards: BlueprintCard[];
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Add blueprint API functions**

```typescript
// Add at end of api.ts

export async function fetchBlueprint(): Promise<Blueprint> {
  const userId = localStorage.getItem('eden-user-id');
  if (!userId) throw new Error('Not authenticated');
  return fetchApi('/blueprint', {
    headers: { Authorization: `Bearer ${userId}` },
  });
}

export async function saveBlueprint(cards: Omit<BlueprintCard, 'id'>[]): Promise<Blueprint> {
  const userId = localStorage.getItem('eden-user-id');
  if (!userId) throw new Error('Not authenticated');
  return fetchApi('/blueprint', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userId}` },
    body: JSON.stringify({ cards }),
  });
}

export async function deleteBlueprintCard(cardId: string): Promise<void> {
  const userId = localStorage.getItem('eden-user-id');
  if (!userId) throw new Error('Not authenticated');
  return fetchApi(`/blueprint/cards/${cardId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userId}` },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/services/api.ts
git commit -m "feat(api): add Blueprint types and API service"
```

---

### Task 2: Add hasBlueprint to User type + AuthContext

**Files:**
- Modify: `src/services/api.ts`
- Modify: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Add hasBlueprint to User interface**

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  language: string;
  isValidated: boolean;
  hasBlueprint: boolean;  // already in GET /api/me response
  matchStatus: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/api.ts
git commit -m "feat(api): add hasBlueprint to User type"
```

---

### Task 3: BlueprintCard component

**Files:**
- Create: `src/components/BlueprintCard.tsx`
- Create: `src/test/BlueprintCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BlueprintCard from '../components/BlueprintCard';

describe('BlueprintCard', () => {
  const defaultProps = {
    id: '1',
    title: 'My Vision',
    content: 'I want to build a platform that...',
    order: 1,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders card title and content', () => {
    render(<BlueprintCard {...defaultProps} />);
    expect(screen.getByText('My Vision')).toBeInTheDocument();
    expect(screen.getByText('I want to build a platform that...')).toBeInTheDocument();
  });

  it('shows the card order number', () => {
    render(<BlueprintCard {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<BlueprintCard {...defaultProps} />);
    const editBtn = screen.getByRole('button', { name: /edit/i });
    editBtn.click();
    expect(defaultProps.onEdit).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<BlueprintCard {...defaultProps} />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    deleteBtn.click();
    expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/BlueprintCard.test.tsx`
Expected: FAIL with "module not found"

- [ ] **Step 3: Write minimal BlueprintCard component**

```typescript
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlueprintCardProps {
  id: string;
  title: string;
  content: string;
  order: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function BlueprintCard({ id, title, content, order, onEdit, onDelete }: BlueprintCardProps) {
  return (
    <div className="group rounded-sm border border-primary/10 bg-background p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-xs font-mono text-primary">
          {order}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-medium text-foreground mb-1">{title}</h3>
          <p className="font-body text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(id)} aria-label="Edit card">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(id)} aria-label="Delete card">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BlueprintCard;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/BlueprintCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/BlueprintCard.tsx src/test/BlueprintCard.test.tsx
git commit -m "feat(blueprint): add BlueprintCard component"
```

---

### Task 4: BlueprintCardForm (dialog for add/edit)

**Files:**
- Create: `src/components/BlueprintCardForm.tsx`
- Create: `src/test/BlueprintCardForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BlueprintCardForm from '../components/BlueprintCardForm';

describe('BlueprintCardForm', () => {
  it('renders form fields when open', () => {
    render(
      <BlueprintCardForm
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
  });

  it('calls onSave with title and content when submitted', () => {
    const onSave = vi.fn();
    render(
      <BlueprintCardForm
        open={true}
        onOpenChange={vi.fn()}
        onSave={onSave}
      />
    );
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My Vision' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'I want to build...' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith({ title: 'My Vision', content: 'I want to build...' });
  });

  it('pre-fills fields when editing', () => {
    render(
      <BlueprintCardForm
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        initialTitle="Existing Title"
        initialContent="Existing content"
      />
    );
    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    expect(titleInput.value).toBe('Existing Title');
  });

  it('shows "Add Card" title when no initialTitle, "Edit Card" when editing', () => {
    const { rerender } = render(
      <BlueprintCardForm open={true} onOpenChange={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.getByText('Add Card')).toBeInTheDocument();

    rerender(
      <BlueprintCardForm
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        initialTitle="Something"
      />
    );
    expect(screen.getByText('Edit Card')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/BlueprintCardForm.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write BlueprintCardForm component**

```typescript
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BlueprintCardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; content: string }) => void;
  initialTitle?: string;
  initialContent?: string;
}

function BlueprintCardForm({ open, onOpenChange, onSave, initialTitle, initialContent }: BlueprintCardFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const isEditing = !!initialTitle;

  useEffect(() => {
    if (open) {
      setTitle(initialTitle ?? '');
      setContent(initialContent ?? '');
    }
  }, [open, initialTitle, initialContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), content: content.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">{isEditing ? 'Edit Card' : 'Add Card'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-body text-sm text-muted-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Vision, Target Market..."
              className="font-body"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="font-body text-sm text-muted-foreground">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe this section of your blueprint..."
              className="font-body min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!title.trim()}>{isEditing ? 'Save Changes' : 'Add Card'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BlueprintCardForm;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/BlueprintCardForm.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/BlueprintCardForm.tsx src/test/BlueprintCardForm.test.tsx
git commit -m "feat(blueprint): add BlueprintCardForm dialog"
```

---

### Task 5: BlueprintEditor page

**Files:**
- Create: `src/pages/dashboard/BlueprintEditor.tsx`
- Create: `src/test/BlueprintEditor.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BlueprintEditor from '../pages/dashboard/BlueprintEditor';

vi.mock('../../services/api', () => ({
  fetchBlueprint: vi.fn().mockRejectedValue(new Error('Not found')),
  saveBlueprint: vi.fn(),
  BlueprintCard: {} as any,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', firstName: 'Test' },
  }),
}));

describe('BlueprintEditor', () => {
  it('shows empty state with prompt to add first card', async () => {
    render(
      <MemoryRouter>
        <BlueprintEditor />
      </MemoryRouter>
    );
    expect(await screen.findByText(/start your blueprint/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add.*card/i })).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(
      <MemoryRouter>
        <BlueprintEditor />
      </MemoryRouter>
    );
    expect(screen.getByText('My Blueprint')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/BlueprintEditor.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write BlueprintEditor component**

```typescript
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlueprintCard from '@/components/BlueprintCard';
import BlueprintCardForm from '@/components/BlueprintCardForm';
import { fetchBlueprint, saveBlueprint, type BlueprintCard as BlueprintCardType } from '@/services/api';

function BlueprintEditor() {
  const [cards, setCards] = useState<BlueprintCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBlueprint()
      .then((data) => setCards(data.cards ?? []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data: { title: string; content: string }) => {
    if (editingId) {
      const updated = cards.map((c) =>
        c.id === editingId ? { ...c, title: data.title, content: data.content } : c
      );
      setCards(updated);
    } else {
      const newCard: BlueprintCardType = {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        title: data.title,
        content: data.content,
        order: cards.length + 1,
      };
      setCards([...cards, newCard]);
    }
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const remaining = cards.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i + 1 }));
    setCards(remaining);
  };

  const editingCard = editingId ? cards.find((c) => c.id === editingId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            My Blueprint
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Structure your idea into cards. Each card is a building block of your vision.
          </p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-primary/20 py-16">
          <p className="font-body text-sm text-muted-foreground mb-4">
            Start your blueprint by adding your first card.
          </p>
          <Button variant="outline" onClick={() => { setEditingId(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Card
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <BlueprintCard
              key={card.id}
              id={card.id}
              title={card.title}
              content={card.content}
              order={card.order}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <BlueprintCardForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingId(null); }}
        onSave={handleSave}
        initialTitle={editingCard?.title}
        initialContent={editingCard?.content}
      />
    </div>
  );
}

export default BlueprintEditor;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/BlueprintEditor.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/BlueprintEditor.tsx src/test/BlueprintEditor.test.tsx
git commit -m "feat(blueprint): add BlueprintEditor page with card CRUD"
```

---

### Task 6: Wire blueprint route in App.tsx and update DashboardHome

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/dashboard/DashboardHome.tsx`

- [ ] **Step 1: Add import and route in App.tsx**

```typescript
// Add import with other dashboard imports (after line 29):
import BlueprintEditor from '@/pages/dashboard/BlueprintEditor';

// Add route inside the DashboardLayout (after the DashboardHome route, before closing </DashboardLayout>):
<Route
  path="/dashboard/blueprint"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <BlueprintEditor />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 2: Update DashboardHome to remove coming-soon for Blueprint**

Change the first card object:
```typescript
{
  title: 'Your Blueprint',
  icon: FileEdit,
  message: 'Not yet created. Start structuring your vision.',
  button: 'Create Blueprint',
  route: '/dashboard/blueprint',
  comingSoon: false,  // changed from true
},
```

- [ ] **Step 3: Run existing tests to verify nothing broken**

Run: `npx vitest run --reporter=verbose src/test/DashboardHome.test.tsx src/test/BlueprintEditor.test.tsx src/test/BlueprintCard.test.tsx src/test/BlueprintCardForm.test.tsx`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/pages/dashboard/DashboardHome.tsx
git commit -m "feat(app): wire blueprint route, remove coming-soon for blueprint card"
```

---

### Task 7: Update mock API for blueprint endpoints

**Files:**
- Modify: `mock-api.mjs`

- [ ] **Step 1: Add blueprint in-memory store and handlers**

```javascript
// Add after the existing handlers (before the 404 catch-all):

const blueprints = {};

if (req.url === '/api/blueprint' && req.method === 'GET') {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  const userId = auth.split(' ')[1];
  const bp = blueprints[userId];
  res.writeHead(bp ? 200 : 200);
  res.end(JSON.stringify(bp ?? { id: `${userId}-bp`, userId, cards: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  return;
}

if (req.url === '/api/blueprint' && req.method === 'PUT') {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  const userId = auth.split(' ')[1];
  let body = '';
  req.on('data', (chunk) => body += chunk);
  req.on('end', () => {
    const { cards } = JSON.parse(body);
    blueprints[userId] = {
      id: `${userId}-bp`,
      userId,
      cards: cards.map((c, i) => ({ ...c, id: c.id ?? crypto.randomUUID(), order: i + 1 })),
      createdAt: blueprints[userId]?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    res.writeHead(200);
    res.end(JSON.stringify(blueprints[userId]));
  });
  return;
}
```

- [ ] **Step 2: Test restart mock API and verify in browser**

Stop old mock API (Ctrl+C) and restart: `node mock-api.mjs`
Then navigate to `http://localhost:8080/dashboard/blueprint` — should show empty state with "Add Your First Card" button.

- [ ] **Step 3: Commit**

```bash
git add mock-api.mjs
git commit -m "chore(mock-api): add blueprint CRUD endpoints"
```

---

### Task 8: Full test suite run

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run --reporter=verbose`
Expected: All 46+ tests pass (new + existing)

- [ ] **Step 2: Fix any failing tests**

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: finalize Phase 2 blueprint studio"
```

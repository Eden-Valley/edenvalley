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
        id: String(Date.now()),
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

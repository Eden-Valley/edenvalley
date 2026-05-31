import { Pencil, Trash2 } from 'lucide-react';
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

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

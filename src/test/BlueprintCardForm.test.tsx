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
    fireEvent.click(screen.getByRole('button', { name: /add card/i }));
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
    expect(screen.getByRole('heading', { name: /add card/i })).toBeInTheDocument();

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

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InviteMemberForm from '../components/InviteMemberForm';

describe('InviteMemberForm', () => {
  it('renders email input and role dropdown', () => {
    render(<InviteMemberForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<InviteMemberForm onSubmit={vi.fn()} onCancel={onCancel} />);
    screen.getByRole('button', { name: /cancel/i }).click();
    expect(onCancel).toHaveBeenCalled();
  });

  it('has disabled submit when email is empty', () => {
    render(<InviteMemberForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const submitBtn = screen.getByRole('button', { name: /send invite/i });
    expect(submitBtn).toBeDisabled();
  });
});

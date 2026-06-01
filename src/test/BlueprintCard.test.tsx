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

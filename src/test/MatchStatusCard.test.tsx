import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MatchStatusCard from '../components/MatchStatusCard';

describe('MatchStatusCard', () => {
  it('shows unmatched status with CTA', () => {
    render(<MatchStatusCard status="unmatched" onFindMatch={vi.fn()} />);
    expect(screen.getByText(/not yet matched/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find.*match/i })).toBeInTheDocument();
  });

  it('shows pending status', () => {
    render(<MatchStatusCard status="pending" onFindMatch={vi.fn()} />);
    expect(screen.getByText(/match.*pending/i)).toBeInTheDocument();
  });

  it('shows matched status with match name', () => {
    const match = { id: '1', firstName: 'Jane', lastName: 'Doe', role: 'doer' } as any;
    render(<MatchStatusCard status="matched" match={match} onFindMatch={vi.fn()} />);
    expect(screen.getByText(/matched/i)).toBeInTheDocument();
    expect(screen.getByText(/jane.*doe/i)).toBeInTheDocument();
  });
});

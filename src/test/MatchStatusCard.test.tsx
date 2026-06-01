import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MatchStatusCard from '../components/MatchStatusCard';
import type { MatchProfile } from '@/services/api';

const mockMatch: MatchProfile = {
  id: '1',
  userId: 'u1',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'doer',
  skills: [],
  vision: '',
};

describe('MatchStatusCard', () => {
  it('shows unmatched status with CTA', () => {
    render(<MatchStatusCard status="unmatched" onFindMatch={vi.fn()} />);
    expect(screen.getByText(/not yet matched/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find.*match/i })).toBeInTheDocument();
  });

  it('calls onFindMatch when button clicked', async () => {
    const onFindMatch = vi.fn();
    const user = userEvent.setup();
    render(<MatchStatusCard status="unmatched" onFindMatch={onFindMatch} />);
    await user.click(screen.getByRole('button', { name: /find.*match/i }));
    expect(onFindMatch).toHaveBeenCalledTimes(1);
  });

  it('shows pending status', () => {
    render(<MatchStatusCard status="pending" onFindMatch={vi.fn()} />);
    expect(screen.getByText(/match.*pending/i)).toBeInTheDocument();
  });

  it('shows matched status with match name', () => {
    render(<MatchStatusCard status="matched" match={mockMatch} onFindMatch={vi.fn()} />);
    expect(screen.getByText(/matched/i)).toBeInTheDocument();
    expect(screen.getByText(/jane.*doe/i)).toBeInTheDocument();
  });

  it('shows fallback when match is missing in matched status', () => {
    render(<MatchStatusCard status="matched" onFindMatch={vi.fn()} />);
    expect(screen.getByText(/matched with a co-founder/i)).toBeInTheDocument();
  });
});

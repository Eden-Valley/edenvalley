import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Match from '../pages/dashboard/Match';

vi.mock('../services/api', () => ({
  fetchMatchStatus: vi.fn().mockResolvedValue({ status: 'unmatched' }),
  fetchMatchSuggestions: vi.fn().mockResolvedValue([
    { id: '1', userId: '1', firstName: 'Jane', lastName: 'Doe', role: 'doer', skills: ['React'], vision: 'Hello', matchScore: 85 },
  ]),
  requestMatch: vi.fn(),
}));

describe('Match', () => {
  it('shows page title', async () => {
    render(<Match />);
    expect(await screen.findByRole('heading', { name: /find a match/i, level: 1 })).toBeInTheDocument();
  });

  it('shows match status card', async () => {
    render(<Match />);
    expect(await screen.findByText(/not yet matched/i)).toBeInTheDocument();
  });

  it('shows suggestions when unmatched', async () => {
    render(<Match />);
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
  });
});

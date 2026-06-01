import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Match from '../pages/dashboard/Match';

const mockFetchMatchStatus = vi.fn().mockResolvedValue({ status: 'unmatched' });
const mockFetchMatchSuggestions = vi.fn().mockResolvedValue([
  { id: '1', userId: '1', firstName: 'Jane', lastName: 'Doe', role: 'doer', skills: ['React'], vision: 'Hello', matchScore: 85 },
]);
const mockRequestMatch = vi.fn();

vi.mock('../services/api', () => ({
  fetchMatchStatus: (...args: any[]) => mockFetchMatchStatus(...args),
  fetchMatchSuggestions: (...args: any[]) => mockFetchMatchSuggestions(...args),
  requestMatch: (...args: any[]) => mockRequestMatch(...args),
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

  it('shows error state when API fails', async () => {
    mockFetchMatchStatus.mockRejectedValueOnce(new Error('Network error'));
    render(<Match />);
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    mockFetchMatchStatus.mockResolvedValue(new Promise(() => {})); // never resolves
    const { container } = render(<Match />);
    expect(container.querySelector('[aria-label="Loading"]')).toBeInTheDocument();
  });
});

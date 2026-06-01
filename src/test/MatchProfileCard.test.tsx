import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MatchProfileCard from '../components/MatchProfileCard';
import type { MatchProfile } from '@/services/api';

const profile: MatchProfile = {
  id: 'profile-2',
  userId: 'user-2',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'doer',
  skills: ['React', 'Python'],
  vision: 'Build the future of education',
  matchScore: 85,
};

describe('MatchProfileCard', () => {
  it('renders name and role', () => {
    render(<MatchProfileCard profile={profile} onRequest={vi.fn()} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('doer')).toBeInTheDocument();
  });

  it('renders skills', () => {
    render(<MatchProfileCard profile={profile} onRequest={vi.fn()} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('shows match score', () => {
    render(<MatchProfileCard profile={profile} onRequest={vi.fn()} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('calls onRequest when button clicked', () => {
    const onRequest = vi.fn();
    render(<MatchProfileCard profile={profile} onRequest={onRequest} />);
    screen.getByRole('button', { name: /request match/i }).click();
    expect(onRequest).toHaveBeenCalledWith('user-2');
  });

  it('renders initials in avatar', () => {
    render(<MatchProfileCard profile={profile} onRequest={vi.fn()} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});

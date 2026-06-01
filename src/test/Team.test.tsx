import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Team from '../pages/dashboard/Team';

const mockTeam = vi.hoisted(() => [
  { id: 'mem-1', userId: 'u1', firstName: 'Jane', lastName: 'Doe', role: 'CTO', joinedAt: '2026-01-15T00:00:00Z' },
  { id: 'mem-2', userId: 'u2', firstName: 'Bob', lastName: 'Smith', role: 'CEO', joinedAt: '2026-02-01T00:00:00Z' },
]);

vi.mock('../services/api', () => ({
  fetchTeam: vi.fn().mockResolvedValue(mockTeam),
  inviteTeamMember: vi.fn(),
  removeTeamMember: vi.fn(),
  updateTeamMemberRole: vi.fn(),
}));

describe('Team', () => {
  it('shows page title', async () => {
    render(<Team />);
    expect(await screen.findByText('My Team')).toBeInTheDocument();
  });

  it('shows team members list', async () => {
    render(<Team />);
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(await screen.findByText('Bob Smith')).toBeInTheDocument();
  });

  it('shows invite member button', async () => {
    render(<Team />);
    expect(await screen.findByRole('button', { name: /invite member/i })).toBeInTheDocument();
  });
});

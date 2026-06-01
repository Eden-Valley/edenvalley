import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TeamMemberCard from '../components/TeamMemberCard';
import type { TeamMember } from '@/services/api';

const member: TeamMember = {
  id: 'mem-1',
  userId: 'user-1',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'CTO',
  joinedAt: '2026-01-15T00:00:00Z',
};

describe('TeamMemberCard', () => {
  it('renders member name and role', () => {
    render(<TeamMemberCard member={member} onRemove={vi.fn()} onRoleChange={vi.fn()} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('CTO', { selector: 'p' })).toBeInTheDocument();
  });

  it('renders initials in avatar', () => {
    render(<TeamMemberCard member={member} onRemove={vi.fn()} onRoleChange={vi.fn()} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn();
    render(<TeamMemberCard member={member} onRemove={onRemove} onRoleChange={vi.fn()} />);
    screen.getByRole('button', { name: /remove/i }).click();
    expect(onRemove).toHaveBeenCalledWith('mem-1');
  });

  it('renders role selector', () => {
    render(<TeamMemberCard member={member} onRemove={vi.fn()} onRoleChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardHome from '../pages/dashboard/DashboardHome';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'a@b.com', firstName: 'Alex', lastName: 'Smith', role: 'thinker', language: 'en', isValidated: true, matchStatus: 'unmatched' },
    isAuthenticated: true,
    isLoading: false,
    signOut: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

describe('DashboardHome', () => {
  it('renders welcome message with user first name', () => {
    render(
      <MemoryRouter>
        <DashboardHome />
      </MemoryRouter>,
    );
    expect(screen.getByText('Alex')).toBeInTheDocument();
  });

  it('renders all 4 status cards', () => {
    render(
      <MemoryRouter>
        <DashboardHome />
      </MemoryRouter>,
    );
    expect(screen.getByText('Your Blueprint')).toBeInTheDocument();
    expect(screen.getByText('Find a Match')).toBeInTheDocument();
    expect(screen.getByText('Your Team')).toBeInTheDocument();
    expect(screen.getByText('Funding')).toBeInTheDocument();
  });

  it('shows appropriate status text', () => {
    render(
      <MemoryRouter>
        <DashboardHome />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Start structuring/)).toBeInTheDocument();
    expect(screen.getByText(/Explore potential/)).toBeInTheDocument();
    expect(screen.getByText(/Build your team/)).toBeInTheDocument();
    expect(screen.getByText(/Complete your/)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(
      <MemoryRouter>
        <DashboardHome />
      </MemoryRouter>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });
});

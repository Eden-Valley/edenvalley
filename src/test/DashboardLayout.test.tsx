import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'a@b.com', firstName: 'John', lastName: 'Doe', role: 'thinker', language: 'en', isValidated: true, matchStatus: 'unmatched' },
    isAuthenticated: true,
    isLoading: false,
    signOut: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

describe('DashboardLayout', () => {
  it('renders sidebar with navigation', () => {
    render(
      <MemoryRouter>
        <DashboardLayout>
          <div />
        </DashboardLayout>
      </MemoryRouter>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Blueprint')).toBeInTheDocument();
  });

  it('renders user avatar in top bar', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardLayout>
          <div />
        </DashboardLayout>
      </MemoryRouter>,
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
  });

  it('renders children content area', () => {
    render(
      <MemoryRouter>
        <DashboardLayout>
          <div data-testid="child-content" />
        </DashboardLayout>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});

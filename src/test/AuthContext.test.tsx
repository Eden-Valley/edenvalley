import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const mockFetchMe = vi.hoisted(() => vi.fn());

vi.mock('../services/api', () => ({
  fetchMe: mockFetchMe,
}));

const mockUser = {
  id: 'user-1',
  email: 'test@edenvalley.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'thinker',
  language: 'en',
  isValidated: true,
  hasBlueprint: false,
  matchStatus: 'pending',
};

function TestComponent() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button data-testid="signout" onClick={signOut}>Sign Out</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockFetchMe.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows loading then unauthenticated when no stored session', async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(mockFetchMe).not.toHaveBeenCalled();
  });

  it('authenticates when valid userId is in localStorage', async () => {
    localStorage.setItem('eden-user-id', 'user-1');
    mockFetchMe.mockResolvedValue(mockUser);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(mockFetchMe).toHaveBeenCalledTimes(1);
  });

  it('clears session when API returns 401', async () => {
    localStorage.setItem('eden-user-id', 'user-1');
    mockFetchMe.mockRejectedValue(new Error('HTTP 401'));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('eden-user-id')).toBeNull();
    expect(localStorage.getItem('eden-email')).toBeNull();
    expect(mockFetchMe).toHaveBeenCalledTimes(1);
  });

  it('signOut clears localStorage and user state', async () => {
    localStorage.setItem('eden-user-id', 'user-1');
    mockFetchMe.mockResolvedValue(mockUser);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByTestId('signout').click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem('eden-user-id')).toBeNull();
    expect(localStorage.getItem('eden-email')).toBeNull();
  });
});

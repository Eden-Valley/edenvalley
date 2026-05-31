import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import UserNav from '../components/UserNav';

function renderUserNav(props?: Partial<React.ComponentProps<typeof UserNav>>) {
  const defaultProps = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    onSignOut: vi.fn(),
    ...props,
  };
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <UserNav {...defaultProps} />
      </MemoryRouter>
    ),
  };
}

describe('UserNav', () => {
  it('renders user initials in avatar', () => {
    renderUserNav();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows email in the dropdown', async () => {
    const { user } = renderUserNav();
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onSignOut when sign out is clicked', async () => {
    const onSignOut = vi.fn();
    const { user } = renderUserNav({ onSignOut });
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    await user.click(screen.getByText('Sign out'));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});

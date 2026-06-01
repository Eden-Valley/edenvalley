import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav';

describe('SidebarNav', () => {
  it('renders all navigation links', () => {
    render(
      <MemoryRouter>
        <SidebarNav />
      </MemoryRouter>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Blueprint')).toBeInTheDocument();
    expect(screen.getByText('Find Match')).toBeInTheDocument();
    expect(screen.getByText('My Team')).toBeInTheDocument();
    expect(screen.getByText('Funding')).toBeInTheDocument();
    expect(screen.getByText('Pischon AI')).toBeInTheDocument();
  });

  it('highlights the active route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/blueprint']}>
        <SidebarNav />
      </MemoryRouter>,
    );
    const link = screen.getByText('My Blueprint').closest('a');
    expect(link).toHaveClass('text-primary');
  });

  it('renders Eden Valley branding', () => {
    render(
      <MemoryRouter>
        <SidebarNav />
      </MemoryRouter>,
    );
    expect(screen.getByText('EDEN')).toBeInTheDocument();
    expect(screen.getByText('VALLEY')).toBeInTheDocument();
  });
});

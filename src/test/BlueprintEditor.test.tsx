import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BlueprintEditor from '../pages/dashboard/BlueprintEditor';

vi.mock('../services/api', () => ({
  fetchBlueprint: vi.fn().mockRejectedValue(new Error('Not found')),
  saveBlueprint: vi.fn(),
}));

describe('BlueprintEditor', () => {
  it('shows empty state with prompt to add first card', async () => {
    render(
      <MemoryRouter>
        <BlueprintEditor />
      </MemoryRouter>
    );
    expect(await screen.findByText(/start your blueprint/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add your first card/i })).toBeInTheDocument();
  });

  it('renders page title', async () => {
    render(
      <MemoryRouter>
        <BlueprintEditor />
      </MemoryRouter>
    );
    expect(await screen.findByText('My Blueprint')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultPage from '../pages/ResultPage';
import { LanguageProvider } from '../i18n/LanguageContext';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock intersection observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

const queryClient = new QueryClient();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('ResultPage storytelling rendering', () => {
  it('renders the storyteller content for thinker', async () => {
    render(
      <Wrapper>
        <ResultPage type="thinker" />
      </Wrapper>
    );
    
    // Check for title (Wait for loading screen if necessary, but we can check existence after timeout)
    // For unit tests, we might want to mock LoadingScreen or shorten the duration
  });
});

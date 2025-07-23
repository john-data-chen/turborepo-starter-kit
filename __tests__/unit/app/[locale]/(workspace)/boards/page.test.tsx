import BoardPage from '@/app/[locale]/(workspace)/boards/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock server-only modules
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key)
}));

// Mock child components
vi.mock('@/components/kanban/BoardOverview', () => ({
  BoardOverview: () => <div data-testid="board-overview">BoardOverview</div>
}));

describe('BoardPage', () => {
  it('should render BoardOverview component', () => {
    render(<BoardPage />);
    expect(screen.getByTestId('board-overview')).toBeInTheDocument();
  });
});

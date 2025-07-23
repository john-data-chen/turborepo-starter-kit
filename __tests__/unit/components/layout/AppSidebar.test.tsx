import AppSidebar from '@/components/layout/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useBoards } from '@/hooks/useBoards';
import { usePathname } from '@/i18n/navigation';
import { Board } from '@/types/dbInterface';
import { describe, expect, it, vi } from 'vitest';
import { render as customRender, screen } from '../../test-utils';

// Mock i18n navigation
vi.mock('@/i18n/navigation', () => ({
  usePathname: vi.fn(),
  Link: vi.fn(({ href, children, ...props }) => (
    <a href={href as string} {...props}>
      {children}
    </a>
  ))
}));

// Mock useBoards hook
vi.mock('@/hooks/useBoards');

// Mock next-intl
vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: () => (key: string) => key
  };
});

describe('AppSidebar Component', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return customRender(<SidebarProvider>{ui}</SidebarProvider>);
  };

  const myTestBoards: Board[] = [
    {
      _id: '1',
      title: 'Board 1',
      description: '',
      owner: { id: 'user1', name: 'Test User' },
      members: [],
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      title: 'Board 2',
      description: '',
      owner: { id: 'user1', name: 'Test User' },
      members: [],
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  const teamTestBoards: Board[] = [
    {
      _id: '3',
      title: 'Team Board 1',
      description: '',
      owner: { id: 'user1', name: 'Test User' },
      members: [],
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  it('should render project name correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />);

    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should highlight overview link when on boards page', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />);

    const overviewLink = screen.getByRole('link', { name: 'overview' });
    expect(overviewLink).toHaveAttribute('data-active', 'true');
  });

  it('should render loading state correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: true,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />);

    const loadingElements = screen.getAllByText('loading');
    expect(loadingElements).toHaveLength(2);
  });

  it('should render my boards correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: myTestBoards,
      teamBoards: [],
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />);

    expect(screen.getByText('Board 1')).toBeInTheDocument();
    expect(screen.getByText('Board 2')).toBeInTheDocument();
  });

  it('should render team boards correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: teamTestBoards,
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />);

    expect(screen.getByText('Team Board 1')).toBeInTheDocument();
  });

  it('should highlight active board link', () => {
    vi.mocked(usePathname).mockReturnValue('/boards/1');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: myTestBoards,
      teamBoards: [],
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />);

    const boardLink = screen.getByRole('link', { name: 'Board 1' });
    expect(boardLink).toHaveAttribute('data-active', 'true');
  });
});

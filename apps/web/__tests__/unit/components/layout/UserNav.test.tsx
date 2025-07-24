import { UserNav } from '@/components/layout/UserNav';
import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/navigation';
import userEvent from '@testing-library/user-event';
import { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test-utils';

// Mock dependencies
vi.mock('next-auth/react', async (importOriginal) => {
  const mod = await importOriginal<typeof import('next-auth/react')>();
  return {
    ...mod,
    useSession: vi.fn(),
    signOut: vi.fn()
  };
});

vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn()
}));

vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: () => (key: string) => key
  };
});

describe('UserNav Component', () => {
  const mockSession: Session = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.png',
      id: 'test-user-id'
    },
    expires: new Date(Date.now() + 2 * 86400).toISOString()
  };

  const mockRouterPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockRouterPush
    } as any);
  });

  it('should render nothing when there is no session', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });
    const { container } = render(<UserNav />);
    expect(
      container.querySelector('button[aria-haspopup="menu"]')
    ).not.toBeInTheDocument();
  });

  it('should render the user avatar button when session exists', () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn()
    });
    render(<UserNav />);
    const avatarButton = screen.getByRole('button');
    expect(avatarButton).toBeInTheDocument();
  });

  it('should open dropdown, show user info and logout option on button click', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn()
    });
    const user = userEvent.setup();
    render(<UserNav />);
    const avatarButton = screen.getByRole('button');

    await user.click(avatarButton);

    expect(screen.getByText(mockSession.user?.name ?? '')).toBeInTheDocument();
    expect(screen.getByText(mockSession.user?.email ?? '')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'logOut' })
    ).toBeInTheDocument();
  });

  it('should call signOut with redirect:false and then router.push on logout click', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn()
    });
    const user = userEvent.setup();
    render(<UserNav />);
    const avatarButton = screen.getByRole('button');

    await user.click(avatarButton);
    const logoutMenuItem = screen.getByRole('menuitem', { name: 'logOut' });
    await user.click(logoutMenuItem);

    expect(vi.mocked(signOut)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(signOut)).toHaveBeenCalledWith({ redirect: false });
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN);
  });
});

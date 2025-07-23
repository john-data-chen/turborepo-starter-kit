import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn()
}));

// Mock useBreadcrumbs hook
vi.mock('@/hooks/useBreadcrumbs', () => ({
  useBreadcrumbs: vi.fn()
}));

describe('Breadcrumbs Component', () => {
  it('should render single breadcrumb item correctly', () => {
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [{ title: 'Home', link: '/boards' }],
      rootLink: '/boards'
    });

    render(<Breadcrumbs />);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/boards');
  });

  it('should render multiple breadcrumb items correctly for desktop', () => {
    // Mock desktop view
    vi.mocked(useIsMobile).mockReturnValue(false);

    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [
        { title: 'Home', link: '/boards' },
        { title: 'Boards', link: '/boards' },
        { title: 'Project', link: '/boards/1' }
      ],
      rootLink: '/boards'
    });

    render(<Breadcrumbs />);

    // Check if the navigation is rendered
    const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(nav).toBeInTheDocument();

    // Check all breadcrumb items are rendered
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);

    // Check each breadcrumb item
    expect(links[0]).toHaveTextContent('More');
    expect(links[0]).toHaveAttribute('href', '/boards');

    expect(links[1]).toHaveTextContent('Project');
    expect(links[1]).toHaveAttribute('href', '/boards/1');

    expect(links[2]).toHaveTextContent('Home');
    expect(links[2]).toHaveAttribute('href', '/boards');
  });

  it('should render mobile view correctly for multiple items', () => {
    // Mock mobile view
    vi.mocked(useIsMobile).mockReturnValue(true);

    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [
        { title: 'Home', link: '/boards' },
        { title: 'Boards', link: '/boards' },
        { title: 'Project', link: '/boards/1' }
      ],
      rootLink: '/boards'
    });

    render(<Breadcrumbs />);

    // Check if the navigation is rendered
    const mobileContainer = screen.getByRole('navigation', {
      name: 'breadcrumb'
    });
    expect(mobileContainer).toBeInTheDocument();

    // Check for the ellipsis link (first link in mobile view)
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/boards');
    expect(links[0].querySelector('svg')).toBeInTheDocument(); // Check for ellipsis icon

    // Check for the last item link
    expect(links[1]).toHaveTextContent('Project');
    expect(links[1]).toHaveAttribute('href', '/boards/1');
  });

  it('should handle separator rendering correctly', () => {
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [
        { title: 'Home', link: '/boards' },
        { title: 'Boards', link: '/boards' }
      ],
      rootLink: '/boards'
    });

    render(<Breadcrumbs />);

    const separators = document.querySelectorAll('[aria-hidden="true"]');
    expect(separators.length).toBeGreaterThan(0);
  });
});

import {
  getPathname,
  Link,
  redirect,
  usePathname,
  useRouter
} from '@/i18n/navigation';
import { describe, expect, it, vi } from 'vitest';

// Mock next-intl/navigation and routing
vi.mock('next-intl/navigation', () => ({
  createNavigation: vi.fn(() => ({
    Link: 'MockLink',
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
    getPathname: vi.fn()
  }))
}));
vi.mock('@/i18n/routing', () => ({
  routing: {}
}));

describe('navigation exports', () => {
  it('should export Link, redirect, usePathname, useRouter, getPathname', () => {
    expect(Link).toBeDefined();
    expect(redirect).toBeInstanceOf(Function);
    expect(usePathname).toBeInstanceOf(Function);
    expect(useRouter).toBeInstanceOf(Function);
    expect(getPathname).toBeInstanceOf(Function);
  });
});

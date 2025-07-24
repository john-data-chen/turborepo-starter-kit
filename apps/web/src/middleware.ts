import { ROUTES } from '@/constants/routes';
import { routing } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

// Assuming you'll export these

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/auth')) {
    return;
  }

  const isAuthenticated = !!req.auth;

  if (pathname.startsWith('/api')) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return;
  }

  const i18nResponse = intlMiddleware(req);
  if (i18nResponse) {
    return i18nResponse;
  }

  const { locale, pathname: pathnameAfterI18n } = req.nextUrl;
  const isAuthRoute = pathnameAfterI18n === ROUTES.AUTH.LOGIN;

  const getRedirectUrl = (path: string) => {
    return new URL(`/${locale}${path}`, req.url);
  };

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(getRedirectUrl(ROUTES.BOARDS.ROOT));
  }

  if (!isAuthenticated && !isAuthRoute) {
    return NextResponse.redirect(getRedirectUrl(ROUTES.AUTH.LOGIN));
  }

  return;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

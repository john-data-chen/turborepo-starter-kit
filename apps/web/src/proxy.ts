import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public routes
  const isPublicRoute =
    pathname.includes("/login") || pathname.startsWith("/api") || pathname.startsWith("/_next");

  if (!isPublicRoute) {
    const token =
      request.cookies.get("jwt")?.value || request.cookies.get("isAuthenticated")?.value;

    if (!token) {
      // Extract locale from pathname or use default
      const pathLocale = pathname.split("/")[1];
      const locale =
        pathLocale && routing.locales.includes(pathLocale as any)
          ? pathLocale
          : routing.defaultLocale;

      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  // We skip all API routes, including the old /api/auth paths
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};

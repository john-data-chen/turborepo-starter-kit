import createMiddleware from "next-intl/middleware"

import { routing } from "@/i18n/routing"

/**
 * This middleware is now only responsible for internationalization (i18n).
 * Authentication is handled on the client-side by AuthContext and the useAuth hook.
 * Server-side route protection via middleware has been removed.
 */
export default createMiddleware(routing)

export const config = {
  // Match only internationalized pathnames
  // We skip all API routes, including the old /api/auth paths
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}

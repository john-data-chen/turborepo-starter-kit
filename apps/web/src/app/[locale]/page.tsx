'use client'

import { useEffect } from 'react'
import { ROUTES } from '@/constants/routes'
import { useRouter } from '@/i18n/navigation'
import { useAuthStore } from '@/stores/auth-store'

// This page acts as a client-side entry point to redirect users
// based on their authentication status.
export default function RootPage() {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Wait until the authentication status is determined
    if (isLoading) {
      return
    }

    if (user) {
      // If user is logged in, redirect to the main content page
      router.replace(ROUTES.BOARDS.OVERVIEW_PAGE)
    } else {
      // If user is not logged in, redirect to the login page
      // Note: We are hardcoding '/login' as it's a frontend route
      // and not part of the API routes constant.
      router.replace('/login')
    }
  }, [user, isLoading, router])

  // Render a loading state while we determine the redirect.
  // This can be replaced with a more sophisticated loading spinner component.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Loading...</p>
    </div>
  )
}

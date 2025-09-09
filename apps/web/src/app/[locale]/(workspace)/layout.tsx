'use client'

import RootWrapper from '@/components/layout/RootWrapper'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Suspense, use, useEffect } from 'react'

interface AppLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default function AppLayout({ children, params }: Readonly<AppLayoutProps>) {
  const { locale } = use(params)
  const t = useTranslations('sidebar')
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Add a small delay to prevent race conditions with fresh logins
    const timer = setTimeout(() => {
      // Only redirect if we're not loading and not authenticated
      if (!isLoading && !isAuthenticated) {
        router.replace(`/${locale}/login`)
      }
    }, 200) // 200ms delay to allow auth state to settle

    return () => clearTimeout(timer)
  }, [isAuthenticated, isLoading, locale, router])

  // Show loading while checking authentication
  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return <div>{t('loading')}</div>
  }

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <RootWrapper>{children}</RootWrapper>
    </Suspense>
  )
}

'use client'

import { TOAST_DURATION } from '@/constants/ui'
import { Toaster } from 'sonner'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        expand={false}
        toastOptions={{
          duration: TOAST_DURATION
        }}
        visibleToasts={1}
        closeButton
      />
    </>
  )
}

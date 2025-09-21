'use client'

import React from 'react'
import AppSidebar from '@/components/layout/AppSidebar'
import Header from '@/components/layout/Header'
import { TOAST_DURATION } from '@/constants/ui'
import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar'
import { Toaster } from 'sonner'

export default function RootWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
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

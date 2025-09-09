'use client'

import AppSidebar from '@/components/layout/AppSidebar'
import Header from '@/components/layout/Header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TOAST_DURATION } from '@/constants/ui'
import React from 'react'
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

"use client"

import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar"
import React from "react"
import { Toaster } from "sonner"

import AppSidebar from "@/components/layout/AppSidebar"
import Header from "@/components/layout/Header"
import { TOAST_DURATION } from "@/constants/ui"

export default function RootWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider defaultOpen={true}>
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

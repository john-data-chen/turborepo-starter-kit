'use client';

import AppSidebar from '@/components/layout/AppSidebar';
import Header from '@/components/layout/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import React from 'react';

export default function RootWrapper({
  children
}: {
  children: React.ReactNode;
}) {
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
        position={'bottom-right'}
        expand={false}
        toastOptions={{
          duration: 1000
        }}
        visibleToasts={1}
        closeButton
      />
    </>
  );
}

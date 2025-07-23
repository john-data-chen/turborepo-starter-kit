'use client';

import { Toaster } from '@/components/ui/sonner';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <>
      {children}
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

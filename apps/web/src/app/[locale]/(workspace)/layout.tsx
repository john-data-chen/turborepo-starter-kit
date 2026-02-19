import { Suspense } from "react";

import RootWrapper from "@/components/layout/RootWrapper";

interface AppLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AppLayout({ children }: Readonly<AppLayoutProps>) {
  return (
    <Suspense fallback=<WorkspaceLoadingSkeleton />>
      <RootWrapper>{children}</RootWrapper>
    </Suspense>
  );
}

function WorkspaceLoadingSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  );
}

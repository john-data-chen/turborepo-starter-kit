import { ScrollArea } from "@repo/ui/components/scroll-area";
import React from "react";

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  const contentClasses = "h-full px-4 sm:px-6";

  return (
    <div data-testid="page-container">
      {scrollable ? (
        <ScrollArea className="h-[calc(100dvh-52px)]">
          <div data-testid="content-area" className={contentClasses}>
            {children}
          </div>
        </ScrollArea>
      ) : (
        <div data-testid="content-area" className={contentClasses}>
          {children}
        </div>
      )}
    </div>
  );
}

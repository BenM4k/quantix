import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn("p-6 sm:p-8 md:p-12 space-y-8 max-w-7xl mx-auto w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}

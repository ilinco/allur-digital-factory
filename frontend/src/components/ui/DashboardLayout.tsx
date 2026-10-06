import { type ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-dvh bg-slate-50 font-sans text-slate-900 antialiased">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};

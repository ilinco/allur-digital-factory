import { type ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-dvh bg-[#f6f6f6] font-sans text-slate-900 antialiased">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col p-2.5 pl-0 sm:p-4 sm:pl-0 overflow-x-hidden">
        <div className="flex min-h-full min-w-0 flex-1 flex-col rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-[#fdfcfd] shadow-2xs">
          {children}
        </div>
      </div>
    </div>
  );
};

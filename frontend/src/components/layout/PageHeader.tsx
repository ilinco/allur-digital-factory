import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, actions }: PageHeaderProps) => {
  return (
    <header className="flex flex-col gap-4 px-4 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6 sm:pb-4">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h1>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </header>
  );
};

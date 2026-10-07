import { type ReactNode } from "react";

interface PageContentProps {
  children: ReactNode;
}

export const PageContent = ({ children }: PageContentProps) => {
  return (
    <main className="flex flex-1 flex-col px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="flex w-full flex-1 flex-col gap-4 sm:gap-5">
        {children}
      </div>
    </main>
  );
};

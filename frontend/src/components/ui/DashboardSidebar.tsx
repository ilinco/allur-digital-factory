import {
  IconChevronLeft,
  IconHeadset,
  IconLayoutDashboard,
  IconSettings,
} from "@tabler/icons-react";
import { type ReactNode } from "react";

interface NavButtonProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavButton = ({ icon, label, isActive, onClick }: NavButtonProps) => {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
        isActive
          ? "bg-red-50 text-[#ff2e1f]"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {icon}
      {isActive && (
        <span className="absolute -left-3 top-2.5 h-5 w-1 rounded-r-full bg-[#ff2e1f]" />
      )}
    </button>
  );
};

export const DashboardSidebar = () => {
  return (
    <aside className="sticky top-0 flex h-dvh w-18 flex-col items-center justify-between border-r border-slate-200 bg-white py-5 select-none">
      <div className="flex flex-col items-center gap-6">
        <img src="logo.svg" alt="allur logo" />
        <button
          type="button"
          title="Свернуть меню"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <IconChevronLeft size={18} stroke={1.75} />
        </button>

        <nav className="flex flex-col items-center gap-3">
          <NavButton
            icon={<IconLayoutDashboard size={20} stroke={1.8} />}
            label="Обзор завода"
            isActive
          />
        </nav>
      </div>

      <div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-4">
        <NavButton
          icon={<IconHeadset size={20} stroke={1.8} />}
          label="Поддержка диспетчера"
        />
        <NavButton
          icon={<IconSettings size={20} stroke={1.8} />}
          label="Параметры системы"
        />
      </div>
    </aside>
  );
};

import {
  IconArrowBarLeft,
  IconHeadset,
  IconSettings,
  IconSmartHome,
} from '@tabler/icons-react';
import { type ReactNode } from 'react';

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
      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-colors ${
        isActive
          ? 'bg-white text-[#ff2e1f] shadow-2xs'
          : 'text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700'
      }`}
    >
      {icon}
    </button>
  );
};

export const DashboardSidebar = () => {
  return (
    <aside className="sticky top-0 flex h-dvh w-16 sm:w-18 flex-col items-center justify-between bg-[#f6f6f6] py-5 select-none shrink-0">
      <div className="flex flex-col items-center gap-5">
        <div className="flex h-10 items-center justify-center">
          <img
            src="/logo.svg"
            alt="Allur logo"
            className="h-4.5 w-auto object-contain"
          />
        </div>

        <button
          type="button"
          title="Свернуть меню"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-600 transition-colors"
        >
          <IconArrowBarLeft size={18} stroke={1.75} />
        </button>

        <nav className="flex flex-col items-center gap-2.5">
          <NavButton
            icon={<IconSmartHome size={20} stroke={1.8} />}
            label="Обзор завода"
          />
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2.5">
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

import {
  IconArrowBarLeft,
  IconArrowBarRight,
  IconDeviceAnalytics,
  IconFileAi,
  IconHeadset,
  IconSchema,
  IconSettings,
} from '@tabler/icons-react';
import { StaticLinks } from '@/config/StaticLinks';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { SidebarNavItem } from './SidebarNavItem';

export const DashboardSidebar = () => {
  const { isCollapsed, toggle } = useSidebarCollapse();
  const toggleLabel = isCollapsed ? 'Развернуть меню' : 'Свернуть меню';
  const ToggleIcon = isCollapsed ? IconArrowBarRight : IconArrowBarLeft;

  return (
    <aside
      className={`sticky top-0 flex h-dvh shrink-0 select-none flex-col justify-between overflow-hidden bg-[#f6f6f6] px-4 py-5 transition-[width] duration-200 ${
        isCollapsed ? 'w-18' : 'w-60'
      }`}
    >
      <div className="flex flex-col gap-6">
        <div
          className={`flex gap-4 ${
            isCollapsed
              ? 'flex-col items-center'
              : 'items-center justify-between'
          }`}
        >
          <div className="flex h-10 items-center">
            <img
              src="/logo.svg"
              alt="Allur logo"
              className="h-4.5 w-auto object-contain"
            />
          </div>
          <button
            type="button"
            onClick={toggle}
            title={toggleLabel}
            aria-label={toggleLabel}
            aria-expanded={!isCollapsed}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-800"
          >
            <ToggleIcon size={18} stroke={1.75} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarNavItem
            to={StaticLinks.home}
            icon={<IconDeviceAnalytics size={20} stroke={1.8} />}
            label="Аналитика"
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            to={StaticLinks.schema}
            icon={<IconSchema size={20} stroke={1.8} />}
            label="Схема производства"
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            to={StaticLinks.forecast}
            icon={<IconFileAi size={20} stroke={1.8} />}
            label="AI-Прогноз"
            isCollapsed={isCollapsed}
          />
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <SidebarNavItem
          icon={<IconHeadset size={20} stroke={1.8} />}
          label="Поддержка"
          isCollapsed={isCollapsed}
        />
        <SidebarNavItem
          icon={<IconSettings size={20} stroke={1.8} />}
          label="Параметры"
          isCollapsed={isCollapsed}
        />
      </div>
    </aside>
  );
};

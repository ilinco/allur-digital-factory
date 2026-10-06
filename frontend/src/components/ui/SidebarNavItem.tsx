import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

interface SidebarNavItemProps {
  icon: ReactNode;
  label: string;
  isCollapsed: boolean;
  to?: string;
  onClick?: () => void;
}

const BASE_CLASS =
  'flex h-10 w-full cursor-pointer items-center rounded-xl text-sm font-medium transition-colors';
const ACTIVE_CLASS = 'bg-white text-primary font-semibold shadow-2xs';
const INACTIVE_CLASS =
  'text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800';

const ItemContent = ({
  icon,
  label,
  isCollapsed,
}: Pick<SidebarNavItemProps, 'icon' | 'label' | 'isCollapsed'>) => (
  <>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center">
      {icon}
    </span>
    <span
      className={isCollapsed ? 'sr-only' : 'truncate whitespace-nowrap pr-3'}
    >
      {label}
    </span>
  </>
);

export const SidebarNavItem = ({
  icon,
  label,
  isCollapsed,
  to,
  onClick,
}: SidebarNavItemProps) => {
  const title = isCollapsed ? label : undefined;

  if (to) {
    return (
      <NavLink
        to={to}
        end
        title={title}
        className={({ isActive }) =>
          `${BASE_CLASS} ${isActive ? ACTIVE_CLASS : INACTIVE_CLASS}`
        }
      >
        <ItemContent icon={icon} label={label} isCollapsed={isCollapsed} />
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`${BASE_CLASS} ${INACTIVE_CLASS}`}
    >
      <ItemContent icon={icon} label={label} isCollapsed={isCollapsed} />
    </button>
  );
};

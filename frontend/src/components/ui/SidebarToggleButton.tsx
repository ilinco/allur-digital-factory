import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';

export interface SidebarToggleButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export const SidebarToggleButton = ({
  isCollapsed,
  onToggle,
  className = '',
}: SidebarToggleButtonProps) => {
  const label = isCollapsed ? 'Развернуть меню' : 'Свернуть меню';
  const ToggleIcon = isCollapsed ? IconArrowBarRight : IconArrowBarLeft;

  return (
    <button
      type="button"
      onClick={onToggle}
      title={label}
      aria-label={label}
      aria-expanded={!isCollapsed}
      className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-800 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
    >
      <ToggleIcon size={18} stroke={1.75} />
    </button>
  );
};

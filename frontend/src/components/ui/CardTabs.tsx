import type { ReactNode } from 'react';

export interface CardTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface CardTabsProps<T extends string = string> {
  tabs: CardTabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export const CardTabs = <T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: CardTabsProps<T>) => {
  return (
    <div
      role="tablist"
      className={`flex border-b border-slate-200 text-sm font-medium text-slate-500 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 pb-2.5 transition-colors outline-none focus:outline-none ${
              isActive
                ? 'border-b-2 border-primary font-semibold text-primary'
                : 'hover:text-slate-700'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>
              {tab.label}
              {typeof tab.count === 'number' && ` (${tab.count})`}
            </span>
          </button>
        );
      })}
    </div>
  );
};

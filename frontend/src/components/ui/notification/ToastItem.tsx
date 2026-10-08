import { useEffect, useRef, useState } from 'react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import type { ToastItemData } from '@/types/notification';

interface ToastItemProps {
  toast: ToastItemData;
  onDismiss: (id: string) => void;
}

const TYPE_CONFIG = {
  success: {
    icon: IconCircleCheck,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    defaultTitle: 'Успешное действие',
  },
  error: {
    icon: IconAlertCircle,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    defaultTitle: 'Ошибка выполнения',
  },
  warning: {
    icon: IconAlertTriangle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    defaultTitle: 'Предупреждение',
  },
  info: {
    icon: IconInfoCircle,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    defaultTitle: 'Информация',
  },
};

export const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
  const { id, type, title, message, duration = 4000, action } = toast;
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const remainingTimeRef = useRef(duration);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (duration <= 0) return;

    lastTickRef.current = Date.now();
    const interval = window.setInterval(() => {
      if (isPaused) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const elapsed = now - (lastTickRef.current ?? now);
      lastTickRef.current = now;

      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      setProgress((remainingTimeRef.current / duration) * 100);

      if (remainingTimeRef.current <= 0) {
        window.clearInterval(interval);
        onDismiss(id);
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [id, duration, isPaused, onDismiss]);

  return (
    <div
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg transition-all duration-200 pointer-events-auto"
    >
      <div className="flex items-start gap-3">
        {/* Semantic Icon Chip */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconBg} ${config.iconColor}`}
        >
          <Icon size={18} stroke={2} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-xs font-bold text-slate-900 leading-tight">
            {title || config.defaultTitle}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-600 leading-relaxed break-words">
            {message}
          </p>

          {/* Action button if provided */}
          {action && (
            <button
              type="button"
              onClick={() => {
                action.onClick();
                onDismiss(id);
              }}
              className="mt-2 inline-flex items-center text-xs font-semibold text-slate-800 underline underline-offset-2 hover:text-slate-950 cursor-pointer"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
          aria-label="Закрыть уведомление"
        >
          <IconX size={15} stroke={2} />
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
          <div
            className={`h-full transition-all duration-75 ${
              type === 'error'
                ? 'bg-rose-500'
                : type === 'warning'
                ? 'bg-amber-500'
                : type === 'success'
                ? 'bg-emerald-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

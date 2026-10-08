import { useToast } from '@/hooks/useToast';
import { ToastItem } from './ToastItem';

export const ToastContainer = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Уведомления системы"
      className="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 pointer-events-none sm:top-5 sm:right-5"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} onDismiss={dismiss} />
      ))}
    </div>
  );
};

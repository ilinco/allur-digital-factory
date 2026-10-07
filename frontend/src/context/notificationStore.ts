import type { ToastItemData, ToastOptions, ToastType } from '@/types/notification';

type Listener = () => void;

let toasts: ToastItemData[] = [];
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const notificationStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): ToastItemData[] {
    return toasts;
  },

  add(message: string, type: ToastType = 'info', options?: ToastOptions): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const duration =
      options?.duration !== undefined
        ? options.duration
        : type === 'error'
        ? 6000
        : type === 'warning'
        ? 5000
        : 4000;

    const newToast: ToastItemData = {
      id,
      type,
      message,
      title: options?.title,
      duration,
      action: options?.action,
      timestamp: Date.now(),
    };

    // Keep max 5 most recent toasts
    toasts = [newToast, ...toasts.slice(0, 4)];
    notify();
    return id;
  },

  dismiss(id: string): void {
    const prevCount = toasts.length;
    toasts = toasts.filter((item) => item.id !== id);
    if (toasts.length !== prevCount) {
      notify();
    }
  },

  clear(): void {
    if (toasts.length > 0) {
      toasts = [];
      notify();
    }
  },
};

export const toast = {
  success(message: string, options?: ToastOptions): string {
    return notificationStore.add(message, 'success', options);
  },
  error(message: string, options?: ToastOptions): string {
    return notificationStore.add(message, 'error', options);
  },
  warning(message: string, options?: ToastOptions): string {
    return notificationStore.add(message, 'warning', options);
  },
  info(message: string, options?: ToastOptions): string {
    return notificationStore.add(message, 'info', options);
  },
  dismiss(id: string): void {
    notificationStore.dismiss(id);
  },
  clear(): void {
    notificationStore.clear();
  },
};

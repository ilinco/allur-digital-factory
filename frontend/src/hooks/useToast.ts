import { useSyncExternalStore } from 'react';
import { notificationStore, toast } from '@/context/notificationStore';
import type { ToastItemData } from '@/types/notification';

export const useToast = () => {
  const toasts: ToastItemData[] = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getSnapshot,
    notificationStore.getSnapshot,
  );

  return {
    toasts,
    toast,
    dismiss: notificationStore.dismiss,
    clear: notificationStore.clear,
  };
};

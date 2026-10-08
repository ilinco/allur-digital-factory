export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItemData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: ToastAction;
  timestamp: number;
}

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  duration?: number;
  action?: ToastAction;
}

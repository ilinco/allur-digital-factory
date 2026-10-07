import type { ReactNode } from 'react';

export interface SelectOption<T = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
}

export type SelectSize = 'sm' | 'md' | 'lg';

export type SelectVariant = 'default' | 'subtle' | 'ghost';

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  size?: SelectSize;
  variant?: SelectVariant;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  dropdownClassName?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

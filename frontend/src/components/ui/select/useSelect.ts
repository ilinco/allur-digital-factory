import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import type { SelectOption } from './types';

interface UseSelectParams<T> {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
}

interface UseSelectReturn<T> {
  isOpen: boolean;
  toggleOpen: () => void;
  close: () => void;
  open: () => void;
  selectedValue?: T;
  selectedOption?: SelectOption<T>;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  handleSelect: (option: SelectOption<T>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  listboxRef: RefObject<HTMLUListElement | null>;
  listboxId: string;
}

export function useSelect<T = string>({
  options,
  value,
  defaultValue,
  onChange,
  disabled = false,
}: UseSelectParams<T>): UseSelectReturn<T> {
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLUListElement | null>(null);

  const generatedId = useId();
  const listboxId = `select-listbox-${generatedId}`;

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const selectedIndex = options.findIndex((opt) => opt.value === selectedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [disabled, selectedIndex]);

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const toggleOpen = useCallback(() => {
    if (disabled) return;
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [disabled, isOpen, close, open]);

  const handleSelect = useCallback(
    (option: SelectOption<T>) => {
      if (option.disabled || disabled) return;
      if (!isControlled) {
        setInternalValue(option.value);
      }
      onChange?.(option.value);
      close();
      triggerRef.current?.focus();
    },
    [disabled, isControlled, onChange, close],
  );

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        target &&
        !containerRef.current.contains(target)
      ) {
        close();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, close]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listboxRef.current) return;
    const items = listboxRef.current.querySelectorAll('[role="option"]');
    const targetItem = items[highlightedIndex] as HTMLElement | undefined;
    targetItem?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, highlightedIndex]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;

      if (!isOpen) {
        if (
          event.key === 'ArrowDown' ||
          event.key === 'ArrowUp' ||
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault();
          open();
        }
        return;
      }

      switch (event.key) {
        case 'Escape': {
          event.preventDefault();
          close();
          triggerRef.current?.focus();
          break;
        }
        case 'Tab': {
          close();
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          setHighlightedIndex((prev) => {
            let next = prev + 1;
            while (next < options.length && options[next].disabled) {
              next++;
            }
            return next < options.length ? next : prev;
          });
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && options[next].disabled) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
          break;
        }
        case 'Home': {
          event.preventDefault();
          const firstValid = options.findIndex((opt) => !opt.disabled);
          if (firstValid >= 0) setHighlightedIndex(firstValid);
          break;
        }
        case 'End': {
          event.preventDefault();
          for (let i = options.length - 1; i >= 0; i--) {
            if (!options[i].disabled) {
              setHighlightedIndex(i);
              break;
            }
          }
          break;
        }
        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (highlightedIndex >= 0 && options[highlightedIndex]) {
            handleSelect(options[highlightedIndex]);
          }
          break;
        }
      }
    },
    [disabled, isOpen, open, close, options, highlightedIndex, handleSelect],
  );

  return {
    isOpen,
    toggleOpen,
    close,
    open,
    selectedValue,
    selectedOption,
    highlightedIndex,
    setHighlightedIndex,
    handleSelect,
    handleKeyDown,
    containerRef,
    triggerRef,
    listboxRef,
    listboxId,
  };
}

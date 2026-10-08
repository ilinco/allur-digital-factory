import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import type { SelectProps, SelectSize, SelectVariant } from './types';
import { useSelect } from './useSelect';

const SIZE_TRIGGER_STYLES: Record<SelectSize, string> = {
  sm: 'h-8 px-2.5 text-xs rounded-lg gap-1.5',
  md: 'h-9.5 px-3.5 text-sm rounded-xl gap-2',
  lg: 'h-11 px-4 text-base rounded-xl gap-2.5',
};

const VARIANT_TRIGGER_STYLES: Record<SelectVariant, string> = {
  default:
    'border border-slate-200 bg-white text-slate-800 shadow-2xs hover:border-slate-300 focus:border-slate-400',
  subtle:
    'border border-slate-200 bg-slate-50 text-slate-800 hover:bg-white hover:border-slate-300 focus:border-slate-400 focus:bg-white',
  ghost:
    'border border-transparent bg-transparent text-slate-800 hover:bg-slate-100 focus:border-slate-300',
};

const SIZE_OPTION_STYLES: Record<SelectSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md gap-2',
  md: 'px-3 py-2 text-sm rounded-lg gap-2.5',
  lg: 'px-3.5 py-2.5 text-base rounded-lg gap-3',
};

export function Select<T = string>({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Выберите...',
  label,
  helperText,
  error,
  disabled = false,
  size = 'md',
  variant = 'default',
  leftIcon,
  fullWidth = false,
  className = '',
  dropdownClassName = '',
  id,
  name,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const {
    isOpen,
    toggleOpen,
    selectedOption,
    highlightedIndex,
    setHighlightedIndex,
    handleSelect,
    handleKeyDown,
    containerRef,
    triggerRef,
    listboxRef,
    listboxId,
  } = useSelect<T>({
    options,
    value,
    defaultValue,
    onChange,
    disabled,
  });

  const isError = Boolean(error);
  const chevronSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const checkSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <div
      ref={containerRef}
      className={`relative font-sans ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}
    >
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-xs font-semibold text-slate-700"
        >
          {label}
        </label>
      )}

      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedOption ? String(selectedOption.value) : ''}
        />
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={ariaLabel ?? label ?? placeholder}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={`group relative flex w-full items-center justify-between transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50 ${
          SIZE_TRIGGER_STYLES[size]
        } ${VARIANT_TRIGGER_STYLES[variant]} ${
          isError ? '!border-rose-400 !focus-visible:ring-rose-200' : ''
        }`}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {leftIcon && (
            <span className="shrink-0 text-slate-400 group-focus:text-slate-600">
              {leftIcon}
            </span>
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-500">
              {selectedOption.icon}
            </span>
          )}
          <span
            className={`truncate font-medium ${
              selectedOption ? 'text-slate-800' : 'text-slate-400'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <span
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-600' : ''
          }`}
        >
          <IconChevronDown size={chevronSize} stroke={2} />
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 z-50 mt-1.5 min-w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 ${dropdownClassName}`}
        >
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={ariaLabel ?? label ?? placeholder}
            onKeyDown={handleKeyDown}
            className="max-h-60 overflow-y-auto outline-none focus:outline-none"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-center text-xs text-slate-400">
                Нет доступных вариантов
              </li>
            ) : (
              options.map((option, index) => {
                const isSelected = selectedOption?.value === option.value;
                const isHighlighted = highlightedIndex === index;

                return (
                  <li
                    key={String(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onMouseEnter={() => {
                      if (!option.disabled) setHighlightedIndex(index);
                    }}
                    onClick={() => handleSelect(option)}
                    className={`flex cursor-pointer items-center justify-between transition-colors select-none ${
                      SIZE_OPTION_STYLES[size]
                    } ${
                      option.disabled
                        ? 'cursor-not-allowed opacity-40'
                        : isHighlighted
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-700 hover:bg-slate-50'
                    } ${isSelected ? 'font-semibold text-slate-900 bg-slate-50' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {option.icon && (
                        <span className="shrink-0 text-slate-500">
                          {option.icon}
                        </span>
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{option.label}</span>
                        {option.description && (
                          <span className="text-[11px] font-normal text-slate-400">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <span className="shrink-0 pl-2 text-slate-700">
                        <IconCheck size={checkSize} stroke={2.5} />
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

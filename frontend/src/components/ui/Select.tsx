import React, { forwardRef, SelectHTMLAttributes, useId, useRef, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  clearable?: boolean;
  onChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, placeholder, options, clearable = false, className, id: providedId, onChange, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(props.value || '');
    const selectRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const describedBy = clsx(
      error && errorId,
      helperText && !error && helperId
    );

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (selectRef.current && !selectRef.current.contains(event.target as Node) &&
            dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (value: string) => {
      setSelectedValue(value);
      onChange?.(value);
      props.onChange?.({ target: { value } } as React.ChangeEvent<HTMLSelectElement>);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          setIsOpen(!isOpen);
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setIsOpen(true);
          break;
        case 'ArrowUp':
          event.preventDefault();
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          break;
      }
    };

    const selectedOption = options.find(opt => opt.value === selectedValue);

    return (
      <div className="w-full" ref={selectRef}>
        {label && (
          <label htmlFor={id} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <button
            type="button"
            id={id}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy || undefined}
            aria-disabled={props.disabled ? 'true' : 'false'}
            className={twMerge(
              'input',
              'w-full text-left justify-between pr-10',
              error && 'input-error',
              clearable && selectedValue && 'pr-14',
              className
            )}
            onClick={() => !props.disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            tabIndex={props.disabled ? -1 : 0}
          >
            <span className={clsx(
              'truncate block',
              !selectedValue && !placeholder && 'text-foreground-tertiary'
            )}>
              {selectedValue ? selectedOption?.label : (placeholder || 'Select...')}
            </span>
            {isOpen ? <ChevronUp className="w-5 h-5 flex-shrink-0 text-foreground-tertiary" /> : <ChevronDown className="w-5 h-5 flex-shrink-0 text-foreground-tertiary" />}
            {clearable && selectedValue && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground-primary transition-colors p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChange('');
                }}
                aria-label="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </button>
          {isOpen && (
            <div
              ref={dropdownRef}
              role="listbox"
              aria-label={label || 'Select options'}
              className="absolute z-[100] w-full mt-1 bg-background-primary border border-border rounded-md shadow-lg max-h-60 overflow-auto scrollbar-thin"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selectedValue === option.value}
                  disabled={option.disabled}
                  className={clsx(
                    'w-full px-3 py-2 text-left text-sm transition-colors',
                    selectedValue === option.value
                      ? 'bg-background-selected text-foreground-primary'
                      : 'hover:bg-background-hover',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => {
                    if (!option.disabled) {
                      handleChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {option.label}
                </button>
              ))}
              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-foreground-tertiary">
                  No options available
                </div>
              )}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="error-text" role="alert">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="helper-text">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
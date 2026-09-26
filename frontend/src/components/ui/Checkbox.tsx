import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
import { Check, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate = false, className, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    return (
      <div className="flex items-start gap-2">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className={twMerge(
              'peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-border',
              'bg-background-primary text-brand-blue',
              'checked:bg-brand-blue checked:border-brand-blue',
              'checked:after:content-[""] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1.5 checked:after:h-1.5',
              'focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-fast',
              className
            )}
            aria-checked={indeterminate ? 'mixed' : props.checked}
            {...props}
          />
          {indeterminate && (
            <Minus
              className="absolute w-2.5 h-2.5 text-foreground-on-brand pointer-events-none"
              aria-hidden="true"
            />
          )}
          {!indeterminate && props.checked && (
            <Check
              className="absolute w-2.5 h-2.5 text-foreground-on-brand pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>
        {label && (
          <label
            htmlFor={id}
            className="text-sm text-foreground-primary cursor-pointer select-none leading-relaxed"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
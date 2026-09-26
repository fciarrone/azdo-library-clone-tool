import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';

interface SelectionCardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  metadata?: React.ReactNode;
  footer?: React.ReactNode;
}

export const SelectionCard = forwardRef<HTMLDivElement, SelectionCardProps>(
  ({ 
    selected = false, 
    onClick, 
    icon, 
    title, 
    description, 
    badge, 
    metadata,
    footer,
    className, 
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (!onClick) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={twMerge(
          clsx(
            'group relative w-full rounded-xl border p-4 transition-all duration-200',
            selected
              ? 'border-brand-blue bg-background-selected shadow-md ring-1 ring-brand-blue/20'
              : 'border-border bg-background-secondary hover:border-brand-blue-hover hover:shadow-md hover:-translate-y-0.5',
            onClick && 'cursor-pointer',
            className
          )
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div className={clsx(
              'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm transition-colors',
              selected
                ? 'bg-brand-blue-light text-brand-blue'
                : 'bg-background-tertiary text-foreground-tertiary'
            )}>
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={clsx(
                'truncate text-base font-semibold transition-colors',
                selected ? 'text-foreground-primary' : 'text-foreground-primary'
              )}>
                {title}
              </p>
              {badge && <span className="shrink-0">{badge}</span>}
            </div>

            {description && (
              <p className="mt-1 line-clamp-2 text-sm text-foreground-tertiary">
                {description}
              </p>
            )}

            {metadata && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground-tertiary">
                {metadata}
              </div>
            )}

            {children}
          </div>

          <div className="mt-0.5 shrink-0">
            <div className={clsx(
              'flex h-5 w-5 items-center justify-center rounded-full border transition-all',
              selected
                ? 'border-brand-blue bg-brand-blue text-foreground-on-brand shadow-sm'
                : 'border-border bg-background-primary text-transparent group-hover:border-brand-blue group-hover:text-brand-blue'
            )}>
              <Check className="h-3 w-3" />
            </div>
          </div>
        </div>

        {footer && (
          <div className="mt-3 border-t border-border pt-3">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

SelectionCard.displayName = 'SelectionCard';

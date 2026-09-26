import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface BreadcrumbProps extends HTMLAttributes<HTMLNavElement> {
  items: BreadcrumbItem[];
  maxItems?: number;
}

export const Breadcrumb = forwardRef<HTMLNavElement, BreadcrumbProps>(
  ({ items, maxItems = 5, className, ...props }, ref) => {
    const displayItems = items.length > maxItems
      ? [
          items[0],
          { label: '...', disabled: true },
          ...items.slice(-(maxItems - 1))
        ]
      : items;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={twMerge('flex items-center gap-1.5 flex-wrap', className)}
        {...props}
      >
        <ol className="flex items-center gap-1.5 flex-wrap" role="list">
          {displayItems.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-foreground-tertiary flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              {item.href ? (
                <a
                  href={item.href}
                  className={clsx(
                    'text-sm font-medium transition-colors',
                    item.disabled
                      ? 'text-foreground-tertiary cursor-not-allowed'
                      : 'text-foreground-secondary hover:text-brand-blue'
                  )}
                  aria-current={index === items.length - 1 ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={clsx(
                    'text-sm font-medium transition-colors',
                    item.disabled
                      ? 'text-foreground-tertiary cursor-not-allowed'
                      : 'text-foreground-secondary hover:text-brand-blue'
                  )}
                  aria-current={index === items.length - 1 ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={clsx(
                    'text-sm font-medium',
                    index === items.length - 1 ? 'text-foreground-primary' : 'text-foreground-tertiary'
                  )}
                  aria-current={index === items.length - 1 ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
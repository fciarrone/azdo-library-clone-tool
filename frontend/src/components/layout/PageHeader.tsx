import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';

interface PageHeaderProps extends HTMLAttributes<HTMLHeaderElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  showThemeToggle?: boolean;
}

export const PageHeader = forwardRef<HTMLHeaderElement, PageHeaderProps>(
  ({ title, subtitle, actions, onMenuClick, showMenuButton = false, showThemeToggle = true, className, children, ...props }, ref) => {
    const { theme, toggleTheme } = useTheme();

    return (
      <header
        ref={ref}
        className={twMerge('flex items-center justify-between gap-4 px-4 h-full', className)}
        {...props}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showMenuButton && onMenuClick && (
            <button
              type="button"
              className="p-2 rounded-md text-foreground-tertiary hover:text-foreground-primary hover:bg-background-hover transition-colors lg:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
              aria-expanded="false"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-foreground-primary truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-foreground-tertiary truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showThemeToggle && (
            <button
              type="button"
              className="p-2 rounded-md text-foreground-tertiary hover:text-foreground-primary hover:bg-background-hover transition-colors"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
          {children}
        </div>
      </header>
    );
  }
);

PageHeader.displayName = 'PageHeader';
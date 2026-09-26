import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps extends HTMLAttributes<HTMLAsideElement> {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
  children: React.ReactNode;
}

export const Sidebar = forwardRef<HTMLAsideElement, SidebarProps>(
  ({ isCollapsed, onToggleCollapse, isMobile, children, className, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={twMerge('flex flex-col h-full', className)}
        {...props}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!isCollapsed && (
            <span className="font-semibold text-foreground-primary truncate">
              Azure DevOps Cloner
            </span>
          )}
          {!isMobile && (
            <button
              type="button"
              className={clsx(
                'p-1.5 rounded-md text-foreground-tertiary hover:text-foreground-primary hover:bg-background-hover transition-colors',
                isCollapsed && 'rotate-180'
              )}
              onClick={() => onToggleCollapse(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Navigation">
          {children}
        </nav>
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

interface NavItemProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
}

export function NavItem({ label, icon, active, onClick, disabled, href }: NavItemProps) {
  const Component = href ? 'a' : 'button';
  
  return (
    <Component
      href={href}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-fast',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2',
        active
          ? 'bg-background-selected text-brand-blue'
          : 'text-foreground-secondary hover:bg-background-hover hover:text-foreground-primary',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-current={active ? 'page' : undefined}
    >
      {icon && <span className="w-5 h-5 flex-shrink-0" aria-hidden="true">{icon}</span>}
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Component>
  );
}
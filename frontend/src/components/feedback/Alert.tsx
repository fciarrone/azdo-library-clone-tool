import React, { forwardRef, HTMLAttributes } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type: AlertType;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const iconMap: Record<AlertType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
  error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
  info: <Info className="w-5 h-5 flex-shrink-0" />,
};

const typeClasses: Record<AlertType, string> = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ type, title, dismissible = false, onDismiss, children, className, role = 'alert', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={role}
        className={twMerge('alert', typeClasses[type], className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0" aria-hidden="true">
            {iconMap[type]}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-medium text-sm mb-1">{title}</h4>
            )}
            <div className="text-sm">{children}</div>
          </div>
          {dismissible && onDismiss && (
            <button
              type="button"
              className="flex-shrink-0 p-1 rounded text-foreground-tertiary hover:text-foreground-primary hover:bg-background-hover transition-colors"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
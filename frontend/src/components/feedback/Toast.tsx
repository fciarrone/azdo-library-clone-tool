import React from 'react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

interface ToastProps extends Omit<ToastOptions, 'icon'> {
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
}

const styleMap: Record<NonNullable<ToastProps['type']>, React.CSSProperties> = {
  success: {
    background: 'var(--color-status-success-bg)',
    color: 'var(--color-status-success-foreground)',
    border: '1px solid var(--color-status-success-border)',
  },
  error: {
    background: 'var(--color-status-error-bg)',
    color: 'var(--color-status-error-foreground)',
    border: '1px solid var(--color-status-error-border)',
  },
  warning: {
    background: 'var(--color-status-warning-bg)',
    color: 'var(--color-status-warning-foreground)',
    border: '1px solid var(--color-status-warning-border)',
  },
  info: {
    background: 'var(--color-status-info-bg)',
    color: 'var(--color-status-info-foreground)',
    border: '1px solid var(--color-status-info-border)',
  },
  loading: {
    background: 'var(--color-background-primary)',
    color: 'var(--color-foreground-primary)',
    border: '1px solid var(--color-border-default)',
  },
};

const iconMap: Record<NonNullable<ToastProps['type']>, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-status-success" />,
  error: <AlertCircle className="w-5 h-5 text-status-error" />,
  warning: <AlertTriangle className="w-5 h-5 text-status-warning" />,
  info: <Info className="w-5 h-5 text-status-info" />,
  loading: <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />,
};

export function showToast(message: string, options?: ToastProps) {
  const { type = 'info', ...rest } = options || {};
  
  return toast(message, {
    ...rest,
    style: {
      ...styleMap[type],
      padding: '12px 16px',
      borderRadius: '6px',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    iconTheme: {
      primary: 'currentColor',
      secondary: 'currentColor',
    },
    icon: iconMap[type],
    duration: type === 'loading' ? Infinity : 4000,
    position: 'top-right',
    ...rest,
  });
}

export function dismissToast(id?: string) {
  if (id) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
}

export function ToastContainer() {
  return (
    <Toaster
      toastOptions={{
        style: {
          background: 'var(--color-background-primary)',
          color: 'var(--color-foreground-primary)',
          border: '1px solid var(--color-border-default)',
          padding: '12px 16px',
          borderRadius: '6px',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '1.5',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-status-success)',
            secondary: 'var(--color-status-success-bg)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--color-status-error)',
            secondary: 'var(--color-status-error-bg)',
          },
        },
      }}
      position="top-right"
      reverseOrder={true}
      gutters={16}
      containerAriaLive="polite"
    />
  );
}

export { toast };
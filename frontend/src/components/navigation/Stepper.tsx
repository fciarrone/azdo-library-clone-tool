import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
  status?: 'pending' | 'active' | 'complete' | 'error';
  disabled?: boolean;
}

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

const stepStatusClasses: Record<Step['status'], string> = {
  pending: 'bg-background-tertiary text-foreground-tertiary border-border',
  active: 'bg-brand-blue text-foreground-on-brand border-brand-blue shadow-sm shadow-brand-blue/30',
  complete: 'bg-status-success text-foreground-on-brand border-status-success',
  error: 'bg-status-error text-foreground-on-brand border-status-error',
};

const stepConnectorClasses: Record<Step['status'], string> = {
  pending: 'bg-border',
  active: 'bg-brand-blue',
  complete: 'bg-status-success',
  error: 'bg-status-error',
};

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, currentStep, onStepClick, orientation = 'horizontal', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="navigation"
        aria-label="Progress steps"
        className={twMerge(
          clsx('flex', orientation === 'horizontal' ? 'flex-row items-start' : 'flex-col items-start gap-4'),
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isClickable = onStepClick && (index < currentStep || step.status === 'complete') && !step.disabled;
          const status = step.status || (index < currentStep ? 'complete' : index === currentStep ? 'active' : 'pending');

          return (
            <React.Fragment key={index}>
              <div className={clsx(
                'flex',
                orientation === 'horizontal' ? 'flex-1 min-w-0' : 'flex-row items-center gap-3'
              )}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={index === currentStep}
                  aria-disabled={step.disabled}
                  disabled={step.disabled || !isClickable}
                  onClick={() => isClickable && onStepClick?.(index)}
                  className={clsx(
                    'flex flex-col items-center gap-2 transition-all',
                    orientation === 'horizontal' ? 'w-full' : 'flex-shrink-0',
                    step.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div
                    className={clsx(
                      'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200',
                      stepStatusClasses[status],
                      isClickable && 'cursor-pointer hover:scale-105 hover:shadow-md'
                    )}
                    aria-current={index === currentStep ? 'step' : undefined}
                  >
                    {status === 'complete' ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <span className={clsx(
                      'block text-sm font-medium transition-colors',
                      index === currentStep ? 'text-foreground-primary' : 'text-foreground-secondary'
                    )}>
                      {step.label}
                    </span>
                    {step.description && (
                      <span className="block text-xs text-foreground-tertiary">
                        {step.description}
                      </span>
                    )}
                  </div>
                </button>
                {!isLast && orientation === 'horizontal' && (
                  <div
                    className={clsx(
                      'h-0.5 flex-1 rounded-full transition-colors duration-300',
                      stepConnectorClasses[steps[index + 1]?.status || (index + 1 < currentStep ? 'complete' : 'pending')]
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
              {!isLast && orientation === 'vertical' && (
                <div
                  className={clsx(
                    'w-0.5 ml-4.5 flex-1 rounded-full transition-colors duration-300',
                    stepConnectorClasses[steps[index + 1]?.status || (index + 1 < currentStep ? 'complete' : 'pending')]
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

Stepper.displayName = 'Stepper';

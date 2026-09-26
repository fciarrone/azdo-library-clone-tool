import React, { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

const columnClasses: Record<GridProps['columns'], string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  12: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
};

const gapClasses: Record<GridProps['gap'], string> = {
  none: 'gap-0',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ columns = 1, gap = 'md', responsive = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          'grid',
          responsive && columnClasses[columns],
          !responsive && `grid-cols-${columns}`,
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  flex?: 1 | 'auto' | 'initial' | 'none';
}

const alignClasses: Record<FlexProps['align'], string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses: Record<FlexProps['justify'], string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const directionClasses: Record<FlexProps['direction'], string> = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
};

const gapClassesFlex: Record<FlexProps['gap'], string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({
    direction = 'row',
    align = 'stretch',
    justify = 'start',
    gap = 'md',
    wrap = false,
    flex,
    className,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          'flex',
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
          gapClassesFlex[gap],
          wrap && 'flex-wrap',
          flex === 1 && 'flex-1',
          flex === 'auto' && 'flex-auto',
          flex === 'initial' && 'flex-initial',
          flex === 'none' && 'flex-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

/* Stack component for vertical/horizontal stacking */
interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'vertical' | 'horizontal';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  divider?: React.ReactNode;
}

const stackGapClasses: Record<StackProps['gap'], string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ direction = 'vertical', gap = 'md', divider, className, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const validChildren = childrenArray.filter(child => React.isValidElement(child));

    return (
      <div
        ref={ref}
        className={twMerge(
          'flex',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          stackGapClasses[gap],
          className
        )}
        {...props}
      >
        {validChildren.map((child, index) => (
          <React.Fragment key={child.key ?? index}>
            {child}
            {divider && index < validChildren.length - 1 && (
              <div className={direction === 'vertical' ? 'w-full' : 'h-full'} aria-hidden="true">
                {divider}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);

Stack.displayName = 'Stack';
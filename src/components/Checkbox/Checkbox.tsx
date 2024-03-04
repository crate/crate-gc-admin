import React from 'react';
import { cn } from 'utils';

export type CheckboxProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  required?: boolean;
  indeterminate?: boolean;
};

const Checkbox = React.forwardRef(
  (
    { indeterminate, checked, className, ...checkboxProps }: CheckboxProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <div className="relative flex">
        <input
          className={cn(
            'peer relative h-4 w-4 shrink-0 appearance-none',
            'border-2 border-blue-200',
            'checked:border-0 checked:bg-crate-blue',
            'cursor-pointer rounded-sm bg-white',
            className,
          )}
          type="checkbox"
          ref={ref}
          checked={
            typeof indeterminate !== 'undefined' ? checked || indeterminate : checked
          }
          {...checkboxProps}
        />
        {/* Custom chekmark */}
        <svg
          className="pointer-events-none absolute hidden h-4 w-4 stroke-white outline-none peer-checked:block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-4 -4 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {indeterminate ? (
            <line
              x1="4"
              y1="12"
              x2="20"
              y2="12"
              data-testid="check-intederminate"
            ></line>
          ) : (
            <polyline points="20 6 9 17 4 12" data-testid="check-normal"></polyline>
          )}
        </svg>
      </div>
    );
  },
);

export default Checkbox;

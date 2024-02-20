import React from 'react';
import { cn } from 'utils';

type CheckboxProps = React.DetailedHTMLProps<
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
      <div className="flex relative">
        <input
          className={cn(
            'peer relative appearance-none shrink-0 w-4 h-4',
            'border-2 border-blue-200',
            'checked:bg-crate-blue checked:border-0',
            'rounded-sm bg-white cursor-pointer',
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
          className="absolute w-4 h-4 pointer-events-none hidden peer-checked:block stroke-white outline-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-4 -4 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {indeterminate ? (
            <line x1="4" y1="12" x2="20" y2="12"></line>
          ) : (
            <polyline points="20 6 9 17 4 12"></polyline>
          )}
        </svg>
      </div>
    );
  },
);

export default Checkbox;

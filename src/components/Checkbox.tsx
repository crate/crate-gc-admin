import cn from '../utils/cn';
import React from 'react';

type CheckboxProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: string;
};

const Checkbox = React.forwardRef(
  (
    { label, ...checkboxProps }: CheckboxProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <div className="w-full flex">
        <input
          className={cn(
            'peer relative appearance-none shrink-0 w-4 h-4',
            'border-2 border-blue-200',
            'checked:bg-crate-blue checked:border-0',
            'rounded-sm mt-1 bg-white cursor-pointer',
          )}
          type="checkbox"
          ref={ref}
          {...checkboxProps}
        />
        {/* Custom chekmark */}
        <svg
          className="absolute w-4 h-4 pointer-events-none hidden peer-checked:block stroke-white mt-1 outline-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-4 -4 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        {/* Label */}
        {label && (
          <label htmlFor={checkboxProps.id} className="cursor-pointer pl-2">
            {label}
          </label>
        )}
      </div>
    );
  },
);

export default Checkbox;

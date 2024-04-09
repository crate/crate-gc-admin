import React from 'react';
import { cn } from 'utils';

export type CheckboxProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  required?: boolean;
  indeterminate?: boolean;
  containerClassName?: string;
};

const Checkbox = React.forwardRef(
  (
    {
      indeterminate,
      checked,
      containerClassName,
      className,
      disabled,
      ...checkboxProps
    }: CheckboxProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <div className={cn('relative flex', containerClassName)}>
        <input
          className={cn(
            'peer size-4 shrink-0 appearance-none',
            'border border-[#d9d9d9]',
            'cursor-pointer rounded-sm bg-white',
            {
              'border-0 bg-crate-blue': checked,
            },
            {
              'cursor-not-allowed opacity-50': disabled,
            },
            className,
          )}
          type="checkbox"
          ref={ref}
          checked={
            typeof indeterminate !== 'undefined' ? checked || indeterminate : checked
          }
          disabled={disabled}
          {...checkboxProps}
        />

        <span
          className={cn(
            'pointer-events-none absolute size-full',
            // animation details
            'transition-all',
            // when checked
            'opacity-1 scale-100 delay-100 duration-100',
            // when not checked
            {
              'antd-check-animation-not-checked scale-0 opacity-0 duration-100':
                !checked && !indeterminate,
            },
          )}
        >
          {/* Check custom tick */}
          <svg
            className={cn(
              'absolute block size-full stroke-white outline-none peer-checked:block',
              {
                'size-0': !checked,
              },
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-4 -4 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" data-testid="check-normal"></polyline>
          </svg>

          {/* Indeterminate custom tick */}
          <span
            data-testid="check-intederminate"
            className={cn('absolute flex size-full items-center justify-center', {
              'opacity-0': !indeterminate,
            })}
          >
            <span className="size-1/2 bg-crate-blue" />
          </span>
        </span>
      </div>
    );
  },
);

export default Checkbox;

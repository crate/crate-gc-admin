import { cn } from 'utils';
import React from 'react';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

function Input({ ref, ...inputProps }: InputProps) {
  return (
    <span>
      <input
        ref={ref}
        {...inputProps}
        className={cn(
          'flex',
          'w-full',
          'border-2',
          'p-2',
          'rounded-sm',
          {
            'focus:border-crate-blue': true,
            'outline-none': true,
          },
          { 'border-red-600': inputProps['aria-invalid'] },
          inputProps.className,
        )}
      />
    </span>
  );
}

export default Input;

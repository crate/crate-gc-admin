import React from 'react';
import cn from '../../utils/cn';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const Input = React.forwardRef(
  ({ ...inputProps }: InputProps, ref: React.ForwardedRef<HTMLInputElement>) => {
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
  },
);

export default Input;

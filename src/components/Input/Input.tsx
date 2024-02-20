import React from 'react';
import Text from '../Text';
import cn from '../../utils/cn';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  error?: React.ReactNode;
};

const Input = React.forwardRef(
  (
    { error = undefined, ...inputProps }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <>
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
            { 'border-red-600': error },
            inputProps.className,
          )}
        />
        {error && <Text className="text-red-600">{error}</Text>}
      </>
    );
  },
);

export default Input;

import React from 'react';
import Text from '../components/Text';
import cn from '../utils/cn';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  id: string;
  label: string;
  error?: React.ReactNode;
  required?: boolean;
};

const Input = React.forwardRef(
  (
    { label, id, error = undefined, required = false, ...inputProps }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <>
        <label htmlFor={id}>
          <Text className={cn('font-bold', { 'text-red-600': error })}>
            {label} {required && '*'}
          </Text>
        </label>
        <input
          ref={ref}
          {...inputProps}
          id={id}
          className={cn(
            'border-2',
            'p-2',
            'rounded-sm',
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

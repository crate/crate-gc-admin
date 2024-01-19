import { Text } from '@crate.io/crate-ui-components';
import cn from '../utils/cn';
import React from 'react';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  id: string;
  label: string;
  error?: React.ReactElement;
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
          <Text className={cn('font-bold', { 'text-red-500': error })}>
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
            { 'border-red-500': error },
            inputProps.className,
          )}
        />
        {error}
      </>
    );
  },
);

export default Input;

import { Text } from '@crate.io/crate-ui-components';
import cn from '../utils/cn';
import React from 'react';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: string;
};

const Input = React.forwardRef(
  (props: InputProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    const { label, ...buttonProps } = props;

    return (
      <>
        {label && <Text className="font-bold">{label}</Text>}
        <input
          ref={ref}
          {...buttonProps}
          className={cn('border', 'p-2', 'rounded-sm', props.className)}
        />
      </>
    );
  },
);

export default Input;

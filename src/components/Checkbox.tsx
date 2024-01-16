import { Text } from '@crate.io/crate-ui-components';
import cn from '../utils/cn';
import React from 'react';

type CheckboxProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: string;
};

const Checkbox = React.forwardRef(
  (props: CheckboxProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    const { label, ...checkboxProps } = props;

    return (
      <>
        {label && <Text className="font-bold">{label}</Text>}
        <input
          ref={ref}
          {...checkboxProps}
          type="checkbox"
          className={cn('border', 'p-2', 'rounded-sm', 'h-full', props.className)}
        />
      </>
    );
  },
);

export default Checkbox;

import React from 'react';
import Text from '../Text';
import cn from '../../utils/cn';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { colors } from '../../constants/colors';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  id: string;
  label: string;
  error?: React.ReactNode;
  info?: React.ReactNode;
  required?: boolean;
};

const Input = React.forwardRef(
  (
    {
      label,
      id,
      info,
      error = undefined,
      required = false,
      ...inputProps
    }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <>
        <label htmlFor={id}>
          <Text className={cn('font-bold', { 'text-red-600': error })}>
            {label} {required && '*'}{' '}
            {info && (
              <Tooltip title={info}>
                <InfoCircleOutlined style={{ color: colors.crateBlue }} />
              </Tooltip>
            )}
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

/* eslint-disable react/jsx-props-no-spreading,react/button-has-type */
import React, { useMemo } from 'react';
import Loader from '../Loader/Loader';
import useButtonStyles from './useButtonStyles';
import { BUTTON_INPUT_TYPES, BUTTON_KINDS, BUTTON_SIZES } from './ButtonConstants';
import { ValueOf } from '../../types/utils';

export type ButtonKind = ValueOf<typeof BUTTON_KINDS>;
export type ButtonSize = ValueOf<typeof BUTTON_SIZES>;
export type ButtonType = ValueOf<typeof BUTTON_INPUT_TYPES>;

export type ButtonProps = {
  /** Aria controls - receives id for the controlled region */
  ariaControls?: React.AriaAttributes['aria-controls'];
  /** Aria to be set if the popup is open */
  ariaExpanded?: React.AriaAttributes['aria-expanded'];
  /** Aria for a button popup */
  ariaHasPopup?: React.AriaAttributes['aria-haspopup'];
  /** Element id to describe the button control */
  ariaLabelledBy?: React.AriaAttributes['aria-labelledby'];
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  /** The ID of a form that a submit button will submit */
  form?: string;
  ghost?: boolean;
  id?: string;
  kind?: ButtonKind;
  loading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: ButtonType;
  size?: ButtonSize;
  warn?: boolean;
};

function Button({
  ariaControls,
  ariaExpanded,
  ariaHasPopup,
  ariaLabelledBy,
  className = '',
  children,
  disabled = false,
  form,
  ghost = false,
  id,
  kind = BUTTON_KINDS.PRIMARY,
  loading = false,
  onClick,
  size = BUTTON_SIZES.REGULAR,
  type = BUTTON_INPUT_TYPES.BUTTON,
  warn = false,
}: ButtonProps) {
  const buttonClasses = useButtonStyles({
    className,
    disabled,
    ghost,
    kind,
    loading,
    size,
    warn,
  });

  const buttonProps = useMemo(
    () => ({
      'aria-busy': loading ? true : undefined,
      'aria-controls': ariaControls,
      'aria-disabled': disabled || loading,
      'aria-expanded': ariaExpanded,
      'aria-haspopup': ariaHasPopup,
      'aria-labelledby': ariaLabelledBy,
      className: buttonClasses,
      'data-testid': id,
      disabled: disabled || loading,
      form,
      id,
      onClick,
      type,
    }),
    [
      ariaLabelledBy,
      ariaHasPopup,
      ariaExpanded,
      ariaControls,
      buttonClasses,
      disabled,
      form,
      onClick,
      id,
      loading,
      type,
    ],
  );

  return (
    <button {...buttonProps}>
      <span>{children}</span>
      {loading && <Loader className="ml-2" size={Loader.sizes.SMALL} />}
    </button>
  );
}

Button.sizes = BUTTON_SIZES;
Button.types = BUTTON_INPUT_TYPES;
Button.kinds = BUTTON_KINDS;

export default Button;

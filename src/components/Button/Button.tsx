import React, { useMemo } from 'react';
import Loader from 'components/Loader';
import useButtonStyles from './useButtonStyles';
import { BUTTON_INPUT_TYPES, BUTTON_KINDS, BUTTON_SIZES } from './ButtonConstants';
import { ValueOf } from 'types/utils';

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
  /** Aria Current for pagination */
  ariaCurrent?: React.AriaAttributes['aria-current'];
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
  ariaCurrent,
  className = '',
  children,
  disabled = false,
  form,
  id,
  kind = BUTTON_KINDS.PRIMARY,
  loading = false,
  onClick,
  size = BUTTON_SIZES.REGULAR,
  type = BUTTON_INPUT_TYPES.BUTTON,
  warn = false,
}: ButtonProps) {
  const buttonClasses = useButtonStyles({
    disabled,
    kind,
    loading,
    size,
    warn,
    className,
  });

  const buttonProps = useMemo(
    () => ({
      'aria-busy': loading ? true : undefined,
      'aria-controls': ariaControls,
      'aria-disabled': disabled || loading,
      'aria-expanded': ariaExpanded,
      'aria-haspopup': ariaHasPopup,
      'aria-labelledby': ariaLabelledBy,
      'aria-current': ariaCurrent,
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
      ariaCurrent,
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

import { useMemo } from 'react';
import cx from 'classnames';
import { ButtonKind, ButtonSize } from './Button';
import { BUTTON_KINDS, BUTTON_SIZES } from './ButtonConstants';

type UseButtonStylesProps = {
  className?: string;
  disabled?: boolean;
  kind?: ButtonKind;
  loading?: boolean;
  size?: ButtonSize;
  warn?: boolean;
};

// This hook was developed as a convenient way of sharing button
// styles with non-button HTML elements in AccessCluster.jsx
// that, for historical, were reasons designed to look like buttons
// but the <button> html element was not the right semantic element to
// use. AccessCluster uses links that are designed to look like buttons.
//
// Styling links as buttons should probably be the exception to the rule and idealy should be considered non-standard.
// The expectation is that when a button is seen, it has button-like behaviour, so this hook is realy a workaround
// to support the AccessCluster.jsx use case.
function useButtonStyles({
  className = '',
  disabled = false,
  kind = BUTTON_KINDS.PRIMARY,
  loading = false,
  size = BUTTON_SIZES.REGULAR,
  warn = false,
}: UseButtonStylesProps) {
  const buttonClasses = useMemo(() => {
    const sizeIsSmall = size === BUTTON_SIZES.SMALL;
    const sizeIsRegular = size === BUTTON_SIZES.REGULAR;
    const kindIsPrimary = kind === BUTTON_KINDS.PRIMARY;
    const kindIsSecondary = kind === BUTTON_KINDS.SECONDARY;
    const kindIsTertiary = kind === BUTTON_KINDS.TERTIARY;
    const loadingOrDisabled = disabled || loading;

    return cx(
      className,
      'border',
      'inline-flex',
      'items-center',
      'justify-center',
      'focus-visible:outline',
      'focus-visible:outline-offset-2',
      'rounded',
      'transition-all',
      'whitespace-nowrap',
      'focus-visible:outline-crate-blue',
      {
        // Sizes
        'leading-8': sizeIsRegular,
        'px-4': sizeIsRegular && !kindIsTertiary,
        'py-0.5': sizeIsRegular,
        'text-base': sizeIsRegular,

        'leading-[1.875rem]': sizeIsSmall,
        'px-3': sizeIsSmall && !kindIsTertiary,
        'text-sm': sizeIsSmall,
        'h-8': sizeIsSmall,
      },
      {
        // primary variant
        'border-crate-blue': kindIsPrimary && !disabled,
        'bg-crate-blue': kindIsPrimary && !disabled && !warn,
        'text-neutral-100': kindIsPrimary && !disabled,

        'active:bg-[#23bfde]': kindIsPrimary && !loadingOrDisabled,
        'active:border-[#23bfde]': kindIsPrimary && !loadingOrDisabled,
        'hover:bg-crate-button-hover': kindIsPrimary && !loadingOrDisabled,
        'hover:border-crate-button-hover': kindIsPrimary && !loadingOrDisabled,

        // secondary variant
        'text-neutral-600': kindIsSecondary && !disabled && !warn,
        'active:text-crate-blue': kindIsSecondary && !loadingOrDisabled,
        'hover:bg-gray-100': kindIsSecondary && !loadingOrDisabled,
        'hover:text-neutral-600': kindIsSecondary && !loadingOrDisabled,

        // tertiary - text only
        'border-transparent': kindIsTertiary,
        'text-crate-blue': kindIsTertiary && !loadingOrDisabled && !warn,
        'active:text-[#23bfde]': kindIsTertiary && !loadingOrDisabled && !warn,
        'hover:text-crate-button-hover':
          kindIsTertiary && !loadingOrDisabled && !warn,
      },
      {
        // disabled
        'border-crate-border-light': !kindIsTertiary && !kindIsSecondary && disabled,
        'bg-neutral-100': kindIsPrimary && disabled,
        'text-neutral-400': disabled,
        'cursor-not-allowed': disabled,
      },
      {
        // warn
        'bg-red-400': kindIsPrimary && warn && !disabled,
        'border-red-400': (kindIsPrimary || kindIsSecondary) && warn && !disabled,
        'text-red-400': (kindIsSecondary || kindIsTertiary) && warn && !disabled,

        'active:bg-red-600':
          (kindIsPrimary || kindIsTertiary) && !loadingOrDisabled && warn,
        'active:border-red-400':
          (kindIsPrimary || kindIsSecondary) && warn && !disabled,
        'active:text-neutral-100': kindIsPrimary && !loadingOrDisabled && warn,
        'hover:bg-red-600': kindIsPrimary && !loadingOrDisabled && warn,
        'hover:border-red-400':
          (kindIsPrimary || kindIsSecondary) && warn && !disabled,
        'hover:text-neutral-100': kindIsPrimary && !loadingOrDisabled && warn,

        'active:border-red-600': kindIsSecondary && !loadingOrDisabled && warn,
        'active:text-red-600': kindIsSecondary && !loadingOrDisabled && warn,
        'hover:border-red-600': kindIsSecondary && !loadingOrDisabled && warn,
        'hover:text-red-600':
          (kindIsSecondary || kindIsTertiary) && !loadingOrDisabled && warn,
      },
    );
  }, [className, disabled, kind, loading, size, warn]);

  return buttonClasses;
}

export default useButtonStyles;

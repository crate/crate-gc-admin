import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from 'utils';
import { Loader } from 'components';
import { SWITCH_SIZES } from './SwitchConstants';
import { ValueOf } from 'types/utils';

type SwitchProps = {
  loading?: boolean;
  size?: ValueOf<typeof SWITCH_SIZES>;
};

const Root = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & SwitchProps
>(({ className, loading = false, size = 'medium', ...props }, ref) => {
  const isMediumSize = size === 'medium';
  const isSmallSize = size === 'small';

  return (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crate-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-crate-blue data-[state=unchecked]:bg-slate-200',
        {
          'h-[22px] w-[44px]': isMediumSize,
          'h-[16px] w-[28px]': isSmallSize,
        },
        className,
      )}
      {...props}
      disabled={loading || props.disabled}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
          'relative',
          {
            'size-[18px] data-[state=checked]:translate-x-[22px]': isMediumSize,
            'size-[12px] data-[state=checked]:translate-x-[12px]': isSmallSize,
          },
        )}
      >
        {loading && (
          <Loader
            size={isMediumSize ? Loader.sizes.SMALL : Loader.sizes.EXTRA_SMALL}
            className={cn(
              'absolute left-1/2 top-1/2 !block -translate-x-1/2 -translate-y-1/2',
              {
                'size-[8px]': !isMediumSize,
                'size-[16px]': isMediumSize,
              },
            )}
          />
        )}
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  );
});
Root.displayName = SwitchPrimitives.Root.displayName;

const Switch = {
  Root,
  sizes: SWITCH_SIZES,
};

export default Switch;

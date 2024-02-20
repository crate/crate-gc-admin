import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from 'utils';
import { Loader } from 'components';

type SwitchProps = {
  loading?: boolean;
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & SwitchProps
>(({ className, loading = false, ...props }, ref) => {
  return (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crate-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-crate-blue data-[state=unchecked]:bg-slate-200 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-crate-blue dark:data-[state=checked]:bg-slate-50 dark:data-[state=unchecked]:bg-crate-blue',
        className,
      )}
      {...props}
      disabled={loading || props.disabled}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 dark:bg-crate-blue',
          'flex items-center justify-center',
        )}
      >
        {loading && <Loader size={Loader.sizes.SMALL} />}
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export default Switch;

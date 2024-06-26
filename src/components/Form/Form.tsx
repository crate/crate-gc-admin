import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';

import { cn } from 'utils';
import { Label as CrateLabel, Text } from 'components';

type FieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FieldContext = React.createContext<FieldContextValue>({} as FieldContextValue);

const Field = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FieldContext);
  const itemContext = React.useContext(ItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: id ? `${id}-form-item` : undefined,
    formDescriptionId: id ? `${id}-form-item-description` : undefined,
    formMessageId: id ? `${id}-form-item-message` : undefined,
    ...fieldState,
  };
};

type ItemContextValue = {
  id: string;
};

const ItemContext = React.createContext<ItemContextValue>({} as ItemContextValue);

type ItemProps = React.HTMLAttributes<HTMLDivElement> & {
  layout?: 'vertical' | 'horizontal';
};
const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, layout = 'vertical', ...props }, ref) => {
    const id = React.useId();

    return (
      <ItemContext.Provider value={{ id }}>
        <div
          ref={ref}
          className={cn(
            {
              'flex flex-col gap-2': layout === 'vertical',
              'flex items-center gap-2': layout === 'horizontal',
            },
            className,
          )}
          {...props}
        />
      </ItemContext.Provider>
    );
  },
);
Item.displayName = 'FormItem';

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ ...props }, ref) => {
  const { formItemId } = useFormField();

  return <CrateLabel ref={ref} htmlFor={formItemId} {...props} />;
});
Label.displayName = 'FormLabel';

const Control = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
Control.displayName = 'FormControl';

const Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <Text pale>
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn('text-xs', className)}
        {...props}
      />
    </Text>
  );
});
Description.displayName = 'FormDescription';

const Message = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body =
    (error && error.message) || (error && error.root && error.root.message)
      ? String(error?.message ? error.message : error.root?.message)
      : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-sm font-medium text-red-500', className)}
      {...props}
    >
      {body}
    </p>
  );
});
Message.displayName = 'FormMessage';

const Form = {
  FormProvider,
  useFormField,
  Item,
  Label,
  Control,
  Description,
  Message,
  Field,
};

export default Form;

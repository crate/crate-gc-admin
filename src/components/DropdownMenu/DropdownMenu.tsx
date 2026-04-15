import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CiCircleOutlined, RightOutlined } from '@ant-design/icons';
import * as React from 'react';
import { cn } from 'utils';
import { Checkbox } from 'components';

const Menu = DropdownMenuPrimitive.Root;

const Trigger = DropdownMenuPrimitive.Trigger;

const Group = DropdownMenuPrimitive.Group;

const Portal = DropdownMenuPrimitive.Portal;

const Sub = DropdownMenuPrimitive.Sub;

const RadioGroup = DropdownMenuPrimitive.RadioGroup;

function SubTrigger({
  ref,
  className,
  inset,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-slate-100 data-[state=open]:bg-slate-100',
        inset && 'pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <RightOutlined className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}
SubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

function SubContent({
  ref,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  );
}
SubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

function Content({
  ref,
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}
Content.displayName = DropdownMenuPrimitive.Content.displayName;

function Item({
  ref,
  className,
  inset,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  );
}
Item.displayName = DropdownMenuPrimitive.Item.displayName;

function RadioItem({
  ref,
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CiCircleOutlined className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}
RadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

function Label({
  ref,
  className,
  inset,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
      {...props}
    />
  );
}
Label.displayName = DropdownMenuPrimitive.Label.displayName;

type CheckboxItemProps = {
  checked?: boolean;
  indeterminate?: boolean;
};

function CheckboxItem({
  ref,
  className,
  children,
  checked,
  indeterminate,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Label> &
  CheckboxItemProps) {
  return (
    <Label
      ref={ref}
      className={cn(`flex cursor-pointer items-center font-normal`, className)}
      {...props}
    >
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        containerClassName="mr-2"
        onChange={() => {}}
      />

      {children}
    </Label>
  );
}
CheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

function Separator({
  ref,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-slate-100', className)}
      {...props}
    />
  );
}
Separator.displayName = DropdownMenuPrimitive.Separator.displayName;

const Shortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  );
};
Shortcut.displayName = 'DropdownMenuShortcut';

const DropdownMenu = {
  Menu,
  Trigger,
  Content,
  Item,
  CheckboxItem,
  RadioItem,
  Label,
  Separator,
  Shortcut,
  Group,
  Portal,
  Sub,
  SubContent,
  SubTrigger,
  RadioGroup,
};

export default DropdownMenu;

import * as React from 'react';

import { cn } from 'utils';
import { Button as CrateButton } from 'components';
import { ButtonProps as CrateButtonProps } from 'components/Button/Button';
import { LeftOutlined, MoreOutlined, RightOutlined } from '@ant-design/icons';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const Content = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  ),
);
Content.displayName = 'PaginationContent';

const Item = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  ),
);
Item.displayName = 'PaginationItem';

type ButtonProps = {
  isActive?: boolean;
} & CrateButtonProps;

const Button = ({
  isActive = false,
  disabled = false,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <CrateButton
      aria-current={isActive ? 'page' : undefined}
      size={CrateButton.sizes.SMALL}
      kind={CrateButton.kinds.SECONDARY}
      disabled={disabled}
      className={cn(
        // Normal state
        '!border-[#d9d9d9]',
        'hover:!text-[#23bfde] active:!text-[#23bfde]',
        'hover:!border-[#23bfde] active:!border-[#23bfde]',
        '!px-[10px]',
        // + active
        {
          '!text-black': !isActive,
          '!text-crate-blue': isActive,
          '!border-crate-blue': isActive,
        },
        // + disable state
        {
          '!text-[#d9d9d9]': disabled,
          '!border-[#d9d9d9]': disabled,
        },
        className,
      )}
      {...props}
    />
  );
};

Button.displayName = 'PaginationButton';

const Previous = (props: Partial<ButtonProps>) => (
  <Button aria-label="Go to previous page" {...props}>
    <LeftOutlined className="h-4 w-4 mt-2" />
  </Button>
);
Previous.displayName = 'PaginationPrevious';

const Next = (props: Partial<ButtonProps>) => (
  <Button aria-label="Go to next page" {...props}>
    <RightOutlined className="h-4 w-4 mt-2" />
  </Button>
);
Next.displayName = 'PaginationNext';

const Ellipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreOutlined className="h-4 w-4 rotate-90" />
    <span className="sr-only">More pages</span>
  </span>
);
Ellipsis.displayName = 'PaginationEllipsis';

Pagination.Content = Content;
Pagination.Item = Item;
Pagination.Previous = Previous;
Pagination.Button = Button;
Pagination.Ellipsis = Ellipsis;
Pagination.Next = Next;

export { Pagination };

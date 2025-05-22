import * as React from 'react';

import { cn } from 'utils';
import { Button as CrateButton, Select } from 'components';
import { ButtonProps as CrateButtonProps } from 'components/Button/Button';
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';

export type PaginationProps = {
  pageSize?: number;
  currentPage: number;
  totalPages: number;
  pageToShow?: number;
  className?: string;
  testId?: string;
  hidePageSize?: boolean;
  onPageChange: (pageNumber: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const Pagination = ({
  pageSize = 50,
  pageToShow = 5,
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
  className = '',
  testId,
  hidePageSize = false,
}: PaginationProps) => {
  let minPageIndex = currentPage - Math.floor(pageToShow / 2);
  let maxPageIndex = currentPage + Math.ceil(pageToShow / 2);

  if (minPageIndex < 1) {
    minPageIndex = 1;
    maxPageIndex = Math.min(totalPages, minPageIndex + pageToShow);
  } else if (maxPageIndex > totalPages) {
    maxPageIndex = totalPages;
    minPageIndex = Math.max(1, maxPageIndex - pageToShow);
  }

  const pagesIndex = Array.from(
    { length: maxPageIndex - minPageIndex },
    (_, pageIndex) => {
      return minPageIndex + pageIndex;
    },
  );
  if (pagesIndex.length === 0) {
    pagesIndex.push(currentPage);
  }

  return (
    <nav
      data-testid={testId}
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex select-none justify-center', className)}
    >
      <Content>
        {/* Prev Button */}
        <Item>
          <Previous
            id="pagination-prev-arrow"
            disabled={currentPage === 1}
            onClick={() => {
              onPageChange(currentPage - 1);
            }}
          />
        </Item>
        {/* First page */}
        {!pagesIndex.includes(1) && (
          <Item>
            <Button
              id="pagination-first"
              onClick={() => {
                onPageChange(0);
              }}
              isActive={currentPage === 1}
            >
              1
            </Button>
          </Item>
        )}

        {/* Ellipsis */}
        {pagesIndex[0] > 2 && (
          <Item>
            <Ellipsis
              direction="left"
              onClick={() => {
                onPageChange(Math.max(1, currentPage - pageToShow));
              }}
            />
          </Item>
        )}
        {/* Render pageToShow pages */}
        {pagesIndex.map(pageIndex => {
          return (
            <Item key={pageIndex}>
              <Button
                id={`pagination-page-${pageIndex}`}
                onClick={() => {
                  onPageChange(pageIndex);
                }}
                isActive={pageIndex === currentPage}
              >
                {pageIndex}
              </Button>
            </Item>
          );
        })}
        {/* Ellipsis */}
        {pagesIndex[pagesIndex.length - 1] < totalPages - 1 && (
          <Item>
            <Ellipsis
              direction="right"
              onClick={() => {
                onPageChange(Math.min(totalPages, currentPage + pageToShow));
              }}
            />
          </Item>
        )}
        {/* Last page */}
        {!pagesIndex.includes(totalPages) && (
          <Item>
            <Button
              id="pagination-last"
              onClick={() => {
                onPageChange(totalPages);
              }}
              isActive={currentPage === totalPages}
            >
              {totalPages}
            </Button>
          </Item>
        )}

        {/* Next button */}
        <Item>
          <Next
            id="pagination-next-arrow"
            disabled={currentPage === totalPages}
            onClick={() => {
              onPageChange(currentPage + 1);
            }}
          />
        </Item>

        {/* Page Size select */}
        {!hidePageSize && (
          <Select.Root
            label="Select a page size"
            value={pageSize.toString()}
            onValueChange={(newValue: string) => {
              onPageSizeChange(parseInt(newValue));
            }}
          >
            <Select.Content>
              <Select.Group>
                <Select.Item value="10">10 / Page</Select.Item>
                <Select.Item value="20">20 / Page</Select.Item>
                <Select.Item value="50">50 / Page</Select.Item>
                <Select.Item value="100">100 / Page</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        )}
      </Content>
    </nav>
  );
};
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
      ariaCurrent={isActive ? 'page' : undefined}
      size={CrateButton.sizes.SMALL}
      kind={CrateButton.kinds.SECONDARY}
      disabled={disabled}
      className={cn(
        // Normal state
        '!border-transparent',
        {
          'hover:!text-[#23bfde]': !disabled,
          'hover:!text-white': isActive && !disabled,
        },
        '!px-[4px]',
        '!text-[13px]',
        '!leading-[22px]',
        '!h-[18px]',
        // + active
        {
          '!text-black': !isActive,
          '!text-white': isActive,
          '!bg-crate-blue': isActive,
        },
        // + disable state
        {
          '!text-[#d9d9d9]': disabled,
          'hover:!text-[#d9d9d9]': disabled,
        },
        className,
      )}
      {...props}
    />
  );
};

Button.displayName = 'PaginationButton';

const Previous = ({ className, ...props }: Partial<ButtonProps>) => (
  <Button
    aria-label="Go to previous page"
    className={cn('!border-none', className)}
    {...props}
  >
    <LeftOutlined className="size-2" />
  </Button>
);
Previous.displayName = 'PaginationPrevious';

const Next = ({ className, ...props }: Partial<ButtonProps>) => (
  <Button
    aria-label="Go to next page"
    className={cn('!border-none', className)}
    {...props}
  >
    <RightOutlined className="size-2" />
  </Button>
);
Next.displayName = 'PaginationNext';

type EllipsisProps = {
  direction: 'left' | 'right';
};
const Ellipsis = ({
  direction,
  className,
  onClick,
  ...props
}: React.ComponentProps<'span'> & EllipsisProps) => (
  <span
    aria-hidden
    className={cn(
      'group relative flex size-9 items-center justify-center text-[14px] text-gray-300',
      className,
    )}
    {...props}
  >
    <span className="absolute transition-opacity duration-200 group-hover:opacity-0">
      •••
    </span>
    <span className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <Button kind={CrateButton.kinds.TERTIARY} onClick={onClick}>
        {direction === 'right' ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
      </Button>
    </span>
    <span className="sr-only">More pages</span>
  </span>
);
Ellipsis.displayName = 'PaginationEllipsis';

export default Pagination;

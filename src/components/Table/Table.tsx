import * as React from 'react';
import { cn } from 'utils';

const Table = ({ className, ...props }: React.ComponentProps<'table'>) => (
  <table className={cn('w-full caption-bottom text-[14px]', className)} {...props} />
);
Table.displayName = 'Table';

const Header = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
Header.displayName = 'TableHeader';

const Body = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
Body.displayName = 'TableBody';

const Footer = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-slate-100/50 font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
));
Footer.displayName = 'TableFooter';

const RowHeader = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b bg-slate-100/50 transition-colors', className)}
    {...props}
  />
));
RowHeader.displayName = 'TableRowHeader';

const Row = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-table-row-hover data-[state=selected]:bg-slate-100',
      className,
    )}
    {...props}
  />
));
Row.displayName = 'TableRow';

const Head = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 bg-table-row-hover text-left align-middle font-medium text-[#737373] [&:has([role=checkbox])]:pr-0',
      className,
    )}
    {...props}
  >
    <span className="flex h-full grow items-end border-r px-2 pb-1">{children}</span>
  </th>
));
Head.displayName = 'TableHead';

const Cell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-2 align-top [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
Cell.displayName = 'TableCell';

const Caption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-slate-500', className)}
    {...props}
  />
));
Caption.displayName = 'TableCaption';

Table.Header = Header;
Table.Body = Body;
Table.Footer = Footer;
Table.Row = Row;
Table.RowHeader = RowHeader;
Table.Cell = Cell;
Table.Caption = Caption;
Table.Head = Head;

export { Table };

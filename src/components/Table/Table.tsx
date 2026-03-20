import * as React from 'react';
import { cn } from 'utils';

const Table = ({ className, ...props }: React.ComponentProps<'table'>) => (
  <table className={cn('w-full caption-bottom text-[14px]', className)} {...props} />
);
Table.displayName = 'Table';

function Header({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>;
}) {
  return <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />;
}
Header.displayName = 'TableHeader';

function Body({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>;
}) {
  return (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}
Body.displayName = 'TableBody';

function Footer({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>;
}) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        'border-t bg-slate-100/50 font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}
Footer.displayName = 'TableFooter';

function RowHeader({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.Ref<HTMLTableRowElement>;
}) {
  return (
    <tr
      ref={ref}
      className={cn('border-b bg-slate-100/50 transition-colors', className)}
      {...props}
    />
  );
}
RowHeader.displayName = 'TableRowHeader';

function Row({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.Ref<HTMLTableRowElement>;
}) {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-table-row-hover data-[state=selected]:bg-slate-100',
        className,
      )}
      {...props}
    />
  );
}
Row.displayName = 'TableRow';

function Head({
  ref,
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.Ref<HTMLTableCellElement>;
}) {
  return (
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
  );
}
Head.displayName = 'TableHead';

function Cell({
  ref,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.Ref<HTMLTableCellElement>;
}) {
  return (
    <td
      ref={ref}
      className={cn('p-2 align-top [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
}
Cell.displayName = 'TableCell';

function Caption({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: React.Ref<HTMLTableCaptionElement>;
}) {
  return (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-slate-500', className)}
      {...props}
    />
  );
}
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

import * as React from 'react';

import { cn } from '@/lib/utils';

export type TableProps = React.HTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: TableProps) {
  return <table className={cn('w-full caption-bottom text-sm', className)} {...props} />;
}

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)} {...props} />;
}

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export function TableHead({ className, ...props }: TableHeadProps) {
  return <th className={cn('h-12 px-4 text-left align-middle text-xs font-medium text-muted-foreground', className)} {...props} />;
}

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export function TableCell({ className, ...props }: TableCellProps) {
  return <td className={cn('p-4 align-middle text-sm', className)} {...props} />;
}

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>;

export function TableCaption({ className, ...props }: TableCaptionProps) {
  return <caption className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />;
}

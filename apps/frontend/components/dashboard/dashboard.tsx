'use client';

import { useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  useReactTable,
} from '@tanstack/react-table';

import { LanguageSwitcher } from '@/components/language-switcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocale } from '@/components/providers/locale-provider';
import { useOrders } from '@/hooks/use-orders';
import { cn } from '@/lib/utils';
import { useTradingStore } from '@/stores/trading-store';

export function Dashboard() {
  const { dictionary, locale } = useLocale();
  const dashboard = dictionary.dashboard;
  const statusFilter = useTradingStore((state) => state.statusFilter);
  const setStatusFilter = useTradingStore((state) => state.setStatusFilter);
  const lastSyncedAt = useTradingStore((state) => state.lastSyncedAt);
  const markSynced = useTradingStore((state) => state.markSynced);

  const {
    filteredOrders,
    data: allOrders,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useOrders();

  // Initialize lastSyncedAt on client mount to avoid hydration mismatch
  useEffect(() => {
    if (lastSyncedAt === 0) {
      markSynced();
    }
  }, [lastSyncedAt, markSynced]);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const quantityFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumSignificantDigits: 4,
      }),
    [locale]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [locale]
  );

  const totalValue = useMemo(
    () =>
      (allOrders ?? []).reduce(
        (acc, order) => acc + order.quantity * order.price,
        0
      ),
    [allOrders]
  );

  const openPositions = useMemo(
    () => (allOrders ?? []).filter((order) => order.status === 'open').length,
    [allOrders]
  );

  const pendingOrders = useMemo(
    () =>
      (allOrders ?? []).filter((order) => order.status === 'pending').length,
    [allOrders]
  );

  const columns = useMemo<ColumnDef<(typeof filteredOrders)[number]>[]>(
    () => [
      {
        accessorKey: 'asset',
        header: dashboard.table.asset,
      },
      {
        accessorKey: 'type',
        header: dashboard.table.type,
        cell: ({ getValue }) => {
          const type = getValue<string>();
          const isBuy = type === 'BUY';
          return (
            <Badge variant={isBuy ? 'success' : 'destructive'}>{type}</Badge>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: dashboard.table.quantity,
        cell: ({ getValue }) => quantityFormatter.format(Number(getValue())),
      },
      {
        accessorKey: 'price',
        header: dashboard.table.price,
        cell: ({ getValue }) => numberFormatter.format(Number(getValue())),
      },
      {
        accessorKey: 'status',
        header: dashboard.table.status,
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const variant =
            status === 'filled'
              ? 'success'
              : status === 'pending'
              ? 'warning'
              : 'default';
          return <Badge variant={variant as never}>{status}</Badge>;
        },
      },
      {
        accessorKey: 'timestamp',
        header: dashboard.table.timestamp,
        cell: ({ getValue }) =>
          dateFormatter.format(new Date(String(getValue()))),
      },
    ],
    [dashboard.table, quantityFormatter, numberFormatter, dateFormatter]
  );

  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const filters = [
    { key: 'all' as const, label: dashboard.filters.all },
    { key: 'open' as const, label: dashboard.filters.open },
    { key: 'pending' as const, label: dashboard.filters.pending },
    { key: 'filled' as const, label: dashboard.filters.filled },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {dashboard.title}
          </h1>
          <p className="text-sm text-muted-foreground">{dashboard.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitcher label={dashboard.language} activeLocale={locale} />
          <Filters
            filters={filters}
            activeFilter={statusFilter}
            onFilterChange={setStatusFilter}
            isBusy={isLoading || isFetching}
          />
          <Button onClick={() => refetch()} disabled={isFetching}>
            {dashboard.refresh}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>{dashboard.portfolioValue}</CardDescription>
            <CardTitle>{numberFormatter.format(totalValue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{dashboard.openPositions}</CardDescription>
            <CardTitle>{openPositions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{dashboard.pendingOrders}</CardDescription>
            <CardTitle>{pendingOrders}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{dashboard.ordersTitle}</CardTitle>
            <CardDescription>
              {dashboard.lastSynced}:{' '}
              <span suppressHydrationWarning>
                {lastSyncedAt > 0 ? dateFormatter.format(lastSyncedAt) : '—'}
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-sm text-destructive">
              {(error as Error).message}
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {isLoading ? dashboard.loading : dashboard.empty}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type FiltersProps = {
  filters: { key: 'all' | 'open' | 'pending' | 'filled'; label: string }[];
  activeFilter: string;
  onFilterChange: (filter: FiltersProps['filters'][number]['key']) => void;
  isBusy: boolean;
};

function Filters({
  filters,
  activeFilter,
  onFilterChange,
  isBusy,
}: FiltersProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          size="sm"
          variant={activeFilter === filter.key ? 'default' : 'ghost'}
          className={cn('min-w-[4.5rem] capitalize')}
          onClick={() => onFilterChange(filter.key)}
          disabled={isBusy && activeFilter === filter.key}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

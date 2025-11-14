'use client';

import { useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  useReactTable,
} from '@tanstack/react-table';
import {
  DollarSign,
  TrendingUp,
  Clock,
  RefreshCw,
  ShoppingCart,
  Activity,
} from 'lucide-react';

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
import { Skeleton } from '@/components/ui/skeleton';
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
        header: dashboard.table.assetPair,
      },
      {
        accessorKey: 'type',
        header: dashboard.table.side,
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
    { key: 'filled' as const, label: dashboard.filters.closed },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {dashboard.title}
          </h1>
          <p className="text-muted-foreground">{dashboard.subtitle}</p>
        </div>
        <Card className="luxury-card border-0">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-lg font-medium text-destructive mb-2">
              Failed to load orders
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {(error as Error).message}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {dashboard.title}
          </h1>
          <p className="text-muted-foreground">{dashboard.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Filters
            filters={filters}
            activeFilter={statusFilter}
            onFilterChange={setStatusFilter}
            isBusy={isLoading || isFetching}
          />
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            className="font-medium"
            size="sm"
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')}
            />
            {dashboard.refresh}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="luxury-card border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="luxury-card border-0 group hover:scale-[1.02] transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {dashboard.stats.totalValue}
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {numberFormatter.format(totalValue)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card border-0 group hover:scale-[1.02] transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {dashboard.stats.openPositions}
                  </p>
                  <p className="text-3xl font-bold mt-2">{openPositions}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card border-0 group hover:scale-[1.02] transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {dashboard.stats.pendingOrders}
                  </p>
                  <p className="text-3xl font-bold mt-2">{pendingOrders}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      <Card className="luxury-card border-0">
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                Trading Orders
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {dashboard.lastSynced}:{' '}
                <span suppressHydrationWarning className="font-medium">
                  {lastSyncedAt > 0 ? dateFormatter.format(lastSyncedAt) : '—'}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent border-b border-border/50"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="font-semibold">
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
                        className="hover:bg-muted/50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="font-medium">
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
                        className="h-48 text-center"
                      >
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-lg font-medium text-muted-foreground">
                            {dashboard.empty}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            No trading orders yet
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
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
    <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1 backdrop-blur-sm">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          size="sm"
          variant={activeFilter === filter.key ? 'default' : 'ghost'}
          className={cn(
            'min-w-[4.5rem] capitalize font-medium transition-all',
            activeFilter === filter.key && 'shadow-sm'
          )}
          onClick={() => onFilterChange(filter.key)}
          disabled={isBusy && activeFilter === filter.key}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

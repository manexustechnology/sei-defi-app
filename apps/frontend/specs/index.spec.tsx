import React from 'react';
import { render, screen } from '@testing-library/react';

import { Dashboard } from '@/components/dashboard/dashboard';
import { LocaleProvider } from '@/components/providers/locale-provider';
import en from '@/i18n/dictionaries/en.json';

jest.mock('@/components/providers/query-provider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const { QueryProvider } = jest.requireMock('@/components/providers/query-provider');

afterAll(() => {
  jest.clearAllTimers();
});

jest.mock('next/navigation', () => ({
  usePathname: () => '/en',
}));

jest.mock('@/hooks/use-orders', () => ({
  useOrders: () => ({
    filteredOrders: [],
    data: [],
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('Dashboard', () => {
  it('renders translated heading', () => {
    render(
      <QueryProvider>
        <LocaleProvider locale="en" dictionary={en}>
          <Dashboard />
        </LocaleProvider>
      </QueryProvider>,
    );

    expect(screen.getByText(en.dashboard.title)).toBeInTheDocument();
  });
});

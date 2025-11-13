export async function GET() {
  const orders = [
    {
      id: '1',
      asset: 'ETH/USDC',
      type: 'BUY',
      quantity: 1.25,
      price: 3225.45,
      status: 'filled',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      asset: 'BTC/USDT',
      type: 'SELL',
      quantity: 0.42,
      price: 69482.12,
      status: 'pending',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '3',
      asset: 'SOL/USDC',
      type: 'BUY',
      quantity: 50,
      price: 185.32,
      status: 'open',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ];

  return Response.json({ orders });
}

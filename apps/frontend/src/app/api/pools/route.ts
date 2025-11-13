import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dex = searchParams.get('dex');
    
    const params = new URLSearchParams();
    if (dex) params.append('dex', dex);

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3333';
    const response = await fetch(`${backendUrl}/api/pools?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch pools' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching pools:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


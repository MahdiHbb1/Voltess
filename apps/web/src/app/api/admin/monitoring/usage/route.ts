import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function proxyRequest(
  request: NextRequest,
  path: string,
  init?: RequestInit
) {
  const url = `${API_BASE_URL}/monitoring${path}`;
  
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  // Forward authorization header if present
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const data = await response.json();
  
  return NextResponse.json(data, { status: response.status });
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, '/usage');
}
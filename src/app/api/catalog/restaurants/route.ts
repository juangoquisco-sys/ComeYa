import { NextResponse } from 'next/server';
import { listPublishedRestaurants } from '@/modules/catalog/catalog.public-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const restaurants = await listPublishedRestaurants();
  return NextResponse.json({ restaurants });
}

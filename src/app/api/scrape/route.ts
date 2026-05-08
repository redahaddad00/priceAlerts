import { NextResponse } from 'next/server';
import { scrapeProduct } from '@/lib/backend/services/scraper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if (!url) return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    const data = await scrapeProduct(url);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Scrape failed' }, { status: 500 });
  }
}

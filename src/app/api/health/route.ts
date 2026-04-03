import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbVars = Object.keys(process.env)
    .filter(k => k.match(/prisma|postgres|database|direct/i))
    .map(k => {
      const val = process.env[k] ?? '';
      const protocol = val.split('://')[0] ?? 'empty';
      return `${k}=${protocol}://...`;
    });

  return NextResponse.json({ vars: dbVars });
}

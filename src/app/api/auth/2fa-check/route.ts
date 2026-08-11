import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

/**
 * Returns whether a given email requires a TOTP challenge.
 * Always returns 200 - returns { requiresTotp: false } if user not found
 * to avoid leaking user existence.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ requiresTotp: false }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ requiresTotp: false });

  // totpEnabled / totpSecret are not yet in the User schema - TOTP is not active.
  // When TOTP is implemented, add the fields to the schema and query them here.
  return NextResponse.json({ requiresTotp: false });
}

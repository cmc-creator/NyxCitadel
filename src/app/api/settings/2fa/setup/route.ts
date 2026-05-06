import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, totpEnabled: true },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.totpEnabled) return NextResponse.json({ error: '2FA is already enabled.' }, { status: 400 });

  const secret = generateSecret();
  const otpUri = generateURI({
    issuer: 'NyxCitadel',
    label: user.email,
    secret,
  });
  const qrDataUrl = await QRCode.toDataURL(otpUri);

  // Store secret temporarily (not yet "enabled") — user must verify before we enable
  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: secret, totpEnabled: false },
  });

  // Generate 8 backup codes (will be stored on /verify success)
  const backupCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(5).toString('hex').toUpperCase()
  );

  return NextResponse.json({ secret, qrDataUrl, backupCodes });
}

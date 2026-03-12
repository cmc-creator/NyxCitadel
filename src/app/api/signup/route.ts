import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, facility, phone, facilityType, beds, message } = body;

    if (!name?.trim() || !email?.trim() || !facility?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and facility name are required.' },
        { status: 400 }
      );
    }

    const record = await prisma.demoRequest.create({
      data: {
        name:         name.trim(),
        email:        email.trim().toLowerCase(),
        facilityName: facility.trim(),
        phone:        phone?.trim()  || null,
        facilityType: facilityType   || null,
        beds:         beds ? parseInt(beds, 10) : null,
        message:      message?.trim() || null,
      },
    });

    return NextResponse.json({ ok: true, id: record.id });
  } catch (err: any) {
    console.error('[signup] error:', err?.message ?? err);
    return NextResponse.json(
      { error: 'Unable to save your request right now. Please try again shortly.' },
      { status: 500 }
    );
  }
}

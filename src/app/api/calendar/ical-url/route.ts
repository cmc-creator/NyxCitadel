import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const secret = process.env.ICAL_SECRET
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? ''
  const facilityId = session.user.facilityId ?? ''

  if (!secret) {
    return NextResponse.json({ url: null, reason: 'ICAL_SECRET not configured' })
  }

  const url = `${appUrl}/api/calendar/ical?token=${encodeURIComponent(secret)}&fid=${encodeURIComponent(facilityId)}`
  return NextResponse.json({ url })
}

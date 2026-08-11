import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}

function foldLine(line: string): string {
  // RFC 5545 §3.1 - fold at 75 octets
  const result: string[] = []
  while (line.length > 75) {
    result.push(line.slice(0, 75))
    line = ' ' + line.slice(75)
  }
  result.push(line)
  return result.join('\r\n')
}

function toIcsDate(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function toIcsDateTime(d: Date): string {
  const y = d.getUTCFullYear()
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const h = String(d.getUTCHours()).padStart(2, '0')
  const mi = String(d.getUTCMinutes()).padStart(2, '0')
  const s = String(d.getUTCSeconds()).padStart(2, '0')
  return `${y}${mo}${day}T${h}${mi}${s}Z`
}

function addOneDay(d: Date): Date {
  const next = new Date(d)
  next.setUTCDate(next.getUTCDate() + 1)
  return next
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const fid = searchParams.get('fid')

  const secret = process.env.ICAL_SECRET
  if (!secret || token !== secret) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!fid) {
    return new NextResponse('Missing fid', { status: 400 })
  }

  // Verify facility exists
  const facility = await prisma.facility.findUnique({
    where: { id: fid },
    select: { id: true, name: true },
  })
  if (!facility) {
    return new NextResponse('Facility not found', { status: 404 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const events = await prisma.calendarEvent.findMany({
    where: {
      facilityId: fid,
      dueDate: { gte: thirtyDaysAgo },
    },
    orderBy: { dueDate: 'asc' },
    take: 500,
  })

  const now = new Date()
  const dtstamp = toIcsDateTime(now)

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//NyxCitadel//Compliance Calendar//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    foldLine(`X-WR-CALNAME:${escapeIcsText(facility.name)} - Compliance Calendar`),
    'X-WR-TIMEZONE:UTC',
  ]

  for (const event of events) {
    const dtstart = toIcsDate(event.dueDate)
    const dtend = toIcsDate(addOneDay(event.dueDate))

    // iCal priority: 1 = highest, 9 = lowest; 0 = undefined
    let priority = 5
    if (event.status === 'OVERDUE' || event.priority === 'CRITICAL') {
      priority = 1
    } else if (event.priority === 'HIGH') {
      priority = 3
    } else if (event.priority === 'LOW') {
      priority = 7
    }

    const description = [
      event.description ?? '',
      event.regulatoryBody ? `Regulatory Body: ${event.regulatoryBody}` : '',
      event.status ? `Status: ${event.status}` : '',
      event.notes ? `Notes: ${event.notes}` : '',
    ]
      .filter(Boolean)
      .join('\\n')

    lines.push('BEGIN:VEVENT')
    lines.push(foldLine(`UID:${event.id}@nyxcitadel`))
    lines.push(`DTSTAMP:${dtstamp}`)
    lines.push(`DTSTART;VALUE=DATE:${dtstart}`)
    lines.push(`DTEND;VALUE=DATE:${dtend}`)
    lines.push(foldLine(`SUMMARY:${escapeIcsText(event.title)}`))
    if (description) {
      lines.push(foldLine(`DESCRIPTION:${description}`))
    }
    lines.push(`PRIORITY:${priority}`)
    if (event.status === 'COMPLETED') {
      lines.push('STATUS:COMPLETED')
    } else if (event.status === 'OVERDUE') {
      lines.push('STATUS:NEEDS-ACTION')
    }
    if (event.recurrenceRule) {
      lines.push(foldLine(`RRULE:${event.recurrenceRule}`))
    }
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const icsContent = lines.join('\r\n') + '\r\n'

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="compliance-calendar.ics"',
      'Cache-Control': 'no-store',
    },
  })
}

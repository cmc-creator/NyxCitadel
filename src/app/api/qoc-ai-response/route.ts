import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { qocId, investigationNotes, chartData } = await req.json();

    // Fetch QOC record
    const qoc = await prisma.qocComplaint.findUnique({
      where: { id: qocId },
    });

    if (!qoc || qoc.facilityId !== session.user.facilityId) {
      return NextResponse.json({ error: 'QOC not found' }, { status: 404 });
    }

    // Build prompt for Claude
    const prompt = `You are a healthcare compliance expert helping draft a formal response to a CMS Quality of Care (QOC) complaint.

COMPLAINT DETAILS:
- Complaint Number: ${qoc.qocNumber}
- Allegation Summary: ${qoc.allegationSummary}
- Complainant Type: ${qoc.complainantType}
- Investigation Type: ${qoc.investigationType}

INVESTIGATION FINDINGS:
${investigationNotes || 'No detailed investigation notes provided.'}

${chartData ? `SUPPORTING DATA:\n${chartData}\n` : ''}

TASK:
Generate a formal, professional response to this QOC complaint that:
1. Acknowledges the complaint and thanks the complainant
2. Summarizes what was investigated
3. Presents key findings and evidence from the investigation
4. Explains any corrective actions taken or will be taken
5. Provides timeline for follow-up
6. Maintains professional, respectful tone while defending facility where appropriate
7. References relevant policies or procedures
8. Is suitable for submission to CMS/state regulators

Format as a formal letter. Do NOT include placeholders or bracketed text. Make it complete and ready to edit if needed.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const formalResponse = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({
      success: true,
      formalResponse,
      qocNumber: qoc.qocNumber,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('QOC AI response error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
}

import twilio from 'twilio';

export function getSmsReadiness(): { ok: boolean; missing: string[] } {
  const missing = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'].filter(
    (k) => !process.env[k],
  );
  return { ok: missing.length === 0, missing };
}

export async function sendSms(
  to: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const { ok, missing } = getSmsReadiness();
  if (!ok) return { ok: false, error: `Missing env vars: ${missing.join(', ')}` };

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
    await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER!,
      to,
    });
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

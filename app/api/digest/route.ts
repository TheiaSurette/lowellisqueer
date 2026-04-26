import { NextResponse } from 'next/server';
import { sendWeeklyDigest } from '@/lib/email/send-weekly-digest';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { broadcastId, eventCount } = await sendWeeklyDigest();

  return NextResponse.json({
    message: `Digest sent with ${eventCount} event${eventCount !== 1 ? 's' : ''}`,
    broadcastId,
  });
}

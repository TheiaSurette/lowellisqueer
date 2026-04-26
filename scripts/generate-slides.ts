import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import type { CalendarEvent } from '../lib/types';
import { WeeklySlide } from '../lib/image/weekly-slides';
import { generateWeeklyCaption } from '../lib/image/weekly-caption';

const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY!;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!;

const EVENTS_PER_SLIDE = 6;
const WIDTH = 1080;
const HEIGHT = 1350;

async function fetchEvents(timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    key: API_KEY,
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Calendar API: ${res.status}`);

  const data = await res.json();
  return (data.items ?? []).map((e: Record<string, unknown>) => {
    const start = e.start as Record<string, string>;
    const end = e.end as Record<string, string>;
    const desc = (e.description as string) ?? '';
    const tagMatch = desc.match(/#tags:\s*"([^"]*)"/i);
    const tags = tagMatch ? tagMatch[1].split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    return {
      id: e.id as string,
      title: (e.summary as string) ?? '(No title)',
      description: desc.replace(/#featured\s*/gi, '').replace(/#image:\s*(?:<a[^>]*>)?https?:\/\/[^\s<]+(?:<\/a>)?\s*/gi, '').replace(/#tags:\s*"[^"]*"\s*/gi, '').trim(),
      location: (e.location as string) ?? '',
      start: new Date(start.dateTime ?? start.date),
      end: new Date(end.dateTime ?? end.date),
      isAllDay: !start.dateTime,
      colorId: (e.colorId as string) ?? null,
      imageUrl: null,
      featured: desc.includes('#featured'),
      tags,
      htmlLink: e.htmlLink as string,
    };
  });
}

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`);
  return res.arrayBuffer();
}

async function main() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  console.log(`Fetching events for ${start.toDateString()} – ${end.toDateString()}...`);
  const events = await fetchEvents(start.toISOString(), end.toISOString());
  console.log(`Found ${events.length} event(s)`);

  if (events.length === 0) {
    console.log('No events — nothing to generate.');
    return;
  }

  const chunks: CalendarEvent[][] = [];
  for (let i = 0; i < events.length; i += EVENTS_PER_SLIDE) {
    chunks.push(events.slice(i, i + EVENTS_PER_SLIDE));
  }

  const [soraLight, sora, soraMedium, fraunces, frauncesBlack] = await Promise.all([
    loadFont('https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmScMnn-K.ttf'),
    loadFont('https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmSdSnn-K.ttf'),
    loadFont('https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmSdgnn-K.ttf'),
    loadFont('https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcUByjDg.ttf'),
    loadFont('https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcHhyjDg.ttf'),
  ]);

  const fonts = [
    { name: 'Sora', data: soraLight, weight: 300 as const, style: 'normal' as const },
    { name: 'Sora', data: sora, weight: 400 as const, style: 'normal' as const },
    { name: 'Sora', data: soraMedium, weight: 500 as const, style: 'normal' as const },
    { name: 'Fraunces', data: fraunces, weight: 700 as const, style: 'normal' as const },
    { name: 'Fraunces', data: frauncesBlack, weight: 900 as const, style: 'normal' as const },
  ];

  const dateStr = start.toISOString().slice(0, 10);
  const outputDir = path.join(process.cwd(), 'out', 'slides', dateStr);
  await fs.mkdir(outputDir, { recursive: true });

  for (let i = 0; i < chunks.length; i++) {
    const svg = await satori(
      WeeklySlide({
        events: chunks[i],
        weekStart: start,
        slideIndex: i,
        totalSlides: chunks.length,
      }),
      { width: WIDTH, height: HEIGHT, fonts },
    );

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
    const png = resvg.render().asPng();

    const filename = `slide-${i + 1}.png`;
    const filePath = path.join(outputDir, filename);
    await fs.writeFile(filePath, png);

    console.log(`Generated slide ${i + 1}/${chunks.length}: ${filename}`);
  }

  const caption = generateWeeklyCaption(events, start);
  const captionPath = path.join(outputDir, 'caption.txt');
  await fs.writeFile(captionPath, caption);

  console.log(`\nDone! ${chunks.length} slide(s) + caption saved to ${outputDir}`);
  console.log('\n--- Caption ---\n');
  console.log(caption);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

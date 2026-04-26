import fs from 'fs/promises';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { fetchEvents } from '@/lib/google-calendar';
import { WeeklySlide } from './weekly-slides';

const EVENTS_PER_SLIDE = 7;
const WIDTH = 1080;
const HEIGHT = 1350;

async function loadFont(name: string, url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font ${name}: ${res.status}`);
  return res.arrayBuffer();
}

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

export async function generateWeeklySlides(options?: {
  weekOf?: Date;
  outputDir?: string;
}): Promise<string[]> {
  const { start, end } = getWeekBounds(options?.weekOf ?? new Date());
  const dateStr = start.toISOString().slice(0, 10);
  const outputDir = options?.outputDir ?? path.join(process.cwd(), 'out', 'slides', dateStr);

  const events = await fetchEvents({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: 50,
  });

  if (events.length === 0) {
    console.log('No events this week.');
    return [];
  }

  const chunks: (typeof events)[] = [];
  for (let i = 0; i < events.length; i += EVENTS_PER_SLIDE) {
    chunks.push(events.slice(i, i + EVENTS_PER_SLIDE));
  }

  const [soraLight, sora, soraMedium, fraunces, frauncesBlack] = await Promise.all([
    loadFont('Sora-Light', 'https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmScMnn-K.ttf'),
    loadFont('Sora', 'https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmSdSnn-K.ttf'),
    loadFont('Sora-Medium', 'https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmSdgnn-K.ttf'),
    loadFont('Fraunces', 'https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcUByjDg.ttf'),
    loadFont('Fraunces-Black', 'https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcHhyjDg.ttf'),
  ]);

  const fonts = [
    { name: 'Sora', data: soraLight, weight: 300 as const, style: 'normal' as const },
    { name: 'Sora', data: sora, weight: 400 as const, style: 'normal' as const },
    { name: 'Sora', data: soraMedium, weight: 500 as const, style: 'normal' as const },
    { name: 'Fraunces', data: fraunces, weight: 700 as const, style: 'normal' as const },
    { name: 'Fraunces', data: frauncesBlack, weight: 900 as const, style: 'normal' as const },
  ];

  await fs.mkdir(outputDir, { recursive: true });

  const paths: string[] = [];

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
    paths.push(filePath);

    console.log(`Generated slide ${i + 1}/${chunks.length}: ${filename}`);
  }

  return paths;
}

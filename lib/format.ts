const HTML_BR_RE = /<br\s*\/?>/gi;
const HTML_TAG_RE = /<[^>]*>/g;

const TZ = 'America/New_York';

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: TZ,
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TZ,
  });
}

export function formatMonthShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', timeZone: TZ }).toUpperCase();
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: TZ });
}

export function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', timeZone: TZ });
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: TZ });
}

export function stripHtml(html: string): string {
  return html.replace(HTML_TAG_RE, '');
}

export function stripHtmlPreserveBreaks(html: string): string {
  return html.replace(HTML_BR_RE, '\n').replace(HTML_TAG_RE, '').trim();
}

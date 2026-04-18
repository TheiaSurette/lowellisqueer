const HTML_BR_RE = /<br\s*\/?>/gi;
const HTML_TAG_RE = /<[^>]*>/g;

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatMonthShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric' });
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function stripHtml(html: string): string {
  return html.replace(HTML_TAG_RE, '');
}

export function stripHtmlPreserveBreaks(html: string): string {
  return html.replace(HTML_BR_RE, '\n').replace(HTML_TAG_RE, '').trim();
}

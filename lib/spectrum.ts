export const SPECTRUM = [
  '#E53935',
  '#F4811F',
  '#FDCA17',
  '#2E9B3E',
  '#2B6CC4',
  '#7B3FA0',
] as const;

export type SpectrumColor = (typeof SPECTRUM)[number];

export function spectrumColor(index: number): string {
  return SPECTRUM[index % SPECTRUM.length];
}

/** Returns a contrast-safe version for text on light backgrounds (yellow needs darkening) */
export function spectrumTextColor(index: number): string {
  const color = SPECTRUM[index % SPECTRUM.length];
  return color === '#FDCA17' ? '#B8960F' : color;
}

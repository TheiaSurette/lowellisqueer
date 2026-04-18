import { SPECTRUM } from '@/lib/spectrum';

export function SpectrumDots({ size = 8, gap = 6 }: { size?: number; gap?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: `${gap}px`, alignItems: 'center' }}>
      {SPECTRUM.map((color) => (
        <span
          key={color}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'block',
            flexShrink: 0,
          }}
        />
      ))}
    </span>
  );
}

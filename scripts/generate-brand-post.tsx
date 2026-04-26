import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';

const RAINBOW = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'];
const WIDTH = 1080;
const HEIGHT = 1080;

function generateGradient(colors: string[]): string {
  const step = 100 / colors.length;
  const stops = colors
    .map((color, i) => `${color} ${step * i}% ${step * (i + 1)}%`)
    .join(', ');
  return `linear-gradient(to right, ${stops})`;
}

function BrandPost({ logoBase64 }: { logoBase64: string }) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FCFAF7',
        fontFamily: 'Fraunces',
      }}
    >
      {/* Logo */}
      <img
        src={logoBase64}
        width={430}
        height={350}
        style={{ marginBottom: 44 }}
      />

      {/* "Lowell is" */}
      <div
        style={{
          display: 'flex',
          fontSize: 112,
          fontWeight: 900,
          color: '#1C1917',
          lineHeight: 1.1,
        }}
      >
        Lowell is
      </div>

      {/* "Queer" with rainbow gradient + shadow */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          marginTop: -16,
        }}
      >
        {/* Shadow layer 2 (deepest) */}
        <div
          style={{
            display: 'flex',
            fontSize: 168,
            fontWeight: 900,
            color: '#000000',
            lineHeight: 1.1,
            position: 'absolute',
            left: -4,
            top: 4,
          }}
        >
          Queer
        </div>
        {/* Shadow layer 1 */}
        <div
          style={{
            display: 'flex',
            fontSize: 168,
            fontWeight: 900,
            color: '#000000',
            lineHeight: 1.1,
            position: 'absolute',
            left: -1,
            top: 1,
          }}
        >
          Queer
        </div>
        {/* Rainbow gradient layer */}
        <div
          style={{
            display: 'flex',
            fontSize: 168,
            fontWeight: 900,
            lineHeight: 1.1,
            backgroundImage: generateGradient(RAINBOW),
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Queer
        </div>
      </div>
    </div>
  );
}

function LogoPost({ logoBase64 }: { logoBase64: string }) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FCFAF7',
      }}
    >
      <img
        src={logoBase64}
        width={830}
        height={676}
      />
    </div>
  );
}

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`);
  return res.arrayBuffer();
}

async function main() {
  const logoPath = path.join(process.cwd(), 'public', 'lowell-logo.png');

  const pngLogoPath = '/tmp/lowell-logo-converted.png';
  const { execSync } = await import('child_process');
  execSync(`sips -s format png "${logoPath}" --out "${pngLogoPath}"`, { stdio: 'pipe' });
  const pngBuffer = await fs.readFile(pngLogoPath);
  const logoBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;

  const [fraunces, frauncesBlack] = await Promise.all([
    loadFont('https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcUByjDg.ttf'),
    loadFont('https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcHhyjDg.ttf'),
  ]);

  const fonts = [
    { name: 'Fraunces', data: fraunces, weight: 700 as const, style: 'normal' as const },
    { name: 'Fraunces', data: frauncesBlack, weight: 900 as const, style: 'normal' as const },
  ];

  const svg = await satori(BrandPost({ logoBase64 }), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  const png = resvg.render().asPng();

  const outputDir = path.join(process.cwd(), 'out');
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'brand-post.png');
  await fs.writeFile(outputPath, png);
  console.log(`Generated: ${outputPath}`);

  const logoSvg = await satori(LogoPost({ logoBase64 }), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const logoResvg = new Resvg(logoSvg, { fitTo: { mode: 'width', value: WIDTH } });
  const logoPng = logoResvg.render().asPng();

  const logoOutputPath = path.join(outputDir, 'logo-post.png');
  await fs.writeFile(logoOutputPath, logoPng);
  console.log(`Generated: ${logoOutputPath}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

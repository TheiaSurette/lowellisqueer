'use client';

import { useState, useEffect, useRef } from 'react';

type WordEntry = {
  word: string;
  colors: string[];
};

function generateBackground(colors: string[]): string {
  const step = 100 / colors.length;
  const stops = colors
    .map((color, i) => `${color} ${step * i}% ${step * (i + 1)}%`)
    .join(', ');
  return `linear-gradient(to right, ${stops})`;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const RAINBOW = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'];

const WORD_POOL: WordEntry[] = [
  { word: 'Gay', colors: ['#078D70', '#26CEAA', '#98E8C1', '#FFFFFF', '#7BADE2', '#5049CC', '#3D1A78'] },
  { word: 'Lesbian', colors: ['#D52D00', '#EF7627', '#FF9A56', '#FFFFFF', '#D162A4', '#B55690', '#A30262'] },
  { word: 'Bisexual', colors: ['#D60270', '#9B4F96', '#0038A8'] },
  { word: 'Transgender', colors: ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA'] },
  { word: 'Intersex', colors: ['#FFD800', '#7902AA'] },
  { word: 'Asexual', colors: ['#000000', '#A3A3A3', '#FFFFFF', '#800080'] },
  { word: 'Polyamorous', colors: ['#009FE3', '#FFFFFF', '#FCBF00', '#E50051', '#340C46'] },
  { word: 'Transfem', colors: ['#73DEFF', '#FFE1ED', '#FFB5D6', '#FFE1ED', '#73DEFF'] },
  { word: 'Transmasc', colors: ['#FF8ABD', '#CDF5FE', '#9AEBFF', '#CDF5FE', '#FF8ABD'] },
  { word: 'Sapphic', colors: ['#FD8BA8', '#FBF2FF', '#FFFFFF', '#C76BC5', '#FDD768'] },
  { word: 'Non-Binary', colors: ['#FFF433', '#FFFFFF', '#9B59D0', '#2D2D2D'] },
  { word: 'Pansexual', colors: ['#FF218C', '#FFD800', '#21B1FF'] },
];

const RAINBOW_BG = generateBackground(RAINBOW);

export function HeroWordCycle() {
  const [displayText, setDisplayText] = useState('Queer');
  const [background, setBackground] = useState(RAINBOW_BG);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const shuffled = shuffleArray(WORD_POOL);
    const pool: WordEntry[] = [{ word: 'Queer', colors: RAINBOW }, ...shuffled];

    let poolIndex = 0;
    let charIndex = pool[0].word.length;
    let isDeleting = false;

    function tick() {
      const current = pool[poolIndex];

      if (isDeleting) {
        charIndex--;
        setDisplayText(current.word.slice(0, charIndex));

        if (charIndex === 0) {
          // Text is now empty — swap background
          isDeleting = false;
          poolIndex = (poolIndex + 1) % pool.length;
          setBackground(generateBackground(pool[poolIndex].colors));
          timeoutRef.current = setTimeout(tick, 80);
        } else {
          timeoutRef.current = setTimeout(tick, 30 + Math.random() * 25);
        }
      } else {
        if (charIndex < pool[poolIndex].word.length) {
          charIndex++;
          setDisplayText(pool[poolIndex].word.slice(0, charIndex));
          timeoutRef.current = setTimeout(tick, 50 + Math.random() * 50);
        } else {
          // Fully typed — hold, then start deleting
          const hold = poolIndex === 0 ? 3000 : 2000;
          timeoutRef.current = setTimeout(() => {
            isDeleting = true;
            tick();
          }, hold);
        }
      }
    }

    // Hold the initial "Queer" then start cycling
    timeoutRef.current = setTimeout(() => {
      isDeleting = true;
      tick();
    }, 3000);

    return () => clearTimeout(timeoutRef.current);
  }, []);

  const gradientStyle: React.CSSProperties = {
    backgroundImage: background,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(-1px 1px 0 #000000) drop-shadow(-3px 3px 0 #000000)',
    WebkitTextStroke: '1px #000000',
  };

  return (
    <span style={gradientStyle}>
      {displayText || '\u200B'}
    </span>
  );
}

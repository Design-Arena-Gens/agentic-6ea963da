"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Theme = {
  backgroundA: string;
  backgroundB: string;
  starColor: string;
  goldA: string;
  goldB: string;
};

const THEMES: Theme[] = [
  { backgroundA: '#0b0f2b', backgroundB: '#000000', starColor: 'rgba(255,255,255,0.9)', goldA: '#f6d365', goldB: '#fda085' },
  { backgroundA: '#120a3a', backgroundB: '#000000', starColor: 'rgba(220,235,255,0.95)', goldA: '#ffd700', goldB: '#b8860b' },
  { backgroundA: '#0f2027', backgroundB: '#000000', starColor: 'rgba(240,248,255,0.95)', goldA: '#f0e68c', goldB: '#ffd700' },
  { backgroundA: '#1b0028', backgroundB: '#000000', starColor: 'rgba(255,255,255,0.9)', goldA: '#f8d37f', goldB: '#f3a953' },
];

function hashStringToSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0) / 2 ** 32;
}

function createPRNG(seedStr: string) {
  let seed = hashStringToSeed(seedStr) * 1e9;
  return function rand() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return (seed >>> 0) / 4294967296;
  };
}

export default function Home() {
  const [title, setTitle] = useState<string>("?????? ????? ?????? ??????");
  const [subtitle, setSubtitle] = useState<string>("???? ?? ?????? ????? ??????");
  const [themeIndex, setThemeIndex] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const theme = useMemo(() => THEMES[themeIndex % THEMES.length], [themeIndex]);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const baseW = 1600;
    const baseH = 2560;
    canvas.width = baseW * DPR;
    canvas.height = baseH * DPR;
    canvas.style.width = baseW + 'px';
    canvas.style.height = baseH + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.resetTransform();
    ctx.scale(DPR, DPR);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, baseH);
    bg.addColorStop(0, theme.backgroundA);
    bg.addColorStop(1, theme.backgroundB);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, baseW, baseH);

    // Stars
    const rng = createPRNG(title + '|' + subtitle);
    const stars = 400;
    ctx.fillStyle = theme.starColor;
    for (let i = 0; i < stars; i++) {
      const x = Math.floor(rng() * baseW);
      const y = Math.floor(rng() * baseH);
      const r = rng() * 1.5 + 0.2;
      ctx.globalAlpha = 0.6 + rng() * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Mystic geometry
    const cx = baseW / 2;
    const cy = baseH * 0.42;
    const maxR = Math.min(baseW, baseH) * 0.35;

    // Concentric circles
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const r = maxR * (0.25 + t * 0.75);
      const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      g.addColorStop(0, 'rgba(255, 215, 0, 0.12)');
      g.addColorStop(1, 'rgba(255, 215, 0, 0.02)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Golden lines
    const gold = ctx.createLinearGradient(0, 0, baseW, 0);
    gold.addColorStop(0, theme.goldA);
    gold.addColorStop(1, theme.goldB);
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = 0.6;

    const rays = 24;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + rng() * 0.02;
      const r0 = maxR * 0.15;
      const r1 = maxR * (0.8 + rng() * 0.2);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Title
    await (document as any).fonts?.ready;

    const titleFontBase = 92;
    const subtitleFontBase = 44;

    // Text shadow pass
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title shadow
    ctx.font = `700 ${titleFontBase}px Amiri, Cairo, serif`;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 8;
    ctx.strokeText(title, cx, cy + maxR * 0.15 + 2);
    ctx.fillText(title, cx, cy + maxR * 0.15 + 2);

    // Title gold fill
    const titleGrad = ctx.createLinearGradient(cx - 200, cy, cx + 200, cy);
    titleGrad.addColorStop(0, theme.goldA);
    titleGrad.addColorStop(1, theme.goldB);
    ctx.fillStyle = titleGrad;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.strokeText(title, cx, cy + maxR * 0.15);
    ctx.fillText(title, cx, cy + maxR * 0.15);

    // Subtitle
    ctx.font = `700 ${subtitleFontBase}px Cairo, Amiri, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 18;
    ctx.fillText(subtitle, cx, cy + maxR * 0.28);
    ctx.shadowBlur = 0;

    // Bottom ornament line
    ctx.strokeStyle = gold;
    ctx.lineWidth = 3;
    const ox = baseW * 0.16;
    const oy = baseH * 0.86;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(baseW - ox, oy);
    ctx.stroke();

    // Small symbol
    ctx.beginPath();
    ctx.arc(cx, oy, 12, 0, Math.PI * 2);
    ctx.stroke();
  }, [theme, title, subtitle]);

  useEffect(() => {
    draw();
  }, [draw]);

  const onDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = '????-?????-??????-??????.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const randomizeTheme = () => setThemeIndex((i) => (i + 1) % THEMES.length);

  return (
    <main className="container">
      <section className="controls">
        <h1 className="appTitle">????? ???? ????: ????? ?????? ??????</h1>
        <div className="field">
          <label>???????</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="???? ??????? ??????..."
          />
        </div>
        <div className="field">
          <label>??????? ??????</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="???? ????? ?????..."
          />
        </div>
        <div className="buttons">
          <button onClick={randomizeTheme}>????? ???????</button>
          <button className="primary" onClick={onDownload}>????? ?????? PNG</button>
        </div>
      </section>
      <section className="preview">
        <canvas ref={canvasRef} aria-label="???? ??????" />
      </section>
    </main>
  );
}

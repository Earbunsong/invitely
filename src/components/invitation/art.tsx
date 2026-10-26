import type { CoverArt } from "@/templates";

/** Original vector cover art for each template. Pure SVG so it scales and themes cleanly. */
export function CoverBackdrop({ art }: { art: CoverArt }) {
  switch (art) {
    case "garden-gate":
      return <GardenGate />;
    case "royal-frame":
      return <RoyalFrame />;
    case "minimal-line":
      return <MinimalLine />;
    case "balloons":
      return <Balloons />;
    case "home":
      return <Home />;
  }
}

/** Round to 2 decimals so server and client SVG markup match exactly. */
const r2 = (n: number) => Math.round(n * 100) / 100;

function Flower({ x, y, r = 9, color = "#f2b8b5", center = "#e9c46a", rot = 0 }: { x: number; y: number; r?: number; color?: string; center?: string; rot?: number }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)})`}>
      {petals.map((a) => (
        <ellipse key={a} cx={0} cy={r2(-r * 0.75)} rx={r2(r * 0.55)} ry={r2(r * 0.8)} fill={color} opacity={0.92} transform={`rotate(${a})`} />
      ))}
      <circle r={r2(r * 0.35)} fill={center} />
    </g>
  );
}

function Leaf({ x, y, rot = 0, s = 1, color = "#9cb58f" }: { x: number; y: number; rot?: number; s?: number; color?: string }) {
  return <path d="M0 0 C 6 -8, 16 -8, 22 0 C 16 8, 6 8, 0 0 Z" fill={color} opacity={0.85} transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(rot)}) scale(${r2(s)})`} />;
}

/** Deterministic pseudo-random so server and client render the same art. */
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
}

function GardenGate() {
  // Points along the arch for vines and flowers.
  const arch = Array.from({ length: 34 }, (_, i) => {
    const a = Math.PI - (i / 33) * Math.PI;
    return { x: r2(200 + Math.cos(a) * 165), y: r2(250 - Math.sin(a) * 175) };
  });
  const pinks = ["#f4c2c2", "#f7d6d0", "#efb0a8", "#fbe3dc", "#e8a29b"];
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="gg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf6ef" />
          <stop offset="0.6" stopColor="#f9e8dc" />
          <stop offset="1" stopColor="#f3dcc8" />
        </linearGradient>
        <linearGradient id="gg-path" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecd3bd" />
          <stop offset="1" stopColor="#d9b89a" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#gg-sky)" />
      {/* distant hedge */}
      <path d="M0 610 Q 60 570 120 600 T 240 595 T 400 600 V 800 H 0 Z" fill="#c9d8bd" opacity="0.55" />
      {/* garden path */}
      <path d="M150 800 L 185 620 L 215 620 L 250 800 Z" fill="url(#gg-path)" opacity="0.8" />
      {/* pillars */}
      {[22, 338].map((x) => (
        <g key={x}>
          <rect x={x} y={250} width={40} height={430} fill="#f3e6d6" stroke="#dcc3a6" strokeWidth="2" />
          <rect x={x - 6} y={240} width={52} height={16} rx="3" fill="#ead6bf" stroke="#dcc3a6" />
          <rect x={x - 6} y={672} width={52} height={14} rx="3" fill="#ead6bf" stroke="#dcc3a6" />
        </g>
      ))}
      {/* iron gate */}
      <g stroke="#c8b8a6" strokeWidth="3" fill="none" opacity="0.9">
        <path d="M62 680 V 470 Q 130 400 198 450 V 680" />
        <path d="M202 680 V 450 Q 270 400 338 470 V 680" />
        {Array.from({ length: 13 }, (_, i) => 72 + i * 10.5).map((x) => (
          <line key={`l${x}`} x1={x} y1={680} x2={x} y2={r2(470 - Math.sin(((x - 62) / 136) * Math.PI) * 35)} />
        ))}
        {Array.from({ length: 13 }, (_, i) => 212 + i * 10.5).map((x) => (
          <line key={`r${x}`} x1={x} y1={680} x2={x} y2={r2(470 - Math.sin(((x - 202) / 136) * Math.PI) * 35)} />
        ))}
        <circle cx="130" cy="560" r="22" />
        <circle cx="270" cy="560" r="22" />
      </g>
      {/* arch vine */}
      <path d={`M ${arch.map((p) => `${p.x} ${p.y}`).join(" L ")}`} stroke="#8fa982" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7" />
      {arch.map((p, i) => (
        <g key={i}>
          <Leaf x={p.x} y={p.y} rot={seeded(i) * 360} s={0.9 + seeded(i + 3) * 0.5} />
          {i % 2 === 0 && <Flower x={p.x + (seeded(i + 7) - 0.5) * 18} y={p.y + (seeded(i + 9) - 0.5) * 18} r={7 + seeded(i + 1) * 7} color={pinks[i % pinks.length]} rot={seeded(i) * 90} />}
        </g>
      ))}
      {/* vines down the pillars */}
      {[42, 358].map((x, side) =>
        Array.from({ length: 14 }, (_, i) => (
          <g key={`${x}-${i}`}>
            <Leaf x={x + (i % 2 ? 8 : -26)} y={270 + i * 28} rot={i % 2 ? 20 : 160} s={0.9} />
            {i % 3 === side && <Flower x={x + (i % 2 ? 14 : -14)} y={280 + i * 28} r={8} color={pinks[(i + side) % pinks.length]} />}
          </g>
        )),
      )}
      {/* bushes */}
      {[
        [10, 700],
        [80, 740],
        [320, 710],
        [390, 745],
      ].map(([cx, cy], k) => (
        <g key={k}>
          <ellipse cx={cx} cy={cy} rx="85" ry="60" fill="#a9c29b" opacity="0.9" />
          {Array.from({ length: 9 }, (_, i) => (
            <Flower key={i} x={cx - 60 + seeded(k * 10 + i) * 120} y={cy - 40 + seeded(k * 20 + i) * 60} r={8 + seeded(i + k) * 8} color={pinks[(i + k) % pinks.length]} rot={i * 25} />
          ))}
        </g>
      ))}
    </svg>
  );
}

function RoyalFrame() {
  const gold = "#e3b65c";
  const corner = "M0 0 C 30 0, 40 10, 40 40 M0 0 C 0 30, 10 40, 40 40 M10 10 C 25 12, 28 20, 28 28 C 20 28, 12 25, 10 10 Z";
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="rf-bg" cx="50%" cy="25%" r="85%">
          <stop offset="0" stopColor="#7a2236" />
          <stop offset="0.6" stopColor="#4a1222" />
          <stop offset="1" stopColor="#2a0811" />
        </radialGradient>
        <pattern id="rf-pat" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M20 4 L 36 20 L 20 36 L 4 20 Z" fill="none" stroke={gold} strokeOpacity="0.08" />
        </pattern>
      </defs>
      <rect width="400" height="800" fill="url(#rf-bg)" />
      <rect width="400" height="800" fill="url(#rf-pat)" />
      <rect x="18" y="18" width="364" height="764" rx="6" fill="none" stroke={gold} strokeOpacity="0.7" strokeWidth="2" />
      <rect x="28" y="28" width="344" height="744" rx="4" fill="none" stroke={gold} strokeOpacity="0.4" strokeWidth="1" />
      {[
        [28, 28, 0],
        [372, 28, 90],
        [372, 772, 180],
        [28, 772, 270],
      ].map(([x, y, r]) => (
        <path key={`${x}${y}`} d={corner} transform={`translate(${x} ${y}) rotate(${r})`} fill={gold} fillOpacity="0.25" stroke={gold} strokeWidth="1.5" />
      ))}
      {/* temple-tower silhouette crest */}
      <g transform="translate(200 150)" fill={gold} fillOpacity="0.22" stroke={gold} strokeOpacity="0.7" strokeWidth="1.2">
        {[-70, 70].map((dx) => (
          <path key={dx} d={`M${dx - 18} 40 L ${dx - 14} 10 L ${dx - 9} 0 L ${dx - 5} -18 L ${dx} -34 L ${dx + 5} -18 L ${dx + 9} 0 L ${dx + 14} 10 L ${dx + 18} 40 Z`} />
        ))}
        <path d="M-28 40 L -22 0 L -15 -16 L -9 -40 L -4 -62 L 0 -80 L 4 -62 L 9 -40 L 15 -16 L 22 0 L 28 40 Z" />
        <rect x="-110" y="40" width="220" height="10" />
      </g>
      {/* lotus at bottom */}
      <g transform="translate(200 700)" fill={gold} fillOpacity="0.25" stroke={gold} strokeWidth="1.2">
        {[-50, -25, 0, 25, 50].map((a) => (
          <path key={a} d="M0 0 C -14 -20, -10 -42, 0 -54 C 10 -42, 14 -20, 0 0 Z" transform={`rotate(${a})`} />
        ))}
      </g>
    </svg>
  );
}

function MinimalLine() {
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="400" height="800" fill="#f6f5f0" />
      <path d="M70 700 V 300 A 130 130 0 0 1 330 300 V 700" fill="none" stroke="#6b8f71" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M85 700 V 305 A 115 115 0 0 1 315 305 V 700" fill="none" stroke="#6b8f71" strokeOpacity="0.25" strokeWidth="1" />
      {[
        [70, 640, -30],
        [330, 640, 210],
        [120, 190, -60],
        [280, 190, 240],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 0 C 20 -30, 50 -40, 80 -40" stroke="#6b8f71" strokeOpacity="0.6" fill="none" />
          {[15, 35, 55, 72].map((d, k) => (
            <Leaf key={k} x={d} y={-12 - d * 0.3} rot={-60 + k * 10} s={0.7} color="#a7bfa9" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Balloons() {
  const balloons = [
    [70, 170, "#ff7aa2"],
    [130, 120, "#ffd166"],
    [300, 140, "#7cc6fe"],
    [345, 220, "#b28dff"],
    [50, 280, "#7ee0b5"],
    [270, 90, "#ff9f6e"],
  ] as const;
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="bp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4f7" />
          <stop offset="0.5" stopColor="#fdf2ff" />
          <stop offset="1" stopColor="#eef5ff" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#bp-bg)" />
      {balloons.map(([x, y, c], i) => (
        <g key={i} className="animate-float" style={{ animationDelay: `${i * 0.7}s`, transformBox: "fill-box" }}>
          <path d={`M${x} ${y + 42} q -10 40 6 80 t -4 90`} stroke="#c9b8d8" fill="none" strokeWidth="1.2" />
          <ellipse cx={x} cy={y} rx="30" ry="38" fill={c} opacity="0.92" />
          <ellipse cx={x - 10} cy={y - 14} rx="7" ry="11" fill="#fff" opacity="0.45" />
          <path d={`M${x - 5} ${y + 37} L ${x + 5} ${y + 37} L ${x} ${y + 44} Z`} fill={c} />
        </g>
      ))}
      {/* bunting */}
      <path d="M0 40 Q 200 110 400 40" stroke="#e7cfe0" fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 20 + i * 45;
        const y = r2(40 + Math.sin((x / 400) * Math.PI) * 35);
        const colors = ["#ff7aa2", "#ffd166", "#7cc6fe", "#b28dff", "#7ee0b5"];
        return <path key={i} d={`M${x - 14} ${y} L ${x + 14} ${y} L ${x} ${y + 26} Z`} fill={colors[i % colors.length]} opacity="0.85" />;
      })}
    </svg>
  );
}

function Home() {
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="400" height="800" fill="#fbf6ef" />
      <circle cx="320" cy="140" r="60" fill="#f6e2d6" />
      <g transform="translate(200 610)">
        <path d="M-120 0 V -130 L 0 -220 L 120 -130 V 0 Z" fill="#fffaf3" stroke="#c8643b" strokeWidth="3" />
        <path d="M-140 -120 L 0 -235 L 140 -120" fill="none" stroke="#c8643b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="-26" y="-80" width="52" height="80" rx="26" fill="#c8643b" opacity="0.85" />
        <rect x="-95" y="-110" width="44" height="40" rx="4" fill="#f6e2d6" stroke="#c8643b" strokeWidth="2" />
        <rect x="51" y="-110" width="44" height="40" rx="4" fill="#f6e2d6" stroke="#c8643b" strokeWidth="2" />
        <circle cx="0" cy="-160" r="16" fill="#f6e2d6" stroke="#c8643b" strokeWidth="2" />
      </g>
      {[
        [40, 640],
        [360, 640],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M-22 0 L 22 0 L 16 40 L -16 40 Z" fill="#c8643b" opacity="0.8" />
          {Array.from({ length: 7 }, (_, k) => (
            <Leaf key={k} x={0} y={-k * 12} rot={k % 2 ? -150 : -30} s={1.2} color="#7fa070" />
          ))}
        </g>
      ))}
      <rect x="0" y="650" width="400" height="150" fill="#dfe9d6" />
    </svg>
  );
}

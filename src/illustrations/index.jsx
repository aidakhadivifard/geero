import { palette as P } from "../theme.js";

// A shared backdrop keeps the 12 illustrations visually consistent: a deep-plum
// field with a warm golden "halo" — the heart of the Dawnhalo identity. Each
// theme only supplies its central motif. Designed to read well at large card
// size AND small (calendar thumbnail / future home-screen widget, doc §4.7).
function Backdrop({ children }) {
  return (
    <svg viewBox="0 0 240 280" preserveAspectRatio="xMidYMid slice" role="img">
      <defs>
        <linearGradient id="dh-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2c3d" />
          <stop offset="1" stopColor={P.night} />
        </linearGradient>
        <radialGradient id="dh-halo" cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor={P.gold} stopOpacity="0.55" />
          <stop offset="0.5" stopColor={P.gold} stopOpacity="0.14" />
          <stop offset="1" stopColor={P.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="240" height="280" fill="url(#dh-bg)" />
      <circle cx="120" cy="112" r="120" fill="url(#dh-halo)" />
      {children}
      {/* faint star dust */}
      <g fill={P.goldSoft} opacity="0.5">
        <circle cx="40" cy="46" r="1.4" />
        <circle cx="206" cy="60" r="1.2" />
        <circle cx="60" cy="232" r="1.2" />
        <circle cx="196" cy="220" r="1.5" />
        <circle cx="30" cy="150" r="1" />
      </g>
    </svg>
  );
}

const G = P.gold;
const GS = P.goldSoft;
const PC = P.peach;
const CR = P.cream;

const motifs = {
  open_door: (
    <g fill="none" stroke={G} strokeWidth="3.5" strokeLinejoin="round">
      <rect x="86" y="70" width="68" height="120" rx="3" />
      <path d="M154 70 L186 84 L186 204 L154 190 Z" fill={GS} stroke={G} opacity="0.95" />
      <circle cx="146" cy="132" r="3.2" fill={G} stroke="none" />
      <path d="M120 196 q40 -8 70 8" stroke={PC} strokeWidth="2.4" opacity="0.7" />
    </g>
  ),
  sunrise: (
    <g>
      <circle cx="120" cy="150" r="34" fill={GS} />
      <g stroke={G} strokeWidth="3.4" strokeLinecap="round">
        <line x1="120" y1="86" x2="120" y2="68" />
        <line x1="160" y1="100" x2="172" y2="86" />
        <line x1="80" y1="100" x2="68" y2="86" />
        <line x1="176" y1="146" x2="196" y2="142" />
        <line x1="64" y1="146" x2="44" y2="142" />
      </g>
      <path d="M40 188 h160" stroke={PC} strokeWidth="4" strokeLinecap="round" />
      <path d="M40 204 h160" stroke={G} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </g>
  ),
  path: (
    <g>
      <path
        d="M104 210 C104 170 150 160 138 120 C128 88 110 80 118 60"
        fill="none"
        stroke={GS}
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M104 210 C104 170 150 160 138 120 C128 88 110 80 118 60"
        fill="none"
        stroke={G}
        strokeWidth="3"
        strokeDasharray="2 12"
        strokeLinecap="round"
      />
      <circle cx="118" cy="58" r="6" fill={PC} />
    </g>
  ),
  mountain: (
    <g>
      <path d="M30 196 L96 96 L132 150 L160 110 L210 196 Z" fill={P.nightSoft} stroke={G} strokeWidth="3" strokeLinejoin="round" />
      <path d="M96 96 L112 120 L80 120 Z" fill={GS} />
      <path d="M160 110 L172 130 L148 130 Z" fill={GS} opacity="0.8" />
      <circle cx="120" cy="74" r="12" fill={PC} opacity="0.85" />
    </g>
  ),
  moon: (
    <g>
      <path
        d="M150 80 a52 52 0 1 0 0 104 a40 40 0 0 1 0 -104 Z"
        fill={GS}
      />
      <g fill={G}>
        <circle cx="78" cy="92" r="2.2" />
        <circle cx="92" cy="200" r="2" />
        <circle cx="176" cy="196" r="2.4" />
      </g>
    </g>
  ),
  water: (
    <g fill="none" stroke={G} strokeWidth="3.2" strokeLinecap="round">
      <path d="M44 120 q24 -16 48 0 t48 0 t48 0" />
      <path d="M44 150 q24 -16 48 0 t48 0 t48 0" stroke={GS} />
      <path d="M44 180 q24 -16 48 0 t48 0 t48 0" stroke={PC} opacity="0.8" />
      <path d="M44 210 q24 -16 48 0 t48 0 t48 0" opacity="0.5" />
    </g>
  ),
  tree: (
    <g>
      <line x1="120" y1="200" x2="120" y2="130" stroke={G} strokeWidth="5" strokeLinecap="round" />
      <circle cx="120" cy="116" r="40" fill={P.nightSoft} stroke={GS} strokeWidth="3" />
      <g fill={GS}>
        <circle cx="106" cy="108" r="6" />
        <circle cx="132" cy="104" r="7" />
        <circle cx="120" cy="126" r="6" />
        <circle cx="138" cy="124" r="4" fill={PC} />
      </g>
      <path d="M96 200 h48" stroke={G} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </g>
  ),
  bird: (
    <g fill="none" stroke={GS} strokeWidth="3.6" strokeLinecap="round">
      <path d="M58 150 q26 -34 56 -6 q30 -28 56 6" />
      <path d="M86 132 q28 -22 56 0" stroke={G} opacity="0.7" />
      <circle cx="180" cy="86" r="4" fill={PC} stroke="none" />
    </g>
  ),
  anchor: (
    <g fill="none" stroke={G} strokeWidth="3.6" strokeLinecap="round">
      <circle cx="120" cy="84" r="11" />
      <line x1="120" y1="95" x2="120" y2="196" />
      <line x1="96" y1="120" x2="144" y2="120" />
      <path d="M76 168 q4 36 44 36 q40 0 44 -36" stroke={GS} />
      <path d="M120 196 v8" stroke={PC} />
    </g>
  ),
  bridge: (
    <g fill="none" stroke={G} strokeWidth="3.4" strokeLinecap="round">
      <path d="M40 168 q80 -70 160 0" stroke={GS} strokeWidth="4" />
      <line x1="40" y1="168" x2="40" y2="206" />
      <line x1="200" y1="168" x2="200" y2="206" />
      <g stroke={G} strokeWidth="2.4" opacity="0.8">
        <line x1="74" y1="150" x2="74" y2="190" />
        <line x1="120" y1="138" x2="120" y2="190" />
        <line x1="166" y1="150" x2="166" y2="190" />
      </g>
      <circle cx="120" cy="78" r="6" fill={PC} stroke="none" />
    </g>
  ),
  star: (
    <g>
      <path
        d="M120 70 L132 110 L174 110 L140 136 L152 178 L120 152 L88 178 L100 136 L66 110 L108 110 Z"
        fill={GS}
        stroke={G}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="120" cy="126" r="6" fill={PC} />
    </g>
  ),
  flame: (
    <g>
      <path
        d="M120 70 C150 104 150 120 134 140 C150 138 156 124 154 112 C176 142 168 196 120 204 C72 196 64 142 86 112 C84 124 90 138 106 140 C90 120 92 100 120 70 Z"
        fill={GS}
        stroke={G}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M120 120 C132 138 132 152 120 172 C108 152 108 138 120 120 Z" fill={PC} />
    </g>
  ),
};

export function Illustration({ theme }) {
  return <Backdrop>{motifs[theme] || motifs.sunrise}</Backdrop>;
}

export const THEME_KEYS = Object.keys(motifs);

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type { MotionValue } from "motion/react";

const PALETTE = {
  blueYonder: "#2E96F5",
  neonBlue: "#0960E1",
  electricBlue: "#0042A6",
  deepBlue: "#07173F",
  rocketRed: "#E43700",
  martianRed: "#8E1100",
  neonYellow: "#EAFE07",
  white: "#FFFFFF",
  void: "#02060F", 
  frost: "#EAF2FF",
};


const COLORS = {
  bg: PALETTE.void,
  text: PALETTE.frost,
  dim: "rgba(190,214,255,0.58)",
  accent: PALETTE.blueYonder,
  accentGlow: "rgba(46,150,245,0.55)",
  accentSoft: "rgba(46,150,245,0.12)",
  signal: PALETTE.neonYellow, 
  signalGlow: "rgba(234,254,7,0.42)",
  alive: "#F4FFA8", 
  warn: PALETTE.rocketRed, 
  warnGlow: "rgba(228,55,0,0.45)",
};

const FONTS = {
  display: `"Cormorant Garamond", "Times New Roman", serif`,
  mono: `"Space Mono", ui-monospace, SFMono-Regular, Menlo, monospace`,
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Space+Mono:wght@400;700&display=swap",
};



const ASSETS = {
  startBg: "/images/start_screen.png",
  voyagerImg: "/images/voyager.png", 
  selectionVideo: "/videos/selection.mp4",
  introAudio: "/audios/intro.mp3",
  woosh: "/audios/woosh.mp3",
  avatar: "/images/avatar_teacher.png",
};

const ROUTES = {
  next: "/hints", 
};



type Tone = "dying" | "soft" | "alive";

const TEXT = {
  eyebrow: "NASA SPACE APPS CHALLENGE · 2026",
  statusLabel: "CARRIER SIGNAL · FAINT",
  title: "AFTERLIFE",
  subtitle: [
    { text: "Abandoned", tone: "dying" as Tone },
    { text: "but", tone: "soft" as Tone },
    { text: "not forgotten", tone: "alive" as Tone },
  ],
  tagline: "Some signals were never meant to end.",
  beginButton: "Begin experience",
  skip: "Skip",
  launchLabel: "VOYAGER 1 · LAUNCHED 05 SEP 1977",
  clockLabel: "MISSION ELAPSED",
  distanceLabel: "DISTANCE FROM EARTH (KM)",
  lightTimeLabel: "ONE-WAY SIGNAL TIME ≈ 23 HRS",
  whispers: [
    "Somewhere past the edge of the Sun, a machine is still speaking.",
    "It has been alone longer than most of us have been alive.",
    "Its batteries are dying. It keeps calling anyway.",
    "Nobody answers. Somebody should.",
  ],
};


const CONFIG = {
  introTransitionMs: 1400, 
  introSpeed: 1, 
  buttonDelaySec: 0.2,
  parallaxPx: 22,
  exitFadeMs: 900,
  respectReducedMotion: true, 
  voyagerLaunchUTC: Date.UTC(1977, 8, 5, 12, 56, 0),
  woosh: { volume: 0.9 },
};


const INTRO_TIMING = {
  titleStart: 0.8,
  titleLetterGap: 0.13, 
  titleLetterDur: 1.5, 
  subtitleStart: 3.0, 
  subtitleWordGap: 0.9,
  taglineStart: 5.4,
  signalLineStart: 6.0,
  whisperStart: 7.0,
};

const FX = {

  startBgOpacity: 0.45,
  startBgBlend: "screen" as CSSProperties["mixBlendMode"],

  nebulae: [
    { color: PALETTE.neonBlue, x: "14%", y: "32%", size: "74vmax", opacity: 0.42, driftX: 70, driftY: -40, dur: 42 },
    { color: PALETTE.electricBlue, x: "82%", y: "78%", size: "84vmax", opacity: 0.6, driftX: -60, driftY: 30, dur: 50 },
    { color: PALETTE.martianRed, x: "48%", y: "112%", size: "62vmax", opacity: 0.36, driftX: 40, driftY: -30, dur: 36 },
    { color: PALETTE.blueYonder, x: "76%", y: "22%", size: "36vmax", opacity: 0.24, driftX: -30, driftY: 40, dur: 30 },
    { color: PALETTE.rocketRed, x: "4%", y: "92%", size: "30vmax", opacity: 0.14, driftX: 30, driftY: -20, dur: 28 },
  ],

  stars: {
    colors: ["#ffffff", "#ffffff", "#cfe3ff", PALETTE.blueYonder, PALETTE.neonYellow],
    layers: [
      { count: 110, size: [0.6, 1.4], opacity: [0.18, 0.7], twinkle: [3, 9], depthPx: 5, glow: false },
      { count: 46, size: [1, 2], opacity: [0.3, 0.85], twinkle: [2.5, 7], depthPx: 12, glow: false },
      { count: 14, size: [1.8, 3.2], opacity: [0.45, 1], twinkle: [2, 5], depthPx: 24, glow: true },
    ],
  },

  rings: [
    { size: "min(118vh, 118vw)", dur: 260, dir: 1, opacity: 0.16, dash: "2 16", dot: true },
    { size: "min(96vh, 96vw)", dur: 180, dir: -1, opacity: 0.2, dash: "1 10", dot: false },
    { size: "min(150vh, 150vw)", dur: 340, dir: 1, opacity: 0.1, dash: "3 22", dot: true },
  ],
  ringDotColor: PALETTE.neonYellow,


  record: {
    opacity: 0.22,
    spinSec: 160,
    colors: ["#f6dc9c","#c99a42","#7a5718"],
    glow: "rgba(46,150,245,0.4)",
  },

  probe: {
    useImage: true,
    right: "7%",
    top: "15%",
    width: "min(28vw, 400px)",
    opacity: 0.92,
    bobPx: 14,
    bobSec: 11,
    tiltDeg: 4,
    blinkSec: 1.8, 
  },
  pulses: {
    left: "calc(100% - 7% - min(28vw, 400px) * 0.62)", 
    top: "calc(15% + min(28vw, 400px) * 0.32)",
    count: 4,
    size: "min(95vh, 95vw)",
    durSec: 7,
    color: PALETTE.blueYonder,
    maxOpacity: 0.5,
  },

  shootingStars: { count: 3, everySec: 7, durSec: 1.2, travelPx: 560, color: "#ffffff" },

  dust: { count: 38, color: "#ffffff" },

  vignette: 0.88,
  grain: 0.12,
  scanlines: 0.05,

  titleSize: "clamp(52px, 13vw, 210px)",
  titleSpacing: "0.12em",
  titleGlow: [
    "0 0 18px rgba(46,150,245,0.35), 0 0 60px rgba(9,96,225,0.35)",
    "0 0 30px rgba(46,150,245,0.9), 0 0 110px rgba(9,96,225,0.75)",
  ],
  subtitleSize: "clamp(22px, 4.6vw, 62px)",

  signalLine: { width: "min(640px, 78vw)", color: PALETTE.neonYellow, loopSec: 5.5, pauseSec: 1.6, opacity: 0.8 },

  whisperHoldMs: 4600, 
  whisperMinHeight: "3.2em",

  distance: {
    baseKm: 25_900_000_000,
    baseEpochUTC: Date.UTC(2026, 10, 7),
    kmPerSec: 16.95,
  },
};

const SUBTITLE = {
  width: "min(920px, 90vw)", 
  bottom: "5vh", 
  gap: "14px", 
  padding: "18px 28px",
  radius: "18px",
  minHeight: "104px",
  fontSize: "clamp(17px, 2vw, 28px)",
  nameFontSize: "clamp(11px, 1.05vw, 15px)",
  blur: "10px",
  skip: {
    background: COLORS.warn,
    color: "#ffffff",
    padding: "0 26px",
    height: "56px",
    radius: "14px",
    fontSize: "clamp(13px, 1.3vw, 18px)",
    shadow: `0 8px 24px ${COLORS.warnGlow}`,
  },
};

type SpeakerKey = "instructor" | "cadet";
const SPEAKERS: Record<SpeakerKey, { name: string; bg: string; accent: string }> = {
  instructor: { name: "Instructor", bg: "rgba(7, 23, 63, 0.86)", accent: PALETTE.blueYonder },
  cadet: { name: "Cadet", bg: "rgba(142, 17, 0, 0.84)", accent: PALETTE.neonYellow },
};

type Cue = { start: number; end: number; speaker: SpeakerKey; text: string };

const VIDEO_CUES: Cue[] = [
  { start: 0.7, end: 3.5, speaker: "instructor", text: "We're taking one student to explore the archives." },
  { start: 3.6, end: 4.6, speaker: "instructor", text: "How about… you?" },
  { start: 4.7, end: 5.5, speaker: "cadet", text: "Me?" },
  { start: 5.9, end: 8.6, speaker: "instructor", text: "Welcome Aboard Cadet, It would be fun." },
];

const INTRO_CUES: Cue[] = [
  { start: 0.0, end: 1.35, speaker: "instructor", text: "I am the Archivist" },
  { start: 1.4, end: 5.8, speaker: "instructor", text: "Today, we shall explore hardware that were abandoned, but not forgotten." },
  { start: 6.0, end: 10.5, speaker: "instructor", text: "But rest assured, our journey would be fun… and difficult." },
];

const AVATAR_SCENE = {
  appearDelayMs: 900, 
  avatarSize: "clamp(150px, 21vw, 300px)",
  ringColor: PALETTE.blueYonder,
  ringWidth: "3px",
  gapAvatarWave: "clamp(28px, 6vw, 90px)",
  gapToSubtitles: "clamp(28px, 6vh, 70px)",
  backdropStrength: 0.7, 
  wave: {
    color: PALETTE.white,
    bars: 21,
    barWidth: 5,
    gap: 7,
    minHeight: 6,
    maxHeight: 130,
    smoothing: 0.35, 
  },
};



type Scene = "intro" | "selection" | "avatar" | "exit";

const ts = (sec: number) => sec / CONFIG.introSpeed; 
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const analyserCache = new WeakMap<HTMLAudioElement, { ctx: AudioContext; analyser: AnalyserNode }>();
function getAnalyser(a: HTMLAudioElement) {
  const cached = analyserCache.get(a);
  if (cached) return cached;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const src = ctx.createMediaElementSource(a);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser);
    analyser.connect(ctx.destination);
    const entry = { ctx, analyser };
    analyserCache.set(a, entry);
    return entry;
  } catch {
    return null;
  }
}


function useActiveCue(cues: Cue[], getTime: () => number | null, enabled: boolean) {
  const [idx, setIdx] = useState(-1);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const loop = () => {
      const now = getTime();
      const found = now == null ? -1 : cues.findIndex((c) => now >= c.start && now < c.end);
      setIdx((p) => (p === found ? p : found));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cues, getTime, enabled]);
  return idx >= 0 ? cues[idx] : null;
}



function skipToNextCue(media: HTMLMediaElement | null, cues: Cue[]): boolean {
  if (!media) return false;
  const now = media.currentTime;
  const next = cues
    .filter((c) => c.start > now + 0.05)
    .sort((a, b) => a.start - b.start)[0];
  if (!next) return false;
  media.currentTime = next.start + 0.02;
  if (media.paused) media.play().catch(() => {});
  return true;
}



function Nebulae({ strength = 1 }: { strength?: number }) {
  return (
    <>
      {FX.nebulae.map((n, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: n.x, top: n.y, width: n.size, height: n.size, transform: "translate(-50%, -50%)" }}
        >
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${n.color} 0%, transparent 66%)`,
              mixBlendMode: "screen",
            }}
            animate={{
              x: [0, n.driftX, 0],
              y: [0, n.driftY, 0],
              scale: [1, 1.12, 1],
              opacity: [n.opacity * strength, n.opacity * strength * 0.6, n.opacity * strength],
            }}
            transition={{ duration: n.dur, repeat: Infinity, ease: "easeInOut", delay: -i * 7 }}
          />
        </div>
      ))}
    </>
  );
}

function StarLayer({
  layer,
  seed,
  mx,
  my,
  strength,
}: {
  layer: (typeof FX.stars.layers)[number];
  seed: number;
  mx?: MotionValue<number>;
  my?: MotionValue<number>;
  strength: number;
}) {
  const zero = useMotionValue(0);
  const x = useTransform(mx ?? zero, [-0.5, 0.5], [-layer.depthPx, layer.depthPx]);
  const y = useTransform(my ?? zero, [-0.5, 0.5], [-layer.depthPx, layer.depthPx]);

  const stars = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: layer.count }, () => {
      const size = layer.size[0] + r() * (layer.size[1] - layer.size[0]);
      const color = FX.stars.colors[Math.floor(r() * FX.stars.colors.length)];
      return {
        left: `${(r() * 100).toFixed(2)}%`,
        top: `${(r() * 100).toFixed(2)}%`,
        size,
        color,
        lo: (layer.opacity[0] * strength).toFixed(2),
        hi: (layer.opacity[1] * strength).toFixed(2),
        dur: (layer.twinkle[0] + r() * (layer.twinkle[1] - layer.twinkle[0])).toFixed(2),
        delay: (-r() * 8).toFixed(2),
      };
    });
  }, [layer, seed, strength]);

  return (
    <motion.div className="absolute pointer-events-none" style={{ inset: "-4%", x, y }}>
      {stars.map((s, i) => (
        <span
          key={i}
          className="af-star"
          style={
            {
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background: s.color,
              boxShadow: layer.glow ? `0 0 ${s.size * 3.5}px ${s.color}` : undefined,
              "--lo": s.lo,
              "--hi": s.hi,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </motion.div>
  );
}

function Starfield({ mx, my, strength = 1 }: { mx?: MotionValue<number>; my?: MotionValue<number>; strength?: number }) {
  return (
    <>
      {FX.stars.layers.map((l, i) => (
        <StarLayer key={i} layer={l} seed={11 + i * 97} mx={mx} my={my} strength={strength} />
      ))}
    </>
  );
}



function SubtitleBar({
  cue,
  onSkip,
  floating,
}: {
  cue: Cue | null;
  onSkip: () => void;
  floating?: boolean;
}) {
  const sp = cue ? SPEAKERS[cue.speaker] : null;
  const S = SUBTITLE;
  return (
    <div
      style={{
        width: S.width,
        display: "flex",
        alignItems: "center",
        gap: S.gap,
        zIndex: 30,
        ...(floating
          ? { position: "absolute", left: "50%", bottom: S.bottom, transform: "translateX(-50%)" }
          : { position: "relative" }),
      }}
    >
      <motion.div
        animate={{
          backgroundColor: sp?.bg ?? "rgba(0,0,0,0)",
          opacity: cue ? 1 : 0,
          y: cue ? 0 : 10,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          flex: 1,
          minHeight: S.minHeight,
          padding: S.padding,
          borderRadius: S.radius,
          backdropFilter: `blur(${S.blur})`,
          WebkitBackdropFilter: `blur(${S.blur})`,
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {cue && sp && (
          <>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: S.nameFontSize,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: sp.accent,
              }}
            >
              {sp.name}
            </div>
            <motion.div
              key={cue.text}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: S.fontSize, lineHeight: 1.35, color: "#fff", fontWeight: 500 }}
            >
              {cue.text}
            </motion.div>
          </>
        )}
      </motion.div>

      <motion.button
        onClick={onSkip}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: S.skip.background,
          color: S.skip.color,
          padding: S.skip.padding,
          height: S.skip.height,
          borderRadius: S.skip.radius,
          fontSize: S.skip.fontSize,
          fontFamily: FONTS.mono,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: S.skip.shadow,
        }}
      >
        {TEXT.skip} ▶▶
      </motion.button>
    </div>
  );
}



function GoldenRecord() {
  const grooves = Array.from({ length: 34 }, (_, i) => 30 + i * 1.95);
  const [c0, c1, c2] = FX.record.colors;
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <radialGradient id="gr-body" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c0} />
          <stop offset="60%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
        <linearGradient id="gr-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#gr-body)" />
      {grooves.map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgba(2,6,15,0.35)" strokeWidth="0.35" />
      ))}
      <circle cx="100" cy="100" r="98" fill="url(#gr-sheen)" />
      <circle cx="100" cy="100" r="25" fill={c1} />
      <circle cx="100" cy="100" r="25" fill="none" stroke="rgba(2,6,15,0.5)" strokeWidth="0.6" />
      <path
        d="M100 84 a16 16 0 1 1 -0.1 0 M100 100 L112 90 M88 108 h10"
        fill="none"
        stroke="rgba(2,6,15,0.55)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <circle cx="100" cy="100" r="3.5" fill="#02060f" />
    </svg>
  );
}



function ProbeSVG() {
  return (
    <svg viewBox="0 0 280 190" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="pb-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbe9ff" />
          <stop offset="1" stopColor="#31508a" />
        </linearGradient>
        <radialGradient id="pb-dish" cx="38%" cy="38%" r="75%">
          <stop offset="0" stopColor="#f2f7ff" />
          <stop offset="0.65" stopColor="#86abe0" />
          <stop offset="1" stopColor="#223d6d" />
        </radialGradient>
      </defs>
      {/* booms */}
      <g stroke="#8fb4e8" strokeWidth="1.6" strokeLinecap="round">
        <line x1="150" y1="92" x2="262" y2="58" />
        <line x1="152" y1="100" x2="240" y2="158" />
        <line x1="112" y1="78" x2="26" y2="26" />
        <line x1="112" y1="84" x2="12" y2="70" />
      </g>
      <rect x="256" y="50" width="12" height="16" rx="2" fill="#6b8fc7" />
      <rect x="234" y="154" width="12" height="16" rx="2" fill="#6b8fc7" />
      <rect x="6" y="64" width="10" height="12" rx="2" fill="#6b8fc7" />
      {/* bus */}
      <polygon points="118,68 162,74 172,98 152,120 112,112 104,88" fill="url(#pb-metal)" stroke="#a9c6f2" strokeWidth="0.8" />
      <line x1="118" y1="68" x2="152" y2="120" stroke="rgba(2,6,15,0.25)" strokeWidth="0.8" />
      {/* dish */}
      <ellipse cx="94" cy="98" rx="38" ry="54" fill="url(#pb-dish)" transform="rotate(-18 94 98)" />
      <ellipse cx="94" cy="98" rx="26" ry="38" fill="none" stroke="rgba(2,6,15,0.28)" strokeWidth="0.8" transform="rotate(-18 94 98)" />
      <ellipse cx="94" cy="98" rx="12" ry="18" fill="none" stroke="rgba(2,6,15,0.28)" strokeWidth="0.8" transform="rotate(-18 94 98)" />
      <line x1="94" y1="98" x2="52" y2="78" stroke="#a9c6f2" strokeWidth="1.2" />
      <circle cx="50" cy="77" r="3" fill="#cfe3ff" />

      <circle
        className="af-blink"
        cx="141"
        cy="96"
        r="3.2"
        fill={PALETTE.rocketRed}
        style={{ filter: `drop-shadow(0 0 6px ${PALETTE.rocketRed})`, "--blink": `${FX.probe.blinkSec}s` } as CSSProperties}
      />
    </svg>
  );
}

function MissionClock() {
  const [txt, setTxt] = useState("— — —");
  useEffect(() => {
    const tick = () => {
      let s = Math.floor((Date.now() - CONFIG.voyagerLaunchUTC) / 1000);
      const y = Math.floor(s / 31557600);
      s -= y * 31557600;
      const d = Math.floor(s / 86400);
      s -= d * 86400;
      const h = Math.floor(s / 3600);
      s -= h * 3600;
      const m = Math.floor(s / 60);
      s -= m * 60;
      const p = (n: number, l = 2) => String(n).padStart(l, "0");
      setTxt(`${p(y, 3)}Y ${p(d, 3)}D ${p(h)}:${p(m)}:${p(s)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{txt}</>;
}

function DistanceCounter() {
  const [txt, setTxt] = useState("— — —");
  useEffect(() => {
    const D = FX.distance;
    const tick = () => {
      const km = D.baseKm + ((Date.now() - D.baseEpochUTC) / 1000) * D.kmPerSec;
      setTxt(Math.floor(km).toLocaleString("en-US"));
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);
  return <>{txt}</>;
}

function ShootingStars() {
  const S = FX.shootingStars;
  const items = useMemo(
    () =>
      Array.from({ length: S.count }, (_, i) => {
        const r = seeded(500 + i * 13);
        return {
          top: `${(4 + r() * 42).toFixed(1)}%`,
          left: `${(38 + r() * 56).toFixed(1)}%`,
          len: 110 + r() * 120,
          delay: i * (S.everySec / S.count) + r() * 2,
        };
      }),
    [S.count, S.everySec]
  );
  return (
    <>
      {items.map((s, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: s.len,
            height: 1.5,
            rotate: 150,
            background: `linear-gradient(to right, transparent, ${S.color})`,
            borderRadius: 2,
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: [0, -S.travelPx], y: [0, S.travelPx * 0.55], opacity: [0, 1, 0] }}
          transition={{ duration: S.durSec, delay: s.delay, repeat: Infinity, repeatDelay: S.everySec, ease: "easeOut" }}
        />
      ))}
    </>
  );
}


function SignalLine() {
  const L = FX.signalLine;
  return (
    <motion.svg
      viewBox="0 0 800 60"
      style={{ width: L.width, height: "auto", display: "block", overflow: "visible" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: ts(INTRO_TIMING.signalLineStart), duration: 1.2 }}
    >
      <motion.path
        d="M0 30 H170 l8 -24 l10 48 l8 -24 H320 l6 -14 l8 28 l6 -14 H450 l4 -7 l5 14 l4 -7 H560 l3 -3 l3 6 l3 -3 H800"
        fill="none"
        stroke={L.color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${COLORS.signalGlow})`, opacity: L.opacity }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1], opacity: [0, L.opacity, 0] }}
        transition={{
          duration: L.loopSec,
          times: [0, 0.65, 1],
          repeat: Infinity,
          repeatDelay: L.pauseSec,
          ease: "easeInOut",
          delay: ts(INTRO_TIMING.signalLineStart),
        }}
      />
    </motion.svg>
  );
}

function Whispers() {
  const [i, setI] = useState(-1);
  useEffect(() => {
    let n = -1;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      n = (n + 1) % TEXT.whispers.length;
      setI(n);
      timer = setTimeout(next, FX.whisperHoldMs);
    };
    timer = setTimeout(next, ts(INTRO_TIMING.whisperStart) * 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      style={{
        minHeight: FX.whisperMinHeight,
        maxWidth: "min(620px, 84vw)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AnimatePresence mode="wait">
        {i >= 0 && (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 0.9, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              fontFamily: FONTS.display,
              fontStyle: "italic",
              fontSize: "clamp(16px, 1.9vw, 24px)",
              lineHeight: 1.45,
              color: COLORS.text,
              margin: 0,
              textShadow: "0 2px 18px rgba(0,0,0,0.8)",
            }}
          >
            {TEXT.whispers[i]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}



function IntroScene({ onBegin, onDone }: { onBegin: () => void; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [voyagerOk, setVoyagerOk] = useState(FX.probe.useImage);

  // mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 });
  const sy = useSpring(my, { stiffness: 40, damping: 18 });
  const bgX = useTransform(sx, [-0.5, 0.5], [-CONFIG.parallaxPx, CONFIG.parallaxPx]);
  const bgY = useTransform(sy, [-0.5, 0.5], [-CONFIG.parallaxPx, CONFIG.parallaxPx]);
  const fgX = useTransform(sx, [-0.5, 0.5], [CONFIG.parallaxPx * 0.6, -CONFIG.parallaxPx * 0.6]);
  const fgY = useTransform(sy, [-0.5, 0.5], [CONFIG.parallaxPx * 0.6, -CONFIG.parallaxPx * 0.6]);

  const motes = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: FX.dust.count }, () => ({
      left: `${(r() * 100).toFixed(2)}%`,
      top: `${(r() * 100).toFixed(2)}%`,
      size: 1 + r() * 2.2,
      dur: 9 + r() * 14,
      drift: 30 + r() * 80,
      delay: r() * 6,
      op: 0.2 + r() * 0.6,
    }));
  }, []);

  const begin = () => {
    if (leaving) return;
    onBegin();
    setLeaving(true);
    setTimeout(onDone, CONFIG.introTransitionMs);
  };

  const letters = Array.from(TEXT.title);
  const warpDur = CONFIG.introTransitionMs / 1000;
  const probeW = FX.probe.width;

  return (
    <motion.div
      key="intro"
      className="fixed inset-0 overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onMouseMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
      style={{
        color: COLORS.text,
        background: `radial-gradient(ellipse at 50% 40%, ${PALETTE.deepBlue} 0%, ${COLORS.bg} 78%)`,
      }}
    >

      <motion.div
        className="absolute"
        style={{ inset: "-6%", x: bgX, y: bgY }}
        initial={{ scale: 1.25, opacity: 0 }}
        animate={
          leaving
            ? { scale: 2.4, opacity: 1, filter: "blur(6px)" }
            : { scale: [1.06, 1.14, 1.06], opacity: 1 }
        }
        transition={
          leaving
            ? { duration: warpDur, ease: [0.7, 0, 0.9, 0.4] }
            : { scale: { duration: 70, repeat: Infinity, ease: "linear" }, opacity: { duration: 2.4 } }
        }
      >
        {FX.startBgOpacity > 0 && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${ASSETS.startBg})`,
              opacity: FX.startBgOpacity,
              mixBlendMode: FX.startBgBlend,
            }}
          />
        )}
        <Nebulae />
        <Starfield mx={sx} my={sy} />
      </motion.div>
      <ShootingStars />


      {FX.rings.map((r, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            width: r.size,
            height: r.size,
            marginLeft: `calc(${r.size} / -2)`,
            marginTop: `calc(${r.size} / -2)`,
            borderRadius: "50%",
            border: `1px dashed rgba(143,208,255,${r.opacity})`,
            x: fgX,
            y: fgY,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1, rotate: r.dir * 360 }}
          transition={{
            opacity: { duration: 2.4, delay: 0.8 },
            rotate: { duration: r.dur, repeat: Infinity, ease: "linear" },
          }}
        >
          {r.dot && (
            <span
              style={{
                position: "absolute",
                top: -3,
                left: "50%",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: FX.ringDotColor,
                boxShadow: `0 0 12px ${FX.ringDotColor}`,
              }}
            />
          )}
        </motion.div>
      ))}


      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          width: "min(86vh, 86vw)",
          height: "min(86vh, 86vw)",
          marginLeft: "calc(min(86vh, 86vw) / -2)",
          marginTop: "calc(min(86vh, 86vw) / -2)",
          x: fgX,
          y: fgY,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: leaving ? 0 : FX.record.opacity, scale: 1 }}
        transition={{ duration: 2.6, ease: "easeOut" }}
      >
        <motion.div
          style={{ width: "100%", height: "100%", filter: `drop-shadow(0 0 60px ${FX.record.glow})` }}
          animate={{ rotate: 360 }}
          transition={{ duration: FX.record.spinSec, repeat: Infinity, ease: "linear" }}
        >
          <GoldenRecord />
        </motion.div>
      </motion.div>


      <div
        className="absolute pointer-events-none"
        style={{ left: FX.pulses.left, top: FX.pulses.top, width: 0, height: 0 }}
      >
        {Array.from({ length: FX.pulses.count }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              x: "-50%",
              y: "-50%",
              width: FX.pulses.size,
              height: FX.pulses.size,
              borderRadius: "50%",
              border: `1px solid ${FX.pulses.color}`,
              boxShadow: `0 0 24px ${COLORS.accentSoft}, inset 0 0 24px ${COLORS.accentSoft}`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1], opacity: leaving ? 0 : [FX.pulses.maxOpacity, 0] }}
            transition={{
              duration: FX.pulses.durSec,
              repeat: Infinity,
              ease: "easeOut",
              delay: 1.5 + (i * FX.pulses.durSec) / FX.pulses.count,
            }}
          />
        ))}
      </div>


      <motion.div
        className="absolute pointer-events-none"
        style={{ right: FX.probe.right, top: FX.probe.top, width: probeW, x: fgX, y: fgY }}
      >
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{
            opacity: leaving ? 0 : FX.probe.opacity,
            x: 0,
            y: [0, -FX.probe.bobPx, 0],
            rotate: [-FX.probe.tiltDeg, FX.probe.tiltDeg, -FX.probe.tiltDeg],
          }}
          transition={{
            opacity: { duration: 2.4, delay: 1.2 },
            x: { duration: 3, delay: 1.2, ease: "easeOut" },
            y: { duration: FX.probe.bobSec, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: FX.probe.bobSec * 1.6, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ filter: "drop-shadow(0 0 40px rgba(46,150,245,0.35))" }}
        >
          {voyagerOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ASSETS.voyagerImg}
              alt=""
              onError={() => setVoyagerOk(false)}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          ) : (
            <ProbeSVG />
          )}
        </motion.div>
      </motion.div>


      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ left: m.left, top: m.top, width: m.size, height: m.size, opacity: m.op, background: FX.dust.color }}
          animate={{ y: [0, -m.drift, 0], opacity: [m.op, m.op * 0.2, m.op] }}
          transition={{ duration: m.dur, repeat: Infinity, ease: "easeInOut", delay: m.delay }}
        />
      ))}


      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 28%, rgba(2,6,15,${FX.vignette}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: FX.grain,
          mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: FX.scanlines,
          backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)",
        }}
      />


      <motion.div
        className="absolute left-6 top-6 md:left-10 md:top-8"
        style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: "0.24em", color: COLORS.dim, lineHeight: 1.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ delay: 0.6, duration: 1.2 }}
      >
        <div>{TEXT.eyebrow}</div>
        <div style={{ fontSize: 11, letterSpacing: "0.2em" }}>
          <span
            className="af-blink"
            style={{ color: COLORS.warn, marginRight: 8, ["--blink" as string]: `${FX.probe.blinkSec}s` } as CSSProperties}
          >
            ●
          </span>
          {TEXT.statusLabel}
        </div>
      </motion.div>

      <motion.div
        className="absolute right-6 top-6 text-right md:right-10 md:top-8"
        style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: "0.2em", color: COLORS.dim, lineHeight: 1.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ delay: 0.9, duration: 1.2 }}
      >
        <div style={{ color: COLORS.accent }}>{TEXT.clockLabel}</div>
        <MissionClock />
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-6 hidden sm:block md:bottom-8 md:left-10"
        style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.22em", color: COLORS.dim }}
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ delay: 1.2, duration: 1.2 }}
      >
        {TEXT.launchLabel}
      </motion.div>

      <motion.div
        className="absolute bottom-6 right-6 text-right md:bottom-8 md:right-10"
        style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.2em", color: COLORS.dim, lineHeight: 1.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ delay: 1.5, duration: 1.2 }}
      >
        <div style={{ color: COLORS.accent }}>{TEXT.distanceLabel}</div>
        <div style={{ color: COLORS.text }}>
          <DistanceCounter />
        </div>
        <div style={{ fontSize: 10 }}>{TEXT.lightTimeLabel}</div>
      </motion.div>


      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        animate={leaving ? { scale: 1.6, opacity: 0, filter: "blur(14px)" } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: leaving ? warpDur : 0.6, ease: [0.7, 0, 0.9, 0.4] }}
      >
        <h1
          aria-label={TEXT.title}
          style={{
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontSize: FX.titleSize,
            letterSpacing: FX.titleSpacing,
            lineHeight: 1,
            margin: 0,
            paddingLeft: FX.titleSpacing, 
            whiteSpace: "nowrap",
          }}
        >
          {letters.map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              style={{ display: "inline-block", color: COLORS.text }}
              initial={{ opacity: 0, y: 26, scale: 1.08, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{
                delay: ts(INTRO_TIMING.titleStart + i * INTRO_TIMING.titleLetterGap),
                duration: ts(INTRO_TIMING.titleLetterDur),
                ease: [0.2, 0.8, 0.2, 1],
              }}
            >
              <motion.span
                style={{ display: "inline-block" }}
                animate={{ textShadow: [FX.titleGlow[0], FX.titleGlow[1], FX.titleGlow[0]] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: ts(INTRO_TIMING.titleStart + 2.2) + i * 0.22,
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            </motion.span>
          ))}
        </h1>

        <div
          style={{
            fontFamily: FONTS.display,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: FX.subtitleSize,
            marginTop: "clamp(8px, 1.6vh, 22px)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: "0.32em",
          }}
        >
          {TEXT.subtitle.map((w, i) => {
            const delay = ts(INTRO_TIMING.subtitleStart + i * INTRO_TIMING.subtitleWordGap);
            if (w.tone === "dying") {
              return (
                <motion.span
                  key={i}
                  style={{ color: COLORS.accent, display: "inline-block" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0.15, 0.75, 0.1, 0.55, 0.22, 0.4] }}
                  transition={{ delay, duration: ts(2.6), times: [0, 0.1, 0.2, 0.34, 0.46, 0.62, 0.78, 1] }}
                >
                  {w.text}
                </motion.span>
              );
            }
            const alive = w.tone === "alive";
            return (
              <motion.span
                key={i}
                style={{
                  display: "inline-block",
                  color: alive ? COLORS.alive : COLORS.dim,
                  textShadow: alive ? `0 0 26px ${COLORS.signalGlow}, 0 0 70px ${COLORS.signalGlow}` : undefined,
                }}
                initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay, duration: ts(1.3), ease: "easeOut" }}
              >
                {w.text}
              </motion.span>
            );
          })}
        </div>

        <motion.p
          style={{
            fontFamily: FONTS.mono,
            fontSize: 13,
            letterSpacing: "0.3em",
            color: COLORS.dim,
            marginTop: "clamp(16px, 3.4vh, 38px)",
            textTransform: "uppercase",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: ts(INTRO_TIMING.taglineStart), duration: ts(1.4) }}
        >
          {TEXT.tagline}
        </motion.p>

        <div style={{ marginTop: "clamp(10px, 2vh, 22px)" }}>
          <SignalLine />
        </div>

        <Whispers />

        <motion.button
          onClick={begin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: CONFIG.buttonDelaySec, duration: 0.4 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="relative"
          style={{
            marginTop: "clamp(14px, 3vh, 34px)",
            padding: "16px 44px",
            borderRadius: 999,
            border: `1px solid ${COLORS.accent}`,
            background: COLORS.accentSoft,
            color: COLORS.text,
            fontFamily: FONTS.mono,
            fontSize: 15,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            boxShadow: `0 0 30px ${COLORS.accentSoft}`,
          }}
        >
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: `1px solid ${COLORS.accent}` }}
            animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
          {TEXT.beginButton}
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: COLORS.bg }}
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 1 : 0 }}
        transition={{ duration: warpDur, ease: "easeIn" }}
      />
    </motion.div>
  );
}


function SelectionScene({
  videoRef,
  onDone,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  onDone: () => void;
}) {
  const getTime = useCallback(() => {
    const v = videoRef.current;
    return v && !v.paused ? v.currentTime : null;
  }, [videoRef]);
  const cue = useActiveCue(VIDEO_CUES, getTime, true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    v.currentTime = 0;
    v.addEventListener("ended", onDone);
    v.play().catch((err) => console.warn("Video play blocked:", err));
    return () => {
      v.removeEventListener("ended", onDone);
      v.pause();
    };
  }, [videoRef, onDone]);

  const skip = () => {
    if (skipToNextCue(videoRef.current, VIDEO_CUES)) return; 
    videoRef.current?.pause();
    onDone();
  };

  return (
    <motion.div
      key="selection"
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
    >
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: "40%", background: "linear-gradient(to top, rgba(2,6,15,0.65), transparent)" }}
      />
      <SubtitleBar cue={cue} onSkip={skip} floating />
    </motion.div>
  );
}



function AvatarScene({
  audioRef,
  onDone,
}: {
  audioRef: RefObject<HTMLAudioElement | null>;
  onDone: () => void;
}) {
  const [avatarOk, setAvatarOk] = useState(true);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRef = useRef<HTMLDivElement>(null);
  const W = AVATAR_SCENE.wave;

  const getTime = useCallback(() => {
    const a = audioRef.current;
    return a && !a.paused ? a.currentTime : null;
  }, [audioRef]);
  const cue = useActiveCue(INTRO_CUES, getTime, true);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const ended = () => onDone();
    audio.addEventListener("ended", ended);
    const timer = setTimeout(() => {
      const a = getAnalyser(audio);
      a?.ctx.resume().catch(() => {});
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }, AVATAR_SCENE.appearDelayMs);
    return () => {
      clearTimeout(timer);
      audio.removeEventListener("ended", ended);
      audio.pause();
    };
  }, [audioRef, onDone]);


  useEffect(() => {
    let raf = 0;
    const cur = new Array(W.bars).fill(W.minHeight);
    let data: Uint8Array<ArrayBuffer> | null = null;
    const loop = (time: number) => {
      const audio = audioRef.current;
      const playing = !!audio && !audio.paused && !audio.ended;
      const entry = audio ? analyserCache.get(audio) : undefined;
      if (entry && !data) data = new Uint8Array(new ArrayBuffer(entry.analyser.frequencyBinCount));
      if (entry && data && playing) entry.analyser.getByteFrequencyData(data);

      let sum = 0;
      for (let i = 0; i < W.bars; i++) {
        const d = Math.abs(i - (W.bars - 1) / 2) / ((W.bars - 1) / 2); 
        let v = 0;
        if (playing) {
          if (entry && data) v = data[Math.floor(2 + d * 28)] / 255;
          else v = 0.5 + 0.5 * Math.sin(time / 120 + i * 0.9) * Math.random(); // fallback
        }
        const target = W.minHeight + Math.pow(clamp01(v), 1.25) * (W.maxHeight - W.minHeight);
        cur[i] += (target - cur[i]) * W.smoothing;
        const el = barRefs.current[i];
        if (el) el.style.height = `${cur[i].toFixed(1)}px`;
        sum += v;
      }
      if (ringRef.current) {
        const lvl = sum / W.bars;
        ringRef.current.style.transform = `scale(${1 + lvl * 0.12})`;
        ringRef.current.style.opacity = String(0.25 + lvl * 0.9);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [audioRef, W.bars, W.minHeight, W.maxHeight, W.smoothing]);

  const skip = () => {
    if (skipToNextCue(audioRef.current, INTRO_CUES)) return; 
    audioRef.current?.pause(); 
    onDone();
  };

  return (
    <motion.div
      key="avatar"
      className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center"
      style={{ background: `radial-gradient(ellipse at 50% 40%, ${PALETTE.deepBlue} 0%, ${COLORS.bg} 80%)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Nebulae strength={AVATAR_SCENE.backdropStrength} />
      <Starfield strength={AVATAR_SCENE.backdropStrength} />

      <div className="relative flex items-center justify-center" style={{ gap: AVATAR_SCENE.gapAvatarWave, zIndex: 10 }}>
        {/* avatar */}
        <motion.div
          className="relative"
          style={{ width: AVATAR_SCENE.avatarSize, height: AVATAR_SCENE.avatarSize }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div
            ref={ringRef}
            className="absolute rounded-full pointer-events-none"
            style={{ inset: -14, border: `1px solid ${AVATAR_SCENE.ringColor}`, opacity: 0.25 }}
          />
          <div
            className="h-full w-full overflow-hidden rounded-full"
            style={{
              border: `${AVATAR_SCENE.ringWidth} solid ${AVATAR_SCENE.ringColor}`,
              background: `radial-gradient(circle at 35% 30%, ${PALETTE.electricBlue}, ${PALETTE.deepBlue})`,
              boxShadow: `0 0 50px ${COLORS.accentSoft}`,
            }}
          >
            {avatarOk && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ASSETS.avatar}
                alt="Instructor"
                onError={() => setAvatarOk(false)}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </motion.div>

        <motion.div
          className="flex items-center"
          style={{ gap: W.gap, height: W.maxHeight }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {Array.from({ length: W.bars }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                barRefs.current[i] = el;
              }}
              style={{
                width: W.barWidth,
                height: W.minHeight,
                background: W.color,
                borderRadius: W.barWidth,
              }}
            />
          ))}
        </motion.div>
      </div>

      <div className="relative" style={{ marginTop: AVATAR_SCENE.gapToSubtitles, zIndex: 10 }}>
        <SubtitleBar cue={cue} onSkip={skip} />
      </div>
    </motion.div>
  );
}


function ExitScene({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, CONFIG.exitFadeMs);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <motion.div
      key="exit"
      className="fixed inset-0"
      style={{ background: COLORS.bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: CONFIG.exitFadeMs / 1000, ease: "easeIn" }}
    />
  );
}



export default function Page() {
  const router = useRouter();
  const [scene, setScene] = useState<Scene>("intro");
  const introRef = useRef<HTMLAudioElement | null>(null);
  const wooshRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    introRef.current = new Audio(ASSETS.introAudio);
    introRef.current.preload = "auto";
    wooshRef.current = new Audio(ASSETS.woosh);
    wooshRef.current.volume = CONFIG.woosh.volume;
    const refs = [introRef, wooshRef];
    return () => refs.forEach((r) => r.current?.pause());
  }, []);

  useEffect(() => {
    router.prefetch(ROUTES.next);
  }, [router]);


  const handleBegin = useCallback(() => {
    const w = wooshRef.current;
    if (w) {
      w.currentTime = 0;
      w.play().catch(() => {});
    }

    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.play()
        .then(() => {
          v.pause();
          v.currentTime = 0;
          v.muted = false;
        })
        .catch(() => {
          v.muted = false;
        });
    }
    const a = introRef.current;
    if (a) {
      a.muted = true;
      a.play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
          a.muted = false;
        })
        .catch(() => {
          a.muted = false;
        });
    }
  }, []);

  const toSelection = useCallback(() => setScene("selection"), []);
  const toAvatar = useCallback(() => setScene("avatar"), []);
  const toExit = useCallback(() => setScene("exit"), []);
  const goNext = useCallback(() => router.push(ROUTES.next), [router]);

  return (
    <MotionConfig reducedMotion={CONFIG.respectReducedMotion ? "user" : "never"}>
      <main className="fixed inset-0 overflow-hidden" style={{ background: COLORS.bg }}>
        <style>{`@import url('${FONTS.googleFontsUrl}');
          html,body{background:${COLORS.bg};margin:0;overflow:hidden}
          button:focus-visible{outline:2px solid #fff;outline-offset:3px}
          .af-star{position:absolute;border-radius:50%;animation:af-twinkle var(--dur,5s) ease-in-out var(--delay,0s) infinite}
          @keyframes af-twinkle{0%,100%{opacity:var(--lo,.2)}50%{opacity:var(--hi,.8)}}
          .af-blink{animation:af-blink var(--blink,1.8s) steps(1,end) infinite}
          @keyframes af-blink{0%,55%{opacity:1}56%,100%{opacity:.1}}
          @media (prefers-reduced-motion: reduce){.af-star,.af-blink{animation:none}}`}</style>


        <video
          ref={videoRef}
          src={ASSETS.selectionVideo}
          playsInline
          preload="auto"
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: scene === "selection" ? 1 : 0,
            transition: "opacity 0.9s",
            pointerEvents: "none",
          }}
        />

        <AnimatePresence mode="wait">
          {scene === "intro" && <IntroScene key="intro" onBegin={handleBegin} onDone={toSelection} />}
          {scene === "selection" && <SelectionScene key="selection" videoRef={videoRef} onDone={toAvatar} />}
          {scene === "avatar" && <AvatarScene key="avatar" audioRef={introRef} onDone={toExit} />}
          {scene === "exit" && <ExitScene key="exit" onDone={goNext} />}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
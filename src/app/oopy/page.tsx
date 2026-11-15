"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate } from "motion";

type SfxDef = { src: string; vol: number; loop?: boolean; note: string };
const SFX_DEFS = {
  uiClick:      { src: "/audios/sfx/ui_click.mp3",       vol: 0.5,  note: "Soft mechanical key press, ~100ms" },
  typeTick:     { src: "/audios/sfx/type_tick.mp3",      vol: 0.18, note: "Tiny terminal blip for typewriter text, ~30ms" },
  calendarFlip: { src: "/audios/sfx/calendar_flip.mp3",  vol: 0.6,  note: "Paper page torn and flicked away, ~300ms" },
  calendarTick: { src: "/audios/sfx/calendar_tick.mp3",  vol: 0.4,  note: "Slow clock-like tick as the years count down" },
  memoryWhoosh: { src: "/audios/sfx/memory_whoosh.mp3",  vol: 0.55, note: "Warm reverse-swell as a flashback fades in, ~1.2s" },
  radioStatic:  { src: "/audios/sfx/radio_static.mp3",   vol: 0.25, loop: true, note: "Looping radio static / comms hiss" },
  radioBeep:    { src: "/audios/sfx/radio_beep.mp3",     vol: 0.4,  note: "Mission-control comms chirp, ~150ms" },
  alarmLoop:    { src: "/audios/sfx/alarm_loop.mp3",     vol: 0.3,  loop: true, note: "Looping low-power alarm (two-tone, seamless)" },
  klaxon:       { src: "/audios/sfx/klaxon.mp3",         vol: 0.5,  note: "Single big warning blast, ~900ms" },
  heartbeat:    { src: "/audios/sfx/heartbeat.mp3",      vol: 0.55, note: "One deep lub-dub heartbeat, ~600ms" },
  heartbeatHit: { src: "/audios/sfx/heartbeat_hit.mp3",  vol: 0.6,  note: "Bright monitor beep for a successful beat" },
  flatline:     { src: "/audios/sfx/flatline.mp3",       vol: 0.5,  note: "Long continuous medical flatline tone, ~1.5s" },
  passChime:    { src: "/audios/sfx/pass_chime.mp3",     vol: 0.55, note: "Hopeful rising chime, ~700ms" },
  failBuzz:     { src: "/audios/sfx/fail_buzz.mp3",      vol: 0.55, note: "Harsh descending error buzz with a thud, ~800ms" },
  wipeLoop:     { src: "/audios/sfx/wipe_loop.mp3",      vol: 0.35, loop: true, note: "Looping squeegee swish on dusty glass" },
  switchOff:    { src: "/audios/sfx/switch_off.mp3",     vol: 0.55, note: "Heavy relay clunk, ~250ms" },
  powerDown:    { src: "/audios/sfx/power_down.mp3",     vol: 0.55, note: "Machinery spinning down, falling pitch, ~1s" },
  tapSpam:      { src: "/audios/sfx/tap_spam.mp3",       vol: 0.3,  note: "Snappy electric tick, ~50ms (plays up to 16x/sec)" },
  countTick:    { src: "/audios/sfx/count_tick.mp3",     vol: 0.5,  note: "Countdown beep, ~120ms" },
  countGo:      { src: "/audios/sfx/count_go.mp3",       vol: 0.6,  note: "Higher 'GO' beep, ~300ms" },
  glitchHit:    { src: "/audios/sfx/glitch_hit.mp3",     vol: 0.5,  note: "Digital glitch / data corruption stab, ~250ms" },
  boom:         { src: "/audios/sfx/boom.mp3",           vol: 0.65, note: "Deep cinematic impact, ~1.5s" },
  riser:        { src: "/audios/sfx/riser.mp3",          vol: 0.45, note: "Rising tension swell, ~2s" },
  windLoop:     { src: "/audios/sfx/wind_loop.mp3",      vol: 0.35, loop: true, note: "Looping Martian wind, thin and howling" },
  droneLoop:    { src: "/audios/sfx/drone_loop.mp3",     vol: 0.3,  loop: true, note: "Looping low dread drone / pad" },
  oopyChirp:    { src: "/audios/sfx/oopy_chirp.mp3",     vol: 0.45, note: "Cute rover R2-style chirp, ~250ms" },
  oopySad:      { src: "/audios/sfx/oopy_sad.mp3",       vol: 0.5,  note: "Sad falling rover whimper, ~900ms" },
  signalLost:   { src: "/audios/sfx/signal_lost.mp3",    vol: 0.55, note: "Dial-tone dying to static, ~1.2s" },
  stormRoar:    { src: "/audios/sfx/storm_roar.mp3",     vol: 0.55, note: "Wall-of-wind swell for the final storm hit, ~3s" },
} satisfies Record<string, SfxDef>;
type SfxKey = keyof typeof SFX_DEFS;


const CONFIG = {
  assets: {
    suspense: "/audios/suspense.mp3",
    lastWords: "/audios/lastwords.mp3",
    subside: "/audios/subside.mp3",
    mayhem: "/videos/mayhem.mp4",
    intro: "/videos/oopy_intro.mp4",
    engulf: "/videos/engulf.mp4",
  },
  audio: { master: 0.9, ambientWind: true, ambientDrone: true, heartbeatAmbient: true },
  fonts: {
    display: "'Bebas Neue', 'Impact', sans-serif",
    body: "'Space Grotesk', 'Segoe UI', sans-serif",
    mono: "'IBM Plex Mono', 'Courier New', monospace",
    googleUrl:
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;600&family=Space+Grotesk:wght@400;600;700&display=swap",
  },
  colors: {
    danger: "#ff2436",
    dangerDeep: "#7a0712",
    pass: "#3dffb0",
    accent: "#ff8a2a",
    cyan: "#6fe7ff",
    amber: "#ffc857",
    ink: "#05060b",
    glass: "rgba(10,12,22,0.62)",
    dust: "176,112,64",
  },

  transitions: ["fade", "cut", "white", "glitch", "fade"] as const,
  transitionMs: 380,
  scene0: {
    title: "Chapter 3: The Bittersweet Ending",
    hint: "Click to continue",
    kicker: "NASA Space Apps · A story you play",
    soundNote: "Sound on for the full experience",
    stars: 160,
  },
  scene1: {
    targetYear: 2018,
    monthText: "June, 2018",
    pageFlipMs: 270,
    maxFlips: 14,
    holdOnTargetMs: 1400,
    circleDay: 10,
    circleLabel: "Sol 5111",
    textStartVw: 80,
    textEndVw: 90,
    growMs: 500,
    holdMs: 500,
  },
  scene2: {
    danger: "[DANGER]",
    dangerBlinks: 4,
    storm: "[Imminent Martian Storm]",
    stormBlinks: 2,
    blinkMs: 600,
    fallbackMs: 9000, 
    headerLeft: "NASA · JPL MISSION CONTROL",
    headerRight: "LIVE · MER-B OPPORTUNITY",

    chatter: [
      "FLIGHT: Any telemetry from Oppy? Anything?",
      "COMMS: Negative. Carrier is wandering.",
      "POWER: Solar array output below threshold.",
      "FLIGHT: Opacity reading — what's the tau?",
      "SCIENCE: Tau is above ten. Sun is gone, sir.",
      "FLIGHT: Send the wake-up command again.",
      "COMMS: Sent. Waiting on the relay orbiter.",
      "FLIGHT: Come on, Oppy. Talk to us.",
    ],
  },

  mission: { sol: 5111, tau: 10.8, clock: "T-00:00:00" },


  vitals: {
    start: { battery: 58, signal: 74, panel: 41, temp: 70, integrity: 100 },
    drainPerSecond: 0.28, 
    lowThreshold: 25,
    labels: { battery: "POWER", signal: "SIGNAL", panel: "SOLAR", temp: "THERMAL", integrity: "HULL" },
  },

  deltas: {
    heart: { pass: { signal: 8, integrity: 4 }, fail: { signal: -25, integrity: -10 } },
    reflex1: { pass: { signal: 12 }, fail: { signal: -14, battery: -6 } },
    dust: { pass: { panel: 38, battery: 10 }, fail: { panel: -18, battery: -14 } },
    reflex2: { pass: { integrity: 8 }, fail: { integrity: -16, temp: -8 } },
    spam: { pass: {}, fail: { battery: -60, signal: -50, panel: -30 } },
  } as Record<string, { pass: Partial<Record<string, number>>; fail: Partial<Record<string, number>> }>,
  /** Storm intensity (0-1) by step — also rises +stormPerFail for each failed event. */
  storm: { maxParticles: 520, intro: 0.12, heart: 0.28, dust: 0.46, hw: 0.66, spam: 0.88, montage: 1, perFail: 0.04 },

  flash: { passText: "[PASS]", failText: "[FAILED\nTRANSMISSION]", ms: 2300, factDelayMs: 650 },


  transcript: [
    { at: 0, text: "Cadet, Opportunity is dying." },
    { at: 2.7, text: "And you have to do the following to save it." },
    { at: 5, text: "Think fast as you will be presented with quick timed events." },
    { at: 8, text: "DECISIONS MATTER" },
  ] as { at: number; text: string }[],

  guidelines: [
    { keys: ["SPACE"], title: "Heartbeat", body: "Press SPACE when the glowing line is inside a heartbeat zone." },
    { keys: ["A", "S", "D"], title: "Signal lock", body: "Tap the letter that flashes before the ring runs out." },
    { keys: ["🖱"], title: "Solar panel", body: "Hold the mouse or finger and wipe the dust away. 5 seconds." },
    { keys: ["CLICK"], title: "Power down", body: "Switch off 3 of the 7 systems. Every choice has a cost." },
    { keys: ["SPACE", "SPACE"], title: "Final push", body: "Mash SPACE as fast as you possibly can. Do not stop." },
  ],


  eventIntro: { titleMs: 1500, countFrom: 3, tickMs: 650 },

  heartbeat: { beats: [0.2, 0.4, 0.6, 0.8], zoneWidth: 0.075, durationMs: 6200, title: "Keep my heart beating", hint: "Press SPACE when the line is inside a zone", flatlineMs: 900 },
  reflex1: { title: "Lock the relay signal", hint: "Tap the letter shown — fast!", pool: ["A", "S", "D", "F", "J", "K"], count: 4, timeMs: 2000, passText: "[SIGNAL LOCKED]", failText: "[SIGNAL LOST]" },
  reflex2: { title: "Brace for the gust!", hint: "Tap the arrow key shown", pool: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], count: 4, timeMs: 1550, passText: "[BRACED]", failText: "[KNOCKED OVER]" },
  dust: {
    title: "Wipe my panels clean", hint: "Hold and drag across the glass", seconds: 5, cleanPassPct: 75, brush: 62,
    specksPerFrame: 11, speckSize: [2, 8] as [number, number], startSpecks: 6800, gustEveryMs: 1400, gustSpecks: 900,
    panelTitle: "SOLAR ARRAY · PANEL A", wattsMax: 140,
  },
  hardware: {
    title: "Cut power to 3 systems", hint: "Click a system to switch it off — each has a cost", seconds: 10, mustPick: 3, ringRadius: 38,
    /** PLUG IN: edit labels, icons, warnings, lessons and vital effects. */
    items: [
      { id: "heater", icon: "🔥", label: "Heater", warn: "TEMPERATURE CRITICALLY LOW", lesson: "Rovers keep their electronics warm — Mars nights are brutal.", fx: { temp: -40, battery: 12, integrity: -6 } },
      { id: "radio", icon: "📡", label: "Radio", warn: "EARTH LINK LOST", lesson: "Without the radio, NASA can't hear Oopy at all.", fx: { signal: -45, battery: 7 } },
      { id: "cams", icon: "📷", label: "Cameras", warn: "VISUAL FEED OFFLINE", lesson: "The cameras were Oopy's eyes on Mars.", fx: { battery: 6, integrity: -4 } },
      { id: "arm", icon: "🦾", label: "Robotic Arm", warn: "SAMPLE ARM FROZEN", lesson: "The arm touched rocks to read their chemistry.", fx: { battery: 5, integrity: -2 } },
      { id: "imu", icon: "🧭", label: "Gyro / IMU", warn: "NAVIGATION DRIFT DETECTED", lesson: "Without it Oopy can't tell which way is up.", fx: { battery: 4, integrity: -12, signal: -5 } },
      { id: "wheels", icon: "⚙", label: "Wheel Motors", warn: "ROVER IMMOBILISED", lesson: "Oopy drove over 45 km — more than a marathon.", fx: { battery: 8, integrity: -3 } },
      { id: "lab", icon: "🧪", label: "Science Lab", warn: "EXPERIMENTS CORRUPTED", lesson: "Years of mineral data lived in the lab software.", fx: { battery: 10, integrity: -2 } },
    ] as { id: string; icon: string; label: string; warn: string; lesson: string; fx: Record<string, number> }[],
  },
  spam: { title: "Wake me up", hint: "Mash SPACE — do not stop!", seconds: 5, targetClicks: 100, minGapMs: 60, capPct: 98, curveK: 14, startPrompt: "Press SPACE to begin", ringLabel: "REBOOT" },

  /* ───── flashbacks shown between events ───── */
  memoryMs: 3600,

  memories: [
    { sol: "Sol 1", year: "January 2004", line: "A 90-day mission. Everyone said that was the limit.", tint: "#ffb36b", image: "" },
    { sol: "Sol 2,000", year: "2010", line: "Your twin, Spirit, had gone silent. You rolled on for both of you.", tint: "#e9a36b", image: "" },
    { sol: "Sol 5,000", year: "2018", line: "More than 45 kilometres of Mars under your wheels. You never stopped looking.", tint: "#c9784a", image: "" },
  ],
  memoryHint: "Click or press SPACE to skip",

  facts: {
    heart: "Opportunity was built for 90 Martian days (sols). It worked for more than 5,000.",
    reflex1: "Radio messages need roughly 4 to 24 minutes to cross between Mars and Earth.",
    dust: "Mars winds sometimes blew Opportunity's panels clean. Engineers called them 'cleaning events'.",
    reflex2: "Mars has weak gravity and thin air, but its storms can still be huge.",
    hw: "Mars nights can drop below −70 °C, so rovers spend precious power on heaters.",
    spam: "In June 2018 a global dust storm blotted out the Sun. Opportunity's panels could not charge.",
  } as Record<string, string>,

  voice: {
    intro: "I can see the storm coming. It's okay. I've seen worse. Haven't I?",
    heartPre: "My heart is the last thing I'll lose. Keep it steady — please.",
    heartPass: "…Still here. Thank you.",
    heartFail: "I lost you for a second. Everything went quiet.",
    reflex1Pre: "NASA is calling! Lock the signal before it slips away!",
    reflex1Pass: "I hear them! They're still out there.",
    reflex1Fail: "Static… I can't hear anyone.",
    dustPre: "The dust is on my panels. I can't see the sun anymore.",
    dustPass: "Light! I can feel it. A little more life.",
    dustFail: "It's too thick. It's getting dark out here.",
    reflex2Pre: "Wind! Hold on to me!",
    reflex2Pass: "Steady. Steady. I'm still standing.",
    reflex2Fail: "I'm tipping… I'm okay. I think I'm okay.",
    hwPre: "I can't power everything. Help me choose what to let go.",
    hwPass: "Quieter now. Just the important things.",
    hwFail: "Too slow… the systems are fighting each other. Everything is flickering.",
    spamPre: "One last chance. Wake me up. Please.",
    spamFail: "It's okay. You did everything you could.",
  } as Record<string, string>,
  chatter: {
    heart: ["FLIGHT: Vitals are collapsing.", "FLIGHT: Keep trying. Keep trying."],
    reflex1: ["FLIGHT: Get a lock. Any lock.", "COMMS: Carrier is fading!"],
    dust: ["POWER: Array output at twelve watts.", "SCIENCE: Tau still rising.", "FLIGHT: She's running on fumes."],
    reflex2: ["ENG: Gust front inbound.", "SCIENCE: Winds climbing.", "FLIGHT: Hold her steady."],
    hw: ["POWER: Load shed now, load shed now.", "FLIGHT: Pick what she can live without.", "ENG: Ten seconds on the clock."],
    spam: ["FLIGHT: Send the reboot. All of it.", "COMMS: Nothing from the rover.", "FLIGHT: Come on, Oppy. Come on."],
  } as Record<string, string[]>,

  montage: {
    fallbackMs: 22000, 
    lastWords: [
      { at: 1.5, text: "Is anyone still there?" },
      { at: 5, text: "My battery is low and it's getting dark" },
    ] as { at: number; text: string }[],
    signalLost: "NO CARRIER",
  },
  dev: { enableJump: true },
  end: {
    epitaph: { enabled: false, lines: ["Opportunity · 2004 – 2018", "Designed for 90 days. Lived 5,111.", "Thank you, Oopy."], lineMs: 2200 },
    missionFailed: "[MISSION FAILED]",
    failedMinMs: 3800,
    fadeMs: 1100,
    blackAfterMissionFailedMs: 2000,
    redirect: "/voyager",
  },
};

type SceneStep =
  | { kind: "intro" }
  | { kind: "memory"; i: number }
  | { kind: "event"; id: "heart" | "dust" | "hw" | "spam" }
  | { kind: "reflex"; id: "reflex1" | "reflex2" };

const TIMELINE: SceneStep[] = [
  { kind: "intro" },
  { kind: "event", id: "heart" },
  { kind: "reflex", id: "reflex1" },
  { kind: "memory", i: 0 },
  { kind: "event", id: "dust" },
  { kind: "memory", i: 1 },
  { kind: "reflex", id: "reflex2" },
  { kind: "event", id: "hw" },
  { kind: "memory", i: 2 },
  { kind: "event", id: "spam" },
];



type VitalKey = "battery" | "signal" | "panel" | "temp" | "integrity";
type Vitals = Record<VitalKey, number>;
const clamp = (n: number, a = 0, b = 100) => Math.min(b, Math.max(a, n));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const hex2rgb = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
const mixHex = (a: string, b: string, t: number) => {
  const A = hex2rgb(a), B = hex2rgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
};
const applyDelta = (v: Vitals, d: Partial<Record<string, number>>): Vitals => {
  const n = { ...v };
  (Object.keys(d) as VitalKey[]).forEach((k) => { if (k in n) n[k] = clamp(n[k] + (d[k] ?? 0)); });
  return n;
};
const tempC = (t: number) => Math.round(-90 + t * 1.1);




type LoopHandle = { setVol: (v: number) => void; stop: () => void };

function tone(c: AudioContext, d: AudioNode, o: { f: number; f2?: number; t?: OscillatorType; dur: number; v?: number; delay?: number; atk?: number }) {
  const t0 = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = o.t ?? "sine";
  osc.frequency.setValueAtTime(o.f, t0);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), t0 + o.dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.v ?? 0.4, t0 + (o.atk ?? 0.008));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  osc.connect(g); g.connect(d);
  osc.start(t0); osc.stop(t0 + o.dur + 0.05);
}
function noiseBuffer(c: AudioContext) {
  const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), ch = b.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  return b;
}
function noise(c: AudioContext, d: AudioNode, o: { dur: number; v?: number; lp?: number; hp?: number; delay?: number; atk?: number; swell?: boolean }) {
  const t0 = c.currentTime + (o.delay ?? 0);
  const s = c.createBufferSource(); s.buffer = noiseBuffer(c); s.loop = true;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  if (o.swell) g.gain.exponentialRampToValueAtTime(o.v ?? 0.4, t0 + o.dur * 0.95);
  else g.gain.exponentialRampToValueAtTime(o.v ?? 0.4, t0 + (o.atk ?? 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  let node: AudioNode = s;
  if (o.lp) { const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; node.connect(f); node = f; }
  if (o.hp) { const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = o.hp; node.connect(f); node = f; }
  node.connect(g); g.connect(d);
  s.start(t0); s.stop(t0 + o.dur + 0.05);
}


const SYNTH: Partial<Record<SfxKey, (c: AudioContext, d: AudioNode) => void>> = {
  uiClick: (c, d) => tone(c, d, { f: 1400, f2: 700, t: "square", dur: 0.06, v: 0.2 }),
  typeTick: (c, d) => tone(c, d, { f: 2200, t: "square", dur: 0.02, v: 0.1 }),
  calendarFlip: (c, d) => { noise(c, d, { dur: 0.22, v: 0.5, hp: 1400, lp: 7000 }); tone(c, d, { f: 220, f2: 90, t: "triangle", dur: 0.15, v: 0.2 }); },
  calendarTick: (c, d) => tone(c, d, { f: 900, f2: 500, t: "triangle", dur: 0.08, v: 0.3 }),
  memoryWhoosh: (c, d) => { noise(c, d, { dur: 1.3, v: 0.35, lp: 1800, swell: true }); tone(c, d, { f: 220, f2: 440, dur: 1.3, v: 0.12, atk: 0.9 }); },
  radioBeep: (c, d) => { tone(c, d, { f: 1800, t: "square", dur: 0.07, v: 0.2 }); tone(c, d, { f: 1300, t: "square", dur: 0.07, v: 0.2, delay: 0.1 }); },
  klaxon: (c, d) => { tone(c, d, { f: 420, f2: 620, t: "sawtooth", dur: 0.45, v: 0.35 }); tone(c, d, { f: 420, f2: 620, t: "sawtooth", dur: 0.45, v: 0.35, delay: 0.5 }); },
  heartbeat: (c, d) => { tone(c, d, { f: 70, f2: 38, dur: 0.18, v: 0.9 }); tone(c, d, { f: 60, f2: 34, dur: 0.2, v: 0.7, delay: 0.17 }); },
  heartbeatHit: (c, d) => { tone(c, d, { f: 1100, dur: 0.14, v: 0.35 }); tone(c, d, { f: 1650, dur: 0.14, v: 0.2, delay: 0.02 }); },
  flatline: (c, d) => tone(c, d, { f: 980, dur: 1.5, v: 0.25, atk: 0.02 }),
  passChime: (c, d) => [523, 659, 784, 1046].forEach((f, i) => tone(c, d, { f, t: "triangle", dur: 0.35, v: 0.3, delay: i * 0.09 })),
  failBuzz: (c, d) => { tone(c, d, { f: 220, f2: 70, t: "sawtooth", dur: 0.6, v: 0.5 }); tone(c, d, { f: 50, f2: 30, dur: 0.7, v: 0.8 }); noise(c, d, { dur: 0.3, v: 0.3, lp: 900 }); },
  switchOff: (c, d) => { tone(c, d, { f: 160, f2: 60, t: "square", dur: 0.12, v: 0.4 }); noise(c, d, { dur: 0.08, v: 0.3, lp: 2500 }); },
  powerDown: (c, d) => { tone(c, d, { f: 520, f2: 40, t: "sawtooth", dur: 1, v: 0.3 }); tone(c, d, { f: 260, f2: 30, dur: 1, v: 0.4 }); },
  tapSpam: (c, d) => tone(c, d, { f: 1700, f2: 900, t: "square", dur: 0.04, v: 0.16 }),
  countTick: (c, d) => tone(c, d, { f: 880, t: "square", dur: 0.1, v: 0.25 }),
  countGo: (c, d) => tone(c, d, { f: 1320, t: "square", dur: 0.28, v: 0.3 }),
  glitchHit: (c, d) => { noise(c, d, { dur: 0.22, v: 0.5, hp: 800 }); tone(c, d, { f: 2400, f2: 80, t: "sawtooth", dur: 0.2, v: 0.25 }); },
  boom: (c, d) => { tone(c, d, { f: 90, f2: 25, dur: 1.5, v: 1 }); noise(c, d, { dur: 1.2, v: 0.5, lp: 600 }); },
  riser: (c, d) => { tone(c, d, { f: 120, f2: 900, t: "sawtooth", dur: 2, v: 0.2, atk: 1.6 }); noise(c, d, { dur: 2, v: 0.3, hp: 1000, swell: true }); },
  oopyChirp: (c, d) => { tone(c, d, { f: 900, f2: 1500, dur: 0.1, v: 0.3 }); tone(c, d, { f: 1500, f2: 1100, dur: 0.12, v: 0.3, delay: 0.1 }); },
  oopySad: (c, d) => { tone(c, d, { f: 900, f2: 300, dur: 0.8, v: 0.3, atk: 0.05 }); tone(c, d, { f: 700, f2: 220, dur: 0.9, v: 0.2, delay: 0.1 }); },
  signalLost: (c, d) => { tone(c, d, { f: 700, f2: 180, dur: 1.2, v: 0.3 }); noise(c, d, { dur: 1.2, v: 0.3, hp: 2500, swell: true }); },
  stormRoar: (c, d) => { noise(c, d, { dur: 3, v: 0.8, lp: 900, swell: true }); tone(c, d, { f: 55, f2: 40, dur: 3, v: 0.5, atk: 2 }); },
};

class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  missing = new Set<string>();
  loops = new Map<SfxKey, LoopHandle>();
  muted = false;

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = CONFIG.audio.master;
      this.master.connect(this.ctx.destination);
      (Object.keys(SFX_DEFS) as SfxKey[]).forEach((k) => {
        fetch(SFX_DEFS[k].src, { method: "HEAD" }).then((r) => { if (!r.ok) this.missing.add(k); }).catch(() => this.missing.add(k));
      });
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  private synth(key: SfxKey, mul: number) {
    if (!this.ctx || !this.master) return;
    const g = this.ctx.createGain();
    g.gain.value = SFX_DEFS[key].vol * mul;
    g.connect(this.master);
    SYNTH[key]?.(this.ctx, g);
  }

  play(key: SfxKey, mul = 1) {
    if (this.muted || !this.ctx) return;
    const d: SfxDef = SFX_DEFS[key];
    if (d.loop) { this.loop(key, mul); return; }
    if (this.missing.has(key)) { this.synth(key, mul); return; }
    let fell = false;
    const fall = () => { if (!fell) { fell = true; this.missing.add(key); this.synth(key, mul); } };
    const a = new Audio(d.src);
    a.volume = clamp(d.vol * mul * CONFIG.audio.master, 0, 1) / 1;
    a.onerror = fall;
    a.play().catch(fall);
  }

  loop(key: SfxKey, vol = 1): LoopHandle {
    const existing = this.loops.get(key);
    if (existing) { existing.setVol(vol); return existing; }
    const base = SFX_DEFS[key].vol;
    let handle: LoopHandle;
    if (!this.missing.has(key)) {
      const a = new Audio(SFX_DEFS[key].src);
      a.loop = true; a.volume = clamp(base * vol, 0, 1);
      a.play().catch(() => undefined);
      handle = { setVol: (v) => { a.volume = clamp(base * v, 0, 1); }, stop: () => { a.pause(); } };
    } else handle = this.synthLoop(key, vol);
    this.loops.set(key, handle);
    return handle;
  }

  private synthLoop(key: SfxKey, vol: number): LoopHandle {
    const c = this.ctx!, g = c.createGain();
    const base = SFX_DEFS[key].vol;
    g.gain.value = base * vol;
    g.connect(this.master!);
    const stops: (() => void)[] = [];
    const src = (loopNoise: boolean) => {
      const s = c.createBufferSource(); s.buffer = noiseBuffer(c); s.loop = loopNoise; s.start(); stops.push(() => s.stop()); return s;
    };
    if (key === "windLoop") {
      const s = src(true), f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 500; f.Q.value = 0.8;
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 300;
      lfo.connect(lg); lg.connect(f.frequency); lfo.start(); stops.push(() => lfo.stop());
      s.connect(f); f.connect(g);
    } else if (key === "droneLoop") {
      [55, 55.7, 82.4].forEach((fr) => { const o = c.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr;
        const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 240; o.connect(f); f.connect(g); o.start(); stops.push(() => o.stop()); });
    } else if (key === "alarmLoop") {
      const o = c.createOscillator(); o.type = "square"; o.frequency.value = 700;
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.type = "square"; lfo.frequency.value = 2; lg.gain.value = 160;
      lfo.connect(lg); lg.connect(o.frequency); o.connect(g); o.start(); lfo.start(); stops.push(() => { o.stop(); lfo.stop(); });
    } else if (key === "radioStatic") {
      const s = src(true), f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2600; s.connect(f); f.connect(g);
    } else if (key === "wipeLoop") {
      const s = src(true), f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1900; f.Q.value = 1.4; s.connect(f); f.connect(g);
    }
    return {
      setVol: (v) => g.gain.setTargetAtTime(base * v, c.currentTime, 0.08),
      stop: () => { g.gain.setTargetAtTime(0.0001, c.currentTime, 0.1); setTimeout(() => stops.forEach((s) => { try { s() } catch { /* already stopped */ } }), 400); },
    };
  }

  stop(key: SfxKey) { const h = this.loops.get(key); if (h) { h.stop(); this.loops.delete(key); } }
  stopAll() { this.loops.forEach((h) => h.stop()); this.loops.clear(); }
}
const sfx = new AudioEngine();

/** Play one of the big story mp3s; always resolves via onEnd (even on error). */
function playAudio(src: string, onEnd?: () => void, volume = 1) {
  const a = new Audio(src);
  a.volume = volume;
  a.onended = () => onEnd?.();
  a.onerror = () => onEnd?.();
  a.play().catch(() => onEnd?.());
  return a;
}



function useLatest<T>(v: T) { const r = useRef(v); r.current = v; return r; }

function useKeys(handler: (key: string, e: KeyboardEvent) => void, on = true) {
  const h = useLatest(handler);
  useEffect(() => {
    if (!on) return;
    const f = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "Space" || e.key.startsWith("Arrow")) e.preventDefault();
      h.current(e.code === "Space" ? "Space" : e.key, e);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [on, h]);
}
const useSpace = (fn: () => void, on = true) => useKeys((k) => { if (k === "Space") fn(); }, on);

function useRaf(cb: (dt: number, t: number) => void, on = true) {
  const c = useLatest(cb);
  useEffect(() => {
    if (!on) return;
    let raf = 0, last = performance.now();
    const loop = (t: number) => { c.current(Math.min(64, t - last), t); last = t; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [on, c]);
}

function useTypewriter(text: string, cps = 38, onChar?: (i: number) => void) {
  const [n, setN] = useState(0);
  const cb = useLatest(onChar);
  useEffect(() => {
    setN(0);
    let i = 0;
    const id = setInterval(() => { i++; setN(i); cb.current?.(i); if (i >= text.length) clearInterval(id); }, 1000 / cps);
    return () => clearInterval(id);
  }, [text, cps, cb]);
  return { shown: text.slice(0, n), done: n >= text.length };
}

type Fx = { shake: (i?: number) => void; flash: (color?: string, o?: number) => void; pulse: (color?: string) => void };
const FxCtx = createContext<Fx>({ shake() {}, flash() {}, pulse() {} });
const useFx = () => useContext(FxCtx);




function StormCanvas({ intensity }: { intensity: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const I = useLatest(intensity);
  useEffect(() => {
    const c = ref.current!, ctx = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    type P = { x: number; y: number; l: number; s: number; a: number; z: number };
    const mk = (): P => ({ x: rand(0, w * 1.2), y: rand(0, h), l: rand(8, 60), s: rand(8, 26), a: rand(0.1, 0.6), z: rand(0.5, 1.6) });
    const MAX = CONFIG.storm.maxParticles;
    const ps: P[] = Array.from({ length: MAX }, mk);
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(50, t - last) / 16.7; last = t;
      const k = I.current;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      const n = Math.floor(MAX * (0.08 + k * 0.92));
      for (let i = 0; i < n; i++) {
        const p = ps[i];
        p.x -= p.s * dt * (0.5 + k * 2.2) * p.z;
        p.y += Math.sin((p.x + i) * 0.01) * 0.6 * dt;
        if (p.x < -90) { p.x = w + rand(0, 200); p.y = rand(0, h); }
        ctx.strokeStyle = `rgba(${CONFIG.colors.dust},${p.a * (0.25 + k * 0.75)})`;
        ctx.lineWidth = p.z * (1 + k);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.l * (0.5 + k * 1.5), p.y - p.l * 0.05); ctx.stroke();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [I]);
  return <canvas ref={ref} className="storm-canvas" />;
}

/** Oopy, drawn in SVG. `battery` dims the eyes, `dust` buries the panels, `droop` sags the mast. */
function OopySvg({ battery, dust, droop }: { battery: number; dust: number; droop: number }) {
  const low = battery < CONFIG.vitals.lowThreshold;
  const eye = clamp(battery / 100, 0.08, 1);
  return (
    <svg viewBox="0 0 400 270" className="oopy-svg" aria-label="Oopy the Opportunity rover">
      <defs>
        <linearGradient id="oBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8c27a" /><stop offset="1" stopColor="#a8803c" /></linearGradient>
        <linearGradient id="oPanel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1d3f9a" /><stop offset="1" stopColor="#0b1b52" /></linearGradient>
        <radialGradient id="oEye"><stop offset="0" stopColor="#fff" /><stop offset=".4" stopColor={CONFIG.colors.cyan} /><stop offset="1" stopColor="#0a3a4a" /></radialGradient>
        <pattern id="oCells" width="26" height="14" patternUnits="userSpaceOnUse"><rect width="26" height="14" fill="none" stroke="#6f93ff" strokeOpacity=".35" /></pattern>
      </defs>
      <ellipse cx="200" cy="250" rx="170" ry="11" fill="#000" opacity=".35" />
      {/* rocker-bogie */}
      <g stroke="#8d8f98" strokeWidth="6" strokeLinecap="round" fill="none">
        <polyline points="125,170 70,226" /><polyline points="125,170 190,226" /><polyline points="275,170 190,226" /><polyline points="275,170 330,226" />
      </g>
      {[70, 190, 330].map((x) => (
        <g key={x} className="oopy-wheel">
          <circle cx={x} cy="226" r="26" fill="#1a1b22" stroke="#444757" strokeWidth="4" />
          <circle cx={x} cy="226" r="11" fill="#7b7d8c" />
          {[0, 60, 120].map((a) => <line key={a} x1={x} y1="226" x2={x + 22 * Math.cos((a * Math.PI) / 180)} y2={226 + 22 * Math.sin((a * Math.PI) / 180)} stroke="#555869" strokeWidth="3" />)}
        </g>
      ))}
      {/* body */}
      <rect x="95" y="120" width="210" height="58" rx="8" fill="url(#oBody)" stroke="#6b5120" strokeWidth="2" />
      <rect x="112" y="134" width="70" height="26" rx="4" fill="#00000030" />
      <circle cx="270" cy="148" r="8" fill={low ? CONFIG.colors.danger : CONFIG.colors.pass} className={low ? "oopy-led blink-fast" : "oopy-led"} />
      <rect x="85" y="108" width="230" height="14" rx="3" fill="#4d4f5e" />
      {/* solar deck */}
      <polygon points="64,108 336,108 366,88 94,88" fill="url(#oPanel)" stroke="#9fb0e8" strokeWidth="2" />
      <polygon points="64,108 336,108 366,88 94,88" fill="url(#oCells)" />
      <polygon points="64,108 336,108 366,88 94,88" fill={`rgb(${CONFIG.colors.dust})`} opacity={clamp(dust, 0, 0.92)} />
      {/* high-gain antenna */}
      <g transform="rotate(-18 130 90)"><ellipse cx="130" cy="82" rx="22" ry="7" fill="#c9ccd8" stroke="#6d7083" /><line x1="130" y1="88" x2="130" y2="104" stroke="#8d8f98" strokeWidth="4" /></g>
      {/* arm */}
      <polyline points="98,150 62,160 46,186" stroke="#9496a6" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46" cy="188" r="7" fill="#cfd1dc" />
      {/* mast + camera head — sags as hope fades */}
      <g className="oopy-mast" style={{ transform: `rotate(${droop}deg)`, transformOrigin: "293px 110px" }}>
        <rect x="290" y="42" width="7" height="68" fill="#a5a8b8" />
        <rect x="276" y="26" width="38" height="20" rx="4" fill="#d3d5e0" stroke="#6a6c7d" strokeWidth="2" />
        <g className={low ? "oopy-eyes flicker" : "oopy-eyes"} style={{ opacity: eye }}>
          <circle cx="286" cy="36" r="6" fill="url(#oEye)" /><circle cx="304" cy="36" r="6" fill="url(#oEye)" />
        </g>
      </g>
    </svg>
  );
}

const HILLS_FAR = "M0,200 L90,150 L170,185 L260,120 L360,170 L470,110 L580,165 L690,130 L800,175 L900,125 L1000,180 L1000,260 L0,260 Z";
const HILLS_MID = "M0,230 L120,190 L220,215 L340,170 L470,210 L600,175 L740,215 L860,185 L1000,220 L1000,260 L0,260 Z";

function MarsBackdrop({ storm, battery, droop }: { storm: number; battery: number; droop: number }) {
  const s = clamp(storm, 0, 1);
  const style = {
    ["--sky0" as string]: mixHex("#e9a36b", "#220909", s),
    ["--sky1" as string]: mixHex("#f7d6a0", "#5a2414", s * 0.9),
    ["--hill-far" as string]: mixHex("#a8643a", "#1d0a07", s),
    ["--hill-mid" as string]: mixHex("#8a4a28", "#150705", s),
    ["--ground0" as string]: mixHex("#9a5630", "#12060a", s),
    ["--ground1" as string]: mixHex("#6e3a1e", "#07030a", s),
    ["--fog" as string]: mixHex("#c98a55", "#1a0806", s),
  };
  return (
    <div className="mars" style={style}>
      <div className="mars-sky" />
      <div className="mars-sun" style={{ opacity: 1 - s * 0.96, transform: `translate(-50%, ${s * 50}px) scale(${1 + s * 0.5})` }} />
      <svg className="mars-hills far" viewBox="0 0 1000 260" preserveAspectRatio="none"><path d={HILLS_FAR} /></svg>
      <svg className="mars-hills mid" viewBox="0 0 1000 260" preserveAspectRatio="none"><path d={HILLS_MID} /></svg>
      <div className="mars-ground" />
      <div className="mars-oopy"><OopySvg battery={battery} dust={s * 0.9} droop={droop} /></div>
      <div className="mars-fog" style={{ opacity: 0.12 + s * 0.78 }} />
      <StormCanvas intensity={s} />
      <div className="mars-dim" style={{ opacity: Math.max(0, s - 0.35) * 0.7 }} />
    </div>
  );
}

function Gauge({ label, value, display, low }: { label: string; value: number; display?: string; low?: boolean }) {
  return (
    <div className={`gauge ${low ? "low" : ""}`}>
      <div className="gauge-top"><span>{label}</span><b>{display ?? `${Math.round(value)}%`}</b></div>
      <div className="gauge-bar"><i style={{ width: `${clamp(value)}%` }} /></div>
    </div>
  );
}
function SignalBars({ value }: { value: number }) {
  return <div className="sigbars">{[20, 40, 60, 80, 95].map((t, i) => <i key={i} className={value >= t ? "on" : ""} style={{ height: 6 + i * 4 }} />)}</div>;
}

function Hud({ vitals, bpm, label }: { vitals: Vitals; bpm: number; label: string }) {
  const L = CONFIG.vitals.lowThreshold, labels = CONFIG.vitals.labels;
  return (
    <div className="hud">
      <div className="hud-left">
        <div className="hud-badge"><span className="rec" />{label}</div>
        <div className="hud-small">SOL {CONFIG.mission.sol} · TAU {CONFIG.mission.tau}</div>
      </div>
      <div className="hud-gauges">
        <Gauge label={labels.battery} value={vitals.battery} low={vitals.battery < L} />
        <Gauge label={labels.panel} value={vitals.panel} low={vitals.panel < L} />
        <Gauge label={labels.temp} value={vitals.temp} display={`${tempC(vitals.temp)}°C`} low={vitals.temp < L} />
        <Gauge label={labels.integrity} value={vitals.integrity} low={vitals.integrity < L} />
        <div className={`gauge ${vitals.signal < L ? "low" : ""}`}>
          <div className="gauge-top"><span>{labels.signal}</span><b>{Math.round(vitals.signal)}%</b></div>
          <SignalBars value={vitals.signal} />
        </div>
      </div>
      <div className="hud-heart" style={{ ["--bpm" as string]: `${60 / bpm}s` }}>
        <svg viewBox="0 0 120 40"><path className="mini-ecg" d="M0 20 H30 L36 20 L42 6 L50 34 L56 20 H80 L86 20 L92 10 L98 28 L104 20 H120" /></svg>
        <b>{Math.round(bpm)}</b><span>BPM</span>
      </div>
      {vitals.battery < L && <div className="lowpower">⚠ LOW POWER</div>}
    </div>
  );
}



function Voice({ speaker = "OOPY", text }: { speaker?: "OOPY" | "FLIGHT" | "SYSTEM"; text: string }) {
  const { shown } = useTypewriter(text, 34, (i) => { if (i % 3 === 0) sfx.play("typeTick"); });
  if (!text) return null;
  return (
    <div className={`voice ${speaker.toLowerCase()}`} key={text}>
      <div className="voice-eye"><i /><i /></div>
      <div><div className="voice-name">{speaker}</div><p>{shown}<em className="caret">▍</em></p></div>
    </div>
  );
}

function Chatter({ lines }: { lines: string[] }) {
  return (
    <div className="chatter" key={lines.join("|")}>
      {lines.map((l, i) => <p key={i} style={{ animationDelay: `${i * 0.9 + 0.3}s` }}><b>{`T+${String(i * 7 + 3).padStart(2, "0")}`}</b> {l}</p>)}
    </div>
  );
}

function FilmOverlay({ red = 0 }: { red?: number }) {
  return (
    <>
      <div className="grain" /><div className="scanlines" /><div className="vignette-fx" />
      <div className="red-pulse" style={{ opacity: red }} />
    </>
  );
}




function ResultFlash({ text, pass, fact, onDone }: { text: string; pass: boolean; fact?: string; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const fx = useFx();
  const color = pass ? CONFIG.colors.pass : CONFIG.colors.danger;
  useEffect(() => {
    sfx.play(pass ? "passChime" : "failBuzz");
    if (!pass) sfx.play("oopySad");
    fx.shake(pass ? 0.8 : 1.8); fx.flash(color, pass ? 0.35 : 0.6);
    if (ref.current) animate(ref.current, { opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 1.2] }, { duration: CONFIG.flash.ms / 1000, times: [0, 0.14, 0.8, 1] });
    const t = setTimeout(onDone, CONFIG.flash.ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flash-wrap">
      <div ref={ref} className={`flash ${pass ? "pass" : "fail"}`} style={{ color }} data-text={text}>{text}</div>
      {fact && <div className="fact" style={{ animationDelay: `${CONFIG.flash.factDelayMs}ms` }}><b>DID YOU KNOW?</b><p>{fact}</p></div>}
    </div>
  );
}

function MemoryCard({ i, onDone }: { i: number; onDone: () => void }) {
  const m = CONFIG.memories[i % CONFIG.memories.length];
  const done = useRef(false);
  const finish = useCallback(() => { if (!done.current) { done.current = true; onDone(); } }, [onDone]);
  useEffect(() => { sfx.play("memoryWhoosh"); const t = setTimeout(finish, CONFIG.memoryMs); return () => clearTimeout(t); }, [finish]);
  useSpace(finish);
  const { shown } = useTypewriter(m.line, 30);
  return (
    <div className="memory" onClick={finish} style={{ ["--tint" as string]: m.tint }}>
      <div className="memory-glow" />
      <div className="polaroid">
        <div className="polaroid-img" style={m.image ? { backgroundImage: `url(${m.image})` } : undefined}>
          {!m.image && <><div className="pol-sun" /><div className="pol-hill" /><div className="pol-rover"><OopySvg battery={100} dust={0} droop={0} /></div></>}
        </div>
        <div className="polaroid-cap">{m.sol} · {m.year}</div>
      </div>
      <p className="memory-line">{shown}</p>
      <span className="memory-skip">{CONFIG.memoryHint}</span>
    </div>
  );
}



function EventIntro({ title, hint, onDone }: { title: string; hint: string; onDone: () => void }) {
  const [n, setN] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const fx = useFx();
  const E = CONFIG.eventIntro;
  useEffect(() => {
    sfx.play("boom", 0.5); fx.shake(1);
    let cancelled = false;
    (async () => {
      await sleep(E.titleMs);
      for (let k = E.countFrom; k >= 1; k--) {
        if (cancelled) return;
        setN(k); sfx.play("countTick"); fx.pulse();
        await sleep(E.tickMs);
      }
      if (cancelled) return;
      setN(0); sfx.play("countGo"); fx.flash(CONFIG.colors.accent, 0.3);
      await sleep(260);
      if (!cancelled) onDone();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (ref.current) animate(ref.current, { scale: [2.4, 1], opacity: [0, 1] }, { duration: 0.28 }); }, [n]);
  return (
    <div className="ev-intro">
      <h2 className="ev-intro-title glitch" data-text={title}>{title}</h2>
      <p className="ev-intro-hint">{hint}</p>
      {n !== null && <div ref={ref} className={`count ${n === 0 ? "go" : ""}`}>{n === 0 ? "GO!" : n}</div>}
    </div>
  );
}

function Keycap({ k, big, pressed }: { k: string; big?: boolean; pressed?: boolean }) {
  const label = k.startsWith("Arrow") ? { ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" }[k] ?? k : k;
  return <kbd className={`keycap ${big ? "big" : ""} ${pressed ? "pressed" : ""}`}>{label}</kbd>;
}

/** Rapid reflex QTE: a key is shown, press it before the ring empties. */
function KeyReflex({ cfgKey, onResult }: { cfgKey: "reflex1" | "reflex2"; onResult: (pass: boolean) => void }) {
  const C = CONFIG[cfgKey];
  const [seq] = useState(() => Array.from({ length: C.count }, () => pick(C.pool)));
  const [idx, setIdx] = useState(0);
  const [prog, setProg] = useState(0);
  const [state, setState] = useState<"play" | "hit" | "miss">("play");
  const start = useRef(performance.now());
  const done = useRef(false);
  const fx = useFx();

  const end = useCallback((ok: boolean) => {
    if (done.current) return;
    done.current = true;
    setState(ok ? "hit" : "miss");
    setTimeout(() => onResult(ok), 350);
  }, [onResult]);

  useRaf(() => {
    if (done.current) return;
    const p = (performance.now() - start.current) / C.timeMs;
    setProg(Math.min(1, p));
    if (p >= 1) { fx.shake(1.2); sfx.play("glitchHit"); end(false); }
  });
  useKeys((k) => {
    if (done.current) return;
    const want = seq[idx];
    if (k.toLowerCase() === want.toLowerCase()) {
      sfx.play("heartbeatHit"); fx.pulse(CONFIG.colors.pass);
      if (idx + 1 >= seq.length) { end(true); return; }
      setIdx(idx + 1); start.current = performance.now(); setProg(0);
    } else { sfx.play("glitchHit"); fx.shake(1.4); end(false); }
  });
  const R = 120, circ = 2 * Math.PI * R;
  return (
    <div className="event reflex">
      <h2 className="ev-title">{C.title}</h2>
      <p className="ev-sub">{C.hint}</p>
      <div className={`reflex-ring ${state}`}>
        <svg viewBox="0 0 280 280">
          <circle cx="140" cy="140" r={R} className="ring-bg" />
          <circle cx="140" cy="140" r={R} className="ring-fg" strokeDasharray={circ} strokeDashoffset={circ * prog} />
        </svg>
        <div className="reflex-key" key={idx}><Keycap k={seq[Math.min(idx, seq.length - 1)]} big /></div>
      </div>
      <div className="reflex-dots">{seq.map((_, i) => <i key={i} className={i < idx || state === "hit" ? "on" : i === idx ? "cur" : ""} />)}</div>
    </div>
  );
}

function Timer({ ms, onEnd, run = true, tickLast = 3 }: { ms: number; onEnd: () => void; run?: boolean; tickLast?: number }) {
  const [left, setLeft] = useState(ms);
  const end = useLatest(onEnd);
  const lastTick = useRef(-1);
  useEffect(() => {
    if (!run) return;
    const s = performance.now();
    const id = setInterval(() => {
      const l = Math.max(0, ms - (performance.now() - s));
      setLeft(l);
      const sec = Math.ceil(l / 1000);
      if (sec <= tickLast && sec > 0 && sec !== lastTick.current) { lastTick.current = sec; sfx.play("countTick", 0.7); }
      if (l <= 0) { clearInterval(id); end.current(); }
    }, 50);
    return () => clearInterval(id);
  }, [ms, run, end, tickLast]);
  return (
    <div className={`timer ${left < ms * 0.3 ? "low" : ""}`}>
      <div className="timer-bar"><div style={{ width: `${(left / ms) * 100}%` }} /></div>
      <span>{(left / 1000).toFixed(1)}s</span>
    </div>
  );
}



function Starfield({ count }: { count: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, ctx = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const stars = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), r: rand(0.3, 1.6), t: rand(0, 6), sp: rand(0.4, 1.6) }));
    const loop = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(t / 1000 * s.sp + s.t));
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, 6.3); ctx.fill();
        s.x -= 0.00003 * s.r; if (s.x < 0) s.x = 1;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count]);
  return <canvas ref={ref} className="starfield" />;
}

function Scene0({ onDone }: { onDone: () => void }) {
  const S = CONFIG.scene0;
  const go = () => { sfx.unlock(); sfx.play("uiClick"); sfx.play("boom", 0.6); onDone(); };
  return (
    <div className="full black s0" onClick={go}>
      <Starfield count={S.stars} />
      <div className="s0-horizon"><div className="s0-sun" /><div className="s0-rover"><OopySvg battery={45} dust={0.1} droop={14} /></div></div>
      <div className="s0-content">
        <div className="s0-kicker">{S.kicker}</div>
        <h1 className="s0-title">
          {S.title.split(" ").map((w, i) => <span key={i} className="s0-word" style={{ animationDelay: `${0.3 + i * 0.22}s` }}>{w}&nbsp;</span>)}
        </h1>
        <p className="s0-hint">{S.hint}</p>
        <p className="s0-note">🔊 {S.soundNote}</p>
      </div>
      <FilmOverlay />
    </div>
  );
}




const JUNE_2018_START_OFFSET = 5; 

function Scene1({ year, onDone }: { year: number; onDone: () => void }) {
  const S = CONFIG.scene1;
  const fx = useFx();
  const years: number[] = [];
  for (let y = year; y >= S.targetYear; y--) years.push(y);
  const flips = years.length - 1;
  const speed = flips > S.maxFlips ? (S.pageFlipMs * S.maxFlips) / flips : S.pageFlipMs;
  const [gone, setGone] = useState(0);
  const [phase, setPhase] = useState<"calendar" | "vanish" | "text">("calendar");
  const textRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (phase !== "calendar") return;
    if (gone >= flips) {
      const t = setTimeout(() => setPhase("vanish"), S.holdOnTargetMs);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { sfx.play("calendarFlip"); sfx.play("calendarTick"); fx.shake(0.35); setGone((g) => g + 1); }, speed + 90);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gone, flips, phase, speed]);

  useEffect(() => { if (phase === "vanish") { sfx.play("heartbeat"); const t = setTimeout(() => setPhase("text"), 260); return () => clearTimeout(t); } }, [phase]);

  useEffect(() => {
    if (phase !== "text") return;
    audioRef.current = playAudio(CONFIG.assets.suspense);
    sfx.play("boom"); fx.shake(1.6); fx.flash("#ffffff", 0.5);
    if (textRef.current) animate(textRef.current, { fontSize: [`${S.textStartVw / 10}vw`, `${S.textEndVw / 10}vw`] }, { duration: S.growMs / 1000, ease: "easeOut" });
    const t = setTimeout(() => { audioRef.current?.pause(); onDone(); }, S.growMs + S.holdMs);
    return () => { clearTimeout(t); audioRef.current?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "text")
    return (
      <div className="full black center s1-textwrap">
        <div ref={textRef} className="s1-date glitch" data-text={S.monthText} style={{ fontSize: `${S.textStartVw / 10}vw` }}>{S.monthText}</div>
        <FilmOverlay red={0.25} />
      </div>
    );

  const last = gone >= flips;
  return (
    <div className="full black center s1">
      <div className="s1-spot" />
      <div className={`calendar ${phase === "vanish" ? "vanish" : ""}`} style={{ ["--flip" as string]: `${speed}ms` }}>
        <div className="cal-rings">{Array.from({ length: 9 }).map((_, i) => <i key={i} />)}</div>
        {years.map((y, i) => (
          <div key={y} className={`cal-page ${i < gone ? "thrown" : ""}`} style={{ zIndex: 100 - i, ["--rot" as string]: `${-40 - (i % 4) * 9}deg`, ["--tx" as string]: `${-150 - (i % 3) * 25}%` }}>
            <div className="cal-head"><span>JUNE</span><small>MARS · EARTH</small></div>
            <div className="cal-year">{y}</div>
            <div className="cal-days">{["S", "M", "T", "W", "T", "F", "S"].map((d, k) => <b key={k}>{d}</b>)}</div>
            <div className="cal-grid">
              {Array.from({ length: 42 }).map((_, d) => {
                const day = d - JUNE_2018_START_OFFSET + 1;
                const ok = day >= 1 && day <= 30;
                const circled = last && i === flips && ok && day === S.circleDay;
                return <span key={d} className={circled ? "circled" : ""}>{ok ? day : ""}{circled && <em>{S.circleLabel}</em>}</span>;
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="s1-year" key={years[Math.min(gone, years.length - 1)]}>{years[Math.min(gone, years.length - 1)]}</div>
      <FilmOverlay />
    </div>
  );
}



function Scene2({ onDone }: { onDone: () => void }) {
  const C = CONFIG.scene2;
  const fx = useFx();
  const [phase, setPhase] = useState<"danger" | "storm">("danger");
  const [p, setP] = useState(0);
  const [sec, setSec] = useState(0);
  const done = useRef(false);
  const finish = useCallback(() => { if (done.current) return; done.current = true; onDone(); }, [onDone]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    sfx.loop("alarmLoop", 0.8); sfx.loop("radioStatic", 0.7); sfx.play("klaxon");
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    const beep = setInterval(() => sfx.play("radioBeep", 0.6), 2600);
    return () => { clearInterval(id); clearInterval(beep); sfx.stop("alarmLoop"); sfx.stop("radioStatic"); };
  }, []);
  useEffect(() => { if (phase === "storm") { sfx.play("klaxon"); sfx.play("boom", 0.7); fx.shake(1.8); fx.flash(CONFIG.colors.danger, 0.5); } }, [phase, fx]);
  useEffect(() => {
    if (!failed) return;
    const t0 = performance.now();
    const id = setInterval(() => { const q = (performance.now() - t0) / C.fallbackMs; setP(Math.min(1, q)); if (q >= 1) { clearInterval(id); finish(); } }, 100);
    return () => clearInterval(id);
  }, [failed, C.fallbackMs, finish]);

  const mm = String(Math.floor(sec / 60)).padStart(2, "0"), ss = String(sec % 60).padStart(2, "0");
  return (
    <div className="full black s2">
      <video className="fill-video" src={CONFIG.assets.mayhem} autoPlay playsInline
        onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) setP(v.currentTime / v.duration); }}
        onEnded={finish} onError={() => setFailed(true)} />
      <div className="letterbox top" /><div className="letterbox bottom" />
      <div className="s2-tint" />
      <div className="s2-head"><span><i className="rec" /> {C.headerLeft}</span><span>{C.headerRight}</span><span className="mono">{mm}:{ss}</span></div>
      <div className="s2-telemetry">
        <Gauge label="TAU" value={20 + p * 80} display={(3 + p * (CONFIG.mission.tau - 3)).toFixed(1)} low={p > 0.5} />
        <Gauge label="SOLAR" value={Math.max(2, 70 - p * 68)} low={p > 0.3} />
        <Gauge label="CARRIER" value={Math.max(0, 62 - p * 62 + Math.sin(sec * 3) * 6)} low />
      </div>
      <div
        key={phase}
        className="blink-text glitch"
        data-text={phase === "danger" ? C.danger : C.storm}
        style={{ animationDuration: `${C.blinkMs}ms`, animationIterationCount: phase === "danger" ? C.dangerBlinks : C.stormBlinks, fontSize: phase === "danger" ? "11vw" : "6.4vw" }}
        onAnimationEnd={() => phase === "danger" && setPhase("storm")}
      >
        {phase === "danger" ? C.danger : C.storm}
      </div>
      <Chatter lines={C.chatter} />
      <FilmOverlay red={0.3} />
    </div>
  );
}



function Intro({ onNext }: { onNext: () => void }) {
  const vid = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(1);
  const onTime = () => {
    const t = vid.current?.currentTime ?? 0;
    const n = CONFIG.transcript.filter((l) => l.at <= t).length;
    if (n !== shown) { setShown(Math.max(1, n)); sfx.play("radioBeep", 0.4); }
  };
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }, [shown]);
  return (
    <div className="intro">
      <div className="intro-left">
        <div className="panel-title">INCOMING TRANSMISSION · OOPY</div>
        <video ref={vid} src={CONFIG.assets.intro} autoPlay playsInline controls onTimeUpdate={onTime} onEnded={() => setShown(CONFIG.transcript.length)} />
        <div className="guides">
          {CONFIG.guidelines.map((g, i) => (
            <div key={i} className="guide" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="guide-keys">{g.keys.map((k, j) => <Keycap key={j} k={k} />)}</div>
              <div><h4>{g.title}</h4><p>{g.body}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="intro-right">
        <div className="panel-title">TRANSCRIPT</div>
        <div className="transcript" ref={box}>
          {CONFIG.transcript.slice(0, shown).map((l, i) => <p key={i}><b>Archivist ›</b> {l.text}</p>)}
        </div>
        <button className="btn" onClick={() => { sfx.play("uiClick"); onNext(); }}>Next ▶</button>
      </div>
    </div>
  );
}



function Heartbeat({ onResult }: { onResult: (pass: boolean) => void }) {
  const H = CONFIG.heartbeat;
  const fx = useFx();
  const { beats, zoneWidth, durationMs } = H;
  const [p, setP] = useState(0);
  const [hits, setHits] = useState<(string | null)[]>(beats.map(() => null));
  const [flat, setFlat] = useState(false);
  const hitsRef = useRef(hits);
  const pRef = useRef(0);
  const done = useRef(false);
  const cued = useRef<boolean[]>(beats.map(() => false));
  const start = useRef(performance.now());

  const finish = useCallback((ok: boolean) => {
    if (done.current) return;
    done.current = true;
    if (!ok) { setFlat(true); sfx.play("flatline"); fx.shake(1.5); }
    setTimeout(() => onResult(ok), ok ? 450 : H.flatlineMs);
  }, [onResult, fx, H.flatlineMs]);

  useRaf(() => {
    if (done.current) return;
    const v = (performance.now() - start.current) / durationMs;
    pRef.current = v; setP(Math.min(1, v));
    beats.forEach((b, i) => {
      if (!cued.current[i] && v >= b) { cued.current[i] = true; sfx.play("heartbeat", 0.8); }
      if (v > b + zoneWidth / 2 && !hitsRef.current[i]) finish(false);
    });
    if (v >= 1) finish(hitsRef.current.every(Boolean));
  });

  useSpace(() => {
    if (done.current) return;
    const v = pRef.current;
    const i = beats.findIndex((b, k) => Math.abs(v - b) <= zoneWidth / 2 && !hitsRef.current[k]);
    if (i < 0) { sfx.play("glitchHit"); return finish(false); }
    const q = Math.abs(v - beats[i]) <= zoneWidth * 0.18 ? "PERFECT" : "GOOD";
    const n = [...hitsRef.current]; n[i] = q; hitsRef.current = n; setHits(n);
    sfx.play("heartbeatHit"); fx.shake(0.5); fx.pulse(CONFIG.colors.pass);
    if (n.every(Boolean)) finish(true);
  });

  const W = 1000, Hh = 240;
  let d = `M0 ${Hh / 2}`;
  beats.forEach((b) => {
    const x = b * W, w = zoneWidth * W;
    d += ` L${x - w * 0.9} ${Hh / 2} L${x - w * 0.5} ${Hh / 2 - 22} L${x - w * 0.2} ${Hh / 2 + 22} L${x} ${Hh / 2 - 100} L${x + w * 0.2} ${Hh / 2 + 90} L${x + w * 0.5} ${Hh / 2}`;
  });
  d += ` L${W} ${Hh / 2}`;
  return (
    <div className="event">
      <h2 className="ev-title">{H.title}</h2>
      <p className="ev-sub">{H.hint}</p>
      <div className={`ecg ${flat ? "flat" : ""}`}>
        <svg viewBox={`0 0 ${W} ${Hh}`} preserveAspectRatio="none">
          {Array.from({ length: 21 }).map((_, i) => <line key={i} x1={i * 50} x2={i * 50} y1="0" y2={Hh} className="ecg-grid" />)}
          {Array.from({ length: 6 }).map((_, i) => <line key={i} y1={i * 48} y2={i * 48} x1="0" x2={W} className="ecg-grid" />)}
          {beats.map((b, i) => <rect key={i} x={(b - zoneWidth / 2) * W} y={0} width={zoneWidth * W} height={Hh} className={hits[i] ? "zone hit" : "zone"} />)}
          <path d={flat ? `M0 ${Hh / 2} L${W} ${Hh / 2}` : d} className="ecg-path" />
        </svg>
        <div className="scan" style={{ left: `${p * 100}%` }} />
        {hits.map((h, i) => h && <div key={i} className="hit-label" style={{ left: `${beats[i] * 100}%` }}>{h}</div>)}
      </div>
      <div className="beats">{hits.map((h, i) => <span key={i} className={h ? "on" : ""}>♥</span>)}</div>
    </div>
  );
}



function Dust({ onResult }: { onResult: (pass: boolean) => void }) {
  const D = CONFIG.dust;
  const fx = useFx();
  const W = 960, H = 520;
  const cv = useRef<HTMLCanvasElement>(null);
  const down = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const done = useRef(false);
  const [clean, setClean] = useState(0);
  const [gust, setGust] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const speck = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = `rgba(${CONFIG.colors.dust},${rand(0.25, 0.7)})`;
    ctx.beginPath(); ctx.arc(rand(0, W), rand(0, H), rand(D.speckSize[0], D.speckSize[1]), 0, Math.PI * 2); ctx.fill();
  };
  const measure = () => {
    const data = cv.current!.getContext("2d")!.getImageData(0, 0, W, H).data;
    let c = 0, n = 0;
    for (let i = 3; i < data.length; i += 4 * 61) { n++; if (data[i] < 60) c++; }
    return (c / n) * 100;
  };

  useEffect(() => {
    const ctx = cv.current!.getContext("2d")!;
    for (let i = 0; i < D.startSpecks; i++) speck(ctx);
    const m = setInterval(() => setClean(measure()), 200);
    const g = setInterval(() => {
      for (let i = 0; i < D.gustSpecks; i++) speck(ctx);
      setGust(true); fx.shake(0.7); sfx.play("riser", 0.25); setTimeout(() => setGust(false), 450);
    }, D.gustEveryMs);
    return () => { clearInterval(m); clearInterval(g); sfx.stop("wipeLoop"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useRaf(() => { const ctx = cv.current?.getContext("2d"); if (ctx && !done.current) for (let i = 0; i < D.specksPerFrame; i++) speck(ctx); });

  const pos = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const wipe = (e: React.PointerEvent) => {
    const p = pos(e);
    setCursor({ x: (p.x / W) * 100, y: (p.y / H) * 100 });
    if (!down.current) return;
    const ctx = cv.current!.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out"; ctx.lineCap = "round"; ctx.lineWidth = D.brush;
    ctx.beginPath(); ctx.moveTo(last.current?.x ?? p.x, last.current?.y ?? p.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    last.current = p;
  };
  const up = () => { down.current = false; last.current = null; sfx.stop("wipeLoop"); };
  const end = () => {
    if (done.current) return;
    done.current = true; up();
    onResult(measure() >= D.cleanPassPct);
  };
  const watts = Math.round((clean / 100) * CONFIG.dust.wattsMax);

  return (
    <div className="event">
      <h2 className="ev-title">{D.title}</h2>
      <p className="ev-sub">{D.hint}</p>
      <div className={`panel-frame ${gust ? "gust" : ""}`}>
        <div className="panel-label"><span>{D.panelTitle}</span><span className="mono">{watts} W / {D.wattsMax} W</span></div>
        <div className="panel">
          <div className="cells">{Array.from({ length: 24 }).map((_, i) => <i key={i} />)}</div>
          <div className="glare" />
          <canvas ref={cv} width={W} height={H}
            onPointerDown={(e) => { down.current = true; last.current = pos(e); (e.target as Element).setPointerCapture(e.pointerId); sfx.loop("wipeLoop", 1); wipe(e); }}
            onPointerMove={wipe} onPointerUp={up} onPointerLeave={() => setCursor(null)} />
          {cursor && <div className="brush-ring" style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, width: `${(D.brush / W) * 100}%` }} />}
          {gust && <div className="gust-label">GUST!</div>}
        </div>
      </div>
      <div className="meter"><span>CLEAN</span><div><i style={{ width: `${clamp(clean)}%` }} /><b style={{ left: `${D.cleanPassPct}%` }} /></div><span>{Math.floor(clean)}%</span></div>
      <Timer ms={D.seconds * 1000} onEnd={end} />
    </div>
  );
}




function Hardware({ onPick, onResult }: { onPick: (fx: Record<string, number>) => void; onResult: (pass: boolean) => void }) {
  const H = CONFIG.hardware;
  const fx = useFx();
  const [off, setOff] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ warn: string; lesson: string } | null>(null);
  const done = useRef(false);

  const click = (id: string) => {
    if (off.includes(id) || done.current) return;
    const it = H.items.find((x) => x.id === id)!;
    const n = [...off, id];
    setOff(n); setMsg({ warn: it.warn, lesson: it.lesson }); onPick(it.fx);
    sfx.play("switchOff"); sfx.play("powerDown", 0.6); fx.shake(1.2); fx.flash(CONFIG.colors.danger, 0.3);
    if (it.fx.signal && it.fx.signal <= -30) sfx.play("signalLost", 0.7);
    if (n.length >= H.mustPick) { done.current = true; setTimeout(() => onResult(true), 1300); }
  };
  const n = H.items.length;
  return (
    <div className="event hw-event">
      <h2 className="ev-title">{H.title}</h2>
      <p className="ev-sub">{H.hint}</p>
      <div className="hw-ring">
        <svg viewBox="0 0 100 100" className="hw-lines">
          {H.items.map((it, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            return <line key={it.id} x1="50" y1="50" x2={50 + H.ringRadius * Math.cos(a)} y2={50 + H.ringRadius * Math.sin(a)} className={off.includes(it.id) ? "dead" : ""} />;
          })}
        </svg>
        <div className="hw-core"><b>CORE</b><span>{off.length}/{H.mustPick}</span></div>
        {H.items.map((it, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return (
            <button key={it.id} className={`hw ${off.includes(it.id) ? "off" : ""}`}
              style={{ left: `${50 + H.ringRadius * Math.cos(a)}%`, top: `${50 + H.ringRadius * Math.sin(a)}%` }}
              onClick={() => click(it.id)}>
              <span>{it.icon}</span><em>{it.label}</em>
            </button>
          );
        })}
      </div>
      <div className="hw-msg" key={off.length}>{msg ? <><strong>{msg.warn}</strong><small>{msg.lesson}</small></> : " "}</div>
      <Timer ms={H.seconds * 1000} onEnd={() => { if (!done.current) { done.current = true; onResult(false); } }} />
    </div>
  );
}



function Spam({ onResult }: { onResult: (pass: boolean) => void }) {
  const S = CONFIG.spam;
  const fx = useFx();
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [dead, setDead] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; r: number }[]>([]);
  const lastT = useRef(0), cnt = useRef(0), done = useRef(false), sid = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const base = Math.min(S.capPct, S.capPct * (1 - Math.exp(-count / S.curveK)));
  const strain = base > S.capPct * 0.96 && !dead ? rand(-1.4, 0.6) : 0;
  const pct = clamp(base + strain, 0, S.capPct);

  useEffect(() => { const t = setTimeout(() => setStarted(true), 7000); return () => clearTimeout(t); }, []);
  useSpace(() => {
    if (done.current) return;
    const now = performance.now();
    if (!started) setStarted(true);
    setPressed(true); setTimeout(() => setPressed(false), 40);
    if (now - lastT.current < S.minGapMs) return; // ← the 60 ms cap
    lastT.current = now; cnt.current += 1; setCount(cnt.current);
    sfx.play("tapSpam"); if (cnt.current % 8 === 0) fx.shake(0.35);
    setSparks((s) => [...s.slice(-9), { id: sid.current++, x: rand(20, 80), y: rand(20, 80), r: rand(-40, 40) }]);
    if (box.current) animate(box.current, { scale: [1, 1.035, 1] }, { duration: 0.07 });
  });
  const end = () => {
    if (done.current) return;
    done.current = true; setDead(true);
    sfx.play("oopySad"); sfx.play("signalLost"); fx.shake(2); fx.flash(CONFIG.colors.danger, 0.7);
    setTimeout(() => onResult(false), 1500);
  };
  const R = 110, circ = 2 * Math.PI * R;
  return (
    <div className="event spam">
      <h2 className="ev-title">{S.title}</h2>
      <p className="ev-sub">{S.hint}</p>
      <div ref={box} className={`spam-box ${dead ? "dead" : ""} ${started ? "hot" : ""}`}>
        <svg viewBox="0 0 260 260" className="spam-ring">
          <circle cx="130" cy="130" r={R} className="ring-bg" />
          <circle cx="130" cy="130" r={R} className="ring-fg" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} transform="rotate(-90 130 130)" />
        </svg>
        <div className="spam-center"><div className="spam-pct">{Math.floor(pct)}<small>%</small></div><div className="spam-label">{dead ? "REBOOT FAILED" : S.ringLabel}</div></div>
        {sparks.map((s) => <i key={s.id} className="spark" style={{ left: `${s.x}%`, top: `${s.y}%`, ["--r" as string]: `${s.r}deg` }} />)}
      </div>
      <div className="spam-key"><Keycap k="SPACE" big pressed={pressed} /></div>
      <div className="spam-bar"><i style={{ width: `${pct}%` }} /></div>
      {started ? <Timer ms={S.seconds * 1000} onEnd={end} tickLast={5} /> : <p className="ev-sub pulse">{S.startPrompt}</p>}
    </div>
  );
}



function Montage({ vitals, onDone }: { vitals: Vitals; onDone: () => void }) {
  const M = CONFIG.montage, E = CONFIG.end;
  const fx = useFx();
  const [phase, setPhase] = useState<"video" | "failed">("video");
  const [p, setP] = useState(0);
  const [t, setT] = useState(0);
  const [loadFail, setLoadFail] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const voiceAudio = useRef<HTMLAudioElement | null>(null);
  const finished = useRef(false);

  const fade = useCallback(async () => {
    if (wrap.current) await animate(wrap.current, { opacity: [1, 0] }, { duration: E.fadeMs / 1000 });
    onDone();
  }, [E.fadeMs, onDone]);

  const toFailed = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    voiceAudio.current?.pause();
    setPhase("failed"); // video gone → black → alert, immediately
    sfx.play("klaxon"); sfx.play("signalLost"); fx.shake(2.4);
    let audioDone = false, minDone = false;
    const check = () => { if (audioDone && minDone) fade(); };
    playAudio(CONFIG.assets.subside, () => { audioDone = true; check(); });
    setTimeout(() => { minDone = true; check(); }, E.failedMinMs);
  }, [E.failedMinMs, fade, fx]);

  useEffect(() => {
    voiceAudio.current = playAudio(CONFIG.assets.lastWords);
    sfx.play("stormRoar"); fx.shake(1.4);
    return () => { voiceAudio.current?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!loadFail) return;
    const t0 = performance.now();
    const id = setInterval(() => { const s = performance.now() - t0; setT(s / 1000); setP(Math.min(1, s / M.fallbackMs)); if (s >= M.fallbackMs) { clearInterval(id); toFailed(); } }, 100);
    return () => clearInterval(id);
  }, [loadFail, M.fallbackMs, toFailed]);

  const line = [...M.lastWords].reverse().find((l) => l.at <= t)?.text ?? "";
  const k = 1 - p;
  const dv: Vitals = { 
    battery: vitals.battery * k, 
    signal: vitals.signal * k, 
    panel: vitals.panel * k, 
    temp: vitals.temp * (1 - p * 0.35), 
    integrity: vitals.integrity * (1 - p * 0.5) 
  };

  const dropStart = 6.5; 
  const dropDuration = 2.5;

  const dropFactor = t <= dropStart 
    ? 1 
    : Math.max(0, 1 - (t - dropStart) / dropDuration);

  const currentBpm = Math.round(118 * dropFactor);

  useEffect(() => {
    if (t >= dropStart + dropDuration + 1.5 && phase === "video") {
      toFailed();
    }
  }, [t, phase, toFailed]);
  
  return (
    <div ref={wrap} className="full black montage">
      {phase === "video" ? (
        <>
          <video className="fill-video" src={CONFIG.assets.engulf} autoPlay playsInline
            onTimeUpdate={(e) => { const v = e.currentTarget; setT(v.currentTime); if (v.duration) setP(v.currentTime / v.duration); }}
            onEnded={toFailed} onError={() => setLoadFail(true)} />
          <div className="montage-dim" style={{ opacity: p * 0.7 }} />
          <Hud vitals={dv} bpm={currentBpm} label="LIVE · OOPY" />
          {line && <Voice text={line} />}
          <div className={`flatline-strip ${currentBpm <= 0 ? "flat" : ""}`}><svg viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M0 20 H60 L68 20 L76 4 L86 36 L94 20 H170 L178 20 L186 8 L194 30 L202 20 H300" /></svg></div>
          {currentBpm <= 0 && <div className="nocarrier glitch" data-text={M.signalLost}>{M.signalLost}</div>}
          <FilmOverlay red={p * 0.6} />
        </>
      ) : (
        <div className="failed-screen">
          <div className="failed-bg" />
          <div className="mission-failed glitch" data-text={E.missionFailed}>{E.missionFailed}</div>
          <FilmOverlay red={0.5} />
        </div>
      )}
    </div>
  );
}



function useSmooth(target: number, rate = 0.035) {
  const [v, setV] = useState(target);
  const t = useLatest(target);
  useRaf(() => setV((x) => (Math.abs(x - t.current) < 0.002 ? t.current : x + (t.current - x) * rate)));
  return v;
}
const STORM_BASE: Record<string, number> = {
  intro: CONFIG.storm.intro, heart: CONFIG.storm.heart, reflex1: (CONFIG.storm.heart + CONFIG.storm.dust) / 2,
  dust: CONFIG.storm.dust, reflex2: (CONFIG.storm.dust + CONFIG.storm.hw) / 2, hw: CONFIG.storm.hw, spam: CONFIG.storm.spam,
};
const stepId = (s: SceneStep) => (s.kind === "intro" ? "intro" : s.kind === "memory" ? "memory" : s.id);
const stepMeta = (s: SceneStep): { title: string; hint: string } => {
  if (s.kind === "reflex") return CONFIG[s.id];
  if (s.kind !== "event") return { title: "", hint: "" };
  return s.id === "heart" ? CONFIG.heartbeat : s.id === "dust" ? CONFIG.dust : s.id === "hw" ? CONFIG.hardware : CONFIG.spam;
};

function Game({ onDone, startStep = 0 }: { onDone: () => void; startStep?: number }) {
  const fx = useFx();
  const [idx, setIdx] = useState(startStep);
  const [armed, setArmed] = useState(false);
  const [vitals, setVitals] = useState<Vitals>({ ...CONFIG.vitals.start } as Vitals);
  const [fails, setFails] = useState(0);
  const [flash, setFlash] = useState<{ text: string; pass: boolean; fact?: string } | null>(null);
  const [voice, setVoice] = useState<string>(CONFIG.voice.intro);
  const [montage, setMontage] = useState(false);
  const step = TIMELINE[idx];
  const id = stepId(step);


  let sIdx = idx; while (sIdx > 0 && TIMELINE[sIdx].kind === "memory") sIdx--;
  const stormTarget = clamp((STORM_BASE[stepId(TIMELINE[sIdx])] ?? 0.5) + fails * CONFIG.storm.perFail, 0, 1);
  const storm = useSmooth(montage ? 1 : stormTarget);
  const droop = clamp((1 - vitals.battery / 100) * 34, 0, 34);
  const bpm = 70 + storm * 65 + (vitals.battery < CONFIG.vitals.lowThreshold ? 18 : 0);

  const advance = useCallback(() => {
    setFlash(null);
    setIdx((i) => {
      if (i + 1 >= TIMELINE.length) { setMontage(true); return i; }
      return i + 1;
    });
    setArmed(false);
  }, []);

  useEffect(() => {
    const k = id === "intro" ? "intro" : `${id}Pre`;
    if (CONFIG.voice[k]) setVoice(CONFIG.voice[k]);
    if (id !== "intro" && id !== "memory") sfx.play("oopyChirp");
  }, [id]);

  useEffect(() => {
    if (montage) { sfx.stop("windLoop"); sfx.stop("droneLoop"); sfx.stop("alarmLoop"); return; }
    if (CONFIG.audio.ambientWind) sfx.loop("windLoop", 0.25 + storm * 1.2);
    if (CONFIG.audio.ambientDrone) sfx.loop("droneLoop", 0.5 + storm * 0.8);
  }, [storm, montage]);
  useEffect(() => {
    if (vitals.battery < CONFIG.vitals.lowThreshold && !montage) sfx.loop("alarmLoop", 0.6); else sfx.stop("alarmLoop");
  }, [vitals.battery, montage]);
  useEffect(() => () => { sfx.stop("windLoop"); sfx.stop("droneLoop"); sfx.stop("alarmLoop"); }, []);


  useEffect(() => {
    if (montage) return;
    const t = setInterval(() => setVitals((v) => ({ ...v, battery: Math.max(3, v.battery - CONFIG.vitals.drainPerSecond / 4) })), 250);
    return () => clearInterval(t);
  }, [montage]);


  useEffect(() => {
    if (montage || !CONFIG.audio.heartbeatAmbient || id === "heart" || id === "intro") return;
    const t = setInterval(() => sfx.play("heartbeat", 0.35 + storm * 0.4), 60000 / bpm);
    return () => clearInterval(t);
  }, [bpm, id, montage, storm]);

  const result = (key: string, pass: boolean, texts?: { pass: string; fail: string }) => {
    const d = CONFIG.deltas[key];
    if (d) setVitals((v) => applyDelta(v, pass ? d.pass : d.fail));
    if (!pass) setFails((f) => f + 1);
    setVoice(CONFIG.voice[key + (pass ? "Pass" : "Fail")] ?? "");
    setFlash({ text: pass ? texts?.pass ?? CONFIG.flash.passText : texts?.fail ?? CONFIG.flash.failText, pass, fact: CONFIG.facts[key] });
  };

  if (montage) return <Montage vitals={vitals} onDone={onDone} />;

  const meta = stepMeta(step);
  const needsIntro = step.kind === "event" || step.kind === "reflex";
  const chat = CONFIG.chatter[id];
  let body: React.ReactNode = null;
  if (!flash) {
    if (step.kind === "intro") body = <Intro onNext={advance} />;
    else if (step.kind === "memory") body = <MemoryCard key={idx} i={step.i} onDone={advance} />;
    else if (needsIntro && !armed) body = <EventIntro key={`i${idx}`} title={meta.title} hint={meta.hint} onDone={() => setArmed(true)} />;
    else if (step.kind === "reflex") {
      const C = CONFIG[step.id];
      body = <KeyReflex key={idx} cfgKey={step.id} onResult={(p) => result(step.id, p, { pass: C.passText, fail: C.failText })} />;
    } else if (step.kind === "event") {
      if (step.id === "heart") body = <Heartbeat key={idx} onResult={(p) => result("heart", p)} />;
      if (step.id === "dust") body = <Dust key={idx} onResult={(p) => result("dust", p)} />;
      if (step.id === "hw") body = <Hardware key={idx} onPick={(f) => setVitals((v) => applyDelta(v, f))} onResult={(p) => result("hw", p)} />;
      if (step.id === "spam") body = <Spam key={idx} onResult={(p) => result("spam", p)} />;
    }
  }
  return (
    <div className="full game">
      <MarsBackdrop storm={storm} battery={vitals.battery} droop={droop} />
      <Hud vitals={vitals} bpm={bpm} label="OOPY · LIVE" />
      <div className={`stage ${step.kind === "memory" ? "memory-stage" : ""}`}>{body}</div>
      {step.kind !== "memory" && voice && <Voice text={voice} />}
      {chat && step.kind !== "intro" && step.kind !== "memory" && !flash && <Chatter lines={chat} />}
      {flash && <ResultFlash key={`f${idx}`} text={flash.text} pass={flash.pass} fact={flash.fact} onDone={advance} />}
      <FilmOverlay red={vitals.battery < CONFIG.vitals.lowThreshold ? 0.35 : 0} />
      <button className="sr-fx" onClick={() => fx.pulse()} aria-hidden tabIndex={-1} />
    </div>
  );
}



function Epitaph({ onDone }: { onDone: () => void }) {
  const lines = CONFIG.end.epitaph.lines;
  const [i, setI] = useState(0);
  const done = useLatest(onDone);
  useEffect(() => {
    sfx.play("oopyChirp", 0.5);
    const t = setTimeout(() => (i + 1 >= lines.length ? done.current() : setI(i + 1)), CONFIG.end.epitaph.lineMs);
    return () => clearTimeout(t);
  }, [i, lines.length, done]);
  return (
    <div className="full black center">
      <p className="epitaph" key={i}>{lines[i]}</p>
    </div>
  );
}


function readJump(): { scene: number; step: number } | null {
  if (typeof window === "undefined" || !CONFIG.dev.enableJump) return null;
  const q = new URLSearchParams(window.location.search);
  if (!q.has("scene")) return null;
  return { scene: clamp(Number(q.get("scene")), 0, 4), step: clamp(Number(q.get("step") ?? 0), 0, TIMELINE.length - 1) };
}



export default function Page() {
  const router = useRouter();
  useEffect(() => {
    const key = "game_reloaded";
    
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "true");
      window.location.reload();
    } else {
      const timer = setTimeout(() => {
        sessionStorage.removeItem(key);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  const [scene, setScene] = useState(0);
  const [year, setYear] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [startStep, setStartStep] = useState(0);
  const [epitaphDone, setEpitaphDone] = useState(!CONFIG.end.epitaph.enabled);
  const sceneRef = useRef(0);
  const busy = useRef(false);
  const shakeRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<() => void>(() => undefined);

  useEffect(() => setYear(new Date().getFullYear()), []);
  useEffect(() => {
    const j = readJump();
    if (!j) return;
    sfx.unlock(); sceneRef.current = j.scene; setStartStep(j.step); setScene(j.scene);
  }, []);

  const fx = useRef<Fx>({
    shake: (i = 1) => { const el = shakeRef.current; if (!el) return; const a = 10 * i; animate(el, { x: [0, -a, a * 0.8, -a * 0.6, a * 0.4, 0], y: [0, a * 0.5, -a * 0.7, a * 0.4, -a * 0.2, 0] }, { duration: 0.38 }); },
    flash: (color = "#ffffff", o = 0.5) => { const el = flashRef.current; if (!el) return; el.style.background = color; animate(el, { opacity: [o, 0] }, { duration: 0.5 }); },
    pulse: (color = CONFIG.colors.danger) => { const el = pulseRef.current; if (!el) return; el.style.boxShadow = `inset 0 0 140px 30px ${color}`; animate(el, { opacity: [0.75, 0] }, { duration: 0.35 }); },
  }).current;

  const next = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const cur = sceneRef.current;
    const kind = CONFIG.transitions[cur] ?? "fade";
    const el = trRef.current;
    const half = CONFIG.transitionMs / 2000;
    if (el && kind !== "cut") {
      el.dataset.kind = kind; el.style.display = "block";
      if (kind === "glitch") sfx.play("glitchHit");
      await animate(el, { opacity: [0, 1] }, { duration: half });
    }
    sceneRef.current = cur + 1; setScene(cur + 1);
    if (el && kind !== "cut") { await animate(el, { opacity: [1, 0] }, { duration: half }); el.style.display = "none"; }
    busy.current = false;
  }, []);

  useEffect(() => {
    if (scene !== 4 || !epitaphDone) return;
    sfx.stopAll();
    const t = setTimeout(() => router.push(CONFIG.end.redirect), CONFIG.end.blackAfterMissionFailedMs);
    return () => clearTimeout(t);
  }, [scene, epitaphDone, router]);


  useEffect(() => {
    const vis = () => { if (document.hidden) sfx.ctx?.suspend(); else sfx.ctx?.resume(); };
    const key = (e: KeyboardEvent) => { if (e.key.toLowerCase() === "m" && !e.repeat) toggleRef.current(); };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("keydown", key);
    return () => { document.removeEventListener("visibilitychange", vis); window.removeEventListener("keydown", key); };
  }, []);

  const toggleMute = () => { const m = !muted; setMuted(m); sfx.muted = m; if (sfx.master) sfx.master.gain.value = m ? 0 : CONFIG.audio.master; };

  toggleRef.current = toggleMute;

  return (
    <FxCtx.Provider value={fx}>
      <main className="root">
        <link rel="stylesheet" href={CONFIG.fonts.googleUrl} />
        <style>{CSS}</style>
        <div ref={shakeRef} className="shake">
          {scene === 0 && <Scene0 onDone={next} />}
          {scene === 1 && year && <Scene1 year={year} onDone={next} />}
          {scene === 2 && <Scene2 onDone={next} />}
          {scene === 3 && <Game onDone={next} startStep={startStep} />}
          {scene === 4 && (epitaphDone ? <div className="full black" /> : <Epitaph onDone={() => setEpitaphDone(true)} />)}
        </div>
        <div ref={pulseRef} className="fx-layer pulse-layer" />
        <div ref={flashRef} className="fx-layer flash-layer" />
        <div ref={trRef} className="fx-layer transition-layer" />
        {scene > 0 && scene < 4 && <button className="mute" onClick={toggleMute} aria-label="Toggle sound">{muted ? "🔇" : "🔊"}</button>}
      </main>
    </FxCtx.Provider>
  );
}



const C = CONFIG.colors;
const F = CONFIG.fonts;
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const CSS = `
*{box-sizing:border-box}
.root{position:fixed;inset:0;background:#000;color:#fff;font-family:${F.body};overflow:hidden;user-select:none;-webkit-user-select:none}
.shake{position:absolute;inset:0;will-change:transform}
.full{position:absolute;inset:0;overflow:hidden}
.black{background:#000}
.center{display:flex;align-items:center;justify-content:center}
.mono{font-family:${F.mono}}
.fill-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.fx-layer{position:absolute;inset:0;pointer-events:none;opacity:0;z-index:100}
.transition-layer{display:none;z-index:110;background:#000}
.transition-layer[data-kind="white"]{background:#fff}
.transition-layer[data-kind="red"]{background:${C.dangerDeep}}
.transition-layer[data-kind="glitch"]{background:repeating-linear-gradient(0deg,#000 0 6px,#111 6px 8px,${C.danger}33 8px 10px)}
.mute{position:absolute;top:12px;right:14px;z-index:120;background:#0008;border:1px solid #fff3;color:#fff;border-radius:99px;width:38px;height:38px;cursor:pointer;font-size:1rem}
.sr-fx{position:absolute;width:0;height:0;opacity:0;border:0;padding:0}
.rec{display:inline-block;width:10px;height:10px;border-radius:50%;background:${C.danger};box-shadow:0 0 10px ${C.danger};animation:blink 1s steps(1) infinite;margin-right:8px}

/* ═══ film / CRT overlays ═══ */
.grain{position:absolute;inset:-50%;width:200%;height:200%;background-image:${GRAIN};opacity:.09;mix-blend-mode:overlay;pointer-events:none;z-index:50;animation:grainMove .9s steps(6) infinite}
.scanlines{position:absolute;inset:0;pointer-events:none;z-index:51;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);mix-blend-mode:multiply}
.vignette-fx{position:absolute;inset:0;pointer-events:none;z-index:52;background:radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,.75) 100%)}
.red-pulse{position:absolute;inset:0;pointer-events:none;z-index:53;box-shadow:inset 0 0 160px 30px ${C.danger};animation:redBeat 1.1s ease-in-out infinite;transition:opacity .6s}
@keyframes grainMove{0%{transform:translate(0,0)}20%{transform:translate(-4%,3%)}40%{transform:translate(3%,-5%)}60%{transform:translate(-6%,-2%)}80%{transform:translate(5%,4%)}100%{transform:translate(0,0)}}
@keyframes redBeat{0%,100%{filter:brightness(.6)}12%{filter:brightness(1.4)}24%{filter:brightness(.7)}36%{filter:brightness(1.2)}}

/* ═══ glitch text (add class + data-text) ═══ */
.glitch,.flash{position:relative}
.glitch::before,.glitch::after,.flash::before,.flash::after{content:attr(data-text);position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-line;pointer-events:none;mix-blend-mode:screen}
.glitch::before,.flash::before{color:#0ff;transform:translate(-3px,0);clip-path:inset(0 0 55% 0);animation:glitchA 2.1s infinite steps(1)}
.glitch::after,.flash::after{color:#f0f;transform:translate(3px,0);clip-path:inset(55% 0 0 0);animation:glitchB 1.7s infinite steps(1)}
@keyframes glitchA{0%,100%{transform:translate(-3px,0);clip-path:inset(0 0 55% 0)}10%{transform:translate(5px,-2px);clip-path:inset(10% 0 40% 0)}20%{transform:translate(-6px,2px);clip-path:inset(60% 0 5% 0)}30%{transform:translate(2px,0);clip-path:inset(30% 0 30% 0)}50%{transform:translate(-2px,1px);clip-path:inset(0 0 80% 0)}70%{transform:translate(7px,0);clip-path:inset(45% 0 20% 0)}}
@keyframes glitchB{0%,100%{transform:translate(3px,0);clip-path:inset(55% 0 0 0)}15%{transform:translate(-5px,2px);clip-path:inset(20% 0 50% 0)}35%{transform:translate(6px,-1px);clip-path:inset(70% 0 0 0)}55%{transform:translate(-3px,0);clip-path:inset(5% 0 70% 0)}75%{transform:translate(4px,2px);clip-path:inset(35% 0 35% 0)}}
@keyframes blink{50%{opacity:0}}
@keyframes pulse{50%{opacity:.25}}
@keyframes inUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes flick{0%,100%{opacity:1}8%{opacity:.2}12%{opacity:.9}30%{opacity:.35}34%{opacity:1}70%{opacity:.5}74%{opacity:1}}
.pulse{animation:pulse 1.4s infinite}

/* ═══ SCENE 0 ═══ */
.s0{cursor:pointer;background:radial-gradient(ellipse at 50% 120%,#3b1008 0%,#0b0408 45%,#000 80%)}
.starfield{position:absolute;inset:0;width:100%;height:100%}
.s0-horizon{position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(transparent,#2a0d07 70%,#120504)}
.s0-sun{position:absolute;left:62%;bottom:34%;width:min(22vw,260px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fff2c8 0%,#ffb35a 35%,#ff5a1f55 60%,transparent 72%);filter:blur(1px);animation:sunDim 8s ease-in-out infinite alternate}
@keyframes sunDim{to{opacity:.45;transform:scale(.92)}}
.s0-rover{position:absolute;left:18%;bottom:5%;width:min(34vw,420px);filter:drop-shadow(0 0 20px #000);animation:bob 5s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-3px)}}
.s0-content{position:relative;z-index:5;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4vw;gap:2.2vh}
.s0-kicker{font-family:${F.mono};letter-spacing:.4em;font-size:.8rem;text-transform:uppercase;color:${C.accent};opacity:.85}
.s0-title{font-family:${F.display};font-weight:400;font-size:clamp(3rem,9.5vw,10rem);line-height:.95;letter-spacing:.03em;margin:0;text-shadow:0 0 40px #ff3a1a88,0 0 120px #ff3a1a44}
.s0-word{display:inline-block;opacity:0;animation:wordIn .9s cubic-bezier(.2,.9,.2,1) forwards}
@keyframes wordIn{from{opacity:0;transform:translateY(40px) scale(1.15);filter:blur(14px)}to{opacity:1;transform:none;filter:blur(0)}}
.s0-hint{margin:2vh 0 0;font-size:1.25rem;letter-spacing:.18em;text-transform:uppercase;opacity:0;animation:pulse 1.8s 2s infinite,fadeIn 1s 2s forwards}
.s0-note{margin:0;font-size:.85rem;opacity:.5}
@keyframes fadeIn{to{opacity:.85}}

/* ═══ SCENE 1 — calendar ═══ */
.s1{background:radial-gradient(ellipse at 50% 40%,#1a1a24,#000 70%)}
.s1-spot{position:absolute;inset:0;background:conic-gradient(from 180deg at 50% -10%,transparent 150deg,#ffffff14 180deg,transparent 210deg);animation:spotSway 6s ease-in-out infinite alternate}
@keyframes spotSway{to{transform:rotate(6deg)}}
.calendar{position:relative;width:min(72vw,430px);aspect-ratio:3/4;perspective:1400px;filter:drop-shadow(0 30px 40px #000)}
.calendar.vanish{animation:calOut .26s ease-in forwards}
@keyframes calOut{to{transform:scale(.5) rotate(4deg);opacity:0;filter:brightness(3)}}
.cal-rings{position:absolute;top:-16px;left:0;right:0;display:flex;justify-content:space-around;z-index:200;padding:0 7%}
.cal-rings i{width:12px;height:34px;border-radius:6px;background:linear-gradient(90deg,#999,#fff 40%,#555);box-shadow:0 3px 5px #0009}
.cal-page{position:absolute;inset:0;background:linear-gradient(160deg,#fbf8f1,#e9e2d2);color:#222;border-radius:6px;padding:9% 7% 6%;transform-origin:top left;transition:transform var(--flip) cubic-bezier(.45,0,.9,.35),opacity var(--flip) ease-in;box-shadow:0 12px 30px #000a,inset 0 0 40px #0001}
.cal-page.thrown{transform:translate(var(--tx),-140%) rotate(var(--rot));opacity:0}
.cal-head{display:flex;justify-content:space-between;align-items:baseline;font-family:${F.display};font-size:1.7rem;color:${C.danger};letter-spacing:.2em}
.cal-head small{font-family:${F.mono};font-size:.6rem;color:#777;letter-spacing:.2em}
.cal-year{font-family:${F.display};font-size:clamp(4.5rem,15vw,7.5rem);line-height:.95;letter-spacing:.03em}
.cal-days{display:grid;grid-template-columns:repeat(7,1fr);font-size:.7rem;text-align:center;color:#999;margin-top:2%}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-top:1%;font-size:.85rem;text-align:center;color:#444}
.cal-grid span{position:relative;padding:5px 0}
.cal-grid span.circled{color:#fff;font-weight:700;z-index:2}
.cal-grid span.circled::before{content:"";position:absolute;left:50%;top:50%;width:2.5em;height:2.5em;margin:-1.25em 0 0 -1.25em;border-radius:50%;background:${C.danger};box-shadow:0 0 18px ${C.danger};animation:ringPop .6s cubic-bezier(.2,1.4,.4,1) both;z-index:-1}
.cal-grid span.circled em{position:absolute;left:50%;top:115%;transform:translateX(-50%);font-style:normal;white-space:nowrap;font-family:${F.mono};font-size:.65rem;color:${C.danger};letter-spacing:.15em;animation:inUp .6s .5s both}
@keyframes ringPop{from{transform:scale(0)}}
.s1-year{position:absolute;bottom:7%;font-family:${F.display};font-size:clamp(3rem,10vw,7rem);letter-spacing:.12em;color:#ffffffcc;text-shadow:0 0 30px #fff5;animation:yearSlam .3s ease-out}
@keyframes yearSlam{from{transform:scale(1.35);opacity:.2;filter:blur(8px)}}
.s1-textwrap{background:#000}
.s1-date{font-family:${F.display};white-space:nowrap;letter-spacing:.03em;color:#fff;text-shadow:0 0 50px ${C.danger}}

/* ═══ SCENE 2 — mission control ═══ */
.s2{background:#000}
.s2-tint{position:absolute;inset:0;background:linear-gradient(180deg,#ff000018,transparent 40%,#ff00002a);mix-blend-mode:multiply;animation:redBeat 1.2s infinite}
.letterbox{position:absolute;left:0;right:0;height:7vh;background:#000;z-index:4}
.letterbox.top{top:0}.letterbox.bottom{bottom:0}
.s2-head{position:absolute;top:calc(7vh + 8px);left:18px;right:18px;display:flex;justify-content:space-between;font-family:${F.mono};font-size:.78rem;letter-spacing:.18em;z-index:6;text-shadow:0 0 6px #000}
.s2-telemetry{position:absolute;left:18px;top:calc(7vh + 54px);width:210px;display:flex;flex-direction:column;gap:8px;z-index:6;background:#0009;padding:12px;border:1px solid #ffffff22;border-radius:6px;backdrop-filter:blur(3px)}
.blink-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-family:${F.display};color:${C.danger};text-shadow:0 0 30px ${C.danger},0 0 90px #f00;letter-spacing:.06em;animation-name:blinkHard;animation-timing-function:steps(1);z-index:8}
@keyframes blinkHard{0%{opacity:1}50%{opacity:0}100%{opacity:1}}
.chatter{position:absolute;left:18px;bottom:calc(7vh + 14px);width:min(520px,60vw);font-family:${F.mono};font-size:.78rem;display:flex;flex-direction:column;gap:3px;z-index:25;text-shadow:0 0 5px #000}
.chatter p{margin:0;opacity:0;animation:inUp .4s forwards;color:#ffd9c0}
.chatter b{color:${C.accent};margin-right:6px}

/* ═══ GAME ═══ */
.game{background:#000}
.stage{position:absolute;inset:92px 0 132px 0;z-index:10;display:flex;align-items:center;justify-content:center;padding:0 2vw}
.stage.memory-stage{inset:0;padding:0;z-index:35}
.mars{position:absolute;inset:0;overflow:hidden}
.mars-sky{position:absolute;inset:0;background:linear-gradient(180deg,var(--sky0),var(--sky1) 70%)}
.mars-sun{position:absolute;left:50%;top:12%;width:min(20vw,230px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fffbe8 0%,#ffe9a8 30%,#ffb35a66 55%,transparent 72%);transition:opacity .3s}
.mars-hills{position:absolute;left:0;width:100%;height:28%}
.mars-hills.far{bottom:22%}.mars-hills.far path{fill:var(--hill-far)}
.mars-hills.mid{bottom:16%}.mars-hills.mid path{fill:var(--hill-mid)}
.mars-ground{position:absolute;left:0;right:0;bottom:0;height:24%;background:linear-gradient(var(--ground0),var(--ground1))}
.mars-oopy{position:absolute;left:12%;bottom:5%;width:min(36vw,480px);filter:drop-shadow(0 8px 12px #0008);animation:bob 4s ease-in-out infinite;z-index:2}
.oopy-svg{width:100%;height:auto;overflow:visible}
.oopy-mast{transition:transform 3s ease}
.oopy-eyes{filter:drop-shadow(0 0 6px ${C.cyan});transition:opacity 1s}
.oopy-eyes.flicker{animation:flick 1.6s infinite}
.oopy-led.blink-fast{animation:blink .5s steps(1) infinite}
.oopy-wheel{transform-box:fill-box;transform-origin:center}
.mars-fog{position:absolute;inset:0;background:linear-gradient(180deg,transparent 10%,var(--fog) 90%);transition:opacity .4s;z-index:3;mix-blend-mode:multiply}
.mars-dim{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,transparent 20%,#000 100%);z-index:4}
.storm-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:5;pointer-events:none}

/* ═══ HUD ═══ */
.hud{position:absolute;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;gap:20px;padding:10px 64px 10px 18px;background:linear-gradient(180deg,#000d,#0006 80%,transparent);border-bottom:1px solid #ffffff14;font-family:${F.mono};flex-wrap:wrap}
.hud-badge{font-size:.8rem;letter-spacing:.2em;display:flex;align-items:center}
.hud-small{font-size:.65rem;opacity:.6;letter-spacing:.15em;margin-top:3px}
.hud-gauges{display:flex;gap:14px;flex:1;min-width:300px}
.gauge{flex:1;min-width:70px}
.gauge-top{display:flex;justify-content:space-between;font-size:.62rem;letter-spacing:.14em;opacity:.85}
.gauge-bar{height:7px;background:#ffffff1c;border-radius:99px;overflow:hidden;margin-top:3px}
.gauge-bar i{display:block;height:100%;background:linear-gradient(90deg,${C.pass},#c8ff6b);transition:width .5s;border-radius:99px}
.gauge.low .gauge-bar i{background:${C.danger};box-shadow:0 0 10px ${C.danger}}
.gauge.low .gauge-top{color:${C.danger};animation:blink 1s steps(1) infinite}
.sigbars{display:flex;align-items:flex-end;gap:3px;height:26px;margin-top:2px}
.sigbars i{width:6px;background:#ffffff2a;border-radius:1px}
.sigbars i.on{background:${C.pass};box-shadow:0 0 6px ${C.pass}}
.gauge.low .sigbars i.on{background:${C.danger};box-shadow:0 0 6px ${C.danger}}
.hud-heart{display:flex;align-items:center;gap:6px;font-size:.7rem}
.hud-heart svg{width:90px;height:30px}
.hud-heart b{font-size:1.4rem;color:${C.danger};text-shadow:0 0 12px ${C.danger}}
.mini-ecg{fill:none;stroke:${C.danger};stroke-width:2;stroke-dasharray:140;stroke-dashoffset:140;animation:ecgRun var(--bpm,.8s) linear infinite;filter:drop-shadow(0 0 4px ${C.danger})}
@keyframes ecgRun{to{stroke-dashoffset:-140}}
.lowpower{position:absolute;left:50%;top:100%;transform:translateX(-50%);background:${C.danger};color:#000;font-weight:700;letter-spacing:.3em;font-size:.75rem;padding:4px 18px;border-radius:0 0 8px 8px;animation:blink .8s steps(1) infinite}

/* ═══ Voice subtitle ═══ */
.voice{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);width:min(780px,92vw);z-index:30;display:flex;gap:14px;align-items:center;padding:14px 20px;background:${C.glass};backdrop-filter:blur(8px);border:1px solid #ffffff22;border-left:4px solid ${C.cyan};border-radius:10px;box-shadow:0 10px 40px #000a;animation:inUp .3s}
.voice.flight{border-left-color:${C.accent}}
.voice-eye{display:flex;gap:5px}
.voice-eye i{width:14px;height:14px;border-radius:50%;background:radial-gradient(circle,#fff,${C.cyan} 50%,#0a3a4a);box-shadow:0 0 12px ${C.cyan};animation:flick 4s infinite}
.voice-name{font-family:${F.mono};font-size:.65rem;letter-spacing:.3em;color:${C.cyan};margin-bottom:3px}
.voice p{margin:0;font-size:1.1rem;line-height:1.4}
.caret{animation:blink .7s steps(1) infinite;color:${C.cyan}}

/* ═══ Flash result ═══ */
.flash-wrap{position:absolute;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3vh;background:radial-gradient(circle,#0008,#000c)}
.flash{font-family:${F.display};font-size:clamp(3.4rem,12vw,11rem);white-space:pre-line;text-align:center;line-height:.92;letter-spacing:.04em}
.flash.pass{text-shadow:0 0 50px ${C.pass},0 0 120px ${C.pass}88}
.flash.fail{text-shadow:0 0 50px ${C.danger},0 0 120px ${C.danger}88}
.fact{max-width:min(640px,88vw);background:${C.glass};border:1px solid #ffffff22;border-radius:12px;padding:14px 20px;text-align:center;opacity:0;animation:inUp .5s forwards}
.fact b{font-family:${F.mono};font-size:.7rem;letter-spacing:.3em;color:${C.amber}}
.fact p{margin:6px 0 0;font-size:1rem;line-height:1.45;opacity:.9}

/* ═══ Flashbacks ═══ */
.memory{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3vh;background:radial-gradient(ellipse at center,color-mix(in srgb,var(--tint) 35%,#000),#000 85%);cursor:pointer;animation:memIn 1.1s both}
@keyframes memIn{from{opacity:0;filter:blur(18px) sepia(1)}to{opacity:1;filter:none}}
.memory-glow{position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,var(--tint),transparent 55%);opacity:.25;animation:pulse 4s infinite}
.polaroid{position:relative;background:#f6f0e4;padding:14px 14px 46px;transform:rotate(-3deg);box-shadow:0 30px 60px #000c;width:min(420px,70vw);animation:kenburns 5s ease-out forwards}
@keyframes kenburns{from{transform:rotate(-4deg) scale(.94)}to{transform:rotate(-2deg) scale(1.03)}}
.polaroid-img{position:relative;aspect-ratio:4/3;background:linear-gradient(180deg,#f0b56e,#b8643a 60%,#6b3519);background-size:cover;background-position:center;overflow:hidden;filter:sepia(.55) contrast(1.05)}
.pol-sun{position:absolute;left:62%;top:14%;width:20%;aspect-ratio:1;border-radius:50%;background:#fff6d0;box-shadow:0 0 30px #fff6d0}
.pol-hill{position:absolute;left:-10%;right:-10%;bottom:-20%;height:55%;background:#7a3e1c;border-radius:50% 50% 0 0}
.pol-rover{position:absolute;left:12%;bottom:6%;width:60%}
.polaroid-cap{position:absolute;bottom:12px;left:0;right:0;text-align:center;font-family:${F.mono};font-size:.85rem;color:#3a2a1a;letter-spacing:.1em}
.memory-line{max-width:min(720px,88vw);font-size:clamp(1.2rem,2.6vw,1.9rem);text-align:center;line-height:1.4;margin:0;font-style:italic;text-shadow:0 2px 14px #000}
.memory-skip{position:absolute;bottom:18px;font-size:.75rem;opacity:.45;font-family:${F.mono}}

/* ═══ Event intro ═══ */
.ev-intro{text-align:center;display:flex;flex-direction:column;align-items:center;gap:2vh}
.ev-intro-title{font-family:${F.display};font-weight:400;font-size:clamp(2.6rem,8vw,7rem);margin:0;letter-spacing:.05em;animation:slam .4s cubic-bezier(.2,1.4,.4,1);text-shadow:0 0 40px ${C.accent}88}
@keyframes slam{from{transform:scale(2.2);opacity:0;filter:blur(10px)}}
.ev-intro-hint{margin:0;font-size:1.15rem;opacity:.85;letter-spacing:.08em}
.count{font-family:${F.display};font-size:clamp(5rem,16vw,12rem);line-height:1;color:${C.amber};text-shadow:0 0 50px ${C.amber}}
.count.go{color:${C.pass};text-shadow:0 0 60px ${C.pass}}

/* ═══ Shared event UI ═══ */
.event{width:min(94vw,1000px);text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center;animation:inUp .35s}
.ev-title{font-family:${F.display};font-weight:400;font-size:clamp(2rem,4.6vw,3.6rem);margin:0;letter-spacing:.05em;text-shadow:0 0 30px #000}
.ev-sub{margin:0;opacity:.8;text-shadow:0 2px 8px #000}
.btn{background:linear-gradient(180deg,#ffa24d,${C.accent});color:#1a0b00;border:0;font:700 1.05rem ${F.body};letter-spacing:.1em;padding:13px 34px;border-radius:10px;cursor:pointer;box-shadow:0 6px 0 #a24a00,0 12px 24px #0008;transition:transform .08s,box-shadow .08s}
.btn:hover{filter:brightness(1.12)}
.btn:active{transform:translateY(4px);box-shadow:0 2px 0 #a24a00}
.keycap{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 10px;font:700 .8rem ${F.mono};color:#111;background:linear-gradient(180deg,#fff,#cfd3dd);border-radius:7px;box-shadow:0 4px 0 #7b8093,0 7px 10px #0007;margin:0 3px;transition:transform .04s,box-shadow .04s}
.keycap.big{min-width:96px;height:80px;font-size:1.6rem;border-radius:12px}
.keycap.pressed{transform:translateY(4px);box-shadow:0 0 0 #7b8093,0 2px 4px #0007}
.timer{width:100%;display:flex;align-items:center;gap:12px;font-family:${F.mono};font-variant-numeric:tabular-nums}
.timer-bar{flex:1;height:12px;background:#ffffff1f;border-radius:99px;overflow:hidden;border:1px solid #ffffff22}
.timer-bar div{height:100%;background:linear-gradient(90deg,${C.accent},${C.amber});transition:width 50ms linear}
.timer.low .timer-bar div{background:${C.danger};box-shadow:0 0 14px ${C.danger}}
.timer.low span{color:${C.danger};animation:blink .5s steps(1) infinite}
.ring-bg{fill:none;stroke:#ffffff1c;stroke-width:14}
.ring-fg{fill:none;stroke:${C.accent};stroke-width:14;stroke-linecap:round;filter:drop-shadow(0 0 10px ${C.accent});transition:stroke-dashoffset 60ms linear}

/* ═══ Intro briefing ═══ */
.intro{width:min(96vw,1200px);height:100%;display:grid;grid-template-columns:1.45fr 1fr;gap:18px;animation:inUp .4s}
.intro-left,.intro-right{display:flex;flex-direction:column;gap:12px;min-height:0;background:${C.glass};backdrop-filter:blur(10px);border:1px solid #ffffff1f;border-radius:14px;padding:14px;box-shadow:0 20px 60px #000a}
.panel-title{font-family:${F.mono};font-size:.7rem;letter-spacing:.3em;color:${C.cyan}}
.intro-left video{width:100%;border-radius:10px;background:#000;max-height:46%;border:1px solid #ffffff22}
.guides{display:grid;grid-template-columns:1fr 1fr;gap:10px;overflow:auto;padding-right:4px}
.guide{display:flex;flex-direction:column;gap:8px;background:#ffffff0c;border:1px solid #ffffff18;border-radius:10px;padding:10px;animation:inUp .4s both}
.guide-keys{display:flex;flex-wrap:wrap}
.guide h4{margin:0;font-size:.95rem}
.guide p{margin:2px 0 0;font-size:.8rem;opacity:.75;line-height:1.35}
.transcript{flex:1;overflow:auto;display:flex;flex-direction:column;gap:18px;padding-right:6px}
.transcript p{margin:0;line-height:1.55;animation:inUp .4s}
.transcript b{color:${C.cyan};font-family:${F.mono};font-size:.75rem;letter-spacing:.1em}

/* ═══ Reflex ═══ */
.reflex-ring{position:relative;width:min(60vw,300px);aspect-ratio:1;margin:6px 0}
.reflex-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.reflex-ring .ring-fg{transition:none}
.reflex-key{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;animation:slam .22s}
.reflex-ring.hit .ring-fg{stroke:${C.pass};filter:drop-shadow(0 0 14px ${C.pass})}
.reflex-ring.miss .ring-fg{stroke:${C.danger};filter:drop-shadow(0 0 14px ${C.danger})}
.reflex-dots{display:flex;gap:10px}
.reflex-dots i{width:14px;height:14px;border-radius:50%;background:#ffffff22;border:2px solid #fff5}
.reflex-dots i.cur{border-color:${C.amber};animation:pulse .6s infinite}
.reflex-dots i.on{background:${C.pass};border-color:${C.pass};box-shadow:0 0 10px ${C.pass}}

/* ═══ Heartbeat ═══ */
.ecg{position:relative;width:100%;height:clamp(180px,30vh,260px);background:#02110b;border:2px solid #14402c;border-radius:12px;overflow:hidden;box-shadow:inset 0 0 70px #0f66,0 0 40px #0f62}
.ecg svg{width:100%;height:100%}
.ecg-grid{stroke:#14402c;stroke-width:1;vector-effect:non-scaling-stroke}
.zone{fill:#3dffb022;stroke:${C.pass};stroke-dasharray:6 6;vector-effect:non-scaling-stroke;animation:pulse 1s infinite}
.zone.hit{fill:#3dffb0aa;animation:none}
.ecg-path{fill:none;stroke:${C.pass};stroke-width:3;vector-effect:non-scaling-stroke;filter:drop-shadow(0 0 6px ${C.pass})}
.ecg.flat .ecg-path{stroke:${C.danger};filter:drop-shadow(0 0 8px ${C.danger})}
.ecg.flat{border-color:${C.danger};box-shadow:inset 0 0 70px #f003}
.scan{position:absolute;top:0;bottom:0;width:4px;background:#fff;box-shadow:0 0 22px 6px #fff}
.hit-label{position:absolute;top:8px;transform:translateX(-50%);font-family:${F.mono};font-weight:700;color:${C.pass};text-shadow:0 0 10px ${C.pass};animation:inUp .3s}
.beats span{font-size:2.6rem;margin:0 8px;color:#333;transition:.15s}
.beats span.on{color:${C.danger};text-shadow:0 0 24px ${C.danger};transform:scale(1.2);display:inline-block}

/* ═══ Solar panel ═══ */
.panel-frame{width:min(100%,820px);background:linear-gradient(180deg,#434a62,#1b2033);border-radius:18px;padding:14px;box-shadow:0 24px 70px #000b,inset 0 1px 0 #fff3}
.panel-frame.gust{animation:gustShake .4s}
@keyframes gustShake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.panel-label{display:flex;justify-content:space-between;font-family:${F.mono};font-size:.72rem;letter-spacing:.15em;opacity:.8;margin-bottom:8px}
.panel{position:relative;aspect-ratio:960/520;border-radius:8px;overflow:hidden;background:#0a1a4a;border:3px solid #b9c3dc}
.cells{position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(4,1fr);gap:4px;padding:4px;background:#cdd5e6}
.cells i{background:linear-gradient(135deg,#0d2a7a,#2a5fe0 50%,#0a1f5c);border-radius:2px;box-shadow:inset 0 0 0 1px #8fb0ff66,inset 0 0 20px #0006;position:relative}
.cells i::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 12px,#9fb8ff33 12px 13px)}
.glare{position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,#ffffff33 45%,transparent 55%);pointer-events:none;animation:glareMove 5s linear infinite}
@keyframes glareMove{from{transform:translateX(-60%)}to{transform:translateX(60%)}}
.panel canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:none}
.brush-ring{position:absolute;aspect-ratio:1;border-radius:50%;border:2px solid #fff;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 0 12px #fff8,inset 0 0 12px #fff4}
.gust-label{position:absolute;top:8%;right:6%;font-family:${F.display};font-size:3rem;color:${C.danger};text-shadow:0 0 20px ${C.danger};animation:blink .2s steps(1) infinite}
.meter{display:flex;gap:12px;align-items:center;width:min(100%,820px);font-family:${F.mono};font-size:.75rem}
.meter>div{position:relative;flex:1;height:14px;background:#ffffff1f;border-radius:99px;overflow:hidden}
.meter i{display:block;height:100%;background:linear-gradient(90deg,${C.amber},${C.pass});transition:width .2s}
.meter b{position:absolute;top:0;bottom:0;width:3px;background:#fff;box-shadow:0 0 8px #fff}

/* ═══ Hardware ═══ */
.hw-event{gap:6px}
.hw-ring{position:relative;width:min(60vh,520px);aspect-ratio:1;max-width:92vw}
.hw-lines{position:absolute;inset:0;width:100%;height:100%}
.hw-lines line{stroke:${C.accent};stroke-width:.4;stroke-dasharray:1.5 1.5;opacity:.8;animation:dashFlow 1s linear infinite}
.hw-lines line.dead{stroke:#444;animation:none;opacity:.4}
@keyframes dashFlow{to{stroke-dashoffset:-6}}
.hw-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:20%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#2b3a66,#0a1030);border:2px solid ${C.cyan};box-shadow:0 0 30px ${C.cyan}66;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:${F.mono};animation:pulse 2s infinite}
.hw-core b{font-size:.8rem;letter-spacing:.2em}.hw-core span{font-size:1.1rem;color:${C.amber}}
.hw{position:absolute;transform:translate(-50%,-50%);width:23%;aspect-ratio:1;border-radius:50%;border:3px solid ${C.accent};background:radial-gradient(circle,#1d2340,#0b0e1c);color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 0 22px ${C.accent}66;transition:transform .1s,box-shadow .1s}
.hw:hover{transform:translate(-50%,-50%) scale(1.12);box-shadow:0 0 40px ${C.accent}}
.hw span{font-size:clamp(1.4rem,4vw,2.2rem)}
.hw em{font-style:normal;font-size:clamp(.55rem,1.4vw,.8rem)}
.hw.off{border-color:#444;background:#000;filter:grayscale(1);opacity:.45;cursor:default;box-shadow:none;transform:translate(-50%,-50%) scale(.92)}
.hw-msg{min-height:3.4rem;display:flex;flex-direction:column;align-items:center;animation:inUp .2s}
.hw-msg strong{font-family:${F.display};font-size:clamp(1.4rem,3vw,2.2rem);letter-spacing:.06em;color:${C.danger};text-shadow:0 0 18px ${C.danger};animation:blink .25s 3}
.hw-msg small{opacity:.8}

/* ═══ Impossible spam ═══ */
.spam-box{position:relative;width:min(56vw,300px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#2b1304,#0a0502);box-shadow:0 0 60px ${C.accent}33,inset 0 0 40px #000}
.spam-box.hot{box-shadow:0 0 90px ${C.accent}88,inset 0 0 40px #000}
.spam-box.dead{animation:flick .3s 4;box-shadow:0 0 60px ${C.danger}}
.spam-box.dead .ring-fg{stroke:${C.danger}}
.spam-ring{position:absolute;inset:0;width:100%;height:100%}
.spam-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.spam-pct{font-family:${F.display};font-size:clamp(4rem,12vw,6.5rem);line-height:1;text-shadow:0 0 30px ${C.accent}}
.spam-pct small{font-size:.4em}
.spam-label{font-family:${F.mono};letter-spacing:.3em;font-size:.7rem;opacity:.8}
.spark{position:absolute;width:3px;height:26px;background:linear-gradient(#fff,${C.accent},transparent);transform:rotate(var(--r));animation:sparkOut .35s forwards;pointer-events:none}
@keyframes sparkOut{to{opacity:0;transform:rotate(var(--r)) translateY(-40px) scaleY(.3)}}
.spam-key{margin:2px 0}
.spam-bar{width:min(100%,560px);height:20px;background:#000a;border:2px solid ${C.accent};border-radius:99px;overflow:hidden}
.spam-bar i{display:block;height:100%;background:linear-gradient(90deg,${C.accent},#ffd34a);transition:width 60ms linear}

/* ═══ Montage + failure ═══ */
.montage-dim{position:absolute;inset:0;background:#000;pointer-events:none}
.flatline-strip{position:absolute;left:0;right:0;bottom:10%;height:60px;z-index:20;opacity:.85}
.flatline-strip svg{width:100%;height:100%}
.flatline-strip path{fill:none;stroke:${C.danger};stroke-width:2;filter:drop-shadow(0 0 6px ${C.danger});vector-effect:non-scaling-stroke}
.flatline-strip.flat path{d:path("M0 20 H300")}
.nocarrier{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font-family:${F.display};font-size:8vw;color:${C.danger};letter-spacing:.2em;text-shadow:0 0 40px ${C.danger};z-index:30;animation:flick .5s infinite;white-space:nowrap}
.failed-screen{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#000}
.failed-bg{position:absolute;inset:0;background:radial-gradient(circle,${C.dangerDeep},#000 70%);animation:redBeat 1.1s infinite}
.epitaph{font-family:${F.display};font-size:clamp(1.6rem,4.5vw,3.4rem);letter-spacing:.12em;text-align:center;margin:0;padding:0 6vw;animation:epi 2.2s both}
@keyframes epi{0%{opacity:0;filter:blur(10px)}25%,75%{opacity:1;filter:none}100%{opacity:0}}
.mission-failed{position:relative;font-family:${F.display};font-size:12vw;color:${C.danger};text-shadow:0 0 70px ${C.danger},0 0 160px #f00;letter-spacing:.05em;animation:slam .5s cubic-bezier(.2,1.4,.4,1);text-align:center;z-index:5;white-space:nowrap}

@media(max-width:860px){
  .intro{grid-template-columns:1fr;overflow:auto}.guides{grid-template-columns:1fr}
  .hud{gap:10px;padding-right:56px}.hud-gauges{min-width:100%;order:3}.stage{inset:150px 0 120px 0}
  .chatter,.s2-telemetry{display:none}.voice p{font-size:.95rem}
}
@media(prefers-reduced-motion:reduce){.grain,.glare,.mars-oopy,.s0-sun{animation:none}}
`;
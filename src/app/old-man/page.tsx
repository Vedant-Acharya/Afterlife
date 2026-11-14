"use client";


import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";


const CONFIG = {
  assets: {
    model: "/models/odyssey.glb",
    marsVideo: "/videos/marsrotation.mp4",
    infoVideo: "/videos/info.mp4",
    audioDir: "/audios/odyssey", 
    imageDir: "/images",
    zoopSfx: null as string | null, 
    nextRoute: "/oopy",
  },

  colors: {
    space: "#05070f",
    ink: "#ffffff",
    mars: "#e2683c",
    sand: "#f6d3a6",
    odysseyLabel: "#8ec5ff",
    odysseyBoxA: "rgba(16,34,86,0.94)",
    odysseyBoxB: "rgba(40,66,128,0.94)",
    childLabel: "#9af5cf",
    childBoxA: "rgba(8,64,60,0.94)",
    childBoxB: "rgba(22,112,98,0.94)",
    skip: "#d23a3a",
    journeyRed: "#ff3b3b",
    infoBorder: "#f6d3a6",
  },

  fonts: {
    display: "'Fredoka', 'Nunito', system-ui, sans-serif",
    label: "'IBM Plex Mono', ui-monospace, monospace",
    googleUrl:
      "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },

  chapter: {
    title: "Chapter 2: The Old Man's Last Tale",
    titleSize: "clamp(3rem, 9.5vw, 10rem)",
    hint: "Click to continue",
    hintSize: "clamp(1.1rem, 2.4vw, 2.2rem)",
    hintPulseSec: 2.2,
  },
  outro: {
    before: "The Tale is over but the ",
    accent: "journey",
    after: " isn't",
    titleSize: "clamp(2.6rem, 7.5vw, 8rem)",
    button: "Click to continue",
  },

  fadeMs: 900,

  mars: {
    diameterVh: 120,
    centerYPct: 64,
    centerXPct: 50,
    videoZoom: 1.18, 
    playbackRate: 1,
    glow: "0 0 90px 10px rgba(226,104,60,0.35), inset -60px -40px 120px rgba(0,0,0,0.55)",
  },

  orbit: {
    cxPct: 50,
    cyPct: 40,
    rxPct: 58,
    ryPct: 20,
    lineWidthPx: 3,
    lineColor: "rgba(246,211,166,0.55)",
    lineStyle: "dashed" as "dashed" | "dotted" | "solid",
  },

  orbiter: {
    sizePx: 230,
    baseRotationDeg: [20, -35, 0] as [number, number, number],
    swayDeg: 6,
    spinSpeed: 0.25,
    bobPx: 8,
    enterDelaySec: 0.6,
    enterSec: 5,
    awaySec: 1.1, 
    returnSec: 2.6,
    envIntensity: 1.1,
    ambient: 0.6,
    hemi: 0.8,
    keyLight: 2.2,
    fillLight: 1.0,
    metalnessCap: 0.65, 
  },

  subtitle: {
    bottomVh: 3,
    sideVw: 2,
    textSize: "clamp(1.2rem, 2.5vw, 2.4rem)",
    labelSize: "clamp(0.75rem, 1.1vw, 1rem)",
    radiusPx: 34,
    odysseyLabel: "ODYSSEY",
    childLabel: "CADET",
    skipLabel: "SKIP",
    wordDim: 0.4, 
  },

  timing: {
    gapMs: 450, 
    fallbackMsPerChar: 65, 
    finishDelayMs: 1200, 
  },

  visual: {
    topPct: 24, 
    widthVw: 30,
    maxWidthPx: 460,
    sideMarginVw: 2.5,
    tiltDeg: 3,
    bgOpacity: 0.4,
    bgFadeMs: 1400,
    stickerCount: 7,
  },

  info: {
    sizePx: 150,
    mobileSizePx: 100,
    top: 22,
    right: 22,
    borderPx: 5,
    label: "Click to explore more",
    pauseNarration: true,
  },
};


type Who = "odyssey" | "child";
type Line = {
  id: string;
  who: Who;
  text: string;
  audio: string | null; 
  visual?: string; 
  fx?: "away" | "return";
};
type Photo = { src: string; alt: string; caption?: string };
type Visual = {
  title: string;
  emoji: string;
  side: "left" | "right";
  accent: string;
  photos?: Photo[];
  fact?: string;
  stat?: { value: string; label: string };
  kind?: "thermo" | "counter";
  bg?: Photo; 
};

const img = (f: string) => `${CONFIG.assets.imageDir}/${f}`;

const VISUALS: Record<string, Visual> = {
  years: {
    title: "Still orbiting",
    emoji: "🛰️",
    side: "left",
    accent: "#8ec5ff",
    kind: "counter",
    fact: "Odyssey has circled Mars longer than any spacecraft in history.",
  },
  odyssey: {
    title: "Mars Odyssey",
    emoji: "🚀",
    side: "right",
    accent: "#8ec5ff",
    photos: [{ src: img("odyssey-orbiter.jpeg"), alt: "NASA's Mars Odyssey orbiter above Mars", caption: "Me!" }],
    fact: "Launched in 2001. I map Mars and relay messages from rovers.",
  },
  rovers: {
    title: "The rover family",
    emoji: " ",
    side: "left",
    accent: "#f6d3a6",
    photos: [
      { src: img("viking.jpg"), alt: "Viking lander on Mars", caption: "Viking" },
      { src: img("sojourner.jpeg"), alt: "Sojourner rover", caption: "Sojourner" },
      { src: img("spirit.jpeg"), alt: "Spirit rover", caption: "Spirit" },
    ],
    fact: "Every explorer helped the next one go farther.",
  },
  moon: {
    title: "The Moon",
    emoji: "🌙",
    side: "right",
    accent: "#d9dde8",
    photos: [{ src: img("moon.jpg"), alt: "The Moon", caption: "Our neighbour" }],
    bg: { src: img("bg-moon.jpeg"), alt: "Lunar surface backdrop" },
    fact: "The Moon is about 384,000 km from Earth.",
  },
  apollo11: {
    title: "Apollo 11",
    emoji: "👩‍🚀",
    side: "left",
    accent: "#ffd166",
    photos: [
      { src: img("apollo11.jpeg"), alt: "Apollo 11 mission patch", caption: "Apollo 11" },
      { src: img("armstrong.jpg"), alt: "Neil Armstrong in his spacesuit", caption: "Neil Armstrong" },
    ],
    bg: { src: img("bg-moon.jpeg"), alt: "Lunar surface backdrop" },
    fact: "July 20, 1969: the first humans walked on the Moon.",
  },
  thermo: {
    title: "Hot and cold",
    emoji: "🌡️",
    side: "right",
    accent: "#ff9d6e",
    kind: "thermo",
    bg: { src: img("bg-moon.jpeg"), alt: "Lunar surface backdrop" },
    photos: [{ src: img("lunar-rover.jpeg"), alt: "Apollo Lunar Roving Vehicle on the Moon", caption: "Apollo 15, 16, 17 rovers" }],
    fact: "A Thermal Control Subsystem kept the rovers' electronics safe.",
  },
  duke: {
    title: "A photo on the Moon",
    emoji: "📷",
    side: "left",
    accent: "#ffd166",
    photos: [{ src: img("duke-family.jpeg"), alt: "Charles Duke's family photo left on the Moon", caption: "The Duke family" }],
    bg: { src: img("bg-moon.jpeg"), alt: "Lunar surface backdrop" },
    fact: "Charles Duke left it there during Apollo 16 in 1972.",
  },
  zoop: {
    title: "Zoooop!",
    emoji: "💫",
    side: "left",
    accent: "#9af5cf",
    stat: { value: "Whoosh!", label: "Odyssey zips around the far side of Mars" },
  },
  orbit: {
    title: "My job",
    emoji: "🪐",
    side: "right",
    accent: "#8ec5ff",
    stat: { value: "≈ 2 hrs", label: "for one lap around Mars" },
    fact: "Each lap lets me see a new stripe of the planet.",
  },
  timeline: {
    title: "Visitors to Mars",
    emoji: "🕰️",
    side: "left",
    accent: "#f6d3a6",
    photos: [{ src: img("mars-surface.png"), alt: "Rocky surface of Mars", caption: "Mars up close" }],
    bg: { src: img("bg-mars-surface.webp"), alt: "Martian landscape backdrop" },
    fact: "Landers and rovers have been exploring since 1976.",
  },
  viking: {
    title: "Viking",
    emoji: " ",
    side: "right",
    accent: "#f6d3a6",
    photos: [{ src: img("viking.jpg"), alt: "Viking lander on Mars", caption: "Viking 1976" }],
    bg: { src: img("bg-mars-surface.png"), alt: "Martian landscape backdrop" },
    fact: "Viking landed in 1976 — the elder of the Mars family.",
  },
  pathfinder: {
    title: "Pathfinder & Sojourner",
    emoji: " ",
    side: "left",
    accent: "#ffd166",
    photos: [
      { src: img("pathfinder.webp"), alt: "Pathfinder lander", caption: "Pathfinder" },
      { src: img("sojourner.jpeg"), alt: "Sojourner rover", caption: "Sojourner" },
    ],
    bg: { src: img("bg-mars-surface.png"), alt: "Martian landscape backdrop" },
    fact: "1997: Sojourner became the first wheeled rover to roam Mars.",
  },
  spirit: {
    title: "Spirit",
    emoji: "🖤",
    side: "right",
    accent: "#ff9d6e",
    photos: [{ src: img("spirit.jpeg"), alt: "Spirit rover on Mars", caption: "Spirit" }],
    bg: { src: img("bg-mars-surface.png"), alt: "Martian landscape backdrop" },
    fact: "Built for 90 days, Spirit explored for over six years.",
  },
  mission: {
    title: "A mission",
    emoji: "🌟",
    side: "left",
    accent: "#ff6b4a",
    photos: [{ src: img("mission-patch.png"), alt: "Mars exploration mission patch", caption: "Our mission" }],
    fact: "Exploring means learning, so people back home can dream bigger.",
  },
};

const LINES: Line[] = [
  { id: "1", who: "odyssey", audio: "1", visual: "years", text: "Hello there, Cadet. The archivist told me about your arrival." },
  { id: "2", who: "odyssey", audio: "2", visual: "years", text: "You might not know me, but I know everything. I have been in this orbit for over 25 years." },
  { id: "3", who: "odyssey", audio: "3", visual: "odyssey", text: "Let me introduce myself. I am Odyssey, NASA's Mars orbiter." },
  { id: "4", who: "odyssey", audio: "4", visual: "rovers", text: "I know I'm getting old, but before dying I would love to tell you the story of the rovers." },
  { id: "5", who: "odyssey", audio: "5", visual: "moon", text: "Let's start off with the Moon. I don't really see it from here, but I know all about it." },
  { id: "6", who: "odyssey", audio: "6", visual: "apollo11", text: "Starting with Apollo 11, which first took humanity to the Moon. The first person was Neil Armstrong." },
  { id: "7", who: "odyssey", audio: "7", visual: "thermo", text: "As the Moon can be really cold and really hot, the rovers of Apollo 15, 16 and 17 relied on a Thermal Control Subsystem." },
  { id: "8", who: "odyssey", audio: "8", visual: "duke", text: "Ohh, almost forgot. Do you still have Astronaut Charles Duke's memorable picture?" },
  { id: "C1", who: "child", audio: "C1", visual: "duke", text: "Uhh, never heard of him?" },
  { id: "9", who: "odyssey", audio: "9", visual: "duke", text: "Ohh, the one the archivist gave you. It was his family picture, which he left on the Moon." },
  { id: "10", who: "odyssey", audio: "10", visual: "duke", text: "According to me, it's one of the most heartfelt pieces of history out there." },
  { id: "C-yes", who: "child", audio: "C-yes", visual: "duke", text: "Yes, I still have it!!" },
  { id: "11", who: "odyssey", audio: "11", visual: "zoop", fx: "away", text: "OHH NO!" },
  { id: "C2", who: "child", audio: "C2", visual: "zoop", text: "nooOOoo, did you just leave me alone?" },
  { id: "12", who: "odyssey", audio: "12", visual: "orbit", fx: "return", text: "Don't worry, it's my job. I revolve around Mars." },
  { id: "13", who: "odyssey", audio: "13", visual: "timeline", text: "Moving on, let's explore my planet. I have seen many arrive and many pass away. It's part and parcel of life. Everyone who comes, has to go." },
  { id: "14", who: "odyssey", audio: "14", visual: "timeline", text: "Let me introduce you to them." },
  { id: "15", who: "odyssey", audio: "15", visual: "viking", text: "Viking: he was the oldest one among us. But unfortunately, old age was inevitable for him." },
  { id: "16", who: "odyssey", audio: "16", visual: "pathfinder", text: "Look over there, that is Pathfinder, a lander, and its rover Sojourner." },
  { id: "C3", who: "child", audio: "C3", visual: "spirit", text: "Spirit, shh shh, Spirit wake up…" },
  { id: "17", who: "odyssey", audio: "17", visual: "spirit", text: "He won't. A storm took his life. He explored a lot, lived to the fullest. Poor soul." },
  { id: "18", who: "odyssey", audio: "18", visual: "mission", text: "*sighs* I have been willing to tell you one thing: this is not just an exploration, this is a mission." },
  { id: "19", who: "odyssey", audio: "19", visual: "mission", text: "It's better if I show you." }, // 
];



type OrbitCmd = { id: number; from: number; to: number; dur: number; delay?: number };
const HALF_PI = Math.PI / 2;
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);


function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = CONFIG.orbiter.envIntensity;
    return () => { scene.environment = null; tex.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}



function Orbiter({ cmd, onArrive }: { cmd: OrbitCmd; onArrive: (id: number) => void }) {
  const O = CONFIG.orbit;
  const M = CONFIG.orbiter;
  const { scene } = useGLTF(CONFIG.assets.model);
  const { size } = useThree();
  const group = useRef<THREE.Group>(null!);
  const st = useRef({ id: -1, from: Math.PI, to: Math.PI, start: 0, dur: 1, delay: 0, done: true, theta: Math.PI });
  const arrive = useRef(onArrive);
  arrive.current = onArrive;

  const { model, maxDim } = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const s = box.getSize(new THREE.Vector3());
    c.position.sub(box.getCenter(new THREE.Vector3()));
    c.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      (Array.isArray(m) ? m : m ? [m] : []).forEach((mat) => {
        const sm = mat as THREE.MeshStandardMaterial;
        if (typeof sm.metalness === "number") sm.metalness = Math.min(sm.metalness, M.metalnessCap);
        sm.needsUpdate = true;
      });
    });
    return { model: c, maxDim: Math.max(s.x, s.y, s.z) || 1 };
  }, [scene, M.metalnessCap]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const s = st.current;
    if (cmd.id !== s.id) Object.assign(s, { id: cmd.id, from: cmd.from, to: cmd.to, dur: cmd.dur, delay: cmd.delay ?? 0, start: t, done: false, theta: cmd.from });
    if (!s.done) {
      const k = Math.min(1, Math.max(0, (t - s.start - s.delay) / s.dur));
      s.theta = s.from + (s.to - s.from) * (s.to < s.from && s.from === HALF_PI ? easeOut(k) : easeInOut(k));
      if (k >= 1) { s.done = true; arrive.current(s.id); }
    }
    const w = size.width, h = size.height;
    const cx = (O.cxPct / 100) * w, cy = (O.cyPct / 100) * h;
    const rx = (O.rxPct / 100) * w, ry = (O.ryPct / 100) * h;
    const bob = s.done ? Math.sin(t * 1.4) * M.bobPx : 0;
    const px = cx + rx * Math.cos(s.theta);
    const py = cy + ry * Math.sin(s.theta) + bob;
    const g = group.current;
    g.position.set(px - w / 2, h / 2 - py, 0);
    g.scale.setScalar(M.sizePx / maxDim);
    const d = THREE.MathUtils.degToRad;
    g.rotation.set(
      d(M.baseRotationDeg[0]) + Math.sin(t * 0.8) * d(M.swayDeg),
      d(M.baseRotationDeg[1]) + t * M.spinSpeed,
      d(M.baseRotationDeg[2])
    );
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}
useGLTF.preload(CONFIG.assets.model);



function PhotoCard({ p, rot }: { p: Photo; rot: number }) {
  const [bad, setBad] = useState(false);
  return (
    <figure className="polaroid" style={{ transform: `rotate(${rot}deg)` }}>
      <span className="tape" />
      {bad ? (
        <div className="ph-missing">{p.alt}</div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.src} alt={p.alt} onError={() => setBad(true)} draggable={false} />
      )}
      {p.caption && <figcaption>{p.caption}</figcaption>}
    </figure>
  );
}

function Counter({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 2200);
      setN(Math.round(to * easeOut(k)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <div className="stat">
      <b>{n}+</b>
      <span>years in orbit around Mars</span>
    </div>
  );
}

function Thermo() {
  return (
    <div className="thermo">
      <div className="tube"><i /></div>
      <ul>
        <li className="hot">127 °C <small>sunny day</small></li>
        <li className="cold">-173 °C <small>night</small></li>
      </ul>
    </div>
  );
}

function VisualPanel({ v }: { v: Visual }) {
  const rots = [-3, 2.5, -1.5];
  return (
    <aside className={`vpanel ${v.side}`} style={{ ["--accent" as string]: v.accent }}>
      <h3>
        <span aria-hidden>{v.emoji}</span> {v.title}
      </h3>
      {v.kind === "counter" && <Counter to={25} />}
      {v.kind === "thermo" && <Thermo />}
      {v.stat && (
        <div className="stat">
          <b>{v.stat.value}</b>
          <span>{v.stat.label}</span>
        </div>
      )}
      {v.photos && (
        <div className="photos">
          {v.photos.map((p, i) => (
            <PhotoCard key={p.src} p={p} rot={rots[i % 3] * (CONFIG.visual.tiltDeg / 3)} />
          ))}
        </div>
      )}
      {v.fact && <p className="fact">{v.fact}</p>}
    </aside>
  );
}



type SceneName = "chapter" | "main" | "end";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    const key = "odyssey_reloaded";
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
  const [scene, setScene] = useState<SceneName>("chapter");
  const [dark, setDark] = useState(false);
  
  const audioEl = useRef<HTMLAudioElement | null>(null);

  const unlockAudio = () => {
    if (audioEl.current) return;
    const a = new Audio();
    a.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    a.play().catch(() => {});
    audioEl.current = a;
  };

  const goTo = useCallback((s: SceneName) => {
    setDark(true);
    setTimeout(() => {
      setScene(s);
      setTimeout(() => setDark(false), 60);
    }, CONFIG.fadeMs);
  }, []);

  return (
    <main className="root">
      <style>{buildCss()}</style>
      {scene === "chapter" && (
        <button className="full chapter" onClick={() => { unlockAudio(); goTo("main"); }} aria-label="Continue">
          <h1>{CONFIG.chapter.title}</h1>
          <p>{CONFIG.chapter.hint}</p>
        </button>
      )}
      {scene === "main" && <MainScene audioEl={audioEl} onDone={() => goTo("end")} />}
      {scene === "end" && (
        <section className="full outro">
          <h1>
            {CONFIG.outro.before}
            <em>{CONFIG.outro.accent}</em>
            {CONFIG.outro.after}
          </h1>
          <button className="go" onClick={() => router.push(CONFIG.assets.nextRoute)}>
            {CONFIG.outro.button}
          </button>
        </section>
      )}
      <div className="fader" style={{ opacity: dark ? 1 : 0 }} />
    </main>
  );
}


function MainScene({ onDone, audioEl }: { onDone: () => void; audioEl: MutableRefObject<HTMLAudioElement | null> }) {
  const [phase, setPhase] = useState<"enter" | "talk">("enter");
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [blocked, setBlocked] = useState(false); 
  const [cmd, setCmd] = useState<OrbitCmd>({
    id: 1, from: Math.PI, to: HALF_PI, dur: CONFIG.orbiter.enterSec, delay: CONFIG.orbiter.enterDelaySec,
  });
  const cmdId = useRef(1);
  const audioRef = audioEl;
  const marsRef = useRef<HTMLVideoElement>(null);
  const line = LINES[idx];
  const isLast = idx === LINES.length - 1;

  useEffect(() => {
    if (marsRef.current) marsRef.current.playbackRate = CONFIG.mars.playbackRate;
  }, []);

  const send = useCallback((from: number, to: number, dur: number) => {
    cmdId.current += 1;
    setCmd({ id: cmdId.current, from, to, dur });
  }, []);

  const skipIntro = () => send(HALF_PI, HALF_PI, 0.01);


  useEffect(() => {
    if (phase !== "talk") return;
    const L = LINES[idx];
    if (L.fx === "away") {
      send(HALF_PI, 0, CONFIG.orbiter.awaySec);
      if (CONFIG.assets.zoopSfx) new Audio(CONFIG.assets.zoopSfx).play().catch(() => {});
    }
    if (L.fx === "return") send(Math.PI, HALF_PI, CONFIG.orbiter.returnSec);

    let cancelled = false;
    let failed = !L.audio;
    let ended = false;
    const timers: number[] = [];
    const t0 = performance.now();
    const fallbackMs = Math.max(1800, L.text.length * CONFIG.timing.fallbackMsPerChar);
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = L.audio ? audioRef.current : null;
    const url = L.audio ? `${CONFIG.assets.audioDir}/${L.audio}.mp3` : "";

    const finish = () => {
      if (ended || cancelled) return;
      ended = true;
      setProgress(1);
      if (idx === LINES.length - 1) timers.push(window.setTimeout(onDone, CONFIG.timing.finishDelayMs));
      else timers.push(window.setTimeout(() => setIdx((i) => i + 1), CONFIG.timing.gapMs));
    };

    if (audio) {
      audio.onended = finish;
      audio.onerror = () => { console.warn("[odyssey] audio failed to load:", url); failed = true; };
      audio.src = url;
      audio.load();
      audio.play().then(() => { if (!cancelled) setBlocked(false); }).catch((e: Error) => {
        if (cancelled || e?.name === "AbortError") return;
        if (e?.name === "NotAllowedError") setBlocked(true); 
        else { console.warn("[odyssey] audio play error:", url, e); failed = true; }
      });
    }
    setProgress(0);
    const iv = window.setInterval(() => {
      if (ended) return;
      let p: number;
      if (!failed && audio && audio.duration) p = audio.currentTime / audio.duration;
      else if (failed) p = (performance.now() - t0) / fallbackMs;
      else p = 0;
      setProgress(Math.min(1, p));
      if (failed && p >= 1) finish();
    }, 80);

    return () => {
      cancelled = true;
      window.clearInterval(iv);
      timers.forEach(clearTimeout);
      if (audio) { audio.onended = null; audio.onerror = null; audio.pause(); }
    };
  }, [idx, phase, onDone, send]);



  const visualKey = useMemo(() => {
    for (let i = idx; i >= 0; i--) if (LINES[i].visual) return LINES[i].visual!;
    return undefined;
  }, [idx]);
  const visual = phase === "talk" && visualKey ? VISUALS[visualKey] : undefined;


  const bgKeys = useMemo(() => Array.from(new Set(Object.values(VISUALS).filter((v) => v.bg).map((v) => v.bg!.src))), []);

  const words = line.text.split(" ");
  const lit = Math.ceil(progress * words.length);
  const O = CONFIG.orbit;

  return (
    <section className="stage">
      <div className="stars" />

      {bgKeys.map((src) => (
        <div
          key={src}
          className="backdrop"
          role="img"
          aria-label={Object.values(VISUALS).find((v) => v.bg?.src === src)?.bg?.alt}
          style={{ backgroundImage: `url(${src})`, opacity: visual?.bg?.src === src ? CONFIG.visual.bgOpacity : 0 }}
        />
      ))}

      <div className="mars">
        <video ref={marsRef} src={CONFIG.assets.marsVideo} autoPlay loop muted playsInline />
      </div>


      <div
        className="orbit"
        style={{
          left: `${O.cxPct - O.rxPct}%`,
          top: `${O.cyPct - O.ryPct}%`,
          width: `${O.rxPct * 2}%`,
          height: `${O.ryPct * 2}%`,
        }}
      />


      <div className="canvas">
        <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1000], near: 0.1, far: 4000 }} gl={{ alpha: true }}>
          <Env />
          <ambientLight intensity={CONFIG.orbiter.ambient} />
          <hemisphereLight args={["#cfe3ff", "#8a4a2e", CONFIG.orbiter.hemi]} />
          <directionalLight position={[400, 500, 700]} intensity={CONFIG.orbiter.keyLight} />
          <directionalLight position={[-500, -200, 400]} color="#ffb98a" intensity={CONFIG.orbiter.fillLight} />
          <Orbiter cmd={cmd} onArrive={() => setPhase("talk")} />
        </Canvas>
      </div>


      {visual && visualKey && <VisualPanel key={visualKey} v={visual} />}


      <button className="info" onClick={() => window.open('/extra', '_blank', 'noopener,noreferrer')} aria-label={CONFIG.info.label}>
        <video src={CONFIG.assets.infoVideo} autoPlay loop muted playsInline />
        <span>{CONFIG.info.label}</span>
      </button>


      {phase === "talk" ? (
        <div className="subs">
          <div key={line.id} className={`bubble ${line.who}`}>
            <small>{line.who === "odyssey" ? CONFIG.subtitle.odysseyLabel : CONFIG.subtitle.childLabel}</small>
            <p>
              {words.map((w, i) => (
                <span key={i} style={{ opacity: i < lit ? 1 : CONFIG.subtitle.wordDim }}>{w} </span>
              ))}
            </p>
          </div>
          {!isLast && (
            <button className="skip" onClick={() => setIdx((i) => i + 1)}>
              {CONFIG.subtitle.skipLabel} ▶▶
            </button>
          )}
        </div>
      ) : (
        <div className="subs right">
          <button className="skip" onClick={skipIntro}>{CONFIG.subtitle.skipLabel} ▶▶</button>
        </div>
      )}

      {blocked && (
        <button
          className="tap"
          onClick={() => audioRef.current?.play().then(() => setBlocked(false)).catch(() => {})}
        >
          🔊 Tap to hear Odyssey
        </button>
      )}
    </section>
  );
}



function buildCss() {
  const C = CONFIG.colors, F = CONFIG.fonts, M = CONFIG.mars, V = CONFIG.visual, S = CONFIG.subtitle, I = CONFIG.info, O = CONFIG.orbit;
  const stickers = Array.from({ length: V.stickerCount }, (_, i) =>
    `radial-gradient(circle at ${(i * 37 + 11) % 97}% ${(i * 53 + 7) % 91}%, rgba(255,255,255,.9) 0 1.5px, transparent 2.5px)`
  ).join(",");

  return `
@import url('${F.googleUrl}');
.root{position:fixed;inset:0;background:#000;color:${C.ink};font-family:${F.display};overflow:hidden}
.full{position:absolute;inset:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3vh;background:#000;border:0;color:${C.ink};cursor:pointer;text-align:center;padding:4vw;font-family:inherit}
.chapter h1,.outro h1{margin:0;font-weight:700;line-height:1.02;letter-spacing:-.02em;max-width:18ch}
.chapter h1{font-size:${CONFIG.chapter.titleSize}}
.chapter p{margin:0;font-size:${CONFIG.chapter.hintSize};font-weight:400;opacity:.8;animation:pulse ${CONFIG.chapter.hintPulseSec}s ease-in-out infinite}
.outro{cursor:default}
.outro h1{font-size:${CONFIG.outro.titleSize};max-width:16ch}
.outro em{font-style:normal;color:${C.journeyRed}}
.go{font:600 clamp(1.1rem,2vw,1.8rem) ${F.display};color:#fff;background:transparent;border:3px solid #fff;border-radius:999px;padding:.7em 1.8em;cursor:pointer;transition:background .2s,color .2s}
.go:hover,.go:focus-visible{background:#fff;color:#000;outline:none}
.fader{position:absolute;inset:0;background:#000;pointer-events:none;transition:opacity ${CONFIG.fadeMs}ms ease;z-index:50}
@keyframes pulse{0%,100%{opacity:.35}50%{opacity:.95}}

.stage{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 20%,#101a3a 0%,${C.space} 70%);overflow:hidden}
.stars{position:absolute;inset:0;background:${stickers};background-size:100% 100%;opacity:.6;animation:twinkle 5s ease-in-out infinite}
@keyframes twinkle{50%{opacity:.25}}
.backdrop{position:absolute;inset:0;background-size:cover;background-position:center;mix-blend-mode:screen;transition:opacity ${V.bgFadeMs}ms ease}
.mars{position:absolute;left:${M.centerXPct}%;top:${M.centerYPct}%;width:${M.diameterVh}vh;height:${M.diameterVh}vh;transform:translate(-50%,-50%);border-radius:50%;overflow:hidden;box-shadow:${M.glow}}
.mars video{width:100%;height:100%;object-fit:cover;transform:scale(${M.videoZoom})}
.orbit{position:absolute;box-sizing:border-box;border:${O.lineWidthPx}px ${O.lineStyle} ${O.lineColor};border-radius:50%;clip-path:inset(50% 0 0 0);pointer-events:none}
.canvas{position:absolute;inset:0;pointer-events:none}

.vpanel{position:absolute;top:${V.topPct}%;width:${V.widthVw}vw;max-width:${V.maxWidthPx}px;display:flex;flex-direction:column;gap:1.2vh;padding:1.6vh 1.4vw 2vh;border-radius:28px;background:linear-gradient(160deg,rgba(14,22,52,.82),rgba(14,22,52,.55));backdrop-filter:blur(8px);border:2px solid var(--accent);box-shadow:0 0 40px -10px var(--accent);animation:pop .8s cubic-bezier(.2,1.3,.4,1) both;z-index:5}
.vpanel.left{left:${V.sideMarginVw}vw}
.vpanel.right{right:${V.sideMarginVw}vw}
@keyframes pop{from{opacity:0;transform:translateX(var(--from,-40px)) rotate(-4deg) scale(.9)}to{opacity:1;transform:none}}
.vpanel.right{--from:40px}
.vpanel h3{margin:0;font-size:clamp(1.1rem,1.9vw,1.8rem);font-weight:600;color:var(--accent)}
.photos{display:flex;flex-wrap:wrap;gap:1vw;justify-content:center}
.polaroid{position:relative;margin:0;padding:.6vw .6vw 0;background:#fffaf0;border-radius:6px;box-shadow:0 8px 20px rgba(0,0,0,.45);flex:1 1 9vw;max-width:14vw;min-width:96px;transition:transform .3s}
.polaroid:hover{transform:rotate(0) scale(1.05)!important}
.polaroid img,.ph-missing{display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:3px;background:#2a3358}
.ph-missing{display:grid;place-items:center;padding:6px;font-size:.7rem;color:#cfd8ff;text-align:center}
.polaroid figcaption{color:#2a2118;font-weight:600;font-size:clamp(.75rem,1vw,1rem);text-align:center;padding:.5vh 0 .8vh}
.tape{position:absolute;top:-9px;left:50%;width:42%;height:16px;transform:translateX(-50%) rotate(-3deg);background:rgba(246,211,166,.7);border-radius:2px}
.fact{margin:0;font-size:clamp(.85rem,1.2vw,1.1rem);line-height:1.4;color:#eaf0ff;font-weight:400}
.stat{display:flex;flex-direction:column;align-items:center;text-align:center}
.stat b{font-size:clamp(2rem,4.5vw,4.5rem);line-height:1;color:var(--accent)}
.stat span{font-family:${F.label};font-size:clamp(.7rem,1vw,.95rem);color:#cfd8ff}
.thermo{display:flex;align-items:center;gap:1.2vw;justify-content:center}
.tube{width:22px;height:11vh;border-radius:12px;background:#1c274e;overflow:hidden;position:relative;border:2px solid #fff3}
.tube i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(0deg,#4aa8ff,#ff6b4a);animation:rise 4s ease-in-out infinite alternate}
@keyframes rise{from{height:8%}to{height:96%}}
.thermo ul{list-style:none;margin:0;padding:0;font-weight:600;font-size:clamp(1rem,1.7vw,1.6rem)}
.thermo .hot{color:#ff9d6e}.thermo .cold{color:#8ec5ff}
.thermo small{font-family:${F.label};font-size:.6em;opacity:.8;font-weight:400}

.info{position:absolute;top:${I.top}px;right:${I.right}px;width:${I.sizePx}px;height:${I.sizePx}px;border-radius:50%;overflow:hidden;padding:0;cursor:pointer;border:${I.borderPx}px solid ${C.infoBorder};box-shadow:0 0 0 4px rgba(246,211,166,.25),0 0 30px rgba(246,211,166,.4);animation:ring 2.8s ease-in-out infinite;z-index:8;background:#000}
.info video{width:100%;height:100%;object-fit:cover;display:block}
.info span{position:absolute;inset:0;display:grid;place-items:center;padding:14%;text-align:center;font:600 .85rem/1.15 ${F.display};color:#fff;text-shadow:0 2px 6px #000;background:rgba(5,7,15,.38);transition:background .2s}
.info:hover span,.info:focus-visible span{background:rgba(5,7,15,.15)}
@keyframes ring{50%{box-shadow:0 0 0 12px rgba(246,211,166,.1),0 0 44px rgba(246,211,166,.6)}}

.subs{position:absolute;left:${S.sideVw}vw;right:${S.sideVw}vw;bottom:${S.bottomVh}vh;display:flex;gap:1.2vw;align-items:center;z-index:6}
.subs.right{justify-content:flex-end}
.bubble{flex:1;padding:2.2vh 2.4vw;border-radius:${S.radiusPx}px;border:1px solid rgba(255,255,255,.18);box-shadow:0 14px 40px rgba(0,0,0,.45);animation:slideIn .35s ease-out both}
.bubble.odyssey{background:linear-gradient(100deg,${C.odysseyBoxA},${C.odysseyBoxB})}
.bubble.child{background:linear-gradient(100deg,${C.childBoxA},${C.childBoxB})}
.bubble small{display:block;font-family:${F.label};font-size:${S.labelSize};letter-spacing:.3em;margin-bottom:.8vh}
.bubble.odyssey small{color:${C.odysseyLabel}}
.bubble.child small{color:${C.childLabel}}
.bubble p{margin:0;font-size:${S.textSize};font-weight:500;line-height:1.25}
.bubble p span{transition:opacity .25s}
@keyframes slideIn{from{opacity:0;transform:translateY(14px)}}
.skip{font:700 clamp(.9rem,1.5vw,1.4rem) ${F.label};letter-spacing:.2em;color:#fff;background:linear-gradient(180deg,#e04848,${C.skip});border:0;border-radius:26px;padding:2.6vh 2.2vw;cursor:pointer;box-shadow:0 8px 24px rgba(210,58,58,.4);transition:transform .15s}
.skip:hover,.skip:focus-visible{transform:scale(1.06);outline:2px solid #fff}

.tap{position:absolute;left:50%;top:14%;transform:translateX(-50%);z-index:40;font:600 clamp(1rem,1.8vw,1.6rem) ${F.display};color:#fff;background:${C.skip};border:3px solid #fff;border-radius:999px;padding:.7em 1.6em;cursor:pointer;animation:pulse 1.4s infinite}
.modal{position:absolute;inset:0;background:rgba(0,0,0,.82);display:grid;place-items:center;z-index:30;animation:slideIn .3s both}
.modal-card{position:relative;width:min(80vw,1100px);border-radius:28px;overflow:hidden;border:4px solid ${C.infoBorder}}
.modal-card video{display:block;width:100%;background:#000}
.modal-card button{position:absolute;top:12px;right:12px;width:42px;height:42px;border-radius:50%;border:0;background:${C.skip};color:#fff;font-size:1.1rem;cursor:pointer}

@media (max-width:800px){
  .info{width:${I.mobileSizePx}px;height:${I.mobileSizePx}px}.info span{font-size:.65rem}
  .vpanel{width:44vw;max-width:none;top:${V.topPct + 8}%}
  .bubble{padding:1.6vh 4vw}.skip{padding:2vh 3vw}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
}
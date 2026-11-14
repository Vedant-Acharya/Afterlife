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

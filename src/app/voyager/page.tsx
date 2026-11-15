"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { animate } from "motion";

interface SubGroup {
  lines: string[];
  holdSec: number; 
  typewriter?: boolean; 
  font: "ui" | "display";
  size: string;
  weight: number;
  italic: boolean;
  letterSpacing: string;
  lineGap: string;
  lineOpacities?: number[]; 
  sfx?: "transmit" | "static"; 
}

interface CreditItem {
  name: string; 
  url?: string; 
  note?: string; 
}
interface CreditSection {
  heading: string;
  items: CreditItem[];
}

const CONFIG = {
  theme: {
    background: "#000000",
    text: "#ffffff",
    textDim: "rgba(255,255,255,0.55)",
    accent: "#9fd8ff", 
    fontDisplay: `"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif`,
    fontUI: `"Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif`,
  },


  title: {
    eyebrow: "Chapter 4:",
    headline: "Lightyears Away",
    eyebrowSize: "clamp(1.4rem, 3.4vw, 3rem)",
    eyebrowWeight: 300,
    eyebrowOpacity: 0.7,
    eyebrowLetterSpacing: "0.02em",
    headlineSize: "clamp(3.6rem, 13vw, 14rem)",
    headlineWeight: 300,
    headlineLetterSpacing: "-0.035em",
    headlineLineHeight: 0.95,
    gapBetweenLines: "0.4rem",
    introDuration: 0.9, 
    introStagger: 0.18, 
    introBlur: 10, 
    introRise: 18, 
    buttonText: "Click to continue",
    buttonDelay: 0.9,
    buttonSize: "clamp(0.85rem, 1.1vw, 1rem)",
    buttonLetterSpacing: "0.14em",
    buttonLineWidth: "3.5rem",
    buttonPulseSeconds: 2.8,
    buttonBottom: "11vh",
    exitFadeSeconds: 0.25,
  },

  wormhole: {
    durationSec: 0.7,
    progressEase: "linear" as "linear" | "easeIn" | "easeOut" | "easeInOut",
    tunnelRadius: 2.5,
    tunnelLength: 170,
    radialSegments: 96,
    lengthSegments: 64,
    baseFov: 40,
    fovPunch: 52, 
    cameraZ: 10,
    speedMin: 3,
    speedMax: 30,
    flashStrength: 0.85,
    flashCenter: 0.83,
    flashWidth: 0.045,
    fadeInStart: 0.05,
    fadeInEnd: 0.28,
    fadeOutStart: 0.82,
    fadeOutEnd: 1.0,
    colorDeep: "#020a33", 
    colorBlue: "#1f6bff",
    colorYellow: "#ffc72c", 
    colorWhite: "#fffaf0",
    colorStreak: "#dff0ff", 
    colorFlash: "#fff1b8",
    cssZoomFrom: 1.0,
    cssZoomTo: 1.14,
    cssVignette: 0.55, 
    cssFadeInSec: 0.06,
  },

  space: {
    fadeInSec: 1.2,
    nebulaOpacity: 0.16, 
    nebulaColorA: "#2a2c8f",
    nebulaColorB: "#5a1f7a",
    vignette: 0.6,
    starLayers: [
      { count: 260, size: 1, streakPx: 2, opacity: 0.5, driftSeconds: 16, glowPx: 0 },
      { count: 110, size: 1.4, streakPx: 14, opacity: 0.8, driftSeconds: 8, glowPx: 0 },
      { count: 40, size: 2, streakPx: 44, opacity: 1.0, driftSeconds: 3.6, glowPx: 6 },
    ],
    finalBeatSec: 7,
    finalStarRate: 0.08,
    finalCloseIn: 0.85, 
    finalHudOpacity: 0.3,
    tiltDeg: -6, 
    speedMultiplier: 1, 
    warpBoost: 7, 
    warpEaseSec: 3.2, 
    starSeed: 41,
  },

  voyager: {
    modelUrl: "/models/Voyager.glb",
    modelSize: 5.2, 
    cameraFov: 32,
    cameraZ: 14,
    startPosition: [-24, 9, -70] as [number, number, number],
    restPosition: [0, 1.6, 0] as [number, number, number],
    startRotation: [0.7, -1.6, 0.35] as [number, number, number],
    restRotation: [0.28, 0.65, 0.0] as [number, number, number],
    flyInSec: 2.6,
    flyInEase: [0.12, 0.85, 0.25, 1] as [number, number, number, number],
    finalPullbackZ: 5, 
    finalSunScale: 0.2, 
    idleSpinPerSec: 0.0,
    idleYawSway: 0.14,
    idleRollSway: 0.05,
    idleSwaySpeed: 0.7,
    idleDriftX: 0.12, 
    idleBobAmplitude: 0.12,
    idleBobSpeed: 0.55,
    idleBlendSec: 1.2,
    sunColor: "#fff1d6",
    sunIntensity: 3.2,
    sunPosition: [8, 6, 10] as [number, number, number],
    rimColor: "#4a7dff",
    rimIntensity: 1.6,
    rimPosition: [-8, -2, -6] as [number, number, number],
    ambientIntensity: 0.12,
    envIntensity: 0.35,
    exposure: 1.0,
    maxPixelRatio: 2,
  },

  subtitles: {
    startDelaySec: 0.9, 
    fadeInSec: 0.4,
    fadeOutSec: 0.4,
    gapSec: 0.1,
    lineStaggerSec: 0.1, 
    blurPx: 6,
    risePx: 8,
    bottom: "11vh",
    maxWidth: "44ch",
    backdropOpacity: 0.55,
    typeCharsPerSec: 15,
    typeJitter: 0.5,
    typeWordPauseSec: 0.06,
    typePunctPauseSec: 0.4,
    typeStartPauseSec: 0.35,
    beforeTypewriterSilenceSec: 0.9,
    caretWidthPx: 2,
    caretBlinkSec: 0.9,
    groups: [
      {
        lines: ["Sending message to Earth", "Awaiting response in 48hours"],
        sfx: "transmit",
        holdSec: 1.4,
        font: "ui",
        size: "clamp(0.95rem, 1.7vw, 1.4rem)",
        weight: 300,
        italic: false,
        letterSpacing: "0.06em",
        lineGap: "0.6rem",
        lineOpacities: [0.6, 1],
      },
      {
        lines: ["Message saying", "No one has found me till now."],
        sfx: "static",
        holdSec: 1.8,
        font: "display",
        size: "clamp(1.3rem, 2.7vw, 2.3rem)",
        weight: 300,
        italic: true,
        letterSpacing: "0.015em",
        lineGap: "0.45rem",
        lineOpacities: [0.6, 1],
      },
      {
        lines: ["I guess we are alone in this universe…"],
        holdSec: 2.2,
        typewriter: true,
        font: "display",
        size: "clamp(1.6rem, 3.6vw, 3.1rem)",
        weight: 300,
        italic: true,
        letterSpacing: "0.01em",
        lineGap: "0.4rem",
      },
    ] as SubGroup[],
  },

  ending: {
    blackoutSec: 1.2, 
    holdBlackSec: 0.15,
    videoCandidates: [
      "/videos/theend.mp4",
    ],
    advanceToCreditsOnVideoError: false, 
    videoFit: "contain" as "contain" | "cover",
    videoFadeInSec: 0.6,
    videoFadeOutSec: 0.4,
    drumsFadeInSec: 2.5,
    creditsGapSec: 1.0, 
    audioCandidates: [
      "/audios/drums.mp3",
    ],
    audioVolume: 1,
    drumsContinueIntoCredits: true,
  },

  earth: {
    x: 0.1,
    y: 0.72,
    sizePx: 5,
    color: "#8fc8ff",
    glowPx: 18,
    opacity: 0.9,
    label: "Home",
    labelSize: "clamp(0.7rem, 1vw, 0.9rem)",
    fadeInDelaySec: 0.4,
    shrinkTo: 0.55, 
    shrinkSec: 14,
    pulseSec: 2.6,
    lineOpacity: 0.35,
    ringMax: 170,
  },

  mission: {
    label: "In flight since 5 September 1977",
    launchIso: "1977-09-05T12:56:00Z",
    top: "clamp(1.1rem, 3.2vw, 2.6rem)",
    left: "clamp(1.1rem, 3.2vw, 2.8rem)",
    labelSize: "clamp(0.72rem, 1vw, 0.9rem)",
    valueSize: "clamp(1.1rem, 2vw, 1.7rem)",
    fadeInDelaySec: 1.1,
    fadeInSec: 0.9,
  },

  grain: { opacity: 0.07 },

  sfx: {
    enabled: true,
    master: 0.9,
    reverbSeconds: 3.4,
    reverbDecay: 2.6,
    reverbWet: 0.6,
    clickLevel: 0.9,
    wormholeLevel: 0.9,
    flybyLevel: 0.6,
    droneLevel: 0.22,
    padLevel: 0.55,
    droneFadeInSec: 3,
    chordSeconds: 4.2,
    blipLevel: 0.6,
    pingLevel: 0.55,
    staticLevel: 0.16,
    tickLevel: 0.7,
    bellLevel: 0.34,
  },

  hud: {
    label: "Voyager 1: distance from Earth",
    baseKm: 25902068371,
    baseTimeIso: "2026-11-18T10:16:07Z",
    speedKmPerSec: 17,
    updateEveryMs: 50,
    top: "clamp(1.1rem, 3.2vw, 2.6rem)",
    right: "clamp(1.1rem, 3.2vw, 2.8rem)",
    labelSize: "clamp(0.72rem, 1vw, 0.9rem)",
    valueSize: "clamp(1.3rem, 2.6vw, 2.2rem)",
    detailSize: "clamp(0.68rem, 0.95vw, 0.85rem)",
    fadeInDelaySec: 0.9,
    fadeInSec: 0.9,
  },

  credits: {
    fadeInSec: 1.5,
    startDelaySec: 1.2, 
    speedPxPerSec: 200, 
    pauseOnHover: true,
    columnWidth: "min(46rem, 88vw)",
    edgeFadeVh: 20, 
    titleText: "Sources & Acknowledgements",
    titleSize: "clamp(2rem, 5.2vw, 4.4rem)",
    subtitleText: "Chapter 4: Lightyears Away",
    headingSize: "clamp(1rem, 1.6vw, 1.35rem)",
    headingGap: "5.5rem", 
    itemSize: "clamp(1.15rem, 2vw, 1.7rem)",
    itemGap: "1.6rem",
    urlSize: "clamp(0.7rem, 0.95vw, 0.85rem)",
    noteSize: "clamp(0.75rem, 1vw, 0.9rem)",
    closingText: "THE END?",
    closingSize: "clamp(3rem, 20vw, 20.2rem)",
    closingFadeInSec: 3,
    closingDelaySec: 0.8,

    sections: [
      {
        heading: "Mission data & science",
        items: [
          { name: "NASA Voyager Mission", url: "https://science.nasa.gov/mission/voyager/", note: "Mission overview and status" },
          { name: "NASA / JPL Voyager", url: "https://voyager.jpl.nasa.gov/", note: "Spacecraft and mission history" },
          {
            name: "Voyager 1",
            url: "https://earthsky.org/space/voyager-1-1-light-day-from-earth-november-17-18-2026/",
            note: "EarthSky",
          },
          {
            name: "3D resources",
            url: "https://science.nasa.gov/3d-resources/",
            note: "NASA 3D models and textures",
          },
          {
            name: "Spirit traverse map",
            url: "https://www.jpl.nasa.gov/images/pia13730-spirit-traverse-map-sol-2471/",
            note: "NASA JPL mission map",
          },
          {
            name: "Apollo 11 Mission data",
            url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C",
            note: "Apollo 11",
          },
          {
            name: "Mars Pathfinder Mission data",
            url: "https://science.nasa.gov/mission/mars-pathfinder/",
            note: "Mars Pathfinder",
          },
          {
            name: "Spirit & Opportunity Mission data",
            url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
            note: "Spirit & Opportunity",
          },
          //TODO
        ],
      },
      {
        heading: "Made for",
        items: [{ name: "NASA International Space Apps Challenge", url: "https://www.spaceappschallenge.org/" }],
      },
      {
        heading: "DISCLAIMER",
        items: [{ name: "This project is made for NASA Space Apps Challenge 2026 and is not affliated with NASA or JPL in any way.", url: "/" }],
      },
    ] as CreditSection[],
  },
};


type SceneName = "title" | "wormhole" | "voyager" | "ending" | "credits";

const hexToVec3 = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (!mat) return;
    (Array.isArray(mat) ? mat : [mat]).forEach((m) => {
      Object.values(m as unknown as Record<string, unknown>).forEach((v) => {
        if (v instanceof THREE.Texture) v.dispose();
      });
      m.dispose();
    });
  });
}


const GLSL_NOISE_3D = `
float hash31(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
        mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
        mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}
`;

function createWormhole() {
  const W = CONFIG.wormhole;
  const L = W.tunnelLength;

  const geometry = new THREE.CylinderGeometry(
    W.tunnelRadius,
    W.tunnelRadius,
    L,
    W.radialSegments,
    W.lengthSegments,
    true
  );
  geometry.rotateX(Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uSpeed: { value: W.speedMin },
      uFlash: { value: 0 },
      uDeep: { value: new THREE.Vector3(...hexToVec3(W.colorDeep)) },
      uBlue: { value: new THREE.Vector3(...hexToVec3(W.colorBlue)) },
      uYellow: { value: new THREE.Vector3(...hexToVec3(W.colorYellow)) },
      uWhite: { value: new THREE.Vector3(...hexToVec3(W.colorWhite)) },
      uStreak: { value: new THREE.Vector3(...hexToVec3(W.colorStreak)) },
      uFlashColor: { value: new THREE.Vector3(...hexToVec3(W.colorFlash)) },
    },
    side: THREE.BackSide,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uSpeed;
      uniform float uFlash;
      uniform vec3 uDeep;
      uniform vec3 uBlue;
      uniform vec3 uYellow;
      uniform vec3 uWhite;
      uniform vec3 uStreak;
      uniform vec3 uFlashColor;
      varying vec2 vUv;

      ${GLSL_NOISE_3D}

      void main() {
        float ang = vUv.x * 6.2831853;
        float depth = 1.0 - vUv.y;
        float d = depth * ${L.toFixed(1)};
        float travel = uTime * uSpeed;

        float twist = ang + d * 0.012 + uTime * 0.35;
        vec2 pc = vec2(cos(twist), sin(twist));

        float along = d * 0.06 + travel;
        float n1 = noise3(vec3(pc * 2.2, along * 0.9));
        float n2 = noise3(vec3(pc * 5.0 + 3.0, along * 1.7));
        float swirl = 0.6 * n1 + 0.4 * n2;

        float rings = pow(0.5 + 0.5 * sin(along * 3.2 + swirl * 5.0), 5.0);
        float streak = pow(noise3(vec3(cos(ang) * 26.0, sin(ang) * 26.0, along * 0.35)), 9.0) * 3.0;

        vec3 col = mix(uDeep, uBlue, smoothstep(0.2, 0.75, swirl));
        // yellow rings with a white-hot core where they are strongest
        vec3 ringCol = mix(uYellow, uWhite, smoothstep(0.55, 1.0, rings));
        col = mix(col, ringCol, rings * 0.85);
        col += uStreak * streak;

        float far = smoothstep(0.35, 1.0, depth);
        col = mix(col, uWhite, far * far);
        col += uWhite * far * far * far * 1.2;
        col += uFlashColor * uFlash;

        float a = clamp(uIntensity + uFlash, 0.0, 1.0);
        gl_FragColor = vec4(col, a);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 20 - L / 2;
  mesh.renderOrder = 10;
  mesh.frustumCulled = false;

  return {
    mesh,
    set(time: number, intensity: number, speed: number, flash: number) {
      mesh.visible = intensity > 0.001 || flash > 0.001;
      material.uniforms.uTime.value = time;
      material.uniforms.uIntensity.value = intensity;
      material.uniforms.uSpeed.value = speed;
      material.uniforms.uFlash.value = flash;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}


const PAD_PROGRESSION: number[][] = [
  [220.0, 261.63, 329.63], // Am
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 392.0], // G
  [220.0, 261.63, 329.63], // Am
  [146.83, 220.0, 261.63, 349.23], // Dm
  [164.81, 246.94, 329.63], // Em
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63, 329.63],
];

function createSfx() {
  if (typeof window === "undefined" || !CONFIG.sfx.enabled) return null;
  const C = CONFIG.sfx;
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = C.master;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 4;
  master.connect(comp);
  comp.connect(ctx.destination);

  const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * C.reverbSeconds), ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = impulse.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, C.reverbDecay);
  }
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse;
  const reverbIn = ctx.createGain();
  const reverbOut = ctx.createGain();
  reverbOut.gain.value = C.reverbWet;
  reverbIn.connect(reverb);
  reverb.connect(reverbOut);
  reverbOut.connect(master);

  const ambBus = ctx.createGain();
  ambBus.gain.value = 0.0001;
  const ambSend = ctx.createGain();
  ambSend.gain.value = 0.5;
  ambBus.connect(master);
  ambBus.connect(ambSend);
  ambSend.connect(reverbIn);

  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  {
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const noise = (loop: boolean) => {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = loop;
    return s;
  };

  const sources: AudioScheduledSourceNode[] = [];
  const track = <T extends AudioScheduledSourceNode>(n: T) => {
    sources.push(n);
    return n;
  };

  const route = (node: AudioNode, send = 0.25, dest: AudioNode = master) => {
    node.connect(dest);
    if (send > 0) {
      const s = ctx.createGain();
      s.gain.value = send;
      node.connect(s);
      s.connect(reverbIn);
    }
  };
  const env = (g: GainNode, t: number, attack: number, peak: number, decay: number) => {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  };
  const tone = (type: OscillatorType, f0: number, f1: number, t: number, dur: number) => {
    const o = track(ctx.createOscillator());
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    return o;
  };

  const click = () => {
    const t = ctx.currentTime;
    const g = ctx.createGain();
    env(g, t, 0.006, 0.9 * C.clickLevel, 0.5);
    const o = tone("sine", 95, 36, t, 0.45);
    o.connect(g);
    route(g, 0.35);
    o.start(t);
    o.stop(t + 0.7);
    const n = noise(false);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3200;
    const ng = ctx.createGain();
    env(ng, t, 0.002, 0.12 * C.clickLevel, 0.05);
    n.connect(hp);
    hp.connect(ng);
    route(ng, 0.1);
    track(n).start(t);
    n.stop(t + 0.1);
  };

  const wormhole = (dur: number) => {
    const t = ctx.currentTime;
    const L = C.wormholeLevel;
    const n = noise(true);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(180, t);
    bp.frequency.exponentialRampToValueAtTime(7500, t + dur * 0.85);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.linearRampToValueAtTime(0.55 * L, t + dur * 0.8);
    ng.gain.linearRampToValueAtTime(0.0001, t + dur * 1.05);
    n.connect(bp);
    bp.connect(ng);
    route(ng, 0.3);
    track(n).start(t);
    n.stop(t + dur * 1.1);

    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.linearRampToValueAtTime(0.22 * L, t + dur * 0.8);
    og.gain.linearRampToValueAtTime(0.0001, t + dur * 1.0);
    const o = tone("sawtooth", 70, 1100, t, dur * 0.85);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    o.connect(lp);
    lp.connect(og);
    route(og, 0.2);
    o.start(t);
    o.stop(t + dur * 1.05);

    // the boom at the white flash
    const tb = t + dur * 0.83;
    const bg = ctx.createGain();
    env(bg, tb, 0.01, 0.95 * L, 1.6);
    const bo = tone("sine", 70, 26, tb, 1.4);
    bo.connect(bg);
    route(bg, 0.45);
    bo.start(tb);
    bo.stop(tb + 1.8);
    [2400, 3200, 4800].forEach((f, i) => {
      const sg = ctx.createGain();
      env(sg, tb, 0.02, 0.05 * L, 1.4 + i * 0.3);
      const so = tone("sine", f, f * 0.97, tb, 1.5);
      so.connect(sg);
      route(sg, 0.8);
      so.start(tb);
      so.stop(tb + 2.2);
    });
  };

  const playChord = (freqs: number[], t: number, dur: number) => {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(C.padLevel * 0.09, t + dur * 0.45);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    lp.connect(g);
    g.connect(ambBus);
    freqs.forEach((f) =>
      [0, 6].forEach((det, k) => {
        const o = track(ctx.createOscillator());
        o.type = k ? "triangle" : "sine";
        o.frequency.value = f;
        o.detune.value = det;
        const og = ctx.createGain();
        og.gain.value = 1 / freqs.length;
        o.connect(og);
        og.connect(lp);
        o.start(t);
        o.stop(t + dur + 0.1);
      })
    );
  };

  const startAmbient = () => {
    const t = ctx.currentTime;
    ambBus.gain.cancelScheduledValues(t);
    ambBus.gain.setValueAtTime(0.0001, t);
    ambBus.gain.linearRampToValueAtTime(1, t + C.droneFadeInSec);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    lp.Q.value = 0.8;
    const lfo = track(ctx.createOscillator());
    lfo.frequency.value = 0.09;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 220;
    lfo.connect(lfoG);
    lfoG.connect(lp.frequency);
    lfo.start(t);
    const droneG = ctx.createGain();
    droneG.gain.value = C.droneLevel;
    lp.connect(droneG);
    droneG.connect(ambBus);
    const voices: [number, OscillatorType, number, number][] = [
      [55, "sine", 0.9, 0],
      [82.41, "sawtooth", 0.3, -7],
      [110, "triangle", 0.5, 5],
      [164.81, "sine", 0.22, 3],
    ];
    voices.forEach(([f, type, gain, det]) => {
      const o = track(ctx.createOscillator());
      o.type = type;
      o.frequency.value = f;
      o.detune.value = det;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(g);
      g.connect(lp);
      o.start(t);
    });
    PAD_PROGRESSION.forEach((chord, i) => playChord(chord, t + 0.6 + i * C.chordSeconds, C.chordSeconds * 1.2));
  };

  const rampAmbient = (to: number, sec: number) => {
    const t = ctx.currentTime;
    ambBus.gain.cancelScheduledValues(t);
    ambBus.gain.setValueAtTime(Math.max(ambBus.gain.value, 0.0001), t);
    ambBus.gain.linearRampToValueAtTime(Math.max(to, 0.0001), t + sec);
  };

  const flyby = (dur: number) => {
    const t = ctx.currentTime;
    const L = C.flybyLevel;
    const n = noise(true);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(260, t);
    bp.frequency.exponentialRampToValueAtTime(2200, t + dur * 0.5);
    bp.frequency.exponentialRampToValueAtTime(320, t + dur * 1.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.7 * L, t + dur * 0.5);
    g.gain.linearRampToValueAtTime(0.0001, t + dur * 1.6);
    const pan = ctx.createStereoPanner();
    pan.pan.setValueAtTime(-0.95, t);
    pan.pan.linearRampToValueAtTime(0, t + dur * 0.9);
    n.connect(bp);
    bp.connect(g);
    g.connect(pan);
    route(pan, 0.4);
    track(n).start(t);
    n.stop(t + dur * 1.7);

    const rg = ctx.createGain();
    rg.gain.setValueAtTime(0.0001, t);
    rg.gain.linearRampToValueAtTime(0.5 * L, t + dur * 0.55);
    rg.gain.linearRampToValueAtTime(0.0001, t + dur * 1.7);
    const ro = tone("triangle", 62, 38, t, dur * 1.6);
    ro.connect(rg);
    route(rg, 0.3);
    ro.start(t);
    ro.stop(t + dur * 1.75);
  };


  const blips = () => {
    const t = ctx.currentTime;
    for (let i = 0; i < 9; i++) {
      const tt = t + i * 0.08 + Math.random() * 0.03;
      const g = ctx.createGain();
      env(g, tt, 0.004, 0.09 * C.blipLevel, 0.05);
      const o = tone("sine", 1000 + Math.random() * 1100, 1000 + Math.random() * 1100, tt, 0.05);
      o.connect(g);
      route(g, 0.2);
      o.start(tt);
      o.stop(tt + 0.1);
    }
  };
  const ping = () => {
    const t = ctx.currentTime;
    [[1320, 0.22], [1980, 0.07], [660, 0.1]].forEach(([f, a]) => {
      const g = ctx.createGain();
      env(g, t, 0.004, a * C.pingLevel, 3.2);
      const o = tone("sine", f, f, t, 3.4);
      o.connect(g);
      route(g, 0.9);
      o.start(t);
      o.stop(t + 3.6);
    });
  };


  let staticState: { src: AudioBufferSourceNode; gIn: GainNode; timer: ReturnType<typeof setInterval> } | null = null;
  const staticOff = (fade: number) => {
    if (!staticState) return;
    const s = staticState;
    staticState = null;
    clearInterval(s.timer);
    s.gIn.gain.cancelScheduledValues(ctx.currentTime);
    s.gIn.gain.setTargetAtTime(0, ctx.currentTime, Math.max(fade / 4, 0.02));
    setTimeout(() => {
      try {
        s.src.stop();
      } catch {
        /* already stopped */
      }
    }, fade * 1000 + 300);
  };
  const staticOn = () => {
    staticOff(0.01);
    const t = ctx.currentTime;
    const src = track(noise(true));
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3200;
    bp.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.value = 0;
    const gIn = ctx.createGain();
    gIn.gain.setValueAtTime(0.0001, t);
    gIn.gain.linearRampToValueAtTime(1, t + 0.5);
    src.connect(hp);
    hp.connect(bp);
    bp.connect(g);
    g.connect(gIn);
    route(gIn, 0.12);
    src.start(t);
    const timer = setInterval(() => {
      const lvl = C.staticLevel * (0.2 + 0.8 * Math.pow(Math.random(), 2)) * (Math.random() < 0.08 ? 2.4 : 1);
      g.gain.setTargetAtTime(lvl, ctx.currentTime, 0.012);
    }, 55);
    staticState = { src, gIn, timer };
  };


  const tick = (ch: string) => {
    const t = ctx.currentTime;
    const sp = ch === " ";
    const n = noise(false);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = sp ? 1400 : 2600 + Math.random() * 900;
    bp.Q.value = 1.6;
    const g = ctx.createGain();
    env(g, t, 0.001, C.tickLevel * (sp ? 0.18 : 0.32), 0.04);
    n.connect(bp);
    bp.connect(g);
    route(g, 0.14);
    track(n).start(t, Math.random() * 1.5);
    n.stop(t + 0.08);
    const og = ctx.createGain();
    env(og, t, 0.001, C.tickLevel * (sp ? 0.16 : 0.08), 0.06);
    const o = tone("sine", sp ? 95 : 150 + Math.random() * 40, 60, t, 0.06);
    o.connect(og);
    route(og, 0.1);
    o.start(t);
    o.stop(t + 0.1);
  };


  const bell = (f: number, t: number, vel: number) => {
    const car = tone("sine", f, f, t, 4);
    const mod = tone("sine", f * 2.01, f * 2.01, t, 4);
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(f * 1.6, t);
    mg.gain.exponentialRampToValueAtTime(0.5, t + 1.6);
    mod.connect(mg);
    mg.connect(car.frequency);
    const g = ctx.createGain();
    env(g, t, 0.006, vel * C.bellLevel, 3.6);
    car.connect(g);
    route(g, 0.85);
    car.start(t);
    mod.start(t);
    car.stop(t + 4.2);
    mod.stop(t + 4.2);
  };
  const finalMelody = () => {
    const t = ctx.currentTime;
    ([[880, 0], [659.25, 1.5], [783.99, 2.9], [523.25, 4.6], [440, 6.6]] as [number, number][]).forEach(
      ([f, dt], i) => bell(f, t + dt, 0.55 - i * 0.05)
    );
  };



  const subDrop = () => {
    const t = ctx.currentTime;
    const g = ctx.createGain();
    env(g, t, 0.05, 0.7, 2.6);
    const o = tone("sine", 58, 24, t, 2.4);
    o.connect(g);
    route(g, 0.4);
    o.start(t);
    o.stop(t + 3);
  };

  return {
    ctx,
    resume: () => ctx.resume(),
    click,
    wormhole,
    startAmbient,
    flyby,
    blips,
    ping,
    staticOn,
    staticOff,
    tick,
    finalMelody,
    subDrop,
    duckAmbient: (to: number, sec: number) => rampAmbient(to, sec),
    fadeAmbient: (sec: number) => rampAmbient(0, sec),
    dispose: () => {
      staticOff(0.01);
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* not started / already stopped */
        }
      });
      ctx.close().catch(() => undefined);
    },
  };
}
type Sfx = NonNullable<ReturnType<typeof createSfx>>;



function GlobalStyles() {
  const T = CONFIG.title;
  return (
    <style>{`
      html, body { margin: 0; background: ${CONFIG.theme.background}; }
      @keyframes ch4-pulse {
        0%, 100% { opacity: 0.35; }
        50%      { opacity: 1; }
      }
      @keyframes ch4-line {
        0%, 100% { transform: scaleX(0.35); opacity: 0.4; }
        50%      { transform: scaleX(1);    opacity: 1; }
      }
      @keyframes ch4-drift {
        from { transform: translate3d(0, 0, 0); }
        to   { transform: translate3d(-100%, 0, 0); }
      }
      @keyframes ch4-caret {
        0%, 45%   { opacity: 1; }
        55%, 100% { opacity: 0; }
      }
      .ch4-caret { animation: ch4-caret 0.9s steps(1, end) infinite; }
      @keyframes ch4-grain {
        0%   { transform: translate(0, 0); }
        20%  { transform: translate(-6%, 4%); }
        40%  { transform: translate(5%, -7%); }
        60%  { transform: translate(-4%, -3%); }
        80%  { transform: translate(7%, 5%); }
        100% { transform: translate(0, 0); }
      }
      .ch4-grain { animation: ch4-grain 0.7s steps(1, end) infinite; }
      .ch4-credit-link {
        position: relative;
        display: inline-block;
        padding: 0.45rem 1.1rem;
        color: inherit;
        text-decoration: none;
        border-radius: 3px;
        background-image: linear-gradient(90deg, ${CONFIG.theme.accent}33, ${CONFIG.theme.accent}0d);
        background-repeat: no-repeat;
        background-position: left center;
        background-size: 0% 100%;
        transition: background-size 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.25s ease, text-shadow 0.25s ease;
      }
      .ch4-credit-link::after {
        content: "";
        position: absolute;
        left: 1.1rem;
        right: 1.1rem;
        bottom: 0.25rem;
        height: 1px;
        background: ${CONFIG.theme.accent};
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .ch4-credit-link:hover, .ch4-credit-link:focus-visible {
        background-size: 100% 100%;
        color: #fff;
        text-shadow: 0 0 22px ${CONFIG.theme.accent};
        outline: none;
      }
      .ch4-credit-link:hover::after, .ch4-credit-link:focus-visible::after { transform: scaleX(1); }
      .ch4-credit-link .ch4-credit-url { transition: color 0.25s ease; }
      .ch4-credit-link:hover .ch4-credit-url, .ch4-credit-link:focus-visible .ch4-credit-url { color: ${CONFIG.theme.accent}; }
      .ch4-prompt { animation: ch4-pulse ${T.buttonPulseSeconds}s ease-in-out infinite; }
      .ch4-prompt-line { animation: ch4-line ${T.buttonPulseSeconds}s ease-in-out infinite; transform-origin: center; }
      @media (prefers-reduced-motion: reduce) {
        .ch4-prompt, .ch4-prompt-line, .ch4-stars, .ch4-caret, .ch4-grain { animation: none !important; }
      }
    `}</style>
  );
}



function SceneTitle({ onActivate, onContinue }: { onActivate: () => void; onContinue: () => void }) {
  const T = CONFIG.title;
  const rootRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const clicked = useRef(false);

  useEffect(() => {
    const kf = {
      opacity: [0, 1],
      y: [T.introRise, 0],
      filter: [`blur(${T.introBlur}px)`, "blur(0px)"],
    };
    const ctrls = [
      animate(eyebrowRef.current!, { ...kf, opacity: [0, T.eyebrowOpacity] }, {
        duration: T.introDuration,
        ease: "easeOut",
      }),
      animate(headRef.current!, kf, {
        duration: T.introDuration,
        delay: T.introStagger,
        ease: "easeOut",
      }),
      animate(promptRef.current!, { opacity: [0, 1] }, {
        duration: 1.2,
        delay: T.buttonDelay,
      }),
    ];
    return () => ctrls.forEach((c) => c.stop());
  }, [T]);

  const go = () => {
    if (clicked.current) return;
    clicked.current = true;
    onActivate(); 
    animate(rootRef.current!, { opacity: [1, 0] }, { duration: T.exitFadeSeconds });
    setTimeout(onContinue, T.exitFadeSeconds * 1000);
  };

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label={T.buttonText}
      onClick={go}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go()}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        cursor: "pointer",
        background: CONFIG.theme.background,
        color: CONFIG.theme.text,
        outline: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        ref={eyebrowRef}
        style={{
          opacity: 0,
          fontFamily: CONFIG.theme.fontDisplay,
          fontSize: T.eyebrowSize,
          fontWeight: T.eyebrowWeight,
          letterSpacing: T.eyebrowLetterSpacing,
          fontStyle: "italic",
          marginBottom: T.gapBetweenLines,
        }}
      >
        {T.eyebrow}
      </div>

      <h1
        ref={headRef}
        style={{
          opacity: 0,
          margin: 0,
          padding: "0 4vw",
          fontFamily: CONFIG.theme.fontDisplay,
          fontSize: T.headlineSize,
          fontWeight: T.headlineWeight,
          letterSpacing: T.headlineLetterSpacing,
          lineHeight: T.headlineLineHeight,
          textShadow: `0 0 80px ${CONFIG.theme.accent}33`,
        }}
      >
        {T.headline}
      </h1>

      <div
        ref={promptRef}
        style={{
          opacity: 0,
          position: "absolute",
          bottom: T.buttonBottom,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.1rem",
        }}
      >
        <span
          className="ch4-prompt-line"
          style={{
            display: "block",
            width: T.buttonLineWidth,
            height: 1,
            background: CONFIG.theme.accent,
          }}
        />
        <span
          className="ch4-prompt"
          style={{
            fontFamily: CONFIG.theme.fontUI,
            fontSize: T.buttonSize,
            fontWeight: 300,
            letterSpacing: T.buttonLetterSpacing,
            color: CONFIG.theme.text,
          }}
        >
          {T.buttonText}
        </span>
      </div>
    </div>
  );
}



function SceneWormhole({ onDone, sfx }: { onDone: () => void; sfx: Sfx | null }) {
  const W = CONFIG.wormhole;
  const mountRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const mount = mountRef.current;
    const zoomEl = zoomRef.current;
    if (!mount || !zoomEl) return;
    if (!played.current) {
      played.current = true;
      sfx?.wormhole(W.durationSec);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000003, 1);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(W.baseFov, 1, 0.1, 400);
    camera.position.set(0, 0, W.cameraZ);

    const wormhole = createWormhole();
    scene.add(wormhole.mesh);

    const layout = () => {
      const w = Math.max(mount.clientWidth, 1);
      const h = Math.max(mount.clientHeight, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(mount);



    let w = 0;
    let time = 0;
    let last = performance.now();
    let raf = 0;
    let cancelled = false;

    const driver = animate(0, 1, {
      duration: W.durationSec,
      ease: W.progressEase,
      onUpdate: (v) => (w = v),
      onComplete: () => {
        if (!cancelled) onDone();
      },
    });



    const zoom = animate(
      zoomEl,
      { scale: [W.cssZoomFrom, W.cssZoomTo] },
      { duration: W.durationSec, ease: "easeIn" }
    );

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;

      const intensity =
        smoothstep(W.fadeInStart, W.fadeInEnd, w) * (1 - smoothstep(W.fadeOutStart, W.fadeOutEnd, w));
      const speed =
        lerp(W.speedMin, W.speedMax, smoothstep(0.1, 0.5, w)) * (1 - 0.5 * smoothstep(0.8, 1.0, w));
      const flash = Math.exp(-Math.pow((w - W.flashCenter) / W.flashWidth, 2)) * W.flashStrength;
      const fov = W.baseFov + W.fovPunch * Math.pow(Math.sin(Math.PI * w), 1.4);

      wormhole.set(time, intensity, speed, flash);
      if (Math.abs(fov - camera.fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      driver.stop();
      zoom.stop();
      cancelAnimationFrame(raf);
      ro.disconnect();
      wormhole.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000003" }}>
      <div ref={zoomRef} style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%" }}>
        <div ref={mountRef} aria-hidden="true" style={{ position: "absolute", inset: 0 }} />
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${W.cssVignette}) 100%)`,
        }}
      />
    </div>
  );
}



function StarField() {
  const S = CONFIG.space;
  const layers = useMemo(() => {
    const rand = mulberry32(S.starSeed);
    return S.starLayers.map((layer) => {
      const stars = Array.from({ length: layer.count }, () => {
        const tint = rand();
        const rgb = tint < 0.2 ? "255,236,214" : tint > 0.8 ? "205,225,255" : "255,255,255";
        return {
          x: rand() * 100,
          y: rand() * 100,
          len: Math.max(layer.size, layer.streakPx * (0.6 + rand() * 0.8)),
          rgb,
          o: layer.opacity * (0.5 + rand() * 0.5),
        };
      });
      return { ...layer, stars };
    });
  }, [S]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-25%",
        top: "-25%",
        width: "150%",
        height: "150%",
        transform: `rotate(${S.tiltDeg}deg)`,
        pointerEvents: "none",
      }}
    >
      {layers.map((layer, i) => (
        <div
          key={i}
          className="ch4-stars"
          style={{
            position: "absolute",
            inset: 0,
            animation: `ch4-drift ${layer.driftSeconds / S.speedMultiplier}s linear infinite`,
            willChange: "transform",
          }}
        >
          {[0, 100].map((offset) => (
            <div
              key={offset}
              style={{ position: "absolute", left: `${offset}%`, top: 0, width: "100%", height: "100%" }}
            >
              {layer.stars.map((st, j) => (
                <span
                  key={j}
                  style={{
                    position: "absolute",
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                    width: st.len,
                    height: layer.size,
                    borderRadius: layer.size,
                    background: `linear-gradient(to left, rgba(${st.rgb},0), rgba(${st.rgb},${st.o.toFixed(2)}))`,
                    boxShadow: layer.glowPx ? `0 0 ${layer.glowPx}px rgba(${st.rgb},${(st.o * 0.6).toFixed(2)})` : undefined,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}


function MissionClock() {
  const M = CONFIG.mission;
  const rootRef = useRef<HTMLDivElement>(null);
  const valRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = animate(rootRef.current!, { opacity: [0, 1], x: [-10, 0] }, {
      duration: M.fadeInSec,
      delay: M.fadeInDelaySec,
      ease: "easeOut",
    });
    const launch = new Date(M.launchIso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const anniv = (y: number) =>
      Date.UTC(y, launch.getUTCMonth(), launch.getUTCDate(), launch.getUTCHours(), launch.getUTCMinutes(), launch.getUTCSeconds());
    let raf = 0;
    let last = -1e9;
    const tick = (now: number) => {
      if (now - last >= 250) {
        last = now;
        const n = Date.now();
        let years = new Date(n).getUTCFullYear() - launch.getUTCFullYear();
        if (anniv(launch.getUTCFullYear() + years) > n) years--;
        const rem = n - anniv(launch.getUTCFullYear() + years);
        const d = Math.floor(rem / 864e5);
        const h = Math.floor((rem % 864e5) / 36e5);
        const m = Math.floor((rem % 36e5) / 6e4);
        const s = Math.floor((rem % 6e4) / 1e3);
        if (valRef.current) valRef.current.textContent = `${years} y ${d} d  ${pad(h)}:${pad(m)}:${pad(s)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      c.stop();
      cancelAnimationFrame(raf);
    };
  }, [M]);

  return (
    <div
      ref={rootRef}
      style={{
        position: "absolute",
        top: M.top,
        left: M.left,
        opacity: 0,
        fontFamily: CONFIG.theme.fontUI,
        color: CONFIG.theme.text,
        pointerEvents: "none",
        textShadow: "0 1px 12px rgba(0,0,0,0.8)",
      }}
    >
      <div style={{ fontSize: M.labelSize, fontWeight: 300, letterSpacing: "0.03em", color: CONFIG.theme.textDim }}>
        {M.label}
      </div>
      <div
        ref={valRef}
        style={{
          marginTop: "0.35rem",
          fontSize: M.valueSize,
          fontWeight: 200,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "pre",
        }}
      >
        --
      </div>
    </div>
  );
}

function VoyagerHud() {
  const H = CONFIG.hud;
  const rootRef = useRef<HTMLDivElement>(null);
  const kmRef = useRef<HTMLDivElement>(null);
  const auRef = useRef<HTMLSpanElement>(null);
  const lightRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const c = animate(rootRef.current!, { opacity: [0, 1], x: [10, 0] }, {
      duration: H.fadeInSec,
      delay: H.fadeInDelaySec,
      ease: "easeOut",
    });
    const t0 = Date.parse(H.baseTimeIso);
    let raf = 0;
    let lastUpdate = -1e9;
    const tick = (now: number) => {
      if (now - lastUpdate >= H.updateEveryMs) {
        lastUpdate = now;
        const km = H.baseKm + (H.speedKmPerSec * (Date.now() - t0)) / 1000;
        const lightSec = km / 299792.458;
        const hh = Math.floor(lightSec / 3600);
        const mm = Math.floor((lightSec % 3600) / 60);
        if (kmRef.current) kmRef.current.textContent = Math.round(km).toLocaleString("en-US");
        if (auRef.current) auRef.current.textContent = `${(km / 149597870.7).toFixed(2)} AU`;
        if (lightRef.current) lightRef.current.textContent = `${hh} h ${mm} min`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      c.stop();
      cancelAnimationFrame(raf);
    };
  }, [H]);

  return (
    <div
      ref={rootRef}
      style={{
        position: "absolute",
        top: H.top,
        right: H.right,
        opacity: 0,
        textAlign: "right",
        fontFamily: CONFIG.theme.fontUI,
        color: CONFIG.theme.text,
        pointerEvents: "none",
        textShadow: "0 1px 12px rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "0.55rem",
          fontSize: H.labelSize,
          fontWeight: 300,
          letterSpacing: "0.03em",
          color: CONFIG.theme.textDim,
        }}
      >
        <span
          className="ch4-prompt"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: CONFIG.theme.accent,
            boxShadow: `0 0 10px ${CONFIG.theme.accent}`,
          }}
        />
        {H.label}
      </div>
      <div
        style={{
          marginTop: "0.35rem",
          fontSize: H.valueSize,
          fontWeight: 200,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.01em",
          lineHeight: 1.1,
        }}
      >
        <span ref={kmRef}>--</span>
        <span style={{ fontSize: "0.5em", marginLeft: "0.4em", color: CONFIG.theme.textDim }}>km</span>
      </div>
      <div
        style={{
          marginTop: "0.45rem",
          fontSize: H.detailSize,
          fontWeight: 300,
          color: CONFIG.theme.textDim,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.6,
        }}
      >
        <span ref={auRef}>--</span>
        <br />
        Light takes <span ref={lightRef}>--</span> one way
      </div>
    </div>
  );
}

function SceneVoyager({
  onDone,
  sfx,
  onTypeStart,
}: {
  onDone: () => void;
  sfx: Sfx | null;
  onTypeStart: () => void;
}) {
  const V = CONFIG.voyager;
  const S = CONFIG.space;
  const SUB = CONFIG.subtitles;
  const E = CONFIG.ending;
  const EARTH = CONFIG.earth;

  const rootRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<HTMLDivElement[][]>([]);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const earthRef = useRef<HTMLDivElement>(null);
  const earthGlowRef = useRef<HTMLDivElement>(null);
  const sigLineRef = useRef<SVGLineElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const ringRefs = useRef<(SVGCircleElement | null)[]>([]);
  const screenPos = useRef({ x: 0, y: 0 });
  const starAnims = useRef<Animation[]>([]);
  const threeRef = useRef<{ camera: THREE.PerspectiveCamera; sun: THREE.DirectionalLight } | null>(null);
  const flybyPlayed = useRef(false);
  const ambientStarted = useRef(false);
  const [ready, setReady] = useState(false);



  useEffect(() => {
    if (ambientStarted.current) return;
    ambientStarted.current = true;
    sfx?.startAmbient();
  }, [sfx]);



  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = V.exposure;
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(V.cameraFov, 1, 0.1, 600);
    camera.position.set(0, 0, V.cameraZ);


    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = V.envIntensity;

    scene.add(new THREE.AmbientLight(0xffffff, V.ambientIntensity));
    const sun = new THREE.DirectionalLight(V.sunColor, V.sunIntensity);
    sun.position.set(...V.sunPosition);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(V.rimColor, V.rimIntensity);
    rim.position.set(...V.rimPosition);
    scene.add(rim);
    threeRef.current = { camera, sun };

    const holder = new THREE.Group();
    holder.position.set(...V.startPosition);
    holder.rotation.set(...V.startRotation);
    holder.visible = false;
    scene.add(holder);

    const layout = () => {
      const w = Math.max(mount.clientWidth, 1);
      const h = Math.max(mount.clientHeight, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, V.maxPixelRatio));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(mount);

    let flight: ReturnType<typeof animate> | null = null;
    let arrivedAt: number | null = null;
    let disposed = false;
    let yawOffset = 0;

    const start = new THREE.Vector3(...V.startPosition);
    const rest = new THREE.Vector3(...V.restPosition);

    const beginFlight = () => {
      if (!flybyPlayed.current) {
        flybyPlayed.current = true;
        sfx?.flyby(V.flyInSec);
      }
      holder.visible = true;
      flight = animate(0, 1, {
        duration: V.flyInSec,
        ease: V.flyInEase,
        onUpdate: (t) => {
          holder.position.lerpVectors(start, rest, t);
          holder.rotation.set(
            lerp(V.startRotation[0], V.restRotation[0], t),
            lerp(V.startRotation[1], V.restRotation[1], t),
            lerp(V.startRotation[2], V.restRotation[2], t)
          );
        },
        onComplete: () => {
          arrivedAt = performance.now();
        },
      });
      setReady(true);
    };

    new GLTFLoader().load(
      V.modelUrl,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // centre on the origin
        const pivot = new THREE.Group();
        pivot.add(model);
        pivot.scale.setScalar(V.modelSize / Math.max(size.x, size.y, size.z, 1e-6));
        holder.add(pivot);
        beginFlight();
      },
      undefined,
      (err) => {
        console.error("Voyager.glb failed to load:", err);
        setReady(true); 
        
      }
    );

    let raf = 0;
    let last = performance.now();
    const tmp = new THREE.Vector3();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (arrivedAt !== null) {
        const since = (now - arrivedAt) / 1000;
        const blend = smoothstep(0, V.idleBlendSec, since);
        yawOffset += V.idleSpinPerSec * dt * blend;
        holder.rotation.y =
          V.restRotation[1] + yawOffset + Math.sin(since * V.idleSwaySpeed) * V.idleYawSway * blend;
        holder.rotation.z =
          V.restRotation[2] + Math.sin(since * V.idleSwaySpeed * 0.8 + 1) * V.idleRollSway * blend;
        holder.position.y = rest.y + Math.sin(since * V.idleBobSpeed) * V.idleBobAmplitude * blend;
        holder.position.x = rest.x + Math.sin(since * V.idleBobSpeed * 0.7) * V.idleDriftX * blend;
      }


      const w = mount.clientWidth;
      const h = mount.clientHeight;
      tmp.copy(holder.position).project(camera);
      screenPos.current = { x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h };
      const ln = sigLineRef.current;
      if (ln) {
        ln.setAttribute("x1", String(screenPos.current.x));
        ln.setAttribute("y1", String(screenPos.current.y));
        ln.setAttribute("x2", String(w * EARTH.x));
        ln.setAttribute("y2", String(h * EARTH.y));
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      threeRef.current = null;
      flight?.stop();
      cancelAnimationFrame(raf);
      ro.disconnect();
      disposeObject(holder);
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    const ctrls = [
      animate(rootRef.current!, { opacity: [0, 1] }, { duration: S.fadeInSec }),
      animate(earthRef.current!, { opacity: [0, EARTH.opacity] }, { duration: 2.2, delay: EARTH.fadeInDelaySec }),
      animate(earthRef.current!, { scale: [1, EARTH.shrinkTo] }, { duration: EARTH.shrinkSec, ease: "linear" }),
    ];
    return () => ctrls.forEach((c) => c.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    starAnims.current = root
      .getAnimations({ subtree: true })
      .filter((a) => (a as Animation & { animationName?: string }).animationName === "ch4-drift");
    if (S.warpBoost <= 1) return;
    starAnims.current.forEach((a) => (a.playbackRate = S.warpBoost));
    const c = animate(S.warpBoost, 1, {
      duration: S.warpEaseSec,
      ease: "easeOut",
      onUpdate: (v) => starAnims.current.forEach((a) => (a.playbackRate = v)),
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const ctrls: { stop: () => void }[] = [];

    const wait = (s: number) =>
      new Promise<void>((res) => {
        timers.push(setTimeout(res, s * 1000));
      });
    const play = (el: Element, kf: Record<string, unknown>, opts: Record<string, unknown>) =>
      new Promise<void>((res) => {
        const c = animate(el, kf as never, opts as never);
        ctrls.push(c);
        c.then(() => res());
      });


      const sendPulse = () => {
      const root = rootRef.current;
      const line = sigLineRef.current;
      const dot = pulseRef.current;
      if (!root || !line || !dot) return;
      const ex = root.clientWidth * EARTH.x;
      const ey = root.clientHeight * EARTH.y;
      const v0 = { ...screenPos.current };
      ctrls.push(
        animate(line, { opacity: [0, EARTH.lineOpacity, EARTH.lineOpacity, 0] }, {
          duration: EARTH.pulseSec + 0.8,
          times: [0, 0.12, 0.85, 1],
        })
      );
      ctrls.push(
        animate(0, 1, {
          duration: EARTH.pulseSec,
          ease: "easeInOut",
          onUpdate: (p) => {
            const v = screenPos.current;
            dot.setAttribute("cx", String(lerp(v.x, ex, p)));
            dot.setAttribute("cy", String(lerp(v.y, ey, p)));
            dot.setAttribute("opacity", String(Math.sin(Math.PI * clamp01(p))));
          },
          onComplete: () => {
            if (earthGlowRef.current) {
              ctrls.push(
                animate(earthGlowRef.current, { scale: [1, 2.6, 1], opacity: [1, 1, 1] }, { duration: 1.6, ease: "easeOut" })
              );
            }
          },
        })
      );
      ringRefs.current.forEach((ring, i) => {
        if (!ring) return;
        ring.setAttribute("cx", String(v0.x));
        ring.setAttribute("cy", String(v0.y));
        ctrls.push(
          animate(0, 1, {
            duration: 1.6,
            delay: i * 0.28,
            ease: "easeOut",
            onUpdate: (p) => {
              ring.setAttribute("r", String(p * EARTH.ringMax));
              ring.setAttribute("opacity", String((1 - p) * 0.5));
            },
            onComplete: () => ring.setAttribute("opacity", "0"),
          })
        );
      });
    };



    const finalBeat = () => {
      const T = threeRef.current;
      ctrls.push(
        animate(0, 1, {
          duration: S.finalBeatSec,
          ease: "easeInOut",
          onUpdate: (t) => {
            if (T) {
              T.camera.position.z = lerp(V.cameraZ, V.cameraZ + V.finalPullbackZ, t);
              T.sun.intensity = lerp(V.sunIntensity, V.sunIntensity * V.finalSunScale, t);
            }
            const r = lerp(1, S.finalStarRate, t);
            starAnims.current.forEach((a) => (a.playbackRate = r));
          },
        })
      );
      if (earthRef.current) ctrls.push(animate(earthRef.current, { opacity: 0 }, { duration: S.finalBeatSec }));
      if (closeRef.current)
        ctrls.push(animate(closeRef.current, { opacity: [0, S.finalCloseIn] }, { duration: S.finalBeatSec, ease: "easeInOut" }));
      if (hudRef.current) ctrls.push(animate(hudRef.current, { opacity: S.finalHudOpacity }, { duration: S.finalBeatSec }));
    };


    const typeLine = async (lineEl: HTMLElement, text: string) => {
      const typed = lineEl.querySelector("[data-typed]") as HTMLElement | null;
      const rest = lineEl.querySelector("[data-rest]") as HTMLElement | null;
      if (!typed || !rest) return;
      for (let n = 1; n <= text.length; n++) {
        if (cancelled) return;
        typed.textContent = text.slice(0, n);
        rest.textContent = text.slice(n);
        const ch = text[n - 1];
        sfx?.tick(ch);
        let d = (1 / SUB.typeCharsPerSec) * (1 + (Math.random() * 2 - 1) * SUB.typeJitter);
        if (ch === " ") d += SUB.typeWordPauseSec;
        if (/[.,…!?]/.test(ch)) d += SUB.typePunctPauseSec;
        await wait(d);
      }
    };

    (async () => {
      await wait(SUB.startDelaySec);
      for (let gi = 0; gi < SUB.groups.length; gi++) {
        if (cancelled) return;
        const g = SUB.groups[gi];
        const els = lineRefs.current[gi] || [];
        const opacityOf = (li: number) => g.lineOpacities?.[li] ?? 1;

        if (g.typewriter) {
          await wait(SUB.beforeTypewriterSilenceSec);
          if (cancelled) return;
        }
        if (g.sfx === "transmit") {
          sfx?.blips();
          sendPulse();
          timers.push(setTimeout(() => sfx?.ping(), 650));
        }
        if (g.sfx === "static") sfx?.staticOn();

        if (g.typewriter) {
          await Promise.all(
            els.map((el, li) => play(el, { opacity: [0, opacityOf(li)] }, { duration: SUB.fadeInSec }))
          );
          await wait(SUB.typeStartPauseSec);
          if (cancelled) return;
          onTypeStart();
          sfx?.duckAmbient(0.5, 2);
          sfx?.finalMelody();
          finalBeat();
          for (let li = 0; li < els.length; li++) await typeLine(els[li], g.lines[li]);
        } else {
          await Promise.all(
            els.map((el, li) =>
              play(
                el,
                {
                  opacity: [0, opacityOf(li)],
                  y: [SUB.risePx, 0],
                  filter: [`blur(${SUB.blurPx}px)`, "blur(0px)"],
                },
                { duration: SUB.fadeInSec, delay: li * SUB.lineStaggerSec, ease: "easeOut" }
              )
            )
          );
        }
        if (cancelled) return;

        if (g.sfx === "static") {
          await wait(g.holdSec * 0.45);
          sfx?.staticOff(0.5);
          await wait(g.holdSec * 0.55);
        } else {
          await wait(g.holdSec);
        }
        if (cancelled) return;

        await Promise.all(
          els.map((el) =>
            play(
              el,
              { opacity: 0, filter: ["blur(0px)", `blur(${SUB.blurPx}px)`] },
              { duration: SUB.fadeOutSec, ease: "easeIn" }
            )
          )
        );
        if (cancelled) return;
        await wait(SUB.gapSec);
      }
      if (cancelled) return;
      sfx?.fadeAmbient(E.blackoutSec);
      sfx?.subDrop();
      await play(blackoutRef.current!, { opacity: [0, 1] }, { duration: E.blackoutSec, ease: "easeInOut" });
      if (cancelled) return;
      await wait(E.holdBlackSec);
      if (!cancelled) onDone();
    })();

    return () => {
      cancelled = true;
      sfx?.staticOff(0.05);
      timers.forEach(clearTimeout);
      ctrls.forEach((c) => c.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const nebula = S.nebulaOpacity;
  const nebHex = Math.round(nebula * 255).toString(16).padStart(2, "0");
  const fontFor = (f: "ui" | "display") => (f === "ui" ? CONFIG.theme.fontUI : CONFIG.theme.fontDisplay);
  const grainSvg =
    "data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";

  return (
    <div
      ref={rootRef}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000", opacity: 0 }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 55% at 22% 30%, ${S.nebulaColorA}${nebHex} 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 75%, ${S.nebulaColorB}${nebHex} 0%, transparent 70%),
            #000`,
        }}
      />
      <StarField />

      <div
        ref={earthRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${EARTH.x * 100}%`,
          top: `${EARTH.y * 100}%`,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <div
          ref={earthGlowRef}
          style={{
            position: "absolute",
            left: -EARTH.sizePx / 2,
            top: -EARTH.sizePx / 2,
            width: EARTH.sizePx,
            height: EARTH.sizePx,
            borderRadius: "50%",
            background: EARTH.color,
            boxShadow: `0 0 ${EARTH.glowPx}px ${EARTH.color}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: EARTH.sizePx + 10,
            left: 0,
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontFamily: CONFIG.theme.fontDisplay,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: EARTH.labelSize,
            color: CONFIG.theme.textDim,
          }}
        >
          {EARTH.label}
        </div>
      </div>

      <svg
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}
      >
        <line
          ref={sigLineRef}
          stroke={CONFIG.theme.accent}
          strokeWidth={1}
          strokeDasharray="3 8"
          opacity={0}
        />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            r={0}
            fill="none"
            stroke={CONFIG.theme.accent}
            strokeWidth={1}
            opacity={0}
          />
        ))}
        <circle
          ref={pulseRef}
          r={3.5}
          fill="#ffffff"
          opacity={0}
          style={{ filter: `drop-shadow(0 0 7px ${CONFIG.theme.accent})` }}
        />
      </svg>

      <div ref={mountRef} aria-hidden="true" style={{ position: "absolute", inset: 0 }} />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            linear-gradient(to top, rgba(0,0,0,${SUB.backdropOpacity}) 0%, transparent 38%),
            radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${S.vignette}) 100%)`,
        }}
      />
      <div
        ref={closeRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 8%, rgba(0,0,0,1) 82%)",
        }}
      />
      {CONFIG.grain.opacity > 0 && (
        <div
          aria-hidden="true"
          className="ch4-grain"
          style={{
            position: "absolute",
            inset: "-50%",
            pointerEvents: "none",
            opacity: CONFIG.grain.opacity,
            backgroundImage: `url("${grainSvg}")`,
            mixBlendMode: "overlay",
          }}
        />
      )}

      <div ref={hudRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <VoyagerHud />
        <MissionClock />
      </div>

      <div
        aria-live="polite"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: SUB.bottom,
          display: "grid",
          justifyItems: "center",
          alignItems: "end",
          pointerEvents: "none",
        }}
      >
        {SUB.groups.map((g, gi) => (
          <div
            key={gi}
            style={{
              gridArea: "1 / 1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: g.lineGap,
              maxWidth: SUB.maxWidth,
              padding: "0 6vw",
              textAlign: "center",
              fontFamily: fontFor(g.font),
              fontStyle: g.italic ? "italic" : "normal",
              fontWeight: g.weight,
              fontSize: g.size,
              letterSpacing: g.letterSpacing,
              lineHeight: 1.35,
              color: CONFIG.theme.text,
              textShadow: "0 2px 24px rgba(0,0,0,0.9)",
            }}
          >
            {g.lines.map((text, li) => (
              <div
                key={li}
                ref={(el) => {
                  if (!lineRefs.current[gi]) lineRefs.current[gi] = [];
                  if (el) lineRefs.current[gi][li] = el;
                }}
                style={{ opacity: 0, whiteSpace: "pre-wrap" }}
              >
                {g.typewriter ? (
                  <>
                    <span data-typed="" />
                    <span
                      aria-hidden="true"
                      className="ch4-caret"
                      style={{
                        display: "inline-block",
                        width: SUB.caretWidthPx,
                        height: "0.85em",
                        marginLeft: 3,
                        verticalAlign: "-0.06em",
                        background: CONFIG.theme.text,
                        animationDuration: `${SUB.caretBlinkSec}s`,
                      }}
                    />
                    <span data-rest="" style={{ opacity: 0 }}>
                      {text}
                    </span>
                  </>
                ) : (
                  text
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        ref={blackoutRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: "#000", opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}


function SceneCredits() {
  const C = CONFIG.credits;
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);
  const rollRef = useRef<{ pause: () => void; play: () => void } | null>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const scroll = scrollRef.current!;
    let cancelled = false;
    const ctrls: { stop: () => void }[] = [];
    ctrls.push(animate(root, { opacity: [0, 1] }, { duration: C.fadeInSec }));

    const timer = setTimeout(() => {
      const startY = root.clientHeight;
      const endY = -scroll.offsetHeight;
      const duration = (startY - endY) / C.speedPxPerSec;
      const roll = animate(0, 1, {
        duration,
        ease: "linear",
        onUpdate: (p) => {
          scroll.style.transform = `translate3d(0, ${lerp(startY, endY, p)}px, 0)`;
        },
        onComplete: () => {
          if (cancelled || !closingRef.current) return;
          ctrls.push(
            animate(closingRef.current, { opacity: [0, 1], filter: ["blur(10px)", "blur(0px)"] }, {
              duration: C.closingFadeInSec,
              delay: C.closingDelaySec,
              ease: "easeOut",
            })
          );
        },
      });
      rollRef.current = roll;
      ctrls.push(roll);
    }, C.startDelaySec * 1000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ctrls.forEach((c) => c.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = () => C.pauseOnHover && rollRef.current?.pause();
  const resume = () => C.pauseOnHover && rollRef.current?.play();
  const prettyUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  return (
    <div
      ref={rootRef}
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0,
        overflow: "hidden",
        background: "#000",
        color: CONFIG.theme.text,
      }}
    >
      {/* the rolling column */}
      <div
        ref={scrollRef}
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: C.columnWidth,
          marginLeft: `calc(${C.columnWidth} / -2)`,
          textAlign: "center",
          transform: "translate3d(0, 100vh, 0)",
          willChange: "transform",
          paddingBottom: "6rem",
        }}
      >
        <div style={{ fontFamily: CONFIG.theme.fontDisplay, fontStyle: "italic", fontWeight: 300, color: CONFIG.theme.textDim, fontSize: C.headingSize }}>
          {C.subtitleText}
        </div>
        <h2
          style={{
            margin: "0.6rem 0 0",
            fontFamily: CONFIG.theme.fontDisplay,
            fontWeight: 300,
            fontSize: C.titleSize,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {C.titleText}
        </h2>

        {C.sections.map((section, si) => (
          <section key={si} style={{ marginTop: C.headingGap }}>
            <h3
              style={{
                margin: 0,
                fontFamily: CONFIG.theme.fontDisplay,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: C.headingSize,
                color: CONFIG.theme.accent,
                letterSpacing: "0.04em",
              }}
            >
              {section.heading}
            </h3>
            <div style={{ marginTop: "1.8rem", display: "flex", flexDirection: "column", alignItems: "center", gap: C.itemGap }}>
              {section.items.map((item, ii) => {
                const inner = (
                  <>
                    <span
                      className="ch4-credit-name"
                      style={{ display: "block", fontFamily: CONFIG.theme.fontDisplay, fontWeight: 300, fontSize: C.itemSize, lineHeight: 1.25 }}
                    >
                      {item.name}
                    </span>
                    {item.url && (
                      <span
                        className="ch4-credit-url"
                        style={{
                          display: "block",
                          marginTop: "0.3rem",
                          fontFamily: CONFIG.theme.fontUI,
                          fontWeight: 300,
                          fontSize: C.urlSize,
                          letterSpacing: "0.04em",
                          color: CONFIG.theme.textDim,
                        }}
                      >
                        {prettyUrl(item.url)}
                      </span>
                    )}
                  </>
                );
                return (
                  <div key={ii}>
                    {item.url ? (
                      <a
                        className="ch4-credit-link"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={pause}
                        onMouseLeave={resume}
                        onFocus={pause}
                        onBlur={resume}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div style={{ padding: "0.45rem 1.1rem" }}>{inner}</div>
                    )}
                    {item.note && (
                      <div
                        style={{
                          marginTop: "0.15rem",
                          fontFamily: CONFIG.theme.fontUI,
                          fontWeight: 300,
                          fontSize: C.noteSize,
                          color: CONFIG.theme.textDim,
                        }}
                      >
                        {item.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(to bottom, #000 0%, transparent ${C.edgeFadeVh}%, transparent ${100 - C.edgeFadeVh}%, #000 100%)`,
        }}
      />

      <div
        ref={closingRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          pointerEvents: "none",
          fontFamily: CONFIG.theme.fontDisplay,
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: C.closingSize,
          letterSpacing: "0.01em",
          textShadow: `0 0 60px ${CONFIG.theme.accent}44`,
        }}
      >
        {C.closingText}
      </div>
    </div>
  );
}



export default function Page() {
  const E = CONFIG.ending;
  const [scene, setScene] = useState<SceneName>("title");

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toVoyager = useCallback(() => setScene("voyager"), []);
  const toEnding = useCallback(() => setScene("ending"), []);
  const [videoEnded, setVideoEnded] = useState(false);
  const endedRef = useRef(false);
  const creditsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onVideoDone = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setVideoEnded(true);
    creditsTimer.current = setTimeout(() => {
      if (!E.drumsContinueIntoCredits) audioRef.current?.pause();
      setScene("credits");
    }, E.creditsGapSec * 1000);
  }, [E.creditsGapSec, E.drumsContinueIntoCredits]);

  useEffect(
    () => () => {
      if (creditsTimer.current) clearTimeout(creditsTimer.current);
    },
    []
  );

  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);
  const [assetError, setAssetError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const find = async (candidates: readonly string[]) => {
      for (const url of candidates) {
        try {
          const r = await fetch(url, { method: "HEAD" });
          const type = r.headers.get("content-type") || "";
          if (r.ok && !type.includes("text/html")) return url;
        } catch {
          /* try next */
        }
      }
      return null;
    };
    (async () => {
      const v = await find(E.videoCandidates);
      if (cancelled) return;
      if (v) {
        console.info("[ch4] video found at", v);
        setVideoSrc(v);
      } else {
        const msg = `Video not found. Tried: ${E.videoCandidates.join(", ")}. Put theend.mp4 in /public (or edit CONFIG.ending.videoCandidates).`;
        console.error("[ch4]", msg);
        setAssetError(msg);
      }
      const a = await find(E.audioCandidates);
      if (cancelled) return;
      if (a) {
        console.info("[ch4] drums found at", a);
        const el = new Audio(a);
        el.preload = "auto";
        el.volume = E.audioVolume;
        audioRef.current = el;
      } else {
        console.error(
          `[ch4] drums.mp3 not found. Tried: ${E.audioCandidates.join(", ")}. Put drums.mp3 in /public (or edit CONFIG.ending.audioCandidates).`
        );
      }
    })();
    return () => {
      cancelled = true;
      audioRef.current?.pause();
      audioRef.current = null;
      sfxRef.current?.dispose();
      sfxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onVideoError = useCallback(() => {
    const v = videoRef.current;
    const code = v?.error?.code;
    const msg =
      code === 4
        ? "The video file was found but this browser can't decode it. Re-encode theend.mp4 as H.264 video + AAC audio."
        : `The video failed to load (media error ${code ?? "unknown"}).`;
    console.error("[ch4]", msg, v?.error);
    setAssetError(msg);
    if (E.advanceToCreditsOnVideoError) onVideoDone();
  }, [E.advanceToCreditsOnVideoError, onVideoDone]);


  const primeMedia = useCallback(() => {
    const v = videoRef.current;
    const a = audioRef.current;
    const prime = (m: HTMLMediaElement | null) => {
      if (!m) return;
      const wasMuted = m.muted;
      m.muted = true;
      m.play()
        .then(() => {
          m.pause();
          m.currentTime = 0;
          m.muted = wasMuted;
        })
        .catch(() => {
          m.muted = wasMuted;
        });
    };
    prime(v);
    prime(a);
  }, []);

  const sfxRef = useRef<Sfx | null>(null);

  const onActivate = useCallback(() => {
    primeMedia();
    try {
      const sfx = createSfx();
      sfxRef.current = sfx;
      sfx?.resume();
      sfx?.click();
    } catch (e) {
      console.error("sound setup failed:", e);
    }
  }, [primeMedia]);

  const toWormhole = useCallback(() => setScene("wormhole"), []);

  const startDrums = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.muted = false;
    a.volume = 0;
    a.play().catch((e) => console.error("audio play failed:", e));
    animate(0, E.audioVolume, {
      duration: E.drumsFadeInSec,
      ease: "easeIn",
      onUpdate: (v) => {
        if (audioRef.current) audioRef.current.volume = clamp01(v);
      },
    });
  }, [E.audioVolume, E.drumsFadeInSec]);


  const startEnding = useCallback(() => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch((e) => console.error("video play failed:", e));
    }
    if (a && a.paused) {
      a.volume = E.audioVolume;
      a.play().catch(() => undefined);
    }
  }, [E.audioVolume]);

  useEffect(() => {
    if (scene === "ending") startEnding();
  }, [scene, startEnding]);

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: CONFIG.theme.background,
      }}
    >
      <GlobalStyles />
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        onEnded={onVideoDone}
        onError={onVideoError}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: E.videoFit,
          background: "#000",
          opacity: scene === "ending" && !videoEnded ? 1 : 0,
          transition: `opacity ${videoEnded ? E.videoFadeOutSec : E.videoFadeInSec}s ease`,
          pointerEvents: "none",
        }}
      />

      {scene === "title" && <SceneTitle onActivate={onActivate} onContinue={toWormhole} />}
      {scene === "wormhole" && <SceneWormhole onDone={toVoyager} sfx={sfxRef.current} />}
      {scene === "voyager" && <SceneVoyager onDone={toEnding} sfx={sfxRef.current} onTypeStart={startDrums} />}
      {scene === "credits" && <SceneCredits />}
      {scene === "ending" && assetError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8vw",
            textAlign: "center",
            color: CONFIG.theme.textDim,
            fontFamily: CONFIG.theme.fontUI,
            fontWeight: 300,
            lineHeight: 1.6,
          }}
        >
          {assetError}
        </div>
      )}
    </main>
  );
}
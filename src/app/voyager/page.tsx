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
    speedPxPerSec: 100, 
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
            name: "Voyager 1 reaches one light-day from Earth",
            url: "https://earthsky.org/space/voyager-1-1-light-day-from-earth-november-17-18-2026/",
            note: "EarthSky",
          },
          //TODO
        ],
      },
      {
        heading: "3D model",
        items: [
          { name: "NASA 3D Resources", url: "https://science.nasa.gov/3d-resources/", note: "Replace with the real source of Voyager.glb" },
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



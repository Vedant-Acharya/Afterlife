'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, animate, AnimatePresence, type Variants } from 'motion/react';


const HEADING = 'Spirit: The Ghost Rover’s Tale';
const HEADING_SIZE = 34; 
const HEADING_TOP = 6;
const HEADING_GAP = 0;
const HEADING_GHOSTS = false; 

const BOOK_SIZE = 1.0;
const BOOK_ALIGN: 'top' | 'center' = 'top';
const SCREEN_PADDING = 4;
const CROP = { top: 90, bottom: 50, left: 90, right: 90 };

const ARROW_SIZE = 40;
const CONTROLS_GAP = 14;
const SHOW_PROGRESS_BAR = true;

const BODY_FONT_SIZE = 12.5; 

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400..700&family=Caveat:wght@500;700&display=swap';
const DISPLAY_FONT = "'Fraunces', Georgia, serif"; 
const BODY_FONT = "'Literata', Georgia, serif";
const GHOST_FONT = "'Caveat', 'Segoe Script', cursive"; 

const THEME = {
  ink: '#2a1d2e', 
  rust: '#c4482a', 
  ember: '#ee7a35',
  plum: '#6a2c70',
  teal: '#0e8f83',
  blue: '#2c5fa8',
  gold: '#f0b73e',
  ghost: '#9ff5e8', 
  night: '#1d1633', 
};



const SPRITE_URL = 'https://assets.codepen.io/36869/book.webp';

const IMAGES = {
  cover: {
    src: '',
    emoji: '👻',
    want: 'COVER: Spirit rover lying still and silent on the red sand, with a glowing ghost (its soul) floating just above it. Portrait / tall shape.',
  },
  traverse: {
    src: '/images/spiritroute.jpg',
    emoji: '🗺️',
    want: 'MAP: Spirit’s real path (traverse map) across Gusev Crater, from the landing site to Husband Hill, Home Plate and Troy. Tall shape works best.',
  },
  husbandHill: {
    src: '/images/spiritpanorama.jpg',
    emoji: '⛰️',
    want: 'PHOTO: a panorama from the summit of Husband Hill taken by Spirit.',
  },
  homePlate: {
    src: '/images/spiritsilica.jpg',
    emoji: '✨',
    want: 'PHOTO: Home Plate, or the bright silica soil that Spirit uncovered with its broken wheel.',
  },
};
type ImgKey = keyof typeof IMAGES;



type Tone = 'rust' | 'ember' | 'plum' | 'teal' | 'blue';

const BookCtx = React.createContext<{ restart: () => void }>({ restart: () => {} });

const containerV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemV: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
};


function Item({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.ComponentProps<typeof motion.div>['style'];
}) {
  return (
    <motion.div variants={itemV} className={className} style={style}>
      {children}
    </motion.div>
  );
}



function Chapter({ n, title, c = 'rust' }: { n: number; title: string; c?: Tone }) {
  return (
    <Item className={`bk-chap t-${c}`}>
      <div className="num">{n}</div>
      <div className="tx">
        <span className="kick">Chapter {n}</span>
        <h2>{title}</h2>
      </div>
    </Item>
  );
}



function P({ children, dc = false }: { children: React.ReactNode; dc?: boolean }) {
  return (
    <Item className={`bk-p ${dc ? 'dc' : ''}`}>
      <p>{children}</p>
    </Item>
  );
}



function Hi({ children, c = 'rust' }: { children: React.ReactNode; c?: Tone }) {
  return <span className={`bk-hi t-${c}`}>{children}</span>;
}


function Float({
  children,
  amp = 5,
  dur = 2.8,
  rotate = 0,
}: {
  children: React.ReactNode;
  amp?: number;
  dur?: number;
  rotate?: number;
}) {
  return (
    <motion.span
      style={{ display: 'inline-block' }}
      animate={{ y: [0, -amp, 0], rotate: [-rotate, rotate, -rotate] }}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.span>
  );
}



function Whisper({ children }: { children: React.ReactNode }) {
  return (
    <Item className="bk-whisper">
      <Float amp={3} dur={3} rotate={6}>👻</Float>
      <span>{children}</span>
    </Item>
  );
}


function Pull({ children, c = 'plum' }: { children: React.ReactNode; c?: Tone }) {
  return <Item className={`bk-pull t-${c}`}>{children}</Item>;
}



function Fact({ title = 'Mars fact', c = 'blue', children }: { title?: string; c?: Tone; children: React.ReactNode }) {
  return (
    <Item className={`bk-fact t-${c}`}>
      <b>{title}</b>
      <span>{children}</span>
    </Item>
  );
}



function Stats({ items }: { items: { n: string; l: string; c?: Tone }[] }) {
  return (
    <Item className="bk-stats">
      {items.map((s) => (
        <motion.div key={s.l} className={`bk-stat t-${s.c ?? 'rust'}`} whileHover={{ y: -3, rotate: -2 }}>
          <b>{s.n}</b>
          <span>{s.l}</span>
        </motion.div>
      ))}
    </Item>
  );
}



function Seal({ children, c = 'rust', tilt = -8 }: { children: React.ReactNode; c?: Tone; tilt?: number }) {
  return (
    <motion.div
      variants={itemV}
      className={`bk-seal t-${c}`}
      style={{ rotate: tilt }}
      whileHover={{ scale: 1.1, rotate: tilt + 10 }}
    >
      <span>{children}</span>
    </motion.div>
  );
}



function Pic({ k, caption, tilt = 0, h = 140 }: { k: ImgKey; caption?: string; tilt?: number; h?: number }) {
  const im = IMAGES[k];
  return (
    <Item className="bk-pic" style={{ rotate: tilt }}>
      {im.src ? (
        <img src={im.src} alt={caption ?? k} style={{ height: h }} />
      ) : (
        <div className="bk-ph" style={{ height: h }}>
          <Float amp={4}>
            <span className="e">{im.emoji}</span>
          </Float>
          <span className="t">{im.want}</span>
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </Item>
  );
}




function GhostSVG() {
  return (
    <svg viewBox="0 0 92 100" width="100%" height="100%" aria-hidden="true">
      <rect x="36" y="2" width="20" height="9" rx="2.5" fill="#e6fffb" stroke="#7fd6cb" strokeWidth="1" />
      <circle cx="42" cy="6.5" r="2.6" fill="#12304a" />
      <circle cx="50" cy="6.5" r="2.6" fill="#12304a" />
      <rect x="45" y="11" width="2" height="14" fill="#bff7ef" />
      <path
        d="M10 50 C10 20 82 20 82 50 L82 88 Q74 80 66 90 Q58 80 46 90 Q34 80 26 90 Q18 80 10 88 Z"
        fill="rgba(206,255,249,.93)"
        stroke="#7fd6cb"
        strokeWidth="1.2"
      />
      <ellipse cx="34" cy="48" rx="5" ry="8" fill="#12304a" />
      <ellipse cx="58" cy="48" rx="5" ry="8" fill="#12304a" />
      <circle cx="36" cy="45" r="1.8" fill="#fff" />
      <circle cx="60" cy="45" r="1.8" fill="#fff" />
      <ellipse cx="46" cy="66" rx="4" ry="5" fill="#12304a" />
      <circle cx="23" cy="60" r="4" fill="#ffb3c7" opacity=".65" />
      <circle cx="69" cy="60" r="4" fill="#ffb3c7" opacity=".65" />
    </svg>
  );
}

function RoverScene() {
  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      role="img"
      aria-label="Spirit rover lying silent on the sand at dusk"
    >
      <defs>
        <linearGradient id="bk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#150f33" />
          <stop offset=".5" stopColor="#4a2461" />
          <stop offset=".78" stopColor="#c8502d" />
          <stop offset="1" stopColor="#f2a15a" />
        </linearGradient>
        <radialGradient id="bk-sun">
          <stop offset="0" stopColor="#fff2d6" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff2d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#bk-sky)" />
      {Array.from({ length: 22 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 47 + 13) % 300}
          cy={(i * 29 + 9) % 210}
          r={0.6 + (i % 3) * 0.45}
          fill="#fff"
          opacity={0.45 + (i % 4) * 0.13}
        />
      ))}
      <circle cx="232" cy="262" r="26" fill="url(#bk-sun)" />
      <circle cx="232" cy="262" r="6" fill="#fff2d6" />
      <path d="M0 288 Q70 262 150 284 T300 272 V400 H0Z" fill="#9a3f24" />
      <g transform="translate(150 322) rotate(-7)">
        <rect x="-60" y="-36" width="120" height="7" rx="1.5" fill="#34457a" />
        <path d="M-40 -36 V-29 M-20 -36 V-29 M0 -36 V-29 M20 -36 V-29 M40 -36 V-29" stroke="#1f2a52" strokeWidth="1" />
        <ellipse cx="-10" cy="-33" rx="26" ry="2.5" fill="#b6683c" opacity=".55" />
        <rect x="-52" y="-29" width="104" height="28" rx="5" fill="#c7cbd4" stroke="#7a7f8a" strokeWidth="1.2" />
        <rect x="30" y="-76" width="5" height="40" fill="#9aa0ab" />
        <rect x="23" y="-88" width="19" height="12" rx="2.5" fill="#c7cbd4" stroke="#7a7f8a" strokeWidth="1" />
        <circle cx="29" cy="-82" r="2.4" fill="#5b6070" />
        <circle cx="37" cy="-82" r="2.4" fill="#5b6070" />
        <line x1="-52" y1="-15" x2="-74" y2="-3" stroke="#9aa0ab" strokeWidth="4" strokeLinecap="round" />
        <rect x="-86" y="-8" width="13" height="11" rx="2" fill="#c89b45" />
        {[-38, 0, 38].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={i === 1 ? 7 : 3} r="14" fill="#2a2a33" stroke="#8a8f99" strokeWidth="2" />
            <path
              d={`M${x - 10} ${i === 1 ? 7 : 3} H${x + 10} M${x} ${i === 1 ? -3 : -7} V${i === 1 ? 17 : 13}`}
              stroke="#555a66"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </g>
      <path d="M0 331 Q90 301 170 327 T300 313 V400 H0Z" fill="#6e2a19" />
      <path d="M0 362 Q110 342 210 364 T300 352 V400 H0Z" fill="#53200f" />
    </svg>
  );
}

const WHISPERS = [
  'Boo! …just kidding. 👻',
  'Don’t worry, I’m a friendly ghost.',
  'Come closer, Cadet. I have a story.',
  'It’s about a robot that kept going.',
  'Ready? Flip the page!',
];



function CoverArt({ h = 372 }: { h?: number }) {
  const [i, setI] = useState(0);
  const im = IMAGES.cover;
  return (
    <Item className="bk-cover-art" style={{ height: h }}>
      {im.src ? <img src={im.src} alt="Spirit rover lying still, its ghost floating above" /> : <RoverScene />}
      <div className="bk-whisper-bubble" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.span
            key={i % WHISPERS.length}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {WHISPERS[i % WHISPERS.length]}
          </motion.span>
        </AnimatePresence>
      </div>
      <motion.button
        className="bk-ghost"
        aria-label="Tap the ghost"
        onClick={() => setI((n) => n + 1)}
        animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        whileTap={{ scale: 1.25 }}
        whileHover={{ scale: 1.08 }}
      >
        <GhostSVG />
      </motion.button>
      <div className="bk-tap">tap the ghost</div>
    </Item>
  );
}



function MissionClock() {
  const [sols, setSols] = useState(0);
  const [running, setRunning] = useState(false);
  const ctl = useRef<{ stop: () => void } | null>(null);
  useEffect(() => () => ctl.current?.stop(), []);
  const start = () => {
    ctl.current?.stop();
    setSols(0);
    setRunning(true);
    ctl.current = animate(0, 2208, {
      duration: 3.6,
      ease: 'easeOut',
      onUpdate: (v: number) => setSols(Math.round(v)),
      onComplete: () => setRunning(false),
    });
  };
  return (
    <Item className="bk-game">
      <div className="bk-game-t">The Mission Clock</div>
      <div className="bk-bars">
        <div className="lab">Planned: <b>90 sols</b></div>
        <div className="trk">
          <div className="fill plan" style={{ width: `${(90 / 2208) * 100}%` }} />
        </div>
        <div className="lab">What I really did: <b>{sols} sols</b></div>
        <div className="trk">
          <div className="fill real" style={{ width: `${(sols / 2208) * 100}%` }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={sols >= 2208 ? 'done' : 'idle'}
          className="bk-say"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          {sols >= 2208 ? '🎉 That’s about 24 times longer than planned!' : 'A sol is one Mars day (24 h 40 min).'}
        </motion.div>
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.92 }} className="bk-btn" onClick={start} disabled={running}>
        {running ? 'Rolling…' : sols ? '↺ Run it again' : '▶ Run the mission!'}
      </motion.button>
    </Item>
  );
}

const BOUNCE_X = [0, 30, 60, 90, 118, 142, 162, 178, 190, 198];
const BOUNCE_Y = [-118, 0, -76, 0, -46, 0, -22, 0, -8, 0];
const BOUNCE_R = [0, 170, 340, 510, 680, 820, 930, 1010, 1060, 1090];
const BOUNCE_EASE = Array.from({ length: 9 }, (_, i) => (i % 2 === 0 ? 'easeIn' : 'easeOut')) as ('easeIn' | 'easeOut')[];



function BounceGame() {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (t.current) clearTimeout(t.current);
  }, []);
  const drop = () => {
    setDone(false);
    setN((x) => x + 1);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setDone(true), 3300);
  };
  return (
    <Item className="bk-game">
      <div className="bk-game-t">Drop me on Mars!</div>
      <div className="bk-bounce">
        <motion.div
          key={n}
          className="bk-ball"
          initial={{ x: 0, y: -118, rotate: 0 }}
          animate={n ? { x: BOUNCE_X, y: BOUNCE_Y, rotate: BOUNCE_R } : { x: 0, y: -118, rotate: 0 }}
          transition={{
            x: { duration: 3.2, ease: 'linear' },
            rotate: { duration: 3.2, ease: 'linear' },
            y: { duration: 3.2, ease: BOUNCE_EASE },
          }}
        >
          <span>🤖</span>
        </motion.div>
        <div className="bk-ground" />
      </div>
      <div className="bk-say">
        {done ? '🎉 Landed in Gusev Crater! 4 Jan 2004' : n ? 'Boing… boing… boing…' : 'Press the button and watch me bounce.'}
      </div>
      <motion.button whileTap={{ scale: 0.92 }} className="bk-btn" onClick={drop}>
        {n ? '🎈 Bounce again!' : '🎈 Bounce!'}
      </motion.button>
    </Item>
  );
}



const PARTS: { id: string; x: number; y: number; name: string; blurb: React.ReactNode }[] = [
  {
    id: 'cam',
    x: 69,
    y: 11,
    name: 'Pancam & Mini-TES',
    blurb: (
      <>
        My two eyes on a tall mast: the <b>Panoramic Camera (Pancam)</b> took colour pictures of everything. The{' '}
        <b>Mini-TES</b> felt the heat of far-away rocks to guess what they were made of.
      </>
    ),
  },
  {
    id: 'dish',
    x: 37,
    y: 27,
    name: 'High-gain antenna',
    blurb: <>My dish for talking to Earth. Radio messages take 3 to 22 minutes to cross space, so every chat was slow!</>,
  },
  {
    id: 'panels',
    x: 47,
    y: 42,
    name: 'Solar panels',
    blurb: <>I ate sunshine all day! My panels made all my power, and dust on them was my worst enemy.</>,
  },
  {
    id: 'arm',
    x: 6,
    y: 66,
    name: 'Robot arm toolkit',
    blurb: (
      <>
        <b>RAT</b> (Rock Abrasion Tool) grinds a rock’s dusty skin away. <b>Microscopic Imager</b> is my close-up
        camera. <b>Mössbauer Spectrometer</b> and <b>APXS</b> sniff out iron and other chemical elements.
      </>
    ),
  },
  {
    id: 'wheels',
    x: 47,
    y: 80,
    name: 'Six wheels',
    blurb: <>Each wheel had its own motor. Remember this, Cadet… one of them will matter a lot later. 😉</>,
  },
];

function Anatomy() {
  const [sel, setSel] = useState('cam');
  const part = PARTS.find((p) => p.id === sel) ?? PARTS[0];
  return (
    <Item className="bk-game">
      <div className="bk-game-t">Tap my glowing dots</div>
      <div className="bk-anat">
        <svg viewBox="0 0 300 160" width="100%" height="100%" aria-hidden="true">
          <line x1="0" y1="146" x2="300" y2="146" stroke="#8a4a35" strokeWidth="2" strokeDasharray="4 5" />
          {[70, 140, 210].map((x) => (
            <g key={x}>
              <path d={`M${x} 128 L${x} 108`} stroke="#8c93a0" strokeWidth="4" />
              <circle cx={x} cy="128" r="15" fill="#2a2a33" stroke="#aab0bb" strokeWidth="2.5" />
              <path d={`M${x - 11} 128 H${x + 11} M${x} 117 V139`} stroke="#6b717e" strokeWidth="1.6" />
            </g>
          ))}
          <rect x="48" y="74" width="190" height="34" rx="6" fill="#dcdfe7" stroke="#8c93a0" strokeWidth="1.5" />
          <rect x="44" y="63" width="198" height="9" rx="2" fill="#2f4380" />
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${66 + i * 20} 63 V72`} stroke="#1d2a58" strokeWidth="1" />
          ))}
          <rect x="204" y="22" width="6" height="42" fill="#9aa0ab" />
          <rect x="192" y="9" width="30" height="15" rx="3" fill="#eceef3" stroke="#8c93a0" strokeWidth="1.2" />
          <circle cx="200" cy="17" r="3.8" fill="#1c2233" />
          <circle cx="214" cy="17" r="3.8" fill="#1c2233" />
          <circle cx="201" cy="16" r="1.2" fill="#fff" />
          <circle cx="215" cy="16" r="1.2" fill="#fff" />
          <rect x="109" y="46" width="2" height="18" fill="#9aa0ab" />
          <ellipse cx="110" cy="44" rx="17" ry="6" fill="#f2f3f7" stroke="#8c93a0" strokeWidth="1.2" />
          <line x1="48" y1="92" x2="24" y2="104" stroke="#9aa0ab" strokeWidth="5" strokeLinecap="round" />
          <rect x="8" y="98" width="19" height="15" rx="2.5" fill="#e6a23c" stroke="#a8721f" strokeWidth="1.2" />
        </svg>
        {PARTS.map((p) => (
          <button
            key={p.id}
            className={`bk-dot ${sel === p.id ? 'on' : ''}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            aria-label={p.name}
            onClick={() => setSel(p.id)}
          >
            <motion.i
              animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={part.id}
          className="bk-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <b>{part.name}</b>
          <p>{part.blurb}</p>
        </motion.div>
      </AnimatePresence>
    </Item>
  );
}



const STOPS = [
  { x: 42, y: 170, name: 'Columbia Memorial Station', when: 'January 2004', text: 'My landing spot, renamed in honour of the Space Shuttle Columbia crew.' },
  { x: 88, y: 132, name: 'Bonneville Crater', when: 'March 2004', text: 'I rolled up to the edge of this huge crater and peeked inside.' },
  { x: 165, y: 62, name: 'Husband Hill', when: 'August 2005', text: 'I climbed to the top. A real hike for a robot!' },
  { x: 220, y: 105, name: 'Home Plate', when: '2006 – 2007', text: 'A flat plateau of layered rock, and the place of my big surprise.' },
  { x: 254, y: 150, name: 'Troy', when: 'April 2009', text: 'A sandy trap. This is where I got stuck, and where my journey ended.' },
];

function PathMap() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = STOPS.length - 1;
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIdx((i) => {
        if (i >= last) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 1500);
    return () => clearInterval(id);
  }, [playing, last]);
  const stop = STOPS[idx];
  return (
    <Item className="bk-game">
      <div className="bk-game-t">Follow my tracks</div>
      <div className="bk-map">
        <svg viewBox="0 0 300 210" width="100%" height="100%" role="img" aria-label="Sketch map of Spirit's journey">
          <rect width="300" height="210" rx="10" fill="#efd9ab" />
          {[
            [46, 30],
            [32, 21],
            [18, 11],
          ].map(([rx, ry], i) => (
            <ellipse key={i} cx="165" cy="70" rx={rx} ry={ry} fill="none" stroke="#cfae72" strokeWidth="1.2" />
          ))}
          <circle cx="88" cy="132" r="17" fill="#dcbf86" stroke="#b38a50" strokeWidth="1.2" strokeDasharray="3 3" />
          <ellipse cx="220" cy="108" rx="21" ry="11" fill="#e7c88f" stroke="#b38a50" strokeWidth="1" />
          <text x="8" y="202" fontSize="7.5" fill="#8a6a3a" fontFamily="Literata, serif">sketch, not to scale</text>
          <text x="282" y="18" fontSize="9" fill="#8a6a3a" textAnchor="middle" fontFamily="Fraunces, serif">N↑</text>
          {STOPS.slice(1, idx + 1).map((s, i) => (
            <motion.line
              key={s.name}
              x1={STOPS[i].x}
              y1={STOPS[i].y}
              x2={s.x}
              y2={s.y}
              stroke="#c4482a"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            />
          ))}
          {STOPS.map((s, i) => (
            <g key={s.name} onClick={() => { setPlaying(false); setIdx(i); }} style={{ cursor: 'pointer' }}>
              <circle cx={s.x} cy={s.y} r="12" fill="transparent" />
              <circle cx={s.x} cy={s.y} r="7" fill={i <= idx ? '#c4482a' : '#fff'} stroke="#2a1d2e" strokeWidth="1.5" />
              <text x={s.x} y={s.y + 2.8} fontSize="8" textAnchor="middle" fontWeight="700" fill={i <= idx ? '#fff' : '#2a1d2e'} fontFamily="Fraunces, serif">
                {i + 1}
              </text>
            </g>
          ))}
          <motion.circle
            r="11"
            fill="none"
            stroke="#f0b73e"
            strokeWidth="2"
            animate={{ cx: stop.x, cy: stop.y, scale: [1, 1.3, 1] }}
            transition={{ cx: { type: 'spring', stiffness: 90, damping: 14 }, cy: { type: 'spring', stiffness: 90, damping: 14 }, scale: { duration: 1.4, repeat: Infinity } }}
          />
        </svg>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="bk-card"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.22 }}
        >
          <b>
            {idx + 1}. {stop.name}
          </b>
          <em>{stop.when}</em>
          <p>{stop.text}</p>
        </motion.div>
      </AnimatePresence>
      <div className="bk-row">
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="bk-btn"
          onClick={() => {
            if (idx >= last) setIdx(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? '⏸ Pause' : '▶ Drive!'}
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} className="bk-btn ghost" onClick={() => { setPlaying(false); setIdx(0); }}>
          ↺
        </motion.button>
      </div>
    </Item>
  );
}

const SECRET = 4;
const PEBBLES = ['🪨', '·:·', '🪨'];


function DigGame() {
  const [dug, setDug] = useState<number[]>([]);
  const found = dug.includes(SECRET);
  return (
    <Item className="bk-game">
      <div className="bk-game-t">Scrape with my broken wheel!</div>
      <div className="bk-dig">
        {Array.from({ length: 9 }, (_, i) => {
          const d = dug.includes(i);
          return (
            <button
              key={i}
              className="bk-tile"
              aria-label={`Soil patch ${i + 1}`}
              onClick={() => !d && setDug((x) => [...x, i])}
            >
              <span className={`under ${i === SECRET ? 'shine' : ''}`}>{i === SECRET ? '✨' : PEBBLES[i % 3]}</span>
              <motion.span
                className="dust"
                animate={d ? { opacity: 0, scale: 1.5, rotate: 25 } : { opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.4 }}
                style={{ pointerEvents: d ? 'none' : 'auto' }}
              />
            </button>
          );
        })}
      </div>
      <div className={`bk-say ${found ? 'ok' : ''}`}>
        {found
          ? '🎉 Bright silica! Hot springs may once have flowed here!'
          : dug.length
            ? 'Just pebbles… keep scraping!'
            : 'Tap the dusty squares to scrape them.'}
      </div>
      <motion.button whileTap={{ scale: 0.92 }} className="bk-btn ghost" onClick={() => setDug([])}>
        ↺ Cover it up again
      </motion.button>
    </Item>
  );
}

const stopTouch = (e: React.TouchEvent) => e.stopPropagation();



function DustPower() {
  const [dust, setDust] = useState(35);
  const [wind, setWind] = useState(0);
  const power = Math.max(0, Math.round(100 - dust * 0.95));
  const mood = power > 65 ? '☀️ Sunny and strong!' : power > 30 ? '🌤️ Getting sleepy…' : '💤 Too dusty. I need rest.';
  return (
    <Item className="bk-game">
      <div className="bk-game-t">My power supply</div>
      <motion.div
        key={wind}
        className="bk-panel"
        animate={wind ? { x: [0, -5, 5, -3, 3, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} />
        ))}
        <motion.div className="bk-dustlayer" animate={{ opacity: (dust / 100) * 0.9 }} transition={{ duration: 0.3 }} />
      </motion.div>
      <label className="bk-slide">
        <span>Dust on my panels: {dust}%</span>
        <input
          type="range"
          min={0}
          max={100}
          value={dust}
          onChange={(e) => setDust(+e.target.value)}
          onTouchStart={stopTouch}
          onTouchMove={stopTouch}
          onTouchEnd={stopTouch}
        />
      </label>
      <div className="bk-batt" aria-label={`Power ${power}%`}>
        <motion.div animate={{ width: `${power}%`, backgroundColor: power > 65 ? '#35c46a' : power > 30 ? '#f0b73e' : '#e5484d' }} />
        <b>{power}%</b>
      </div>
      <div className="bk-say">{mood}</div>
      <motion.button
        whileTap={{ scale: 0.92 }}
        className="bk-btn"
        onClick={() => {
          setDust((d) => Math.max(0, d - 40));
          setWind((w) => w + 1);
        }}
      >
        🌪️ Whoosh! A windy day
      </motion.button>
    </Item>
  );
}



function StarLighter() {
  const [n, setN] = useState(0);
  return (
    <Item className="bk-game compact">
      <div className="bk-night">
        {Array.from({ length: Math.min(n, 30) }, (_, i) => (
          <motion.span
            key={i}
            className="s"
            style={{ left: `${((i * 37 + 11) % 90) + 3}%`, top: `${((i * 53 + 7) % 70) + 8}%` }}
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 10 }}
          >
            ✦
          </motion.span>
        ))}
        {n === 0 && <span className="empty">the Martian sky is empty…</span>}
      </div>
      <motion.button whileTap={{ scale: 0.92 }} className="bk-btn" onClick={() => setN((x) => x + 1)}>
        ✨ Light a star for Spirit {n > 0 && `(${n})`}
      </motion.button>
    </Item>
  );
}

function RestartButton() {
  const { restart } = React.useContext(BookCtx);
  return (
    <Item>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} className="bk-btn ghost" onClick={restart}>
        ↺ Read it again
      </motion.button>
    </Item>
  );
}





type Spread = { left: React.ReactNode; right: React.ReactNode; tint?: string; heads?: [string, string] };

const PAGES: Spread[] = [
  {
    heads: ['Spirit’s Tale', 'Gusev Crater, Mars'],
    tint: 'linear-gradient(165deg, rgba(106,44,112,.14), rgba(238,122,53,.12))',
    left: <CoverArt h={372} />,
    right: (
      <>
        <Item className="bk-kicker">A true story from Mars</Item>
        <Item className="bk-booktitle">
          <span className="s1">Spirit</span>
          <span className="s2">the ghost rover’s</span>
          <span className="s3">Tale</span>
        </Item>
        <P>
          As told by a robot who explored another world, and who is <Hi c="teal">still here</Hi>, in a way. Hold on to
          your helmet, Cadet.
        </P>
        <Seal c="plum" tilt={-9}>True story<br />2004 – 2010</Seal>
        <Whisper>Psst… turn the page. I’ll wait.</Whisper>
      </>
    ),
  },



  {
    heads: ['Don’t be scared', 'The Mission Clock'],
    tint: 'linear-gradient(165deg, rgba(240,183,62,.18), rgba(196,72,42,.08))',
    left: (
      <>
        <Chapter n={1} title="Don’t be scared!" c="rust" />
        <P dc>
          Hello, Cadet. I’m a friendly ghost. My name is <Hi c="rust">Spirit</Hi>, and I used to be a rover: a robot
          geologist on six wheels, exploring the planet Mars.
        </P>
        <P>
          The scientists planned for me to work for just <Hi c="blue">90 sols</Hi>. After that, they said, I’d probably
          be worn out and dusty.
        </P>
        <Whisper>They were wrong. I’m very proud of that.</Whisper>
        <Fact title="Named by a kid!" c="plum">
          A 9-year-old girl, Sofi Collis, won a school essay contest and chose my name: Spirit.
        </Fact>
      </>
    ),
    right: <MissionClock />,
  },



  {
    heads: ['The Great Bounce', 'Landing day'],
    tint: 'linear-gradient(165deg, rgba(44,95,168,.12), rgba(240,183,62,.14))',
    left: (
      <>
        <Chapter n={2} title="The Great Bounce" c="blue" />
        <P dc>
          My trip began on 10 June 2003, when a rocket blasted me away from Earth. After nearly seven months in space,
          I reached Mars on <Hi c="blue">4 January 2004</Hi>.
        </P>
        <P>
          I didn’t land like a feather. I was wrapped in giant <Hi c="rust">airbags</Hi>, like a bouncy castle, and I
          bounced and rolled across the ground until I stopped inside a huge bowl-shaped hole called Gusev Crater.
        </P>
        <Fact c="blue">Scientists picked Gusev Crater because it might once have held a lake. 🌊</Fact>
      </>
    ),
    right: <BounceGame />,
  },



  {
    heads: ['Meet my body', 'Robot geologist'],
    tint: 'linear-gradient(165deg, rgba(106,44,112,.12), rgba(14,143,131,.12))',
    left: (
      <>
        <Chapter n={3} title="Meet my body" c="plum" />
        <P dc>
          Look at me, Cadet! I was a <Hi c="plum">robot geologist</Hi>. A geologist studies rocks to read the story of a
          planet, and I came with a whole toolkit for it.
        </P>
        <Pull>Rocks are Mars’s diary. I was there to read it.</Pull>
        <P>Tap the glowing dots on my body to meet my eyes, my arm and my wheels.</P>
        <Whisper>My poor ghost body has no wheels now. Floaty!</Whisper>
      </>
    ),
    right: <Anatomy />,
  },



  {
    heads: ['Roaming Mars', 'Follow my tracks'],
    tint: 'linear-gradient(165deg, rgba(196,72,42,.12), rgba(240,183,62,.16))',
    left: (
      <>
        <Chapter n={4} title="Roaming Mars" c="ember" />
        <P dc>
          Every day, Mission Control on Earth sent me instructions, and every day I rolled a little farther. Since
          messages need minutes to cross space, I had to be careful and brave on my own.
        </P>
        <P>
          Slow and steady, I crossed the dusty plain toward some faraway hills. Press <Hi c="rust">Drive!</Hi> to follow
          my tracks, or tap any numbered dot.
        </P>
        <Whisper>It’s only a sketch. I’m a ghost, not a map-maker!</Whisper>
      </>
    ),
    right: <PathMap />,
  },



  {
    heads: ['Mountain-goat rover', 'My real tracks'],
    tint: 'linear-gradient(165deg, rgba(14,143,131,.14), rgba(44,95,168,.10))',
    left: (
      <>
        <Chapter n={5} title="Mountain-goat rover" c="teal" />
        <P dc>
          Then came my favourite part. I climbed <Hi c="teal">Husband Hill</Hi>, in the Columbia Hills, and reached the
          top in August 2005. A rover on a mountain! I felt like a goat. 🐐
        </P>
        <P>
          Up there I found rocks that showed signs water had once changed them, clues that Mars was wetter long ago.
        </P>
        <Stats
          items={[
            { n: '7.7 km', l: 'driven (4.8 mi)', c: 'rust' },
            { n: '6+', l: 'years working', c: 'teal' },
            { n: '6', l: 'wheels', c: 'plum' },
          ]}
        />
        <Pic k="husbandHill" h={70} tilt={-1.5} caption="The view from the top" />
      </>
    ),
    right: (
      <>
        <Pic k="traverse" h={265} tilt={1.5} caption="My real tracks, mapped from space" />
        <Whisper>Every dot on that map is a day I rolled.</Whisper>
      </>
    ),
  },



  {
    heads: ['The wheel that wouldn’t turn', 'A shiny secret'],
    tint: 'linear-gradient(165deg, rgba(240,183,62,.20), rgba(106,44,112,.10))',
    left: (
      <>
        <Chapter n={6} title="The wheel that wouldn’t turn" c="rust" />
        <P dc>
          In 2006, one of my front wheels stopped turning. Ouch! But the team didn’t give up. They had me drive{' '}
          <Hi c="rust">backwards</Hi>, dragging the broken wheel behind me like a plough.
        </P>
        <Pull c="rust">My broken wheel found the secret.</Pull>
        <P>
          It scraped away the top layer of dirt, and underneath was something bright and shiny. In 2007, scientists
          found it was nearly pure <Hi c="teal">silica</Hi>.
        </P>
        <Fact title="Why it matters" c="teal">
          On Earth, silica forms in hot springs and steam vents, cosy places for tiny living things. So Mars may once
          have had warm, wet spots too!
        </Fact>
      </>
    ),
    right: (
      <>
        <DigGame />
        <Pic k="homePlate" h={70} tilt={1.5} caption="Home Plate" />
      </>
    ),
  },



  {
    heads: ['The long, cold sleep', 'Sunshine and dust'],
    tint: 'linear-gradient(165deg, rgba(29,22,51,.12), rgba(44,95,168,.14))',
    left: (
      <>
        <Chapter n={7} title="The long, cold sleep" c="blue" />
        <P dc>
          In April 2009, I got stuck in a patch of soft sand the team nicknamed <Hi c="blue">Troy</Hi>. My wheels spun
          and spun, but I only sank deeper.
        </P>
        <P>
          Winter was coming. With my panels tilted the wrong way and dust on top, I couldn’t catch enough sunshine to
          keep warm. My last message reached Earth on <Hi c="plum">22 March 2010</Hi>. Then I went to sleep, and I
          never woke up.
        </P>
        <Whisper>Don’t be sad, Cadet. Keep reading. It gets better!</Whisper>
      </>
    ),
    right: <DustPower />,
  },



  {
    heads: ['What I learned', 'The end… or is it?'],
    tint: 'linear-gradient(165deg, rgba(14,143,131,.14), rgba(240,183,62,.20))',
    left: (
      <>
        <Chapter n={8} title="What I learned" c="teal" />
        <P dc>
          For over a year, scientists kept sending messages to me across space. In May 2011, they said a gentle goodbye.
          I had worked for about <Hi c="rust">2,200 sols</Hi>, when I was only built for 90.
        </P>
        <P>
          My twin, Opportunity, kept exploring on the other side of Mars. And on my deck, a tiny sundial carried a
          message that still makes me smile:
        </P>
        <Pull c="teal">“Two Worlds, One Sun.”</Pull>
        <P>Look up, Cadet. We share the very same Sun.</P>
      </>
    ),
    right: (
      <>
        <Item className="bk-lesson">
          <div className="ttl">The Lesson</div>
          <p>
            Don’t let the plan decide your limits. I was built for 90 days and gave more than 2,000. And when my wheel
            broke, it led to my <b>biggest discovery</b>. So when things go wrong, keep going, stay curious, and look for
            the clue hiding inside the problem.
          </p>
        </Item>
        <StarLighter />
        <RestartButton />
      </>
    ),
  },
];




const COLS = 5;
const FLIP_FRAMES = 7;
const FPS = 12;
const FRAME_W = 960;
const FRAME_H = 750;
const BG_W = 4800;
const BG_H = 1500;
const AREA = { x: 142, y: 146, w: 676, h: 458 };
const CROP_W = FRAME_W - CROP.left - CROP.right;
const CROP_H = FRAME_H - CROP.top - CROP.bottom;

const ArrowIcon = ({ flip = false, size }: { flip?: boolean; size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    shapeRendering="crispEdges"
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <polygon fill="#fff" points="14,6 6,6 6,2 2,8 6,14 6,10 14,10" />
  </svg>
);

export default function BookPage() {
  const total = PAGES.length;
  useEffect(() => {
    const key = "spirit_reloaded";
    
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

  const [page, setPage] = useState(0);
  const [frame, setFrame] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [scale, setScale] = useState(0);

  const targetRef = useRef(0);
  const busyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth - SCREEN_PADDING * 2;
      const h = el.clientHeight - SCREEN_PADDING * 2;
      const fit = Math.min(w / CROP_W, h / CROP_H);
      setScale(Math.max(0.1, fit * BOOK_SIZE));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (busyRef.current) return;
      const target = targetRef.current + dir;
      if (target < 0 || target >= total) return;

      busyRef.current = true;
      targetRef.current = target;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        setPage(target);
        busyRef.current = false;
        return;
      }

      const seq = Array.from({ length: FLIP_FRAMES }, (_, i) => i);
      if (dir === -1) seq.reverse();

      let i = 0;
      setHidden(true);
      setFrame(seq[0]);

      timerRef.current = setInterval(() => {
        i += 1;
        if (i === 3) setPage(target);
        if (i === 5) setHidden(false);
        if (i >= seq.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setFrame(0);
          setHidden(false);
          busyRef.current = false;
          return;
        }
        setFrame(seq[i]);
      }, 1000 / FPS);
    },
    [total]
  );

  const restart = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    targetRef.current = 0;
    setHidden(true);
    setTimeout(() => {
      setPage(0);
      setHidden(false);
      busyRef.current = false;
    }, 250);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const col = (frame % COLS) * FRAME_W;
  const row = Math.floor(frame / COLS) * FRAME_H;
  const spread = PAGES[page];
  const heads = spread.heads ?? ['', ''];

  const cssVars = Object.entries(THEME)
    .map(([k, v]) => `--${k}:${v};`)
    .join('');

  return (
    <BookCtx.Provider value={{ restart }}>
      <div className="bk-root" lang="en">
        <style>{`
          @import url('${GOOGLE_FONTS_URL}');
          .bk-root{${cssVars}--fs:${BODY_FONT_SIZE}px;position:fixed;inset:0;display:flex;flex-direction:column;
            background:radial-gradient(ellipse 90% 45% at 50% 108%,#e0673a 0%,rgba(196,72,42,.55) 35%,transparent 70%),
              linear-gradient(#120d2c 0%,#2a1747 55%,#4a2056 100%);
            color:#fff;font-family:${BODY_FONT};overflow:hidden}
          .bk-root *{box-sizing:border-box}
          .bk-star{position:absolute;border-radius:50%;background:#fff;animation:bk-tw 3.4s ease-in-out infinite;pointer-events:none}
          @keyframes bk-tw{0%,100%{opacity:.12}50%{opacity:.9}}
          .bk-mote{position:absolute;bottom:-10px;width:5px;height:5px;border-radius:50%;background:rgba(240,140,90,.5);
            filter:blur(1px);pointer-events:none;animation:bk-drift 14s linear infinite}
          @keyframes bk-drift{0%{transform:translate(0,0);opacity:0}10%{opacity:.8}100%{transform:translate(120px,-105vh);opacity:0}}

          .bk-head{position:relative;flex:0 0 auto;padding:${HEADING_TOP}px 1rem 0;text-align:center;display:flex;
            align-items:center;justify-content:center;gap:12px}
          .bk-head h1{margin:0;font-family:${DISPLAY_FONT};font-weight:800;font-style:italic;letter-spacing:-.01em;
            font-size:clamp(1.15rem,3.3vw,${HEADING_SIZE}px);
            background:linear-gradient(90deg,#ffd9a0,#ff9a5c 45%,#9ff5e8);-webkit-background-clip:text;background-clip:text;
            color:transparent;filter:drop-shadow(0 0 12px rgba(159,245,232,.35)) drop-shadow(2px 3px 0 rgba(0,0,0,.35))}
          .bk-hghost{font-size:clamp(1.1rem,2.6vw,1.8rem);filter:drop-shadow(0 0 8px #9ff5e8)}

          .bk-area{position:relative;flex:1;min-height:0;display:flex;justify-content:center;
            align-items:${BOOK_ALIGN === 'top' ? 'flex-start' : 'center'};
            padding:${SCREEN_PADDING}px;margin-top:${HEADING_GAP}px}
          .bk-stage{position:absolute;left:0;top:0;transform-origin:top left}
          .bk-sprite{position:absolute;inset:0;background-repeat:no-repeat;pointer-events:none}
          .bk-content{position:absolute;display:flex;gap:48px;color:var(--ink);transition:opacity .2s}
          .bk-page{flex:1;min-width:0;display:grid;grid-template-rows:1fr auto;padding:14px 4px 10px 14px;
            font-size:var(--fs);line-height:1.5;border-radius:10px}
          .bk-page.right{padding:14px 14px 10px 4px}
          .bk-body{min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding:2px 5px 6px 2px;
            display:flex;flex-direction:column;gap:9px}
          .bk-foot{display:flex;align-items:baseline;gap:8px;padding-top:4px;border-top:1px solid rgba(42,29,46,.22);
            font-variant-caps:all-small-caps;letter-spacing:.1em;font-size:calc(var(--fs)*.95);color:#7a5a6a}
          .bk-foot .n{font-family:${DISPLAY_FONT};font-weight:800;font-variant-caps:normal;letter-spacing:0;
            font-size:calc(var(--fs)*1.25);color:var(--rust)}
          .bk-foot .h{flex:1}
          .bk-page.left .bk-foot .h{text-align:right}
          .bk-page.right .bk-foot{flex-direction:row-reverse}
          .bk-page.right .bk-foot .h{text-align:left}

          .t-rust{--c:var(--rust)}.t-ember{--c:var(--ember)}.t-plum{--c:var(--plum)}.t-teal{--c:var(--teal)}.t-blue{--c:var(--blue)}

          .bk-chap{display:flex;align-items:flex-end;gap:9px;padding-bottom:7px;border-bottom:2px solid transparent;
            border-image:linear-gradient(90deg,var(--c),transparent) 1}
          .bk-chap .num{font-family:${DISPLAY_FONT};font-weight:900;font-size:calc(var(--fs)*4.6);line-height:.78;
            color:transparent;-webkit-text-stroke:1.6px var(--c);opacity:.85}
          .bk-chap .tx{display:flex;flex-direction:column;gap:2px;min-width:0}
          .bk-chap .kick{font-variant-caps:all-small-caps;letter-spacing:.14em;color:var(--c);font-size:calc(var(--fs)*.95);font-weight:600}
          .bk-chap h2{margin:0;font-family:${DISPLAY_FONT};font-weight:800;font-size:calc(var(--fs)*1.75);line-height:1.02;
            letter-spacing:-.015em;color:var(--ink)}

          .bk-p p{margin:0;text-align:justify;hyphens:auto;text-wrap:pretty}
          .bk-p.dc p::first-letter{float:left;font-family:${DISPLAY_FONT};font-weight:900;color:var(--rust);
            font-size:calc(var(--fs)*3.5);line-height:.78;padding:.06em .09em 0 0}
          .bk-hi{color:var(--c);font-weight:700}

          .bk-whisper{display:flex;gap:6px;align-items:flex-start;font-family:${GHOST_FONT};font-size:calc(var(--fs)*1.6);
            line-height:1.05;color:var(--teal);transform:rotate(-1.5deg);text-shadow:0 0 9px rgba(159,245,232,.9)}
          .bk-pull{font-family:${DISPLAY_FONT};font-style:italic;font-weight:600;font-size:calc(var(--fs)*1.38);line-height:1.16;
            color:var(--c);border-left:4px solid var(--ember);padding:2px 0 2px 11px;letter-spacing:-.01em}

          .bk-fact{display:flex;flex-direction:column;gap:2px;background:rgba(255,255,255,.62);border:1.5px solid var(--c);
            border-radius:4px 14px 4px 14px;padding:6px 10px 7px 13px;box-shadow:inset 5px 0 0 var(--c);font-size:calc(var(--fs)*.94)}
          .bk-fact b{font-family:${DISPLAY_FONT};font-weight:800;font-variant-caps:all-small-caps;letter-spacing:.1em;
            color:var(--c);font-size:calc(var(--fs)*1.05)}

          .bk-stats{display:flex;gap:6px}
          .bk-stat{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;background:rgba(255,255,255,.6);
            border:1.5px solid var(--c);border-radius:10px;padding:4px 2px 5px;cursor:default}
          .bk-stat b{font-family:${DISPLAY_FONT};font-weight:900;font-size:calc(var(--fs)*1.5);color:var(--c);line-height:1}
          .bk-stat span{font-size:calc(var(--fs)*.78);line-height:1.1;color:#6b5260}

          .bk-seal{align-self:center;width:84px;height:84px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;
            text-align:center;border:2px dashed rgba(255,255,255,.85);box-shadow:0 0 0 3px var(--c),0 4px 10px rgba(0,0,0,.25);cursor:default}
          .bk-seal span{font-family:${DISPLAY_FONT};font-weight:800;font-size:calc(var(--fs)*.98);line-height:1.1;font-variant-caps:all-small-caps;letter-spacing:.06em}

          .bk-pic{margin:0;background:#fff;padding:5px 5px 3px;border-radius:5px;box-shadow:2px 3px 9px rgba(42,29,46,.3)}
          .bk-pic img{display:block;width:100%;object-fit:cover;border-radius:3px}
          .bk-pic figcaption{font-style:italic;font-size:calc(var(--fs)*.84);text-align:center;color:#7a5a6a;padding-top:2px}
          .bk-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;text-align:center;padding:6px;
            border-radius:3px;overflow:hidden;border:2px dashed #c9a37d;
            background:repeating-linear-gradient(45deg,#fbf0dc,#fbf0dc 8px,#f3e2c2 8px,#f3e2c2 16px)}
          .bk-ph .e{font-size:26px}
          .bk-ph .t{font-size:calc(var(--fs)*.72);line-height:1.15;color:#7a5236}

          .bk-kicker{text-align:center;font-variant-caps:all-small-caps;letter-spacing:.22em;font-weight:600;color:var(--teal);
            font-size:calc(var(--fs)*1.1);padding-top:6px}
          .bk-booktitle{display:flex;flex-direction:column;align-items:center;text-align:center;line-height:.9}
          .bk-booktitle .s1{font-family:${DISPLAY_FONT};font-weight:900;font-size:calc(var(--fs)*5.3);letter-spacing:-.03em;color:var(--rust);
            text-shadow:3px 3px 0 var(--gold),5px 5px 0 rgba(42,29,46,.25)}
          .bk-booktitle .s2{font-family:${DISPLAY_FONT};font-style:italic;font-weight:600;font-size:calc(var(--fs)*1.7);color:var(--plum);margin-top:4px}
          .bk-booktitle .s3{font-family:${DISPLAY_FONT};font-weight:900;font-size:calc(var(--fs)*3.5);letter-spacing:.06em;color:var(--teal);
            text-shadow:0 0 14px rgba(159,245,232,.9),2px 2px 0 rgba(42,29,46,.18)}

          .bk-cover-art{position:relative;border-radius:10px;overflow:hidden;box-shadow:3px 4px 12px rgba(42,29,46,.45)}
          .bk-cover-art > img{width:100%;height:100%;object-fit:cover;display:block}
          .bk-ghost{position:absolute;left:50%;top:15%;width:92px;height:100px;margin-left:-46px;border:0;background:none;cursor:pointer;
            padding:0;filter:drop-shadow(0 0 14px #9ff5e8) drop-shadow(0 0 30px rgba(159,245,232,.6))}
          .bk-whisper-bubble{position:absolute;top:8px;left:50%;transform:translateX(-50%);max-width:90%;
            background:rgba(10,8,30,.55);border:1px solid rgba(159,245,232,.6);border-radius:14px;padding:3px 12px;color:#dffcf7;
            font-family:${GHOST_FONT};font-size:calc(var(--fs)*1.5);line-height:1.1;text-align:center;white-space:nowrap}
          .bk-tap{position:absolute;bottom:8px;left:0;right:0;text-align:center;color:#ffe3c2;opacity:.85;
            font-variant-caps:all-small-caps;letter-spacing:.16em;font-size:calc(var(--fs)*.9)}

          .bk-game{background:var(--night);color:#f3eaff;border:2px solid var(--rust);border-radius:14px;padding:9px 10px;
            display:flex;flex-direction:column;gap:7px;align-items:center;text-align:center;box-shadow:0 4px 0 rgba(42,29,46,.3)}
          .bk-game.compact{padding:7px 10px}
          .bk-game-t{font-family:${DISPLAY_FONT};font-weight:800;font-style:italic;color:#ffd9a0;font-size:calc(var(--fs)*1.35);line-height:1.05}
          .bk-btn{font-family:${DISPLAY_FONT};font-weight:800;font-size:calc(var(--fs)*1.05);color:var(--ink);
            background:var(--gold);border:0;border-radius:999px;padding:6px 14px;cursor:pointer;box-shadow:0 3px 0 #a87a12}
          .bk-btn.ghost{background:transparent;color:inherit;border:2px solid currentColor;box-shadow:none}
          .bk-game .bk-btn.ghost{color:#ffd9a0}
          .bk-btn:hover{filter:brightness(1.08)}
          .bk-btn:disabled{opacity:.7;cursor:default}
          .bk-btn:focus-visible,.bk-dot:focus-visible,.bk-tile:focus-visible,.bk-arrow:focus-visible,.bk-ghost:focus-visible{
            outline:3px solid var(--ghost);outline-offset:2px}
          .bk-row{display:flex;gap:8px}
          .bk-say{font-weight:600;font-size:calc(var(--fs)*.95);color:#ffe3c2;min-height:1.4em}
          .bk-say.ok{color:#8affc1}

          .bk-bars{width:100%;display:flex;flex-direction:column;gap:3px;text-align:left}
          .bk-bars .lab{font-size:calc(var(--fs)*.92);color:#d9ccf2}
          .bk-bars .lab b{color:#fff}
          .bk-bars .trk{height:15px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden;margin-bottom:5px}
          .bk-bars .fill{height:100%;border-radius:99px}
          .bk-bars .plan{background:var(--ember)}
          .bk-bars .real{background:linear-gradient(90deg,#4fd6c6,#9ff5e8)}

          .bk-bounce{position:relative;width:100%;height:158px;border-radius:10px;overflow:hidden;
            background:linear-gradient(#2a1747,#a24a2f 80%,#e0743c)}
          .bk-ball{position:absolute;left:10px;bottom:18px;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;
            background:radial-gradient(circle at 35% 30%,#fff,#d9d9e6 60%,#9a9ab5);box-shadow:inset 0 0 0 2px rgba(255,255,255,.7)}
          .bk-ball span{font-size:20px}
          .bk-ground{position:absolute;left:0;right:0;bottom:0;height:18px;background:#7a3220;border-top:3px solid #5b2315}

          .bk-anat{position:relative;width:100%;aspect-ratio:300/160;background:radial-gradient(circle at 50% 40%,#3a2a66,#1a1233);border-radius:10px}
          .bk-dot{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:2px solid #fff;
            background:var(--gold);cursor:pointer;padding:0}
          .bk-dot i{position:absolute;inset:-2px;border-radius:50%;border:2px solid var(--gold)}
          .bk-dot.on{background:var(--ghost);border-color:#fff}
          .bk-dot.on i{border-color:var(--ghost)}
          .bk-card{width:100%;text-align:left;background:rgba(255,255,255,.08);border-left:4px solid var(--ghost);border-radius:6px;
            padding:6px 10px;min-height:78px}
          .bk-card b{font-family:${DISPLAY_FONT};font-weight:800;color:#9ff5e8;font-size:calc(var(--fs)*1.05)}
          .bk-card em{margin-left:8px;color:#ffd9a0;font-size:calc(var(--fs)*.88)}
          .bk-card p{margin:2px 0 0;font-size:calc(var(--fs)*.9);line-height:1.35;color:#eadffd}
          .bk-card p b{font-size:inherit;color:#ffd9a0}

          .bk-map{width:100%;aspect-ratio:300/210;border-radius:10px;overflow:hidden}

          .bk-dig{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;width:100%;max-width:200px}
          .bk-tile{position:relative;aspect-ratio:1;border:0;border-radius:8px;overflow:hidden;cursor:pointer;padding:0;background:#3b2a22}
          .bk-tile .under{position:absolute;inset:0;display:grid;place-items:center;font-size:20px;background:#5a4638}
          .bk-tile .under.shine{background:radial-gradient(circle,#fff,#e9fbff 55%,#b9efff);animation:bk-glow 1.4s ease-in-out infinite}
          @keyframes bk-glow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.25)}}
          .bk-tile .dust{position:absolute;inset:0;background:radial-gradient(circle at 30% 30%,#c0653b 0 2px,transparent 3px),
            radial-gradient(circle at 70% 60%,#a84f2c 0 2px,transparent 3px),#b5593a;border-radius:8px}

          .bk-panel{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:3px;width:100%;padding:5px;
            background:#18214a;border-radius:8px;overflow:hidden}
          .bk-panel span{height:20px;border-radius:2px;background:linear-gradient(135deg,#3d58b8,#243a85)}
          .bk-dustlayer{position:absolute;inset:0;background:radial-gradient(circle at 20% 30%,#c8825a,transparent 55%),
            radial-gradient(circle at 80% 70%,#b8704a,transparent 55%),#b97d55;pointer-events:none}
          .bk-slide{width:100%;display:flex;flex-direction:column;gap:2px;font-size:calc(var(--fs)*.92);color:#d9ccf2;text-align:left}
          .bk-slide input{width:100%;accent-color:var(--gold)}
          .bk-batt{position:relative;width:100%;height:18px;border:2px solid #d9ccf2;border-radius:6px;overflow:hidden}
          .bk-batt div{height:100%}
          .bk-batt b{position:absolute;inset:0;display:grid;place-items:center;font-size:calc(var(--fs)*.9);color:#fff;text-shadow:0 1px 2px #000}

          .bk-night{position:relative;width:100%;height:76px;border-radius:8px;overflow:hidden;
            background:radial-gradient(circle at 50% 120%,#5a2c63,#120d2c)}
          .bk-night .s{position:absolute;color:#fff3b0;font-size:16px;text-shadow:0 0 8px #ffe27a}
          .bk-night .empty{position:absolute;inset:0;display:grid;place-items:center;color:#9d8fc2;font-style:italic;font-size:calc(var(--fs)*.9)}

          .bk-lesson{background:linear-gradient(150deg,#3a1d48,#1d1633);color:#fff3e0;border:3px solid var(--gold);border-radius:6px 18px 6px 18px;
            padding:9px 12px 10px;animation:bk-pulse 3s ease-in-out infinite}
          @keyframes bk-pulse{0%,100%{box-shadow:0 0 0 rgba(159,245,232,0)}50%{box-shadow:0 0 22px rgba(159,245,232,.65)}}
          .bk-lesson .ttl{font-family:${DISPLAY_FONT};font-style:italic;font-weight:900;font-size:calc(var(--fs)*1.8);color:var(--gold);
            line-height:1;margin-bottom:3px}
          .bk-lesson p{margin:0;font-size:calc(var(--fs)*.98);line-height:1.42}
          .bk-lesson b{color:var(--ghost)}

          .bk-controls{position:absolute;display:flex;align-items:center;gap:12px}
          .bk-arrow{display:grid;place-items:center;border:0;background:transparent;cursor:pointer;padding:0}
          .bk-arrow:disabled{opacity:.35;cursor:default}
          .bk-arrow:not(:disabled):hover{filter:drop-shadow(2px 4px 6px #000)}
          .bk-arrow:not(:disabled):active{transform:scale(.9)}
          .bk-bar{flex:1;height:8px;border:1px solid #000;background:rgba(0,0,0,.3)}
          .bk-bar > div{height:100%;background:linear-gradient(90deg,var(--ember),var(--ghost));transition:width .3s}
          .bk-spacer{flex:1}
          @media (prefers-reduced-motion: reduce){.bk-star,.bk-mote,.bk-lesson,.bk-tile .under.shine{animation:none}}
        `}</style>

        {Array.from({ length: 34 }, (_, i) => (
          <span
            key={`s${i}`}
            className="bk-star"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 60}%`,
              width: 1 + (i % 3),
              height: 1 + (i % 3),
              animationDelay: `${(i % 7) * 0.45}s`,
            }}
          />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={`m${i}`}
            className="bk-mote"
            style={{ left: `${(i * 23 + 5) % 100}%`, animationDelay: `${i * 1.4}s`, animationDuration: `${11 + (i % 4) * 3}s` }}
          />
        ))}

        {HEADING && (
          <motion.header
            className="bk-head"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 14 }}
          >
            <h1>{HEADING}</h1>
            {HEADING_GHOSTS && (
              <span className="bk-hghost" aria-hidden="true">
                <Float amp={4} dur={3.2} rotate={8}>👻</Float>
              </span>
            )}
          </motion.header>
        )}

        <div className="bk-area" ref={areaRef}>
          <div
            style={{
              position: 'relative',
              width: CROP_W * scale,
              height: CROP_H * scale,
              visibility: scale ? 'visible' : 'hidden',
            }}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div
              className="bk-stage"
              style={{
                width: FRAME_W,
                height: FRAME_H,
                transform: `translate(${-CROP.left * scale}px, ${-CROP.top * scale}px) scale(${scale})`,
              }}
            >
              <div
                className="bk-sprite"
                style={{
                  backgroundImage: `url(${SPRITE_URL})`,
                  backgroundSize: `${BG_W}px ${BG_H}px`,
                  backgroundPosition: `-${col}px -${row}px`,
                }}
              />

              <div
                className="bk-content"
                style={{ left: AREA.x, top: AREA.y, width: AREA.w, height: AREA.h, opacity: hidden ? 0 : 1 }}
              >
                <div className="bk-page left" style={{ background: spread.tint }}>
                  <motion.div key={`L${page}`} className="bk-body" variants={containerV} initial="hidden" animate="show">
                    {spread.left}
                  </motion.div>
                  <div className="bk-foot">
                    <span className="n">{page * 2 + 1}</span>
                    <span className="h">{heads[0]}</span>
                  </div>
                </div>
                <div className="bk-page right" style={{ background: spread.tint }}>
                  <motion.div key={`R${page}`} className="bk-body" variants={containerV} initial="hidden" animate="show">
                    {spread.right}
                  </motion.div>
                  <div className="bk-foot">
                    <span className="n">{page * 2 + 2}</span>
                    <span className="h">{heads[1]}</span>
                  </div>
                </div>
              </div>

              <div
                className="bk-controls"
                style={{ left: AREA.x, top: AREA.y + AREA.h + CONTROLS_GAP, width: AREA.w }}
              >
                <button
                  className="bk-arrow"
                  style={{ width: ARROW_SIZE, height: ARROW_SIZE }}
                  aria-label="Previous page"
                  disabled={page === 0}
                  onClick={() => go(-1)}
                >
                  <ArrowIcon flip size={ARROW_SIZE} />
                </button>

                {SHOW_PROGRESS_BAR ? (
                  <div className="bk-bar">
                    <div style={{ width: `${((page + 1) / total) * 100}%` }} />
                  </div>
                ) : (
                  <div className="bk-spacer" />
                )}

                <button
                  className="bk-arrow"
                  style={{ width: ARROW_SIZE, height: ARROW_SIZE }}
                  aria-label="Next page"
                  disabled={page === total - 1}
                  onClick={() => go(1)}
                >
                  <ArrowIcon size={ARROW_SIZE} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BookCtx.Provider>
  );
}
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'motion/react';


const HEADING = 'The Tale of Apollo 11'; 
const HEADING_SIZE = 44;
const HEADING_TOP = 6; 
const HEADING_GAP = -20; 
const HEADING_COLORS = ['#ffd23f', '#ff5fb7', '#4fc3f7', '#7CFC9a'];

const BOOK_SIZE = 1.05; 
const BOOK_ALIGN: 'top' | 'center' = 'top';
const SCREEN_PADDING = 4; 
const CROP = { top: 90, bottom: 50, left: 90, right: 90 };

const ARROW_SIZE = 40;
const CONTROLS_GAP = 14;
const SHOW_PROGRESS_BAR = true;

const BODY_FONT_SIZE = 13; 

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bangers&family=Fredoka:wght@400;500;600;700&display=swap';
const DISPLAY_FONT = "'Bangers', 'Comic Sans MS', cursive"; 
const BODY_FONT = "'Fredoka', 'Trebuchet MS', sans-serif";

const THEME = {
  pink: '#f23a9d',
  blue: '#1e88e5',
  green: '#1fa65a',
  orange: '#ff7a00',
  purple: '#7c4dff',
  red: '#e53935',
  teal: '#00a3b4',
  yellow: '#ffd23f',
  ink: '#2b2347', 
};

const SPRITE_URL = 'https://assets.codepen.io/36869/book.webp';

const IMAGES = {
  cover: {
    src: '/images/apollo11/cover.png',
    emoji: '🌙',
    want: 'COVER ART: a cheerful cartoon Moon with the Eagle lander, a tiny shiny reflector panel and a starry sky. Portrait / tall shape.',
  },
  eagle: {
    src: '/images/apollo11/eagle.gif',
    emoji: '🛬',
    want: 'PHOTO: the Apollo 11 Eagle lunar module standing on the Moon at Tranquility Base.',
  },
  site: {
    src: '/images/apollo11/landing.png',
    emoji: '🗺️',
    want: 'DIAGRAM: a map of the Apollo 11 landing site showing where each experiment was placed.',
  },
  descentStage: {
    src: '/images/apollo11/lmdescent.png',
    emoji: '🦵',
    want: 'PHOTO or DRAWING: the LM Descent Stage with its legs and gold foil, on the Moon.',
  },
  equipment: {
    src: '/images/apollo11/plss.jpg',
    emoji: '📡',
    want: 'PHOTO: antennas, cables and the PLSS backpack equipment from Apollo 11.',
  },
  seismometer: {
    src: '/images/apollo11/pse.png',
    emoji: '🌍',
    want: 'PHOTO: the Passive Seismic Experiment package sitting on the lunar surface.',
  },
  lrrr: {
    src: '/images/apollo11/lrrr.png',
    emoji: '✨',
    want: 'PHOTO: the LRRR retroreflector panel on the Moon (Buzz Aldrin photo).',
  },
};
type ImgKey = keyof typeof IMAGES;

type Tone = 'pink' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal';

const BookCtx = React.createContext<{ restart: () => void }>({ restart: () => {} });

const containerV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 220, damping: 18 } },
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

function Title({ children, c = 'pink', tilt = -2 }: { children: React.ReactNode; c?: Tone; tilt?: number }) {
  return (
    <Item className={`bk-h c-${c}`} style={{ rotate: tilt }}>
      {children}
    </Item>
  );
}

function P({ children, indent = true }: { children: React.ReactNode; indent?: boolean }) {
  return (
    <Item className={`bk-p ${indent ? 'ind' : ''}`}>
      <p>{children}</p>
    </Item>
  );
}

function Hi({ children, c = 'pink' }: { children: React.ReactNode; c?: Tone }) {
  return <span className={`bk-hi c-${c}`}>{children}</span>;
}

function Big({ children, c = 'orange' }: { children: React.ReactNode; c?: Tone }) {
  return <span className={`bk-big c-${c}`}>{children}</span>;
}

function Float({
  children,
  amp = 5,
  dur = 2.6,
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


function Bubble({
  who,
  emoji,
  c = 'blue',
  side = 'left',
  children,
}: {
  who: string;
  emoji?: string;
  c?: Tone;
  side?: 'left' | 'right';
  children: React.ReactNode;
}) {
  return (
    <Item className={`bk-bubble c-${c} ${side}`}>
      <div className="who">
        {emoji && <Float amp={3} dur={2}>{emoji}</Float>} {who}
      </div>
      <div>{children}</div>
    </Item>
  );
}

function Fact({ title = 'Did you know?', c = 'orange', children }: { title?: string; c?: Tone; children: React.ReactNode }) {
  return (
    <Item className={`bk-fact c-${c}`}>
      <b>{title}</b> {children}
    </Item>
  );
}

function Stamp({ children, c = 'pink', tilt = 6 }: { children: React.ReactNode; c?: Tone; tilt?: number }) {
  return (
    <motion.div
      variants={itemV}
      className={`bk-stamp c-${c}`}
      style={{ rotate: tilt }}
      whileHover={{ scale: 1.08, rotate: tilt + 6 }}
    >
      {children}
    </motion.div>
  );
}


function Pic({ k, caption, tilt = 0, h = 150 }: { k: ImgKey; caption?: string; tilt?: number; h?: number }) {
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



const PACK = [
  { id: 'rocks', label: 'Moon rocks', emoji: '🪨', w: 1 },
  { id: 'ant', label: 'Antennas', emoji: '📡', w: 2 },
  { id: 'cab', label: 'Cables', emoji: '🔌', w: 1 },
  { id: 'plss', label: 'Life Support backpack', emoji: '🎒', w: 3 },
  { id: 'desc', label: 'Descent Stage', emoji: '🛰️', w: 10 },
];
const LIMIT = 6;


function PackingGame() {
  const [on, setOn] = useState<string[]>(['rocks']);
  const load = PACK.filter((p) => on.includes(p.id)).reduce((s, p) => s + p.w, 0);
  const over = load > LIMIT;
  const toggle = (id: string) => setOn((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  return (
    <Item className="bk-game c-purple">
      <div className="bk-game-t">🚀 Pack the ship!</div>
      <div className="bk-game-s">Tap a thing to take it home.</div>
      <div className="bk-pack">
        {PACK.map((p) => (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.9 }}
            className={`bk-chip ${on.includes(p.id) ? 'on' : ''}`}
            onClick={() => toggle(p.id)}
          >
            <span>{p.emoji}</span> {p.label}
            <small>{on.includes(p.id) ? 'going home' : 'staying'}</small>
          </motion.button>
        ))}
      </div>
      <div className="bk-meter">
        <motion.div
          animate={{ width: `${Math.min(100, (load / LIMIT) * 100)}%`, backgroundColor: over ? THEME.red : THEME.green }}
        />
      </div>
      <div className={`bk-say ${over ? 'bad' : 'ok'}`}>
        {over
          ? '😱 Too heavy! The ship can’t lift off!'
          : on.includes('rocks')
            ? '✅ Light enough! The rocks fly home!'
            : '🤔 Where are the moon rocks?!'}
      </div>
    </Item>
  );
}


function LaunchPad() {
  const [up, setUp] = useState(false);
  return (
    <Item className="bk-game c-orange">
      <div className="bk-sky">
        <motion.div
          className="bk-rocket"
          animate={up ? { y: -135, rotate: [0, -5, 5, 0] } : { y: 0, rotate: 0 }}
          transition={{ duration: up ? 1.6 : 0.5, ease: up ? 'easeIn' : 'easeOut' }}
        >
          🚀
          <small>Ascent Stage</small>
        </motion.div>
        <motion.div className="bk-flame" animate={up ? { opacity: [0, 1, 0.6], scaleY: [0.5, 1.4, 1] } : { opacity: 0 }}>
          🔥
        </motion.div>
        <div className="bk-pad">🛰️ Descent Stage (that’s me!)</div>
      </div>
      <motion.button whileTap={{ scale: 0.93 }} className="bk-btn" onClick={() => setUp((u) => !u)}>
        {up ? '↺ Back to the pad' : '3… 2… 1… LIFTOFF!'}
      </motion.button>
    </Item>
  );
}


function Thump() {
  const [n, setN] = useState(0);
  return (
    <Item className="bk-game c-teal">
      <div className="bk-game-t">📈 Seismic wiggles</div>
      <div className="bk-seis">
        {Array.from({ length: 20 }, (_, i) => (
          <motion.i
            key={i}
            animate={{ height: n ? [4, 8 + Math.abs(Math.sin(i * 1.7 + n)) * 42 * (1 - i / 26), 4] : 4 }}
            transition={{ duration: 1.7, delay: i * 0.05, ease: 'easeOut' }}
          />
        ))}
      </div>
      <motion.button whileTap={{ scale: 0.92 }} className="bk-btn" onClick={() => setN((x) => x + 1)}>
        👣 Thump the Moon!
      </motion.button>
    </Item>
  );
}


function LaserBounce() {
  const [shot, setShot] = useState(0);
  return (
    <Item className="bk-game c-blue">
      <div className="bk-laser">
        <span className="p e">🌍</span>
        <span className="p m">🌙</span>
        {shot > 0 && (
          <motion.div
            key={shot}
            className="bk-beam"
            initial={{ left: '16%', opacity: 1 }}
            animate={{ left: ['16%', '78%', '16%'], opacity: [1, 1, 1] }}
            transition={{ duration: 2.6, times: [0, 0.5, 1], ease: 'linear' }}
          />
        )}
      </div>
      <motion.button whileTap={{ scale: 0.92 }} className="bk-btn" onClick={() => setShot((s) => s + 1)}>
        🔦 Fire the laser!
      </motion.button>
      <div className="bk-game-s">Round trip: about 2.5 seconds.</div>
    </Item>
  );
}

function RestartButton() {
  const { restart } = React.useContext(BookCtx);
  return (
    <Item>
      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }} className="bk-btn" onClick={restart}>
        ↺ Read it again
      </motion.button>
    </Item>
  );
}




type Spread = { left: React.ReactNode; right: React.ReactNode; tint?: string };

const PAGES: Spread[] = [

    {
    tint: 'linear-gradient(160deg, rgba(124,77,255,.16), rgba(0,163,180,.14))',
    left: (
      <>
        <Pic k="cover" h={305} tilt={-2} caption="Hardware left on the Moon!" />
        <Stamp c="pink" tilt={-6}>Told by the gear they left behind!</Stamp>
      </>
    ),
    right: (
      <>
        <Item className="bk-cover">
          <span className="c-pink">THE</span> <span className="c-blue">TALE</span> <span className="c-orange">OF</span>
          <br />
          <span className="c-purple big">APOLLO</span> <span className="c-green big">11</span>
        </Item>
        <P indent={false}>
          A <Hi c="teal">true space adventure</Hi>, told by the machines that stayed on the Moon. Hold on to your
          helmet, Cadet!
        </P>
        <Item>
          <div className="bk-hint">
            <Float amp={4} rotate={6}>👉</Float> Flip the page, Cadet!
          </div>
        </Item>
        <Stamp c="orange" tilt={5}>Mission: MOON 🌙</Stamp>
      </>
    ),
  },


  {
    tint: 'linear-gradient(160deg, rgba(255,210,63,.20), rgba(255,122,0,.10))',
    left: (
      <>
        <Title c="pink">Hello, Cadet! <Float rotate={14}>👋</Float></Title>
        <P>
          We are the <Hi c="blue">hardware</Hi> that Apollo 11 left on the Moon. <Big c="orange">Humans used us to
          survive</Big> up here: to land safely, to breathe, to explore, and to talk to Earth.
        </P>
        <P>But when it was time to go home, we had a big problem…</P>
        <Bubble who="All of us, together" emoji="🧰" c="red">
          The spaceship would be <b>too heavy</b> to fly back to Earth!
        </Bubble>
      </>
    ),
    right: (
      <>
        <Pic k="eagle" h={240} tilt={2} caption="Tranquility Base, 20 July 1969" />
        <Fact c="purple">
          On 20 July 1969, Neil Armstrong and Buzz Aldrin landed in the Sea of Tranquility. Michael Collins stayed in
          orbit above, waiting for them. 🌙
        </Fact>
      </>
    ),
  },


  {
    tint: 'linear-gradient(160deg, rgba(124,77,255,.14), rgba(244,58,157,.10))',
    left: (
      <>
        <Title c="purple" tilt={-3}>So we stayed!</Title>
        <P>
          We said goodbye so the astronauts could carry something <Big c="pink">precious</Big> home:{' '}
          <Hi c="orange">moon rocks!</Hi> 🪨
        </P>
        <P>
          Moon rocks are like time capsules. Scientists on Earth study them to learn how the Moon was made. Apollo 11
          carried home about <Hi c="green">21 kilograms</Hi> (47 pounds) of them.
        </P>
        <Bubble who="Moon rocks" emoji="🪨" c="orange" side="right">
          Take us! We’re small, but we’re full of secrets!
        </Bubble>
      </>
    ),
    right: (
      <>
        <Title c="teal" tilt={2}>Your turn!</Title>
        <PackingGame />
      </>
    ),
  },


  {
    tint: 'linear-gradient(160deg, rgba(31,166,90,.14), rgba(255,210,63,.16))',
    left: (
      <>
        <Title c="green" tilt={-2}>Meet the Moon-Gang!</Title>
        <P>
          This is the <Hi c="pink">list of us hardware</Hi> out here:
        </P>
        <Item>
          <ol className="bk-roll">
            <li className="c-blue"><b>LM Descent Stage</b></li>
            <li className="c-teal"><b>Antennas</b> and <b>cables</b></li>
            <li className="c-orange"><b>Portable Life Support System</b></li>
            <li className="c-purple"><b>Passive Seismic Experiment</b></li>
            <li className="c-pink"><b>Lunar Retro-Ranging Reflector Experiment</b></li>
          </ol>
        </Item>
        <P indent={false}>Turn the page and we’ll introduce ourselves, one by one!</P>
      </>
    ),
    right: (
      <>
        <Pic k="site" h={130} tilt={-2} caption="Our neighbourhood on the Moon" />
        <Bubble who="A very quiet little panel" emoji="🤫" c="pink" side="right">
          I’m last on the list… but I’ll be the one telling you the ending. Be patient, Cadet!
        </Bubble>
      </>
    ),
  },


  {
    tint: 'linear-gradient(160deg, rgba(255,122,0,.16), rgba(255,210,63,.14))',
    left: (
      <>
        <Title c="orange" tilt={-2}>I’m the LM Descent Stage!</Title>
        <Bubble who="LM Descent Stage" emoji="🛰️" c="orange">
          I was the <b>bottom half</b> of the Eagle lander. My strong legs set everybody down softly on the Moon!
        </Bubble>
        <P>
          When it was time to leave, I became a <Hi c="red">launch pad</Hi> for the <Hi c="blue">Ascent Stage</Hi>, the
          top half, with the astronauts inside. They zoomed up. I stayed. Best job ever! 🏆
        </P>
        <Fact c="blue" title="LM means…">Lunar Module: the spacecraft that carried two astronauts down to the Moon.</Fact>
      </>
    ),
    right: (
      <>
        <Title c="red" tilt={3}>Countdown time!</Title>
        <LaunchPad />
        <Pic k="descentStage" h={80} tilt={-1} caption="My legs and gold foil" />
      </>
    ),
  },

  {
    tint: 'linear-gradient(160deg, rgba(0,163,180,.16), rgba(30,136,229,.12))',
    left: (
      <>
        <Title c="teal" tilt={-2}>Left behind, but not forgotten!</Title>
        <Bubble who="Antennas" emoji="📡" c="teal">
          We beamed voices and messages between the Moon and Earth. <b>Hello, home!</b>
        </Bubble>
        <Bubble who="Cables" emoji="🔌" c="purple" side="right">
          We linked everything together so all the machines could work as one team.
        </Bubble>
        <Bubble who="Portable Life Support System" emoji="🎒" c="green">
          I was the astronauts’ backpack! I gave them air to breathe and kept them cool. Then I stayed to lighten the
          load.
        </Bubble>
      </>
    ),
    right: (
      <>
        <Pic k="equipment" h={125} tilt={2} caption="Some of our gear" />
        <Fact c="red" title="Wow!">
          On the Moon it swings from scorching sunshine to freezing shadows, so astronauts needed their life support
          backpacks! 🔥❄️
        </Fact>
      </>
    ),
  },

  {
    tint: 'linear-gradient(160deg, rgba(124,77,255,.15), rgba(0,163,180,.14))',
    left: (
      <>
        <Title c="purple" tilt={-2}>Shhh… I feel the Moon shake!</Title>
        <Bubble who="Passive Seismic Experiment" emoji="🌍" c="purple">
          My job was to detect <b>moonquakes</b> and <b>space-rock crashes</b>. 🌠
        </Bubble>
        <P>
          Shaking waves, called <Hi c="teal">seismic waves</Hi>, travel differently on the Moon than they do on Earth, so
          my wiggles taught scientists brand-new things.
        </P>
        <P>
          My big discovery: the Moon is <Big c="green">geologically quiet</Big>. It hardly rumbles at all, so we live
          here <Hi c="pink">peacefully</Hi>. 😌
        </P>
      </>
    ),
    right: (
      <>
        <Thump />
        <Pic k="seismometer" h={100} tilt={-2} caption="Me, listening to the Moon" />
      </>
    ),
  },

  {
    tint: 'linear-gradient(160deg, rgba(244,58,157,.14), rgba(255,210,63,.16))',
    left: (
      <>
        <Title c="pink" tilt={-3}>Oops! I forgot to introduce myself!</Title>
        <Bubble who="LRRR" emoji="✨" c="pink">
          Hi! I’m the <b>Lunar Retro-Ranging Reflector Experiment</b>. Just call me <Big c="pink">LRRR</Big>!
        </Bubble>
        <P>
          I’m telling you this story because the rest of the Apollo 11 gang has gone quiet. Maybe, just maybe, I’m the
          only one still awake. Sometimes it gets <Hi c="blue">lonely</Hi>. 🥺
        </P>
        <Pic k="lrrr" h={70} tilt={2} caption="That’s me!" />
      </>
    ),
    right: (
      <>
        <P indent={false}>
          But I keep doing my job: <Big c="orange">bouncing Earth’s lasers right back at them!</Big>
        </P>
        <LaserBounce />
        <P>
          I do it through the <Hi c="blue">freezing, two-week-long lunar nights</Hi> ❄️. I don’t need electricity, so the
          cold never bothers me.
        </P>
      </>
    ),
  },

  {
    tint: 'linear-gradient(160deg, rgba(255,210,63,.24), rgba(244,58,157,.12))',
    left: (
      <>
        <Title c="orange" tilt={-2}>We were great while we lasted! 🌟</Title>
        <P>
          With our help, humans made <Big c="green">amazing discoveries</Big> about the Moon. And we’ll stay right
          here on the Moon we call home, until our life’s end.
        </P>
        <Bubble who="LRRR" emoji="✨" c="pink">
          Cadet, if you remember only one thing from me: <b>work hard, even when the odds are against you.</b> Work even
          harder than I do!
        </Bubble>
      </>
    ),
    right: (
      <>
        <Item className="bk-lesson">
          <div className="ttl">⭐ THE LESSON ⭐</div>
          <p>
            Keep working hard, even when it is difficult and nobody is watching. A tiny reflector on the Moon keeps going
            every day… and <b>so can you!</b>
          </p>
        </Item>
        <Stamp c="green" tilt={-5}>Official Apollo Cadet 🚀</Stamp>
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

  const cssVars = Object.entries(THEME)
    .map(([k, v]) => `--${k}:${v};`)
    .join('');

  return (
    <BookCtx.Provider value={{ restart }}>
      <div className="bk-root">
        <style>{`
          @import url('${GOOGLE_FONTS_URL}');
          .bk-root{${cssVars}--fs:${BODY_FONT_SIZE}px;position:fixed;inset:0;display:flex;flex-direction:column;
            background:radial-gradient(ellipse at 50% 120%,#3b2a7a 0%,#1a1440 45%,#0b0824 100%);
            color:#fff;font-family:${BODY_FONT};overflow:hidden}
          .bk-root *{box-sizing:border-box}
          .bk-star{position:absolute;border-radius:50%;background:#fff;animation:bk-tw 3s ease-in-out infinite;pointer-events:none}
          @keyframes bk-tw{0%,100%{opacity:.15}50%{opacity:.95}}
          .bk-head{position:relative;flex:0 0 auto;padding:${HEADING_TOP}px 1rem 0;text-align:center}
          .bk-head h1{margin:0;font-family:${DISPLAY_FONT};font-weight:400;letter-spacing:.04em;
            font-size:clamp(1.2rem,3.4vw,${HEADING_SIZE}px);text-shadow:2px 3px 0 rgba(0,0,0,.45)}
          .bk-head h1 span{display:inline-block;margin:0 .18em}
          .bk-area{position:relative;flex:1;min-height:0;display:flex;justify-content:center;
            align-items:${BOOK_ALIGN === 'top' ? 'flex-start' : 'center'};
            padding:${SCREEN_PADDING}px;margin-top:${HEADING_GAP}px}
          .bk-stage{position:absolute;left:0;top:0;transform-origin:top left}
          .bk-sprite{position:absolute;inset:0;background-repeat:no-repeat;pointer-events:none}
          .bk-content{position:absolute;display:flex;gap:48px;color:var(--ink);transition:opacity .2s}
          .bk-page{flex:1;min-width:0;display:grid;grid-template-rows:1fr auto;padding:16px 4px 14px 14px;
            font-size:var(--fs);line-height:1.35;border-radius:12px}
          .bk-page.right{padding:16px 14px 14px 4px}
          .bk-body{min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding:2px 4px 6px 2px;
            display:flex;flex-direction:column;gap:7px}
          .bk-num{padding-top:3px;font-family:${DISPLAY_FONT};letter-spacing:.06em;color:var(--orange);font-size:calc(var(--fs)*1.2)}
          .bk-page.right .bk-num{text-align:right}

          .c-pink{--c:var(--pink)}.c-blue{--c:var(--blue)}.c-green{--c:var(--green)}.c-orange{--c:var(--orange)}
          .c-purple{--c:var(--purple)}.c-red{--c:var(--red)}.c-teal{--c:var(--teal)}

          .bk-h{font-family:${DISPLAY_FONT};letter-spacing:.03em;line-height:1;color:var(--c);
            font-size:calc(var(--fs)*1.95);text-shadow:2px 2px 0 rgba(43,35,71,.18);transform-origin:left center}
          .bk-p p{margin:0}
          .bk-p.ind p{text-indent:1.1rem}
          .bk-hi{color:var(--c);font-weight:700;border-bottom:2px wavy var(--c);text-decoration:none}
          .bk-big{font-family:${DISPLAY_FONT};color:var(--c);font-size:1.45em;letter-spacing:.03em;line-height:1;
            text-shadow:1px 1px 0 rgba(43,35,71,.2)}

          .bk-bubble{position:relative;background:#fff;border:2.5px solid var(--c);border-radius:16px;padding:7px 10px 8px;
            box-shadow:3px 3px 0 var(--c);margin:2px 6px 4px 0}
          .bk-bubble.right{margin:2px 0 4px 6px}
          .bk-bubble::after{content:'';position:absolute;bottom:-9px;left:20px;width:14px;height:14px;background:#fff;
            border-right:2.5px solid var(--c);border-bottom:2.5px solid var(--c);transform:rotate(45deg)}
          .bk-bubble.right::after{left:auto;right:20px}
          .bk-bubble .who{font-family:${DISPLAY_FONT};letter-spacing:.05em;color:var(--c);font-size:calc(var(--fs)*1.15)}

          .bk-fact{border:2.5px dashed var(--c);border-radius:12px;padding:6px 9px;background:rgba(255,255,255,.7)}
          .bk-fact b{font-family:${DISPLAY_FONT};letter-spacing:.05em;color:var(--c);font-size:calc(var(--fs)*1.2);font-weight:400}

          .bk-stamp{align-self:center;text-align:center;font-family:${DISPLAY_FONT};letter-spacing:.05em;color:#fff;
            background:var(--c);padding:7px 14px;border-radius:999px;border:3px dashed #fff;box-shadow:0 0 0 3px var(--c);
            font-size:calc(var(--fs)*1.2);cursor:default}

          .bk-pic{margin:0;background:#fff;padding:5px 5px 3px;border-radius:6px;box-shadow:2px 3px 8px rgba(0,0,0,.25)}
          .bk-pic img{display:block;width:100%;object-fit:cover;border-radius:3px}
          .bk-pic figcaption{font-size:calc(var(--fs)*.82);text-align:center;color:#6b5f8f;padding-top:2px}
          .bk-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;text-align:center;
            padding:6px;border-radius:3px;overflow:hidden;
            background:repeating-linear-gradient(45deg,#f3ecff,#f3ecff 8px,#e6dcff 8px,#e6dcff 16px);border:2px dashed #9b84ff}
          .bk-ph .e{font-size:30px}
          .bk-ph .t{font-size:calc(var(--fs)*.72);line-height:1.15;color:#4b3b88}

          .bk-cover{font-family:${DISPLAY_FONT};font-size:calc(var(--fs)*2.6);line-height:.95;letter-spacing:.04em;
            text-align:center;text-shadow:3px 3px 0 rgba(43,35,71,.25);margin-top:6px;transform:rotate(-3deg)}
          .bk-cover span{color:var(--cc)}
          .bk-cover .c-pink{--cc:var(--pink)}.bk-cover .c-blue{--cc:var(--blue)}.bk-cover .c-orange{--cc:var(--orange)}
          .bk-cover .c-purple{--cc:var(--purple)}.bk-cover .c-green{--cc:var(--green)}
          .bk-cover .big{font-size:1.5em}
          .bk-hint{text-align:center;font-family:${DISPLAY_FONT};letter-spacing:.06em;color:var(--purple);font-size:calc(var(--fs)*1.4)}

          .bk-roll{margin:0;padding:0;list-style:none;counter-reset:n;display:flex;flex-direction:column;gap:5px}
          .bk-roll li{counter-increment:n;background:var(--c);color:#fff;padding:5px 10px 5px 34px;border-radius:10px;
            position:relative;font-size:calc(var(--fs)*.95)}
          .bk-roll li::before{content:counter(n);position:absolute;left:6px;top:50%;transform:translateY(-50%);
            width:22px;height:22px;border-radius:50%;background:#fff;color:var(--c);display:grid;place-items:center;
            font-family:${DISPLAY_FONT};font-size:14px}

          .bk-game{background:rgba(255,255,255,.75);border:2.5px solid var(--c);border-radius:14px;padding:8px;
            display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center}
          .bk-game-t{font-family:${DISPLAY_FONT};letter-spacing:.05em;color:var(--c);font-size:calc(var(--fs)*1.35)}
          .bk-game-s{font-size:calc(var(--fs)*.85);color:#6b5f8f}
          .bk-btn{font-family:${DISPLAY_FONT};letter-spacing:.06em;font-size:calc(var(--fs)*1.2);color:#fff;
            background:var(--c,var(--pink));border:0;border-radius:999px;padding:6px 14px;cursor:pointer;
            box-shadow:0 3px 0 rgba(43,35,71,.35)}
          .bk-btn:hover{filter:brightness(1.08)}

          .bk-pack{display:grid;grid-template-columns:1fr 1fr;gap:5px;width:100%}
          .bk-chip{font:inherit;font-size:calc(var(--fs)*.85);background:#fff;border:2px solid #cbbcf5;border-radius:10px;
            padding:4px 3px;cursor:pointer;display:flex;flex-direction:column;align-items:center;color:var(--ink);line-height:1.1}
          .bk-chip span{font-size:20px}
          .bk-chip small{font-size:calc(var(--fs)*.75);color:#8b7fb5}
          .bk-chip.on{background:#e7ffe9;border-color:var(--green)}
          .bk-chip.on small{color:var(--green);font-weight:700}
          .bk-pack .bk-chip:last-child{grid-column:1 / -1}
          .bk-meter{width:100%;height:12px;border-radius:99px;background:#ddd4fa;overflow:hidden}
          .bk-meter > div{height:100%;border-radius:99px}
          .bk-say{font-weight:700;font-size:calc(var(--fs)*.95)}
          .bk-say.bad{color:var(--red)}.bk-say.ok{color:var(--green)}

          .bk-sky{position:relative;width:100%;height:150px;border-radius:10px;overflow:hidden;
            background:linear-gradient(#0b0824,#2a1f66)}
          .bk-sky::before{content:'';position:absolute;inset:0;
            background:radial-gradient(1px 1px at 20% 30%,#fff,transparent),radial-gradient(1.5px 1.5px at 70% 20%,#fff,transparent),
            radial-gradient(1px 1px at 85% 60%,#fff,transparent),radial-gradient(1.5px 1.5px at 40% 70%,#fff,transparent)}
          .bk-rocket{position:absolute;left:50%;bottom:36px;margin-left:-32px;width:64px;text-align:center;font-size:30px;line-height:1}
          .bk-rocket small{display:block;font-size:calc(var(--fs)*.7);color:#fff;font-family:${BODY_FONT}}
          .bk-flame{position:absolute;left:50%;bottom:22px;margin-left:-10px;font-size:18px;transform-origin:top}
          .bk-pad{position:absolute;left:0;right:0;bottom:0;padding:5px;background:#8d8aa8;color:#fff;font-weight:600;
            font-size:calc(var(--fs)*.85)}

          .bk-seis{display:flex;align-items:center;justify-content:space-between;gap:2px;width:100%;height:56px;
            background:#102a33;border-radius:8px;padding:4px}
          .bk-seis i{display:block;flex:1;min-height:4px;border-radius:3px;background:#5df2d6}

          .bk-laser{position:relative;width:100%;height:56px;border-radius:10px;
            background:radial-gradient(circle at 30% 40%,#27227a,#0b0824)}
          .bk-laser .p{position:absolute;top:50%;transform:translateY(-50%);font-size:28px}
          .bk-laser .e{left:6%}.bk-laser .m{right:6%}
          .bk-beam{position:absolute;top:50%;width:10px;height:10px;margin-top:-5px;border-radius:50%;background:#ff4d4d;
            box-shadow:0 0 10px 4px #ff4d4d}

          .bk-lesson{background:linear-gradient(135deg,var(--yellow),#ffb703);border:3px solid var(--ink);border-radius:14px;
            padding:8px 10px;box-shadow:4px 4px 0 var(--ink);transform:rotate(-1.5deg)}
          .bk-lesson .ttl{font-family:${DISPLAY_FONT};letter-spacing:.07em;font-size:calc(var(--fs)*1.5);color:var(--red);text-align:center}
          .bk-lesson p{margin:2px 0 0;font-weight:600;font-size:calc(var(--fs)*1.02)}

          .bk-controls{position:absolute;display:flex;align-items:center;gap:12px}
          .bk-arrow{display:grid;place-items:center;border:0;background:transparent;cursor:pointer;padding:0}
          .bk-arrow:disabled{opacity:.35;cursor:default}
          .bk-arrow:not(:disabled):hover{filter:drop-shadow(2px 4px 6px #000)}
          .bk-arrow:not(:disabled):active{transform:scale(.9)}
          .bk-arrow:focus-visible,.bk-btn:focus-visible,.bk-chip:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}
          .bk-bar{flex:1;height:8px;border:1px solid #000;background:rgba(0,0,0,.25)}
          .bk-bar > div{height:100%;background:linear-gradient(90deg,var(--pink),var(--yellow));transition:width .3s}
          .bk-spacer{flex:1}
          @media (prefers-reduced-motion: reduce){.bk-star{animation:none}}
        `}</style>

        {/* twinkling stars */}
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            className="bk-star"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 1 + (i % 3),
              height: 1 + (i % 3),
              animationDelay: `${(i % 7) * 0.4}s`,
            }}
          />
        ))}

        {HEADING && (
          <motion.header
            className="bk-head"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
          >
            <h1>
              {HEADING.split(' ').map((w, i) => (
                <motion.span
                  key={i}
                  style={{ color: HEADING_COLORS[i % HEADING_COLORS.length] }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.4, delay: i * 0.25, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {w}
                </motion.span>
              ))}
            </h1>
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
                  <div className="bk-num">{page * 2 + 1}</div>
                </div>
                <div className="bk-page right" style={{ background: spread.tint }}>
                  <motion.div key={`R${page}`} className="bk-body" variants={containerV} initial="hidden" animate="show">
                    {spread.right}
                  </motion.div>
                  <div className="bk-num">{page * 2 + 2}</div>
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
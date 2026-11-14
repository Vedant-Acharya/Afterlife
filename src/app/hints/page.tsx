"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const CONFIG = {
  routes: {noHints:"/old-man"as string,afterHints:"/old-man"as string},
  scene1: {
    title: "Chapter 1: The Forewarning",
    subtitle: "Click to continue",
  },
  scene2:{
    video: "/videos/forewarning.mp4",
    audio: "/audios/warningsuspense.mp3",
    audioVolume: 0.7,
    videoVolume: 1,
    autoAdvanceWhenVideoEnds: true,
    nextLabel: "Next",
    transcriptTitle: "Transcript",
    transcript: [
      "This Journey wont be easy",
      "Challenges and difficulties",
      "I can help you if you allow me to",
      "THE CHOICE IS YOURS",
    ],
  },
  scene3: {
    heading: "Choose your hand",
    hintLabel: "HINT",
    skipLabel: "Continue Without HINTS",
    hintAria: "Take the hint",
    skipAria: "Continue without hints",
  },
  scene4: {
    video: "/videos/hint.mp4",
    transcriptTitle: "Transcript",
    transcript: [
      "First, have your fingers on the keys",
      "Second, Dont Panic",
      "Third, You have to be quick",
      "",
      "I wish you good luck",
    ],
    continueLabel: "Continue",
  },
  timing: { fade: 0.9, handsRise: 1.1, exitBeforeRoute: 0.8 },
  theme: {
    void: "#000000",
    bone: "#f2efe8",
    alarm: "#c8102e",
    skin: "#e8c3a0",
    skinShade: "#c99b78",
    suit: "#07070a",
    shirt: "#f4f4f0",
    gold: "#c9a24a",
    boxColor: "#5b6a73",
    boxColorHover: "#12171a",
    fontDisplay: "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif",
    fontBody: "'Helvetica Neue',Helvetica,Arial,sans-serif",
    handUnit: "clamp(9px, 1.9vw, 20px)",
  },
};

type SceneId = 1 | 2 | 3 | 4;
const T = CONFIG.theme;

export default function ForewarningPage() {
  const router = useRouter();
  useEffect(() => {
    const key = "forewarning_reloaded";
    
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
  const [scene, setScene] = useState<SceneId>(1);
  const [leaving, setLeaving] = useState(false);

  const goTo = useCallback((s: SceneId) => setScene(s), []);


  useEffect(() => {
    setScene(1);
    setLeaving(false);
    router.prefetch(CONFIG.routes.noHints);
    router.prefetch(CONFIG.routes.afterHints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leaveTo = useCallback(
    (route: string) => {
      setLeaving(true);
      window.setTimeout(() => router.push(route), CONFIG.timing.exitBeforeRoute * 1000);
    },
    [router]
  );

  return (
    <main className="fw-root" style={cssVars()}>
      <style>{css}</style>
      <AnimatePresence mode="wait" initial={false}>
        {!leaving && (
          <motion.div
            key={scene}
            className="fw-scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: CONFIG.timing.fade, ease: "easeInOut" }}
          >
            {scene === 1 && <Scene1 onNext={() => goTo(2)} />}
            {scene === 2 && <Scene2 onNext={() => goTo(3)} />}
            {scene === 3 && (
              <Scene3 onHint={() => goTo(4)} onSkip={() => leaveTo(CONFIG.routes.noHints)} />
            )}
            {scene === 4 && <Scene4 onDone={() => leaveTo(CONFIG.routes.afterHints)} />}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}


function Scene1({ onNext }: { onNext: () => void }) {
  const words = CONFIG.scene1.title.split(" ");
  return (
    <div
      className="s1"
      role="button"
      tabIndex={0}
      onClick={onNext}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNext()}
      aria-label={CONFIG.scene1.subtitle}
    >
      <h1 className="s1-title">
        {words.map((w, i) => (
          <span key={i} className="s1-word" style={{ animationDelay: `${0.4 + i * 0.35}s` }}>
            {w}&nbsp;
          </span>
        ))}
      </h1>
      <p className="s1-sub">
        <span>{CONFIG.scene1.subtitle}</span>
      </p>
    </div>
  );
}


function Transcript({ title, lines }: { title: string; lines: string[] }) {
  return (
    <aside className="tx" aria-label={title}>
      <h2 className="tx-title">{title}</h2>
      <div className="tx-body" tabIndex={0}>
        {lines.map((l, i) => (
          <p key={i} className="tx-line" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
            {l}
          </p>
        ))}
      </div>
    </aside>
  );
}

function NextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      className="next"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      {label}
    </motion.button>
  );
}


function Scene2({ onNext }: { onNext: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cfg = CONFIG.scene2;

  const stopMedia = useCallback(() => {
    [videoRef.current, audioRef.current].forEach((m) => {
      if (!m) return;
      m.pause();
      m.currentTime = 0;
    });
  }, []);

  useEffect(() => {
    const v = videoRef.current, a = audioRef.current;
    if (v) { v.volume = cfg.videoVolume; v.play().catch(() => {}); }
    if (a) { a.volume = cfg.audioVolume; a.loop = true; a.play().catch(() => {}); }
    return stopMedia; // also stops on unmount
  }, [cfg.audioVolume, cfg.videoVolume, stopMedia]);

  const next = () => { stopMedia(); onNext(); };

  return (
    <div className="split">
      <div className="stage">
        <video
          ref={videoRef}
          className="vid"
          src={cfg.video}
          playsInline
          controls
          onEnded={() => cfg.autoAdvanceWhenVideoEnds && next()}
        />
        <audio ref={audioRef} src={cfg.audio} preload="auto" />
      </div>
      <Transcript title={cfg.transcriptTitle} lines={cfg.transcript} />
      <NextButton label={cfg.nextLabel} onClick={next} />
    </div>
  );
}

function Scene3({ onHint, onSkip }: { onHint: () => void; onSkip: () => void }) {
  const c = CONFIG.scene3;
  return (
    <div className="s3">
      <h2 className="s3-heading">{c.heading}</h2>

      <div className="hands">
        <button
          className="hand-btn hint"
          onClick={onHint}
          aria-label={c.hintAria}
          style={{ animationDuration: `${CONFIG.timing.handsRise}s` }}
        >
          <Hand side="left" withBox boxText={c.hintLabel} />
        </button>

        <button
          className="hand-btn skip"
          onClick={onSkip}
          aria-label={c.skipAria}
          style={{ animationDuration: `${CONFIG.timing.handsRise}s`, animationDelay: "0.15s" }}
        >
          <Hand side="right" />
          <span className="skip-label">{c.skipLabel}</span>
        </button>
      </div>
    </div>
  );
}


function Hand({ side, withBox, boxText }: { side: "left" | "right"; withBox?: boolean; boxText?: string }) {
  return (
    <div className={`hand ${side}`}>
      <div className="body">
        <div className="sleeve"><i className="cuff" /><i className="link" /></div>
        <div className="fingers">
          <i className="f f1" /><i className="f f2" /><i className="f f3" /><i className="f f4" />
        </div>
        <div className="palm"><i className="crease c1" /><i className="crease c2" /></div>
        <i className="thumb" />
      </div>
      {withBox && (
        <div className="box">
          <div className="gift-art">
            <i className="paper" />
            <i className="lidband" />
            <i className="rb-v" />
            <i className="rb-h" />
            <div className="bow">
              <i className="loop l" /><i className="loop r" /><i className="knot" />
            </div>
          </div>
          <span className="box-text">{boxText}</span>
        </div>
      )}
    </div>
  );
}


function Scene4({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const c = CONFIG.scene4;
  useEffect(() => {
    const v = ref.current;
    v?.play().catch(() => {});
    return () => v?.pause();
  }, []);
  return (
    <div className="split">
      <div className="stage">
        <video ref={ref} className="vid" src={c.video} playsInline controls onEnded={onDone} />
      </div>
      <Transcript title={c.transcriptTitle} lines={c.transcript} />
      <NextButton label={c.continueLabel} onClick={() => { ref.current?.pause(); onDone(); }} />
    </div>
  );
}


function cssVars(): React.CSSProperties {
  return {
    "--void": T.void, "--bone": T.bone, "--alarm": T.alarm, "--skin": T.skin,
    "--skin-shade": T.skinShade, "--suit": T.suit, "--shirt": T.shirt, "--gold": T.gold,
    "--box": T.boxColor, "--box-hover": T.boxColorHover,
    "--display": T.fontDisplay, "--body": T.fontBody, "--u": T.handUnit,
  } as React.CSSProperties;
}

const css = `
.fw-root{position:fixed;inset:0;z-index:9999;background:var(--void);color:var(--bone);font-family:var(--body);overflow:hidden}
.fw-scene{position:absolute;inset:0}
button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--alarm);outline-offset:4px}

/* scene 1 */
.s1{height:100%;display:grid;place-content:center;text-align:center;cursor:pointer;padding:0 6vw}
.s1-title{font-family:var(--display);font-weight:400;font-size:clamp(2.4rem,7.5vw,6.5rem);line-height:1.05;letter-spacing:-.01em;margin:0}
.s1-word{display:inline-block;}
@keyframes fw-rise{from{opacity:0;filter:blur(14px);transform:translateY(18px)}to{opacity:1;filter:blur(0);transform:none}}
@keyframes fw-hand{from{opacity:0;transform:translateY(320px)}to{opacity:1;transform:none}}
@keyframes fw-in{from{opacity:0}to{opacity:1}}
@keyframes fw-pulse{0%,100%{opacity:.85}50%{opacity:.25}}
.s1-sub{margin:2.4rem 0 0;font-size:.85rem;letter-spacing:.12em;}
.s1-sub span{display:inline-block;animation:fw-pulse 3s ease-in-out infinite}

/* scenes 2 & 4 */
.split{height:100%;display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,24rem);gap:clamp(12px,2vw,28px);padding:clamp(12px,2.5vw,36px);padding-bottom:clamp(70px,9vh,96px)}
.stage{position:relative;background:#000;border:1px solid #2a2a2e;display:grid;place-items:center;min-height:0}
.stage::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 90px rgba(200,16,46,.18)}
.vid{width:100%;height:100%;object-fit:contain;background:#000}
.tx{display:flex;flex-direction:column;min-height:0;border-left:2px solid var(--alarm);padding-left:clamp(12px,1.6vw,22px)}
.tx-title{font-family:var(--display);font-weight:400;font-size:1.5rem;margin:0 0 1rem}
.tx-body{overflow:auto;flex:1;padding-right:8px;scrollbar-width:thin;scrollbar-color:#444 transparent}
.tx-line{opacity:0;animation:fw-in .6s ease forwards}
.tx-body p{margin:0 0 1.1em;font-family:var(--display);font-size:1.08rem;line-height:1.65;max-width:46ch;color:#ddd9cf}
.next{opacity:0;animation:fw-in .7s ease 1s forwards;position:absolute;right:clamp(14px,2.5vw,36px);bottom:clamp(14px,3vh,32px);background:var(--alarm);border:0;padding:.85rem 2.4rem;font-size:1rem;letter-spacing:.04em;cursor:pointer;border-radius:2px}
@media (max-width:760px){
  .split{grid-template-columns:1fr;grid-template-rows:minmax(0,1.1fr) minmax(0,1fr)}
  .tx{border-left:0;border-top:2px solid var(--alarm);padding:12px 0 0}
}

/* scene 3 */
.s3{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding-top:9vh;
  background:radial-gradient(ellipse 60% 45% at 50% 100%,rgba(255,255,255,.07),transparent 70%),var(--void)}
.s3-heading{opacity:0;animation:fw-in 1.6s ease .3s forwards;font-family:var(--display);font-weight:400;font-size:clamp(1.4rem,3vw,2.2rem);margin:0}
.hands{display:flex;gap:calc(var(--u)*7);align-items:flex-end;margin-bottom:-2vh}
.hand-btn{position:relative;background:none!important;border:0;outline:0;padding:0;opacity:0;animation:fw-hand 1.1s cubic-bezier(.16,1,.3,1) forwards;cursor:pointer;transition:opacity .5s,filter .5s;-webkit-tap-highlight-color:transparent}

/* the hand — all units derive from --u */
.hand{position:relative;width:calc(var(--u)*11);height:calc(var(--u)*24)}
.hand i,.hand div{position:absolute;display:block}
.sleeve{left:calc(var(--u)*.4);bottom:0;width:calc(var(--u)*10.2);height:calc(var(--u)*9);background:linear-gradient(90deg,#000,var(--suit) 30%,#15151b 70%,#000);border-radius:calc(var(--u)*.6) calc(var(--u)*.6) 0 0;z-index:5}
.cuff{left:calc(var(--u)*.5);right:calc(var(--u)*.5);top:calc(var(--u)*-1.6);height:calc(var(--u)*2.6);background:linear-gradient(90deg,#c9c9c2,var(--shirt) 40%,#d8d8d2);border-radius:calc(var(--u)*.3)}
.link{left:50%;top:calc(var(--u)*-.8);width:calc(var(--u)*.9);height:calc(var(--u)*.9);margin-left:calc(var(--u)*-.45);border-radius:50%;background:radial-gradient(circle at 35% 30%,#f3d98c,var(--gold) 60%,#6b531c)}
.palm{left:calc(var(--u)*1.4);bottom:calc(var(--u)*8);width:calc(var(--u)*8.2);height:calc(var(--u)*8);z-index:2;
  background:radial-gradient(ellipse at 50% 40%,var(--skin),var(--skin-shade));border-radius:calc(var(--u)*1.2) calc(var(--u)*1.2) calc(var(--u)*3.4) calc(var(--u)*3.4);box-shadow:inset 0 calc(var(--u)*-.8) calc(var(--u)*1.2) rgba(0,0,0,.18)}
.crease{height:calc(var(--u)*.14);background:rgba(110,60,30,.28);border-radius:99px}
.c1{left:12%;width:70%;top:30%;transform:rotate(8deg)}
.c2{left:20%;width:55%;top:52%;transform:rotate(-12deg)}
.fingers{left:calc(var(--u)*1.4);bottom:calc(var(--u)*14);width:calc(var(--u)*8.2);height:calc(var(--u)*9);z-index:1}
.f{bottom:0;width:calc(var(--u)*1.9);background:linear-gradient(90deg,var(--skin-shade),var(--skin) 45%,var(--skin-shade));border-radius:calc(var(--u)*1) calc(var(--u)*1) calc(var(--u)*.3) calc(var(--u)*.3);transform-origin:bottom center}
.f::before{content:"";position:absolute;inset:6% 22% auto;height:calc(var(--u)*1.1);border-radius:50% 50% 30% 30%;background:rgba(255,236,220,.28)}
.f::after{content:"";position:absolute;left:10%;right:10%;top:44%;height:calc(var(--u)*.1);background:rgba(110,60,30,.3)}
.f1{left:0;height:calc(var(--u)*6.4);transform:rotate(-7deg)}
.f2{left:calc(var(--u)*2.1);height:calc(var(--u)*8);transform:rotate(-2deg)}
.f3{left:calc(var(--u)*4.2);height:calc(var(--u)*7.6);transform:rotate(3deg)}
.f4{left:calc(var(--u)*6.3);height:calc(var(--u)*5.8);transform:rotate(9deg)}
.thumb{bottom:calc(var(--u)*10.5);width:calc(var(--u)*2.3);height:calc(var(--u)*6);z-index:4;background:linear-gradient(90deg,var(--skin-shade),var(--skin) 50%,var(--skin-shade));border-radius:calc(var(--u)*1.2) calc(var(--u)*1.2) calc(var(--u)*.8) calc(var(--u)*.8)}
.hand.left .thumb{left:calc(var(--u)*.2);transform:rotate(-34deg)}
.hand.right .thumb{right:calc(var(--u)*.2);transform:rotate(34deg)}

/* hover: the hand (not the label / gift text) fades and softly blurs */
.hand .body{inset:0;transition:opacity .6s,filter .6s}
.hand-btn:hover .body,.hand-btn:focus-visible .body{opacity:.45;filter:blur(2.5px)}

/* label for the empty hand: printed right on the palm, above the faded hand */
.skip-label{position:absolute;left:50%;bottom:calc(var(--u)*10.5);width:calc(var(--u)*9.4);transform:translate(-50%,6px) scale(.95);
  padding:calc(var(--u)*.45) calc(var(--u)*.6);background:rgba(0,0,0,.7);border-radius:calc(var(--u)*.3);text-align:center;
  font-family:var(--display);font-size:clamp(.85rem,1.45vw,1.2rem);line-height:1.25;color:var(--bone);
  opacity:0;transition:opacity .5s,transform .5s;pointer-events:none;z-index:10}
.skip:hover .skip-label,.skip:focus-visible .skip-label{opacity:1;transform:translate(-50%,0) scale(1)}

/* the gift box */
.box{left:calc(var(--u)*2.7);bottom:calc(var(--u)*10.8);width:calc(var(--u)*5.6);height:calc(var(--u)*4.4);z-index:6}
.gift-art{inset:0;transition:filter .6s}
.paper{inset:0;border-radius:calc(var(--u)*.3);
  background:repeating-linear-gradient(45deg,rgba(255,255,255,.16) 0 calc(var(--u)*.22),transparent calc(var(--u)*.22) calc(var(--u)*.75)),linear-gradient(145deg,#e03a4b,#9b1424);
  box-shadow:0 calc(var(--u)*.7) calc(var(--u)*1.3) rgba(0,0,0,.65),inset 0 0 calc(var(--u)*.8) rgba(0,0,0,.25)}
.lidband{left:calc(var(--u)*-.25);right:calc(var(--u)*-.25);top:0;height:calc(var(--u)*1.2);border-radius:calc(var(--u)*.3);
  background:linear-gradient(#c21f32,#8e1020);box-shadow:0 calc(var(--u)*.25) calc(var(--u)*.4) rgba(0,0,0,.4)}
.rb-v,.rb-h{background:linear-gradient(90deg,#a9822f,#f3d98c 50%,#a9822f)}
.rb-v{left:50%;width:calc(var(--u)*1);margin-left:calc(var(--u)*-.5);top:0;bottom:0}
.rb-h{top:58%;left:0;right:0;height:calc(var(--u)*1);margin-top:calc(var(--u)*-.5);background:linear-gradient(#a9822f,#f3d98c 50%,#a9822f)}
.bow{left:50%;top:0;width:0;height:0}
.loop{width:calc(var(--u)*2.3);height:calc(var(--u)*1.5);top:calc(var(--u)*-1.5);border-radius:50% 50% 50% 8%;
  background:radial-gradient(ellipse at 50% 70%,#7d5d1c 0 25%,transparent 26%),linear-gradient(145deg,#f3d98c,#b48a33);box-shadow:inset 0 0 calc(var(--u)*.4) rgba(0,0,0,.35)}
.loop.l{left:calc(var(--u)*-2.2);transform:rotate(-22deg)}
.loop.r{left:calc(var(--u)*-.1);transform:scaleX(-1) rotate(-22deg)}
.knot{left:calc(var(--u)*-.5);top:calc(var(--u)*-.9);width:calc(var(--u)*1);height:calc(var(--u)*1);border-radius:50%;background:radial-gradient(circle at 35% 30%,#f9e7aa,#b48a33 70%);box-shadow:0 0 calc(var(--u)*.3) rgba(0,0,0,.4)}
.box-text{position:absolute;left:50%;top:58%;transform:translate(-50%,-50%) scale(.85);padding:calc(var(--u)*.3) calc(var(--u)*.7);
  background:rgba(0,0,0,.82);border-radius:calc(var(--u)*.2);font-family:var(--display);font-size:calc(var(--u)*1.05);letter-spacing:.18em;color:var(--bone);
  opacity:0;transition:opacity .5s,transform .5s;pointer-events:none;white-space:nowrap}
.hint:hover .gift-art,.hint:focus-visible .gift-art{filter:brightness(.28) saturate(.6)}
.hint:hover .box-text,.hint:focus-visible .box-text{opacity:1;transform:translate(-50%,-50%) scale(1)}

@media (prefers-reduced-motion:reduce){*{transition-duration:.01ms!important}}
`;
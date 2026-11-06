import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from "../../hooks/useContent";
import styles from "./ProductDeck.module.css";
import mixer from "../../productShot/iDance Pocket Mix DJ Mixer Box.png";
import speaker from "../../productShot/Rainbow LED Party Speaker and Microphone.png";
import brick from "../../productShot/SURF ROCK Speaker Brick Packaging.png";
import studio from "../../productShot/iDance Sing Creator Studio Set.png";
import party from "../../productShot/RGB Party Speaker with Four Microphones2.png";

function MixerKnob({ label }: { label: string }) {
  const [value, setValue] = useState(50);
  const start = useRef<{ y: number; value: number } | null>(null);
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return <div className={styles.knobControl} role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
    onPointerDown={e => { if (e.button !== 0) return; e.currentTarget.focus(); start.current = { y: e.clientY, value }; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={e => { if (start.current) setValue(clamp(Math.round(start.current.value + (start.current.y - e.clientY) * .7))); }}
    onPointerUp={() => { start.current = null; }} onPointerCancel={() => { start.current = null; }} onLostPointerCapture={() => { start.current = null; }}
    onDoubleClick={() => setValue(50)}
    onKeyDown={e => { if (["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "Home", "End"].includes(e.key)) { e.preventDefault(); setValue(e.key === "Home" ? 0 : e.key === "End" ? 100 : clamp(value + (["ArrowUp", "ArrowRight"].includes(e.key) ? 5 : -5))); } }}>
    <i className={styles.knob} style={{ transform: `rotate(${(value - 50) * 2.7}deg)` }} aria-hidden="true" />
  </div>;
}
function MixerPads({ side }: { side: string }) {
  const [active, setActive] = useState<number[]>([]);
  return <div className={styles.pads} aria-label={`${side} light pads`}>{[0,1,2,3].map(i => <button key={i} aria-label={`${side} light pad ${i + 1}`} aria-pressed={active.includes(i)} style={{ "--pad-color": ["#64dcff", "#b49aff", "#ffadcb", "#91e7c0"][i] } as CSSProperties} onClick={() => setActive(current => current.includes(i) ? current.filter(n => n !== i) : [...current, i])}/>)}</div>;
}
function MixerFader({ side }: { side: "left" | "right" }) {
  const [value, setValue] = useState(50);
  return <div className={`${styles.sideFader} ${styles[side]}`}><input type="range" min="0" max="100" value={value} aria-label={`${side} mixer fader`} onChange={e => setValue(Number(e.target.value))}/></div>;
}

const shots = [
  { id: "mix", name: "Pocket Mix", image: mixer },
  { id: "party", name: "Rainbow Party Speaker", image: speaker },
  { id: "brick", name: "SURF ROCK", image: brick },
  { id: "studio", name: "Sing Creator Studio", image: studio },
  { id: "rgb", name: "RGB Party Speaker", image: party },
];
export function ProductDeck() {
  const data = useContent();
  const [tab, setTab] = useState("popular");
  const [position, setPosition] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const drag = useRef({ x: 0, scroll: 0, active: false, moved: false });
  const products = data.demo
    ? (tab === "popular" ? shots : [...shots.slice(3), ...shots.slice(0, 3)]).map(p => ({ ...p, href: "/products" }))
    : data.products.filter(p => tab === "popular" ? p.isPopular : p.isNew).map(p => ({ id: p.id, name: p.name, image: p.images[0]?.url, href: `/products/${p.slug}` }));
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    el.scrollLeft = 0;
    const sync = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanScroll(max > 1);
      setPosition(max > 0 ? el.scrollLeft / max * 100 : 0);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    el.addEventListener("scroll", sync);
    return () => { observer.disconnect(); el.removeEventListener("scroll", sync); };
  }, [tab, data]);
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const stop = () => animations.forEach(animation => animation.cancel());
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (preference.matches || window.matchMedia("(max-width: 767px)").matches) return;
      el.querySelectorAll(`.${styles.product}`).forEach((card, index) => {
        animations.push(card.animate([
          { opacity: 0, transform: "translateY(66px) scale(.88)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ], { duration: 1950, delay: index * 255, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }));
      });
    }, { threshold: 0.15 });
    observer.observe(el);
    preference.addEventListener("change", stop);
    return () => { observer.disconnect(); stop(); preference.removeEventListener("change", stop); };
  }, [tab]);
  const move = (value: number, smooth = false) => {
    const el = rail.current;
    if (el) el.scrollTo({ left: value / 100 * (el.scrollWidth - el.clientWidth), behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant" });
  };
  return <section ref={section} id="products" className={styles.section} aria-label="Product collection">
    <div className={styles.heading}><div><span>FIND YOUR NEXT SOUND</span><h2>Products</h2></div><Link to="/products">View all products <ArrowUpRight size={18} /></Link></div>
    <div className={styles.deck}>
      <div className={styles.top}>
        <MixerKnob label="Channel tone" />
        <div role="tablist" aria-label="Product collections" className={styles.tabGroup}>{["popular", "new"].map((t, i) => <button key={t} role="tab" id={`tab-${t}`} aria-controls="home-products" aria-selected={tab === t} tabIndex={tab === t ? 0 : -1} onClick={() => setTab(t)} onKeyDown={e => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            e.preventDefault(); const next = e.key === "Home" ? "popular" : e.key === "End" ? "new" : i ? "popular" : "new";
            setTab(next); document.getElementById(`tab-${next}`)?.focus();
          }
        }}>{t === "popular" ? "Popular" : "New Releases"}</button>)}</div>
        <div className={styles.controls}><MixerKnob label="Left effect" /><span aria-hidden="true">▪ ▪ ▪</span><MixerKnob label="Right effect" /></div>
        <MixerKnob label="Channel balance" />
      </div>
      <div ref={rail} className={styles.rail} id="home-products" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}
        onPointerDown={e => { if (e.pointerType === "mouse" && e.button === 0) drag.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft, active: true, moved: false }; }}
        onPointerMove={e => { const d = drag.current; if (!d.active) return; if (Math.abs(e.clientX - d.x) > 5) { d.moved = true; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.scrollLeft = d.scroll - (e.clientX - d.x); } }}
        onPointerUp={() => { drag.current.active = false; }} onPointerCancel={() => { drag.current.active = false; }}
        onLostPointerCapture={() => { drag.current.active = false; }}
        onClickCapture={e => { if (drag.current.moved) { e.preventDefault(); drag.current.moved = false; } }}
        onDragStart={e => e.preventDefault()}>
        {products.map(p => <Link to={p.href} className={styles.product} key={p.id} draggable={false}><div className={styles.disc}><img src={p.image} alt={p.name} loading="lazy" decoding="async" width={640} height={640} draggable={false} /></div><span>{p.name}<ArrowUpRight size={15} /></span></Link>)}
        {!products.length && <p>No products in this collection yet.</p>}
      </div>
      <div className={styles.bottom}>
        <MixerPads side="Left" />
        <div className={styles.faderGroup}><div className={styles.fader}><button aria-label="Previous products" disabled={!canScroll || position < 1} onClick={() => move(Math.max(0, position - 50), true)}><ChevronLeft size={20}/></button><input aria-label="Slide through products" type="range" min="0" max="100" step="0.1" value={position} disabled={!canScroll} onChange={e => move(Number(e.target.value))}/><button aria-label="Next products" disabled={!canScroll || position > 99} onClick={() => move(Math.min(100, position + 50), true)}><ChevronRight size={20}/></button></div><span>DRAG TO DISCOVER</span></div>
        <MixerPads side="Right" />
      </div>
      <MixerFader side="left"/><MixerFader side="right"/>
    </div>
  </section>;
}

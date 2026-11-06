import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import pic01 from "../../productShot/DJX101E/DJX101E_V2_pic01.png";
import pic03 from "../../productShot/DJX101E/DJX101E_V2_pic03 2.png";
import pic02 from "../../productShot/DJX101E/DJX101E_V2_pic02.png";
import styles from "./ProductHero.module.css";

const slides = [pic01, pic03, pic02];
export function ProductHero() {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>([false, false, false]);
  const [failed, setFailed] = useState<boolean[]>([false, false, false]);
  const tilt = useRef<HTMLDivElement>(null);
  const resetTilt = () => {
    tilt.current?.style.setProperty("--hover-x", "0px");
    tilt.current?.style.setProperty("--hover-angle", "0deg");
  };
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const move = (delta: number) => setIndex(current => Math.max(0, Math.min(slides.length - 1, current + delta)));
  return <section className={styles.hero} data-hero aria-label="DJX101E product showcase">
    <div className={styles.heading} data-hero-copy><span>SOUND. SHARED.</span><h1>Bring Your Sound to Life.</h1><p>DJX101E</p></div>
    <div className={styles.viewer} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="DJX101E product views" aria-describedby="hero-help"
      onKeyDown={e => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        if (e.key === "Home") setIndex(0);
        else if (e.key === "End") setIndex(slides.length - 1);
        else move(e.key === "ArrowRight" ? 1 : -1);
      }}
      onPointerMove={e => {
        if (e.pointerType !== "mouse" || gesture.current || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (e.clientX - bounds.left) / bounds.width * 2 - 1));
        tilt.current?.style.setProperty("--hover-x", `${x * 12}px`);
        tilt.current?.style.setProperty("--hover-angle", `${x * 4}deg`);
      }}
      onPointerLeave={resetTilt}
      onPointerDown={e => {
        if (!e.isPrimary || e.button !== 0) return;
        resetTilt();
        gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.focus({ preventScroll: true });
      }}
      onPointerUp={e => {
        const start = gesture.current;
        gesture.current = null;
        if (!start || start.id !== e.pointerId) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }}
      onPointerCancel={() => { gesture.current = null; }}
      onLostPointerCapture={() => { gesture.current = null; }}
      onDragStart={e => e.preventDefault()}>
      <div className={styles.images} data-hero-product>
        <div ref={tilt} className={styles.tilt}>
        {slides.map((src, i) => <img key={src} src={src} alt={`DJX101E — product view ${i + 1}`} width={3840} height={2880} loading="eager" fetchPriority={i === 0 ? "high" : "auto"} decoding="async" draggable={false} aria-hidden={i !== index} className={i === index && loaded[i] ? styles.active : ""}
          onLoad={() => setLoaded(current => current.map((value, n) => n === i ? true : value))}
          onError={() => setFailed(current => current.map((value, n) => n === i ? true : value))} />)}
        </div>
      </div>
      {!loaded[index] && <span className={styles.loading} role="status">{failed[index] ? "Image unavailable" : "Loading product view…"}</span>}
    </div>
    <div className={styles.navigation}>
      <button aria-label="Previous product view" disabled={index === 0} onClick={() => move(-1)}><ChevronLeft size={20}/></button>
      <div className={styles.dots}>{slides.map((_, i) => <button key={i} aria-label={`Show product view ${i + 1}`} aria-current={i === index ? "true" : undefined} onClick={() => setIndex(i)} />)}</div>
      <button aria-label="Next product view" disabled={index === slides.length - 1} onClick={() => move(1)}><ChevronRight size={20}/></button>
    </div>
    <p className={styles.hint} id="hero-help">Drag or swipe to explore · Use ← → keys</p>
    <span className={styles.srOnly} aria-live="polite" aria-atomic="true">Product view {index + 1} of {slides.length}</span>
    <div className={styles.footer}><a href="#products">Discover the collection <ArrowDown size={16}/></a><Link to="/products" className={styles.cta}>Explore products <ArrowUpRight size={16}/></Link><span>0{index + 1} <i/> 03</span></div>
  </section>;
}

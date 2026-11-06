import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ProductModelViewer } from "./ProductModelViewer";
import styles from "./ProductHero.module.css";

export function ProductHero() {
  return <section className={styles.hero} data-hero aria-label="XD301 product showcase">
    <div className={styles.heading} data-hero-copy><span>SOUND. SHARED.</span><h1>Bring Your Sound to Life.</h1><p>XD301</p></div>
    <ProductModelViewer />
    <p className={styles.hint} id="hero-help">拖動旋轉 · Drag to rotate</p>
    <div className={styles.footer}><a href="#products">Discover the collection <ArrowDown size={16}/></a><Link to="/products" className={styles.cta}>Explore products <ArrowUpRight size={16}/></Link><span>XD301</span></div>
  </section>;
}

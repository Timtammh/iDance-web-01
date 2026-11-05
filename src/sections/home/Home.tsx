import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  AudioLines,
  ArrowDown,
} from "lucide-react";
import { useHomeMotion, useProductReveal } from "../../hooks/useHomeMotion";
import { AnimatedTabIndicator } from "../../components/ui/AnimatedTabIndicator";
import { useContent } from "../../hooks/useContent";
import { usePage } from "../../hooks/usePage";
import { LightAtmosphere as Light } from "../../components/effects/LightAtmosphere";
import {
  ProductCard,
  PictureView,
  NewsCard,
} from "../../components/ui/ContentCards";
import { VideoGrid } from "../../components/ui/VideoGrid";
import { track, item } from "../../lib/analytics";
import styles from "./Home.module.css";

export function Home() {
  const data = useContent();
  const [tab, setTab] = useState("popular");
  const root = useRef<HTMLDivElement>(null);
  const viewed = useRef("");
  const products = data.products
    .filter((p) => (tab === "popular" ? p.isPopular : p.isNew))
    .slice(0, 3);
  const featured =
    data.products.find((p) => data.home.featuredProducts?.includes(p.id)) ||
    data.products[0];
  usePage(
    data.settings.seo?.title || "Bring Your Sound to Life",
    data.settings.seo?.description,
    data.home.heroImage?.url,
  );
  const productGrid = useRef<HTMLDivElement>(null);
  useHomeMotion(root);
  useProductReveal(productGrid, tab);
  useEffect(() => {
    if (viewed.current === tab) return;
    viewed.current = tab;
    track("view_item_list", {
      item_list_id: tab,
      items: data.products
        .filter((p) => (tab === "popular" ? p.isPopular : p.isNew))
        .slice(0, 3)
        .map(item),
    });
  }, [tab, data.products]);
  return (
    <div ref={root}>
      <section className={styles.hero} data-hero>
        <Light variant="spotlight" color="#a4c9ff" intensity={0.8} animated />
        <Light variant="horizon" intensity={0.55} />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <span className="eyebrow">
              <span className="tiny-line" /> SOUND. SHARED.
            </span>
            <h1 data-hero-copy>
              {data.home.headline.split(" ").slice(0, -2).join(" ")} <br />
              <span>{data.home.headline.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p data-hero-copy>{data.home.description}</p>
            <div className="button-row" data-hero-copy>
              <Link
                className="button"
                to="/products"
                onClick={() =>
                  track("hero_cta_click", { destination: "products" })
                }
              >
                Explore products <ArrowUpRight size={18} />
              </Link>
              <Link
                className="video-link"
                to="/tv"
                onClick={() => track("hero_cta_click", { destination: "tv" })}
              >
                <span>
                  <Play size={14} />
                </span>
                Watch iDance
              </Link>
            </div>
          </div>
          <div className={styles.heroStage}>
            <Light variant="halo" color="#9382ff" intensity={0.75} />
            <div className={styles.orbit} />
            <div className={styles.orbitTwo} />
            <div className={styles.heroFloat} data-hero-float>
              <div data-hero-product>
                <PictureView
                  picture={data.home.heroImage || featured?.images[0]}
                  priority
                  className={styles.heroProduct}
                />
              </div>
            </div>
            <Light variant="reflection" color="#9c94ff" intensity={0.8} />
            {data.demo && (
              <span className={styles.heroCaption}>
                PRODUCT CONCEPT / DEMO VISUAL
              </span>
            )}
          </div>
          <div className={styles.heroFoot}>
            <span>
              <AudioLines size={18} /> MADE FOR YOUR MOMENTS
            </span>
            <a href="#products">
              Discover the collection <ArrowDown size={16} />
            </a>
            <span>
              01 <i /> 01
            </span>
          </div>
        </div>
      </section>
      <section id="products" className={`section light ${styles.products}`}>
        <Light variant="refraction" color="#d9f4ff" intensity={0.25} />
        <div className="container">
          <div className="section-heading" data-reveal>
            <div>
              <span className="eyebrow muted">THE COLLECTION</span>
              <h2>{data.home.productsHeading}</h2>
            </div>
            <Link className="text-link" to="/products">
              View all products <ArrowUpRight size={18} />
            </Link>
          </div>
          <div role="tablist" aria-label="Product collections" className="tabs">
            <AnimatedTabIndicator active={tab} />
            {["popular", "new"].map((t, i) => (
              <button
                key={t}
                id={`tab-${t}`}
                role="tab"
                aria-controls="home-products"
                aria-selected={tab === t}
                tabIndex={tab === t ? 0 : -1}
                onClick={() => setTab(t)}
                onKeyDown={(e) => {
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                  ) {
                    e.preventDefault();
                    const next =
                      e.key === "Home"
                        ? "popular"
                        : e.key === "End"
                          ? "new"
                          : i
                            ? "popular"
                            : "new";
                    setTab(next);
                    document.getElementById(`tab-${next}`)?.focus();
                  }
                }}
              >
                {t === "popular" ? "Popular" : "New releases"}
              </button>
            ))}
          </div>
          <div
            ref={productGrid}
            id="home-products"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="product-grid"
          >
            {products.map((p) => (
              <div data-card-reveal key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          {!products.length && <p>No products in this collection yet.</p>}
        </div>
      </section>
      <section
        id="find-your-sound"
        className={`section dark ${styles.useCases}`}
      >
        <Light variant="horizon" color="#779ad1" intensity={0.35} />
        <div className="container" data-reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">A SOUND FOR EVERY SIDE OF YOU</span>
              <h2>Find your sound.</h2>
            </div>
            <p>
              Big nights. Small moments.
              <br />
              Make them yours.
            </p>
          </div>
          <div className={styles.useGrid}>
            {data.useCases.map((u, i) => (
              <Link
                className={styles.useCard}
                key={u.id}
                to={`/products?category=${u.categories[0] || ""}`}
              >
                <PictureView picture={u.image} />
                <span className={styles.useIndex}>0{i + 1}</span>
                <div>
                  <span className="eyebrow">{u.description}</span>
                  <h3>{u.title}</h3>
                </div>
                <ArrowUpRight />
              </Link>
            ))}
          </div>
        </div>
      </section>
      {featured && (
        <section className={`section light ${styles.featured}`} data-featured>
          <Light variant="refraction" color="#d9f4ff" intensity={0.3} />
          <div className={`container ${styles.featuredInner}`} data-reveal>
            <div className={styles.featuredImage}>
              <div className={styles.featureCircle} data-feature-depth />
              <div className={styles.featureProduct} data-feature-product>
                <PictureView picture={featured.images[0]} />
              </div>
              <span>01 / THE SPOTLIGHT</span>
            </div>
            <div className={styles.featuredCopy}>
              <span className="eyebrow muted">TURN UP THE MOMENT</span>
              <h2>
                A little louder.
                <br />A little closer.
              </h2>
              <p>
                {featured.summary} Discover {featured.name} and find a new
                reason to bring your people together.
              </p>
              <ul>
                {featured.features.slice(0, 3).map((f) => (
                  <li key={f}>
                    <AudioLines size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                className="button dark-button"
                to={`/products/${featured.slug}`}
              >
                Discover {featured.name} <ArrowUpRight size={17} />
              </Link>
              {featured.demo && (
                <small className="demo-label">
                  Illustrative concept. Official product details to follow.
                </small>
              )}
            </div>
          </div>
        </section>
      )}
      <section className={`section dark ${styles.experience}`}>
        <Light variant="spotlight" color="#9c85dd" intensity={0.5} animated />
        <div className="container" data-reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPERIENCE iDANCE</span>
              <h2>{data.home.videosHeading}</h2>
            </div>
            <Link className="text-link" to="/tv">
              Explore iDance TV <ArrowUpRight size={18} />
            </Link>
          </div>
          <VideoGrid
            videos={(data.home.featuredVideos?.length
              ? data.videos.filter((v) =>
                  data.home.featuredVideos.includes(v.id),
                )
              : data.videos
            ).slice(0, 3)}
          />
        </div>
      </section>
      <section className="section light">
        <div className="container" data-reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow muted">
                STORIES, IDEAS & A LITTLE INSPIRATION
              </span>
              <h2>Latest from iDance.</h2>
            </div>
            <Link className="text-link" to="/news">
              All stories <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="news-grid">
            {data.news.slice(0, 3).map((n) => (
              <NewsCard key={n.id} post={n} />
            ))}
          </div>
        </div>
      </section>
      <section className={styles.brandCta}>
        <Light variant="horizon" color="#9fa8ff" intensity={0.75} />
        <span className="eyebrow">GOOD MOMENTS START WITH SOUND</span>
        <h2>{data.home.cta}</h2>
        <div className="button-row">
          <Link className="button" to="/products">
            Explore products <ArrowRight size={18} />
          </Link>
          <Link
            className="text-link"
            to="/contact"
            onClick={() => track("contact_click", { source: "home_cta" })}
          >
            Let’s talk <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

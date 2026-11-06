import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
} from "lucide-react";
import { useHomeMotion } from "../../hooks/useHomeMotion";
import { ProductHero } from "./ProductHero";
import { ProductDeck } from "./ProductDeck";
import { useContent } from "../../hooks/useContent";
import { usePage } from "../../hooks/usePage";
import { LightAtmosphere as Light } from "../../components/effects/LightAtmosphere";
import {
  PictureView,
  NewsCard,
} from "../../components/ui/ContentCards";
import { VideoGrid } from "../../components/ui/VideoGrid";
import { track } from "../../lib/analytics";
import styles from "./Home.module.css";

export function Home() {
  const data = useContent();
  const root = useRef<HTMLDivElement>(null);
  const featured =
    data.products.find((p) => data.home.featuredProducts?.includes(p.id)) ||
    data.products[0];
  usePage(
    data.settings.seo?.title || "Bring Your Sound to Life",
    data.settings.seo?.description,
    data.home.heroImage?.url,
  );
  useHomeMotion(root);
  return (
    <div ref={root}>
      <ProductHero />
      <ProductDeck />
      <section
        id="find-your-sound"
        className={`section dark ${styles.useCases} ${styles.withParticleBackdrop}`}
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
        <section className={`section light ${styles.featured} ${styles.withParticleBackdrop}`} data-featured>
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
      <section className={`section dark ${styles.experience} ${styles.withParticleBackdrop}`}>
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
      <section className={`section light ${styles.withParticleBackdrop}`}>
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
      <section className={`${styles.brandCta} ${styles.withParticleBackdrop}`}>
        <Light variant="horizon" color="#9fa8ff" intensity={0.75} />
        <span className="eyebrow">GOOD MOMENTS START WITH SOUND</span>
        <h2 data-reveal>{data.home.cta}</h2>
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

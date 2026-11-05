import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import { ArrowUpRight, Download, Check } from "lucide-react";
import { useContent } from "../hooks/useContent";
import { usePage } from "../hooks/usePage";
import {
  PictureView,
  ProductCard,
  NewsCard,
} from "../components/ui/ContentCards";
import { VideoGrid } from "../components/ui/VideoGrid";
import { item, track } from "../lib/analytics";
export function Products() {
  const data = useContent();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const q = params.get("q") || "";
  usePage("Explore Products");
  const products = data.products.filter(
    (p) =>
      (!category || p.category.slug === category) &&
      p.name.toLowerCase().includes(q.toLowerCase()),
  );
  const seen = useRef("");
  useEffect(() => {
    const key = products.map((p) => p.id).join(",");
    if (seen.current === key) return;
    seen.current = key;
    track("view_item_list", {
      item_list_id: "catalogue",
      items: products.map(item),
    });
  }, [products]);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: key === "q" });
  }
  return (
    <section className="page light">
      <div className="container">
        <span className="eyebrow muted">DISCOVER THE COLLECTION</span>
        <h1>Sound for your world.</h1>
        <p className="intro">
          Find your next singalong, celebration or spark of creativity.
        </p>
        {data.demo && (
          <p className="demo-notice">
            Demo collection — product names, illustrations and descriptions are
            placeholders.
          </p>
        )}
        <div className="filters">
          <label className="field">
            Category
            <select
              value={category}
              onChange={(e) => {
                update("category", e.target.value);
                track("product_filter", {
                  category:
                    data.categories.find((c) => c.slug === e.target.value)
                      ?.name || "All",
                });
              }}
            >
              <option value="">All products</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Search products
            <input
              type="search"
              value={q}
              placeholder="Search by product name"
              onChange={(e) => update("q", e.target.value)}
            />
          </label>
        </div>
        <p aria-live="polite" className="result-count">
          {products.length} products
        </p>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!products.length && (
          <div className="empty">
            <h2>No sound found. Yet.</h2>
            <p>Try a different name or category.</p>
            <button
              className="button dark-button"
              onClick={() => setParams({})}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
export function ProductDetail() {
  const { slug } = useParams();
  const data = useContent();
  const p = data.products.find((p) => p.slug === slug);
  const [selected, setSelected] = useState(0);
  const seen = useRef("");
  usePage(
    p?.seo?.title || p?.name || "Product not found",
    p?.seo?.description || p?.summary,
    p?.images[0]?.url,
  );
  useEffect(() => {
    setSelected(0);
    if (p && seen.current !== p.id) {
      seen.current = p.id;
      track("view_item", { items: [item(p)] });
    }
  }, [p]);
  useEffect(() => {
    if (!p || p.demo) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.summary,
      image: p.images.map((i) => i.url),
      category: p.category.name,
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [p]);
  if (!p) return <NotFound />;
  const related = data.products
    .filter(
      (r) =>
        r.id !== p.id &&
        (p.relatedProducts?.length
          ? p.relatedProducts.includes(r.id)
          : r.category.id === p.category.id),
    )
    .slice(0, 3);
  return (
    <section className="page light">
      <div className="container">
        <Link className="text-link" to="/products">
          ← Back to collection
        </Link>
        <div className="detail-grid">
          <div>
            <div className="detail-image">
              <PictureView
                picture={p.images[selected] || p.images[0]}
                priority
              />
            </div>
            {p.images.length > 1 && (
              <div className="thumbnails">
                {p.images.map((img, i) => (
                  <button
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={selected === i}
                    key={img.url}
                    onClick={() => setSelected(i)}
                  >
                    <PictureView picture={img} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <span className="eyebrow muted">{p.category.name}</span>
            <h1>{p.name}</h1>
            <p className="intro">{p.summary}</p>
            {p.demo && (
              <p className="demo-notice">
                Demo product. This concept is not an official iDance product
                listing.
              </p>
            )}
            {p.description && <PortableText value={p.description} />}
            <ul className="feature-list">
              {p.features.map((f) => (
                <li key={f}>
                  <Check size={18} />
                  {f}
                </li>
              ))}
            </ul>
            {!!p.specifications?.length && (
              <dl className="specifications">
                {p.specifications.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link
              className="button dark-button"
              to={`/contact?product=${encodeURIComponent(p.slug)}`}
              onClick={() => track("contact_click", { source: "product" })}
            >
              Enquire about this product <ArrowUpRight size={18} />
            </Link>
            {p.manual && (
              <a
                className="text-link manual"
                href={p.manual}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("file_download", { item_id: p.id })}
              >
                <Download size={18} />
                Download manual
              </a>
            )}
          </div>
        </div>
        {related.length > 0 && (
          <>
            <h2>More to discover.</h2>
            <div className="product-grid">
              {related.map((r) => (
                <ProductCard product={r} key={r.id} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
export function About() {
  const { about, demo } = useContent();
  usePage("Our Story");
  return (
    <section className="page dark">
      <div className="container narrow">
        <span className="eyebrow">OUR WORLD OF SOUND</span>
        <h1>{about.headline}</h1>
        <div className="prose">
          <PortableText value={about.body} />
        </div>
        {demo && (
          <p className="demo-notice">
            Preview copy — approved brand history and company details pending.
          </p>
        )}
        <Link className="button" to="/products">
          Find your sound <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
export function TV() {
  const { videos } = useContent();
  usePage("iDance TV");
  return (
    <section className="page dark">
      <div className="container">
        <span className="eyebrow">EXPERIENCE iDANCE</span>
        <h1>See it. Hear it. Feel it.</h1>
        <p className="intro">
          A closer look at a world brought to life by sound.
        </p>
        <VideoGrid videos={videos} />
        {!videos.length && <p>Films are coming soon.</p>}
      </div>
    </section>
  );
}
export function News() {
  const { news } = useContent();
  usePage("News & Stories");
  return (
    <section className="page light">
      <div className="container">
        <span className="eyebrow muted">FROM OUR WORLD</span>
        <h1>Stories worth sharing.</h1>
        <div className="news-grid">
          {news.map((n) => (
            <NewsCard key={n.id} post={n} />
          ))}
        </div>
        {!news.length && <p>Stories are coming soon.</p>}
      </div>
    </section>
  );
}
export function NewsDetail() {
  const { slug } = useParams();
  const { news } = useContent();
  const p = news.find((n) => n.slug === slug);
  usePage(
    p?.seo?.title || p?.title || "Story not found",
    p?.seo?.description || p?.excerpt,
    p?.cover.url,
  );
  if (!p) return <NotFound />;
  return (
    <article className="page light">
      <div className="container narrow">
        <Link className="text-link" to="/news">
          ← All stories
        </Link>
        <p className="eyebrow muted">
          {p.category} / {p.date}
        </p>
        <h1>{p.title}</h1>
        {p.demo && (
          <p className="demo-notice">
            Sample story — not an official brand announcement.
          </p>
        )}
        <PictureView className="article-cover" picture={p.cover} priority />
        <div className="prose">
          <PortableText value={p.body} />
        </div>
      </div>
    </article>
  );
}
export function Contact() {
  const { settings, products } = useContent();
  const [params] = useSearchParams();
  const product = products.find((p) => p.slug === params.get("product"));
  const [feedback, setFeedback] = useState(false);
  usePage("Contact");
  return (
    <section className="page light">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow muted">LET’S TALK SOUND</span>
          <h1>Start a conversation.</h1>
          <p className="intro">
            Have a product question or an idea to share? We’d love to connect.
          </p>
          {settings.email && (
            <a className="text-link" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
          )}
          {settings.phone && <p>{settings.phone}</p>}
          <p className="demo-notice">
            Demo form — submission is not configured. No information is sent or
            saved.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFeedback(true);
          }}
        >
          <label className="field">
            Your name
            <input name="name" autoComplete="name" required maxLength={100} />
          </label>
          <label className="field">
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label className="field">
            Subject
            <input
              name="subject"
              required
              defaultValue={product ? `Product enquiry: ${product.name}` : ""}
              maxLength={200}
            />
          </label>
          <label className="field">
            Your message
            <textarea name="message" required rows={5} maxLength={5000} />
          </label>
          <button className="button dark-button" type="submit">
            Check enquiry <ArrowUpRight size={18} />
          </button>
          {feedback && (
            <p role="status" className="demo-notice">
              Your fields are valid. Nothing has been sent: this demo has no
              submission service connected.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
export function Privacy() {
  usePage("Privacy information");
  return (
    <section className="page light">
      <div className="container narrow">
        <h1>Privacy information.</h1>
        <p className="intro">
          The formal privacy and cookie policies are pending.
        </p>
        <p>
          Optional analytics is off until you accept it. You can change your
          choice using Cookie settings in the footer. This preview does not
          submit contact forms.
        </p>
        <p>
          This page is a configuration notice, not a published legal policy.
        </p>
      </div>
    </section>
  );
}
export function NotFound() {
  usePage("Page not found");
  return (
    <section className="page light">
      <div className="container narrow">
        <span className="eyebrow muted">404 / LOST THE RHYTHM?</span>
        <h1>Let’s find your way back.</h1>
        <p>The page or product you’re looking for isn’t here.</p>
        <Link className="button dark-button" to="/">
          Back to iDance <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}

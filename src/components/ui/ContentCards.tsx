import { useRef } from "react";
import { useProductHover } from "../../hooks/useProductHover";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Picture, Product, NewsPost } from "../../types/content";
import { item, track } from "../../lib/analytics";
export function PictureView({
  picture,
  className = "",
  priority = false,
}: {
  picture?: Picture;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      className={className}
      src={picture?.url || "/assets/fallback.svg"}
      alt={picture?.alt || "Image coming soon"}
      width="800"
      height="700"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.endsWith("/assets/fallback.svg"))
          img.src = "/assets/fallback.svg";
      }}
    />
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  const root = useRef<HTMLAnchorElement>(null);
  useProductHover(root);
  return (
    <Link
      ref={root}
      className="product-card"
      to={`/products/${p.slug}`}
      onClick={() => track("select_item", { items: [item(p)] })}
    >
      <div className="product-image">
        <PictureView picture={p.images[0]} />
        {p.isNew && <span className="new-label">NEW CONCEPT</span>}
        <ArrowUpRight className="card-arrow" />
      </div>
      <span className="eyebrow muted">{p.category.name}</span>
      <h3>{p.name}</h3>
      <p>{p.summary}</p>
      <span className="text-link">
        View product <ArrowUpRight size={16} />
      </span>
      {p.demo && (
        <small className="demo-label">
          Demo product · concept illustration
        </small>
      )}
    </Link>
  );
}
export function NewsCard({ post: p }: { post: NewsPost }) {
  return (
    <Link className="news-card" to={`/news/${p.slug}`}>
      <PictureView picture={p.cover} />
      <div>
        <span className="eyebrow muted">
          {p.category} <span> / </span>{" "}
          {new Date(p.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        {p.demo && <small className="demo-label">Sample story</small>}
        <h3>{p.title}</h3>
        <p>{p.excerpt}</p>
        <span className="text-link">
          Read story <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}

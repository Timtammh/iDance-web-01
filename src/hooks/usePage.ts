import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageView } from "../lib/analytics";
export function usePage(
  title: string,
  description = "Discover sound for parties, everyday moments and creative play with iDance.",
  image?: string,
) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${title} | iDance`;
    const base = import.meta.env.VITE_SITE_URL || location.origin;
    const canonical = new URL(pathname, base).href;
    const meta = (name: string, content: string, property = false) => {
      let el = document.head.querySelector<HTMLMetaElement>(
        `meta[${property ? "property" : "name"}="${name}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(property ? "property" : "name", name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    meta("description", description);
    meta("og:title", document.title, true);
    meta("og:description", description, true);
    meta("og:url", canonical, true);
    meta("og:type", "website", true);
    if (image) meta("og:image", new URL(image, base).href, true);
    else document.head.querySelector('meta[property="og:image"]')?.remove();
    let link = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
    pageView(pathname, document.title);
  }, [pathname, title, description, image]);
}

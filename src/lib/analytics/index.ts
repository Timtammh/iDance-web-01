/* eslint-disable prefer-rest-params -- Google tag queue requires an Arguments object. */
type Item = { item_id: string; item_name: string; item_category: string };
type Events = {
  view_item_list: { item_list_id: string; items: Item[] };
  select_item: { items: Item[] };
  view_item: { items: Item[] };
  product_filter: { category: string };
  hero_cta_click: { destination: string };
  video_open: { video_id: string };
  contact_click: { source: string };
  file_download: { item_id: string };
  generate_lead: { method: "confirmed_backend" };
};
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean;
  }
}
const id = import.meta.env.VITE_GA4_MEASUREMENT_ID;
let allowed = false,
  initialized = false,
  lastPage = "";
export type Consent = "accepted" | "rejected";
export function savedConsent(): Consent | null {
  try {
    const v = localStorage.getItem("idance-analytics");
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}
export function setConsent(value: Consent) {
  try {
    localStorage.setItem("idance-analytics", value);
  } catch {
    /* Storage unavailable; respect choice for this session. */
  }
  allowed = value === "accepted";
  if (id) window[`ga-disable-${id}`] = !allowed;
  if (!allowed) {
    lastPage = "";
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    return;
  }
  init();
  window.gtag?.("consent", "update", { analytics_storage: "granted" });
  pageView(location.pathname, document.title);
}
function init() {
  if (
    initialized ||
    !allowed ||
    !id ||
    !/^G-[A-Z0-9]+$/.test(id) ||
    import.meta.env.DEV
  )
    return;
  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}
export function pageView(path: string, title: string) {
  if (!allowed || !initialized || lastPage === path) return;
  lastPage = path;
  window.gtag?.("event", "page_view", {
    page_title: title,
    page_location: location.origin + path,
    page_referrer: location.origin,
  });
}
export function track<K extends keyof Events>(name: K, data: Events[K]) {
  if (allowed && initialized) window.gtag?.("event", name, data);
}
export const item = (p: {
  id: string;
  name: string;
  category: { name: string };
}): Item => ({
  item_id: p.id,
  item_name: p.name,
  item_category: p.category.name,
});

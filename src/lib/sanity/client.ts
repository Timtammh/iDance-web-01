import { createClient } from "@sanity/client";
import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import type { Content, Picture } from "../../types/content";
import { contentQuery } from "./queries";
export const contentSource = import.meta.env.VITE_CONTENT_SOURCE || "demo";
export async function loadContent(): Promise<Content> {
  if (contentSource === "demo")
    return (await import("../../data/demo")).demoContent;
  if (contentSource !== "sanity")
    throw new Error("Invalid content source. Use demo or sanity.");
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  if (!projectId)
    throw new Error(
      "Sanity project ID is missing. Configure your environment to connect.",
    );
  const client = createClient({
    projectId,
    dataset: import.meta.env.VITE_SANITY_DATASET || "production",
    apiVersion: import.meta.env.VITE_SANITY_API_VERSION || "2026-01-01",
    useCdn: true,
    perspective: "published",
  });
  const data = await client.fetch<Content>(contentQuery);
  if (!data.settings || !data.home || !data.about)
    throw new Error(
      "Publish site settings, a home page and an about page in Sanity first.",
    );
  const builder = createImageUrlBuilder(client);
  const image = (value: Picture): Picture =>
    value && {
      ...value,
      url: builder
        .image(value as unknown as SanityImageSource)
        .width(1440)
        .fit("max")
        .auto("format")
        .url(),
    };
  data.products = data.products.map((p) => ({
    ...p,
    images: (p.images || []).map(image),
    features: p.features || [],
  }));
  data.news = data.news.map((p) => ({ ...p, cover: image(p.cover) }));
  data.useCases = data.useCases.map((p) => ({ ...p, image: image(p.image) }));
  data.videos = data.videos.map((p) => ({
    ...p,
    thumbnail: image(p.thumbnail),
  }));
  if (data.home.heroImage) data.home.heroImage = image(data.home.heroImage);
  return { ...data, demo: false };
}

import type { PortableTextBlock } from "@portabletext/types";
export type Picture = { url: string; alt: string };
export type SEO = { title?: string; description?: string; image?: Picture };
export type Category = { id: string; name: string; slug: string };
export type Product = {
  id: string;
  name: string;
  slug: string;
  category: Category;
  images: Picture[];
  summary: string;
  description?: PortableTextBlock[];
  features: string[];
  specifications?: { label: string; value: string }[];
  manual?: string;
  isPopular: boolean;
  isNew: boolean;
  relatedProducts?: string[];
  seo?: SEO;
  demo?: boolean;
};
export type NewsPost = {
  id: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  cover: Picture;
  excerpt: string;
  body: PortableTextBlock[];
  seo?: SEO;
  demo?: boolean;
};
export type Video = {
  id: string;
  title: string;
  thumbnail: Picture;
  url?: string;
  category: string;
};
export type UseCase = {
  id: string;
  title: string;
  slug: string;
  image: Picture;
  description: string;
  categories: string[];
};
export type Content = {
  products: Product[];
  categories: Category[];
  news: NewsPost[];
  videos: Video[];
  useCases: UseCase[];
  settings: {
    logo?: Picture;
    navigation?: { label: string; path: string }[];
    socialLinks?: { label: string; url: string }[];
    email?: string;
    phone?: string;
    brandStatement: string;
    seo?: SEO;
  };
  home: {
    headline: string;
    description: string;
    heroImage?: Picture;
    featuredProducts: string[];
    featuredVideos: string[];
    productsHeading: string;
    videosHeading: string;
    cta: string;
  };
  about: { headline: string; body: PortableTextBlock[] };
  demo: boolean;
};

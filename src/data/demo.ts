import type { Content } from "../types/content";
const photo = (id: string, alt: string) => ({
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`,
  alt,
});
const block = (text: string) => [
  {
    _type: "block" as const,
    _key: "intro",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span" as const, _key: "text", text, marks: [] }],
  },
];
const categories = [
  { id: "karaoke", slug: "karaoke", name: "Karaoke" },
  { id: "party", slug: "party", name: "Party speakers" },
  { id: "family", slug: "family", name: "Kids & family" },
  { id: "creative", slug: "creative", name: "Music & creativity" },
];
export const demoContent: Content = {
  demo: true,
  categories,
  settings: {
    brandStatement:
      "For the moments that move you. Discover a world of sound, shared.",
    socialLinks: [],
  },
  home: {
    headline: "Bring Your Sound to Life.",
    description:
      "For the spontaneous singalongs. The all-night celebrations. And every little moment in between.",
    featuredProducts: ["demo-party", "demo-karaoke", "demo-play"],
    featuredVideos: [],
    productsHeading: "Find your next sound.",
    videosHeading: "See it. Hear it. Feel it.",
    cta: "Make every moment sound better.",
  },
  products: [
    {
      id: "demo-party",
      name: "Pulse Party Speaker",
      slug: "pulse-party-speaker",
      category: categories[1],
      images: [
        {
          url: "/assets/speaker.svg",
          alt: "Concept illustration of a black party speaker with cyan and violet light rings",
        },
      ],
      summary: "Set the scene. Bring everyone together.",
      features: [
        "Party speaker concept",
        "Light-ring visual concept",
        "Designed here as a demo illustration",
      ],
      isPopular: true,
      isNew: false,
      demo: true,
    },
    {
      id: "demo-karaoke",
      name: "Sing Together",
      slug: "sing-together",
      category: categories[0],
      images: [
        {
          url: "/assets/karaoke.svg",
          alt: "Concept illustration of a portable karaoke speaker and microphone",
        },
      ],
      summary: "Your living room. Your headline moment.",
      features: [
        "Home karaoke concept",
        "Microphone visual concept",
        "Demo content — specifications pending",
      ],
      isPopular: true,
      isNew: true,
      demo: true,
    },
    {
      id: "demo-play",
      name: "Pocket Groove",
      slug: "pocket-groove",
      category: categories[3],
      images: [
        {
          url: "/assets/pad.svg",
          alt: "Concept illustration of a compact music pad with colourful keys",
        },
      ],
      summary: "A little inspiration. A whole new rhythm.",
      features: [
        "Creative music concept",
        "Colourful pad visual",
        "Demo content — specifications pending",
      ],
      isPopular: true,
      isNew: true,
      demo: true,
    },
    {
      id: "demo-family",
      name: "Little Sound Makers",
      slug: "little-sound-makers",
      category: categories[2],
      images: [
        {
          url: "/assets/karaoke.svg",
          alt: "Demo karaoke speaker illustration",
        },
      ],
      summary: "Make room for a little musical imagination.",
      features: ["Family music concept", "Illustrative design only"],
      isPopular: false,
      isNew: true,
      demo: true,
    },
  ],
  useCases: [
    {
      id: "home",
      slug: "home",
      title: "Home Karaoke",
      image: photo(
        "photo-1516280440614-37939bbacd81",
        "A microphone in warm stage light",
      ),
      description: "The best stage is the one you share.",
      categories: ["karaoke"],
    },
    {
      id: "party",
      slug: "party",
      title: "Party & Events",
      image: photo(
        "photo-1470229722913-7c0e2dbbafd3",
        "An audience sharing a live music moment",
      ),
      description: "Turn a gathering into a good memory.",
      categories: ["party"],
    },
    {
      id: "family",
      slug: "family",
      title: "Kids & Family Fun",
      image: photo(
        "photo-1511632765486-a01980e01a18",
        "Family spending a relaxed moment together",
      ),
      description: "Little moments. Big smiles.",
      categories: ["family"],
    },
    {
      id: "creative",
      slug: "creative",
      title: "Music & Creativity",
      image: photo(
        "photo-1511379938547-c1f69419868d",
        "Musical instruments in a creative studio",
      ),
      description: "Follow your own rhythm.",
      categories: ["creative"],
    },
  ],
  videos: [
    {
      id: "v1",
      title: "Meet your next party starter",
      category: "Product demo",
      thumbnail: photo("photo-1493225457124-a3eb161ffa5f", "Live music stage"),
    },
    {
      id: "v2",
      title: "Good people. Great sound.",
      category: "Life with sound",
      thumbnail: photo(
        "photo-1528605248644-14dd04022da1",
        "Friends gathered around a table",
      ),
    },
    {
      id: "v3",
      title: "Small ideas. New possibilities.",
      category: "Creative play",
      thumbnail: photo(
        "photo-1598488035139-bdbb2231ce04",
        "Music production studio",
      ),
    },
  ],
  news: [
    {
      id: "n1",
      slug: "make-room-for-music",
      title: "Make room for more music.",
      category: "Inspiration",
      date: "2026-10-28",
      cover: photo(
        "photo-1516280440614-37939bbacd81",
        "Microphone in warm light",
      ),
      excerpt:
        "A little inspiration for turning an ordinary evening into a shared soundtrack.",
      body: block(
        "This is a sample editorial story for previewing the iDance website. A living room can become a place to share a favourite song, explore a new rhythm, or simply spend time together. Replace this sample with an approved brand story in Sanity before launch.",
      ),
      demo: true,
    },
    {
      id: "n2",
      slug: "find-your-party-sound",
      title: "Every gathering has a soundtrack.",
      category: "Sound stories",
      date: "2026-10-15",
      cover: photo(
        "photo-1470229722913-7c0e2dbbafd3",
        "Lights above a music audience",
      ),
      excerpt: "Explore the moments that bring people together through sound.",
      body: block(
        "Sample story: music helps set the mood for a gathering. This preview demonstrates the article layout and Portable Text rendering. It is not an official iDance announcement.",
      ),
      demo: true,
    },
    {
      id: "n3",
      slug: "a-little-creative-play",
      title: "Let curiosity take the lead.",
      category: "Creative living",
      date: "2026-10-02",
      cover: photo(
        "photo-1511379938547-c1f69419868d",
        "A music studio ready for creative play",
      ),
      excerpt:
        "Leave a little space in the day for making something of your own.",
      body: block(
        "Sample story: explore a rhythm, hum a melody, and make time for creative play. Replace this demonstration text with a reviewed editorial article before publishing.",
      ),
      demo: true,
    },
  ],
  about: {
    headline: "Life sounds better together.",
    body: block(
      "iDance brings music into the moments we share — from home karaoke and celebrations to family fun and creative play. This preview introduces the brand direction. Approved brand history, company information and product details will be added before launch.",
    ),
  },
};

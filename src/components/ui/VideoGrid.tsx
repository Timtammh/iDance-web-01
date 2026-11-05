import { useState } from "react";
import { Play, ArrowUpRight } from "lucide-react";
import { Modal } from "./Modal";
import { PictureView } from "./ContentCards";
import type { Video } from "../../types/content";
import { track } from "../../lib/analytics";
export function videoEmbed(raw?: string) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (["www.youtube.com", "youtube.com", "youtu.be"].includes(u.hostname)) {
      const id =
        u.hostname === "youtu.be"
          ? u.pathname.slice(1)
          : u.searchParams.get("v");
      return id && /^[\w-]{11}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
        : null;
    }
    if (
      ["vimeo.com", "www.vimeo.com"].includes(u.hostname) &&
      /^\/\d+$/.test(u.pathname)
    )
      return `https://player.vimeo.com/video${u.pathname}?autoplay=1`;
    return null;
  } catch {
    return null;
  }
}
export function VideoGrid({ videos }: { videos: Video[] }) {
  const [active, setActive] = useState<Video | null>(null);
  return (
    <>
      <div className="video-grid">
        {videos.map((v) => (
          <button
            className="video-card"
            key={v.id}
            onClick={(e) => {
              e.currentTarget.focus();
              setActive(v);
              if (videoEmbed(v.url)) track("video_open", { video_id: v.id });
            }}
          >
            <div className="video-image">
              <PictureView picture={v.thumbnail} />
              <span className="play">
                <Play size={20} />
              </span>
              <small>
                {videoEmbed(v.url)
                  ? "WATCH FILM"
                  : "PREVIEW · VIDEO COMING SOON"}
              </small>
            </div>
            <span className="eyebrow">{v.category}</span>
            <h3>
              {v.title}
              <ArrowUpRight size={19} />
            </h3>
          </button>
        ))}
      </div>
      {active && (
        <Modal title={active.title} onClose={() => setActive(null)}>
          {videoEmbed(active.url) ? (
            <iframe
              className="video-player"
              src={videoEmbed(active.url)!}
              title={active.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="unavailable">
              <Play size={36} />
              <h3>The film is on its way.</h3>
              <p>No video has been connected to this preview yet.</p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import introVideo from "../../video/intro.mp4";

export function IntroGate({ children }: { children: ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const enter = useCallback(() => {
    video.current?.pause();
    setShowIntro(false);
    navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!showIntro) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    enterButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (["Escape", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        enter();
      }
    };
    document.addEventListener("keydown", onKey);
    // Muted inline video allows autoplay on mobile; the skip button remains
    // available if a browser or power-saving setting blocks playback.
    void video.current?.play().catch(() => {});
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [showIntro, enter]);

  if (!showIntro) return children;
  return <div className="intro-screen">
    <video ref={video} src={introVideo} autoPlay muted playsInline preload="auto" onEnded={enter} onError={enter} aria-hidden="true" />
    <button ref={enterButton} type="button" className="intro-enter" onClick={enter} aria-label="Stop intro and enter iDance homepage">
      <span>Click anywhere to enter <span aria-hidden="true">↗</span><small>Tap to skip · Esc</small></span>
    </button>
  </div>;
}

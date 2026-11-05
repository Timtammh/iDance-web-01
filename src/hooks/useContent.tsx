import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { loadContent } from "../lib/sanity/client";
import type { Content } from "../types/content";
const Context = createContext<Content | null>(null);
export function ContentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Content | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    loadContent()
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  if (error)
    return (
      <main className="state">
        <h1>We couldn’t load the content.</h1>
        <p>{error}</p>
        <button
          className="button"
          onClick={() => {
            setError("");
            setAttempt((x) => x + 1);
          }}
        >
          Try again
        </button>
      </main>
    );
  if (!data)
    return (
      <main className="state" aria-busy="true">
        <p>Setting the stage…</p>
      </main>
    );
  return <Context.Provider value={data}>{children}</Context.Provider>;
}
export function useContent() {
  const data = useContext(Context);
  if (!data) throw new Error("ContentProvider required");
  return data;
}

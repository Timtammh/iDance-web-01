import type { CSSProperties } from "react";
import styles from "./LightAtmosphere.module.css";
type Props = {
  variant?: "spotlight" | "horizon" | "halo" | "refraction" | "reflection";
  intensity?: number;
  color?: string;
  position?: string;
  animated?: boolean;
  className?: string;
};
export function LightAtmosphere({
  variant = "spotlight",
  intensity = 0.7,
  color = "#65dfff",
  position = "65% 50%",
  animated = false,
  className = "",
}: Props) {
  return (
    <div
      aria-hidden="true"
      data-light={variant}
      data-light-animated={animated || undefined}
      className={`${styles.light} ${styles[variant]} ${className}`}
      style={
        {
          "--light-color": color,
          "--light-position": position,
          "--light-intensity": intensity,
        } as CSSProperties
      }
    >
      <span
        className={`light-layer ${styles.layer} ${variant === "spotlight" ? styles.beam : ""}`}
      />
      {variant === "spotlight" && (
        <span className={`light-layer ${styles.layer} ${styles.ambient}`} />
      )}
    </div>
  );
}

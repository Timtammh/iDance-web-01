import { useId } from "react";
import styles from "./ParticleWaveBackground.module.css";

const rails = [
  { x: 12, y: -40, end: 1040, color: "#ffe500", width: 2.8 },
  { x: 21, y: -40, end: 1040, color: "#ffbd00", width: 1.1 },
  { x: 58, y: 160, end: 920, color: "#ff16af", width: 7 },
  { x: 68, y: 160, end: 920, color: "#ff35cf", width: 0.8 },
  { x: 101, y: -40, end: 580, color: "#d734ff", width: 1.5 },
  { x: 106, y: -40, end: 580, color: "#ff52cf", width: 0.7 },
  { x: 132, y: 110, end: 960, color: "#ff26bb", width: 4.5 },
  { x: 155, y: 420, end: 780, color: "#ffdf00", width: 1.4 },
];

export function ParticleWaveBackground() {
  const id = useId().replace(/:/g, "");
  return <div className={styles.background} aria-hidden="true" data-neon-background>
    <svg className={styles.curves} viewBox="0 0 1600 1000" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-curve-color`} x1="0" y1="0" x2="0.8" y2="1">
          <stop stopColor="#1cd9ff" /><stop offset="0.4" stopColor="#9b47f4" />
          <stop offset="0.7" stopColor="#ff36b4" /><stop offset="1" stopColor="#5349dd" />
        </linearGradient>
        <filter id={`${id}-curve-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={`${id}-curve-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <linearGradient id={`${id}-curve-fade`}>
          <stop stopColor="white"/><stop offset="0.22" stopColor="white" stopOpacity="0.8"/>
          <stop offset="0.36" stopColor="black"/><stop offset="0.64" stopColor="black"/>
          <stop offset="0.78" stopColor="white" stopOpacity="0.8"/><stop offset="1" stopColor="white"/>
        </linearGradient>
        <mask id={`${id}-curve-mask`}><rect width="1600" height="1000" fill={`url(#${id}-curve-fade)`}/></mask>
      </defs>
      <g mask={`url(#${id}-curve-mask)`} fill="none" stroke={`url(#${id}-curve-color)`}>
        {[0, 1].map(side => <g key={side} transform={side ? "translate(1600 1000) scale(-1 -1)" : undefined}>
          {Array.from({ length: 9 }, (_, i) => {
            const offset = i * 24;
            const path = `M -80 ${70 + offset} C 90 ${-20 + offset}, 160 ${300 + offset}, 290 ${265 + offset} S 360 ${105 + offset}, 555 ${145 + offset} M -100 ${620 + offset} C 115 ${430 + offset}, 195 ${820 + offset}, 345 ${715 + offset} S 420 ${590 + offset}, 570 ${655 + offset}`;
            const thickness = i % 3 === 0 ? 14 : 11;
            const lightY = side ? 1 : -1;
            return <g key={i} className={styles.curveTube} style={{ animationDelay: `${i * -1.1}s`, animationDuration: `${9 + i % 3 * 2}s` }} strokeLinecap="round">
              {/* Layered rounded cross-section: cast shadow, deep sidewall,
                  saturated body, broad upper highlight, then a fine light edge. */}
              <path d={path} stroke="#000000" strokeWidth={thickness + 8} transform={`translate(3 ${-lightY * 8})`} opacity="0.95" filter={`url(#${id}-curve-shadow)`}/>
              <path d={path} strokeWidth={thickness + 12} opacity="0.18" filter={`url(#${id}-curve-glow)`}/>
              <path d={path} stroke="#10051f" strokeWidth={thickness + 3} transform={`translate(0 ${-lightY * 3})`}/>
              <path d={path} stroke="#30104e" strokeWidth={thickness}/>
              <path d={path} strokeWidth={thickness * 0.8} transform={`translate(0 ${lightY * 1.2})`} opacity="0.85"/>
              <path d={path} stroke="#261037" strokeWidth={thickness * 0.42} transform={`translate(0 ${-lightY * 3})`} opacity="0.8"/>
              <path d={path} stroke="#d993f8" strokeWidth={thickness * 0.28} transform={`translate(0 ${lightY * 3.2})`} opacity="0.65"/>
              <path d={path} stroke="#f4cfff" strokeWidth="1.1" transform={`translate(0 ${lightY * 4.2})`} opacity="0.75"/>
            </g>;
          })}
        </g>)}
      </g>
    </svg>
    {["left", "right"].map(side => <svg key={side} className={`${styles.rails} ${side === "right" ? styles.right : styles.left}`} viewBox="0 0 180 1000" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-${side}-metal`}>
          <stop stopColor="#090a13" /><stop offset="0.45" stopColor="#261025" />
          <stop offset="0.6" stopColor="#40112f" /><stop offset="1" stopColor="#080910" />
        </linearGradient>

        <filter id={`${id}-${side}-bloom`} filterUnits="userSpaceOnUse" x="-90" y="-150" width="360" height="1300" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={`${id}-${side}-glow`} filterUnits="userSpaceOnUse" x="-90" y="-150" width="360" height="1300" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <linearGradient id={`${id}-${side}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.4" />
          <stop offset="0.15" stopColor="white" />
          <stop offset="0.8" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
        <mask id={`${id}-${side}-mask`}><rect width="180" height="1000" fill={`url(#${id}-${side}-fade)`} /></mask>
      </defs>
      <g mask={`url(#${id}-${side}-mask)`}>
        {/* Recessed metal uprights and reflected seams create a layered light wall. */}
        {[0, 32, 79, 114, 164].map((x, i) => <g key={x}>
          <path d={`M ${x} -20 H ${x + 24} V 1020 H ${x} Z`} fill={`url(#${id}-${side}-metal)`} />
          <path d={`M ${x + 2} -20 V 1020`} stroke={i % 2 ? "#96315f" : "#57405e"} strokeWidth="0.7" opacity="0.6" />
          {Array.from({ length: 10 }, (_, n) => <path key={n} d={`M ${x + 3} ${n * 105 + i * 23} l 16 -12 v 42 l -16 12 z`} fill="#090912" stroke="#78305c" strokeWidth="0.6" opacity="0.55" />)}
        </g>)}
        {/* Short, dim rear LEDs sit behind the brighter foreground tubes. */}
        {Array.from({ length: 28 }, (_, i) => {
          const x = 26 + (i * 37 % 142);
          const y = 45 + (i * 137 % 860);
          const color = i % 4 === 0 ? "#ffcc00" : i % 7 === 0 ? "#29dcff" : "#ed279c";
          return <g key={i} className={styles.rearLight} style={{ animationDelay: `${i * -0.7}s` }} opacity={0.25 + i % 3 * 0.12}>
            <path d={`M ${x} ${y} v ${18 + i % 5 * 15}`} stroke={color} strokeWidth="5" filter={`url(#${id}-${side}-glow)`} />
            <path d={`M ${x} ${y} v ${18 + i % 5 * 15}`} stroke={color} strokeWidth={i % 3 === 0 ? 2 : 0.7} />
          </g>;
        })}
        {rails.map(rail => <path key={rail.x} d={`M ${rail.x - 5} ${rail.y} V ${rail.end}`} stroke="#09070d" strokeWidth={rail.width + 7} />)}
      </g>
      <g mask={`url(#${id}-${side}-mask)`} fill="none" strokeLinecap="butt">
        {rails.map((rail, i) => <g key={rail.x} className={styles.rail} style={{ animationDelay: `${i * -2.5}s` }}>
          <path d={`M ${rail.x} ${rail.y} V ${rail.end}`} stroke={rail.color} strokeWidth={rail.width * 3 + 10} opacity="0.55" filter={`url(#${id}-${side}-bloom)`} />
          <path d={`M ${rail.x} ${rail.y} V ${rail.end}`} stroke={rail.color} strokeWidth={rail.width * 2 + 3} opacity="0.85" filter={`url(#${id}-${side}-glow)`} />
          <path d={`M ${rail.x} ${rail.y} V ${rail.end}`} stroke={rail.color} strokeWidth={rail.width * 1.2} />
          <path d={`M ${rail.x} ${rail.y} V ${rail.end}`} stroke={rail.color === "#ffe500" || rail.color === "#ffbd00" || rail.color === "#ffdf00" ? "#fff59b" : "#fff0fc"} strokeWidth={rail.width * 0.7} />
        </g>)}
      </g>
    </svg>)}
  </div>;
}

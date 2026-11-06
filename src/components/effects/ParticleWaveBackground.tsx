import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "../../lib/motion/gsap";
import { particleWaveConfig, type ParticleWaveConfig } from "./particleWaveConfig";
import styles from "./ParticleWaveBackground.module.css";

const vertexShader = `
  attribute vec4 aSeed;
  attribute float aSide;
  uniform float uProgress, uAspect, uSize, uRatio, uWidth, uBend, uEdge, uFlow, uTime, uFloatAmplitude, uFloatSpeed, uNoteRatio, uNoteSize;
  varying float vLight, vDepth, vHighlight, vNote;
  void main() {
    float depth = aSeed.z;
    // Each layer travels a different distance. Scroll direction is reversible.
    float travel = uProgress * uFlow * (0.72 + depth * 0.28);
    float clock = uTime * uFloatSpeed;
    float drift = sin(clock * (0.55 + aSeed.w * 0.65) + aSeed.x * 31.0)
      + 0.45 * sin(clock * (0.31 + depth * 0.27) + aSeed.w * 19.0);
    float y = (fract(aSeed.x + travel) - 0.5) * 2.8 + drift * uFloatAmplitude;
    float sidePhase = aSide > 0.0 ? 1.8 : 0.0;
    float phase = y * 3.7 + uProgress * 2.2 + depth * 2.6 + sidePhase;
    float across = aSeed.y;
    float wave = sin(phase) * 0.68 + sin(y * 7.3 - uProgress * 1.7 + depth + sidePhase * 1.4) * 0.32;
    float fold = sin(across * 7.0 + phase * 1.1);
    float spread = 0.75 + 0.25 * sin(y * 2.3 + sidePhase + depth * 4.0);
    float scatter = (aSeed.w - 0.5) * uWidth * 0.8
      + sin(clock * 0.35 + aSeed.x * 23.0) * uFloatAmplitude * 0.2;
    float x = aSide * (uEdge + wave * uBend) + across * uWidth * spread + scatter;
    float z = (depth - 0.5) * 0.55 + fold * 0.14;
    vec3 point = vec3(x * uAspect * 2.8, y * 2.8, z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
    float focus = smoothstep(0.15, 0.95, depth);
    gl_PointSize = uSize * uRatio * mix(0.7, 1.55, depth) * mix(0.75, 1.3, aSeed.w);
    vNote = step(1.0 - uNoteRatio, fract(aSeed.x * 317.0 + aSeed.w * 79.0));
    gl_PointSize = mix(gl_PointSize, uNoteSize * uRatio * mix(0.8, 1.2, depth), vNote);
    vDepth = focus;
    vLight = (0.32 + focus * 0.55) * (0.55 + 0.45 * sin(across * 8.0 + phase) * sin(across * 8.0 + phase));
    vHighlight = step(0.94, aSeed.w);
  }
`;
const fragmentShader = `
  uniform vec3 uDeep, uElectric, uHighlight;
  uniform float uBrightness;
  varying float vLight, vDepth, vHighlight, vNote;
  float stroke(vec2 p, vec2 a, vec2 b) {
    vec2 d = b - a;
    return length(p - a - d * clamp(dot(p - a, d) / dot(d, d), 0.0, 1.0));
  }
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0) discard;
    float halo = exp(-r * r * 3.5) * 0.34;
    float core = exp(-r * r * mix(5.0, 9.0, vDepth));
    vec3 color = mix(uDeep, uElectric, vDepth * 0.75 + 0.2);
    color = mix(color, uHighlight, vHighlight * 0.85);
    float alpha = (core + halo) * vLight;
    if (vNote > 0.5) {
      vec2 p = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
      float head = (length((p - vec2(0.33, 0.27)) / vec2(0.13, 0.085)) - 1.0) * 0.085;
      float stem = stroke(p, vec2(0.44, 0.28), vec2(0.44, 0.79)) - 0.025;
      float flag = min(stroke(p, vec2(0.44, 0.79), vec2(0.66, 0.66)), stroke(p, vec2(0.66, 0.66), vec2(0.61, 0.53))) - 0.027;
      float shape = min(head, min(stem, flag));
      if (vDepth > 0.5) {
        float secondHead = (length((p - vec2(0.66, 0.34)) / vec2(0.12, 0.08)) - 1.0) * 0.08;
        float secondStem = stroke(p, vec2(0.76, 0.35), vec2(0.76, 0.82)) - 0.025;
        float beam = stroke(p, vec2(0.44, 0.75), vec2(0.76, 0.82)) - 0.037;
        shape = min(min(head, stem), min(secondHead, min(secondStem, beam)));
      }
      alpha = (1.0 - smoothstep(-0.008, 0.025, shape)) * 0.6 + exp(-max(shape, 0.0) * 32.0) * 0.12;
      alpha *= 0.55 + vDepth * 0.35;
      color = mix(uElectric, uHighlight, 0.25);
    }
    gl_FragColor = vec4(color, min(1.0, alpha * uBrightness));
    #include <colorspace_fragment>
  }
`;

function StaticWave() {
  return <svg className={styles.fallback} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
    {[0, 1].map(side => <g key={side} transform={side ? "translate(1000 0) scale(-1 1)" : undefined}>
      {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M ${35 + i * 3} 1100 C ${140 + i * 2} 850, ${-35 + i * 3} 700, ${65 + i * 3} 500 S ${140 + i * 2} 180, ${45 + i * 3} -100`} fill="none" stroke={i % 7 === 0 ? "#bddfff" : "#167de1"} strokeWidth={i % 3 === 0 ? 1.4 : .8} strokeDasharray={`1 ${6 + i % 5}`} strokeLinecap="round" opacity={.28 + (i % 4) * .1} />)}
    </g>)}
  </svg>;
}

export function ParticleWaveBackground({ config = particleWaveConfig }: { config?: ParticleWaveConfig }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const mount = host.current;
    if (!mount) return;
    let disposed = false;
    let frame = 0;
    let refreshFrame = 0;
    let contextLost = false;
    let elapsed = 0;
    let accumulated = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let geometry: THREE.BufferGeometry | undefined;
    let material: THREE.ShaderMaterial | undefined;
    let tween: gsap.core.Tween | undefined;
    let observer: ResizeObserver | undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 767px)");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20);
    camera.position.z = 6;
    const state = { progress: 0 };
    setReady(false);
    const render = () => {
      frame = 0;
      if (disposed || contextLost || !renderer || !material || document.hidden) return;
      material.uniforms.uProgress.value = state.progress;
      material.uniforms.uTime.value = reduced.matches ? 0 : elapsed;
      renderer.render(scene, camera);
    };
    const requestRender = () => { if (!frame) frame = requestAnimationFrame(render); };
    const floatTick = (_time: number, delta: number) => {
      if (disposed || contextLost || document.hidden || reduced.matches) return;
      const step = Math.min(delta, 50);
      elapsed += step / 1000;
      accumulated += step;
      if (accumulated >= 1000 / 30) { accumulated %= 1000 / 30; requestRender(); }
    };
    const setupScroll = () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      state.progress = 0;
      if (!reduced.matches) {
        tween = gsap.to(state, {
          progress: 1, ease: "none", onUpdate: requestRender,
          scrollTrigger: { id: "particle-wave", trigger: document.documentElement, start: 0, end: "max", scrub: config.scrub, invalidateOnRefresh: true },
        });
        state.progress = tween.scrollTrigger?.progress ?? 0;
      }
      requestRender();
    };
    const resize = () => {
      if (!renderer || !material) return;
      const width = window.innerWidth, height = window.innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, compact.matches ? config.mobilePixelRatio : config.pixelRatio);
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      material.uniforms.uAspect.value = camera.aspect;
      material.uniforms.uRatio.value = ratio;
      material.uniforms.uWidth.value = compact.matches ? config.bandWidth * 0.7 : config.bandWidth;
      material.uniforms.uBend.value = compact.matches ? config.bend * 0.65 : config.bend;
      geometry?.setDrawRange(0, compact.matches ? config.mobileCount : config.count);
      requestRender();
    };
    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => { if (!disposed) { ScrollTrigger.refresh(); requestRender(); } });
    };
    const lost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      setReady(false);
    };
    const restored = () => { contextLost = false; setupScroll(); resize(); setReady(true); };
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      renderer.debug.onShaderError = () => { throw new Error("Particle shader compilation failed"); };
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      mount.appendChild(renderer.domElement);
      renderer.domElement.addEventListener("webglcontextlost", lost);
      renderer.domElement.addEventListener("webglcontextrestored", restored);
      geometry = new THREE.BufferGeometry();
      const seeds = new Float32Array(config.count * 4);
      const sides = new Float32Array(config.count);
      let seed = 137;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      for (let i = 0; i < config.count; i++) {
        seeds.set([random(), (random() - .5) * 2, (i % 3) / 3 + random() * .22, random()], i * 4);
        sides[i] = i % 2 ? 1 : -1;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(config.count * 3), 3));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
      geometry.setAttribute("aSide", new THREE.BufferAttribute(sides, 1));
      material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
        uniforms: {
          uNoteRatio: { value: config.noteRatio }, uNoteSize: { value: config.noteSize },
          uTime: { value: 0 }, uFloatAmplitude: { value: config.floatAmplitude }, uFloatSpeed: { value: config.floatSpeed },
          uProgress: { value: 0 }, uAspect: { value: 1 }, uRatio: { value: 1 },
          uSize: { value: config.size }, uWidth: { value: config.bandWidth }, uBend: { value: config.bend }, uEdge: { value: config.edgePosition },
          uFlow: { value: config.flowDistance }, uBrightness: { value: config.brightness },
          uDeep: { value: new THREE.Color(config.colors.deep) }, uElectric: { value: new THREE.Color(config.colors.electric) }, uHighlight: { value: new THREE.Color(config.colors.highlight) },
        },
      });
      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      scene.add(points);
      resize();
      setupScroll();
      renderer.compile(scene, camera);
      render();
      setReady(true);
      gsap.ticker.add(floatTick);
      observer = new ResizeObserver(refresh);
      observer.observe(document.body);
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", requestRender);
      reduced.addEventListener("change", setupScroll);
      compact.addEventListener("change", resize);
      document.fonts.ready.then(() => { if (!disposed) refresh(); });
    } catch (error) {
      console.warn("Particle background unavailable; using static wave.", error);
      setReady(false);
    }
    return () => {
      disposed = true;
      gsap.ticker.remove(floatTick);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(refreshFrame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", requestRender);
      reduced.removeEventListener("change", setupScroll);
      compact.removeEventListener("change", resize);
      tween?.scrollTrigger?.kill();
      tween?.kill();
      renderer?.domElement.removeEventListener("webglcontextlost", lost);
      renderer?.domElement.removeEventListener("webglcontextrestored", restored);
      geometry?.dispose();
      material?.dispose();
      scene.clear();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
    };
  }, [config, pathname]);
  return <div className={styles.background} aria-hidden="true" data-particle-background>
    {!ready && <StaticWave />}
    <div ref={host} className={styles.canvas} style={{ opacity: ready ? 1 : 0 }} />
  </div>;
}

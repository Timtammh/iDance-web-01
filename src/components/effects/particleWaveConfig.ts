/** All visual tuning lives here. Width/bend are fractions of viewport half-width. */
export const particleWaveConfig = {
  count: 5880,
  mobileCount: 1960,
  size: 4.2,
  noteRatio: 0.005,
  noteSize: 19,
  colors: { deep: "#125dc5", electric: "#48b4ff", highlight: "#e5f5ff" },
  bandWidth: 0.25,
  bend: 0.085,
  edgePosition: 0.79,
  flowDistance: 2.4,
  brightness: 1.155,
  scrub: 0.85,
  floatAmplitude: 0.045,
  floatSpeed: 0.65,
  pixelRatio: 1.7,
  mobilePixelRatio: 1.25,
};
export type ParticleWaveConfig = typeof particleWaveConfig;

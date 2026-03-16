/**
 * Shared animation config for world-class, senior-level motion.
 * - GPU-friendly (opacity, transform)
 * - Consistent easing and duration
 * - Respect prefers-reduced-motion when used with useReducedMotion()
 */

export const ease = {
  /** Smooth decelerate — content entering, modals */
  out: [0.33, 1, 0.68, 1] as const,
  /** Smooth accelerate — content exiting */
  in: [0.32, 0, 0.67, 0] as const,
  /** Subtle ease for staggered items */
  outSoft: [0.25, 0.46, 0.45, 0.94] as const,
} satisfies Record<string, readonly [number, number, number, number]>;

export const duration = {
  fast: 0.2,
  normal: 0.35,
  medium: 0.5,
  slow: 0.6,
  slower: 0.8,
} as const;

/** Default stagger delay between items (e.g. hero lines, list items) */
export const staggerDelay = 0.06;

/** Viewport options for scroll-triggered animations — trigger early, once, no re-fire at bottom */
export const viewportOnce = {
  once: true,
  amount: 0.06,
  margin: '0px 0px 0px 0px',
} as const;

/** Fade up — for sections and cards on scroll */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/** Fade up (larger distance) — for hero-style blocks */
export const fadeUpHero = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

/** Fade only — for overlays and images */
export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Scale + fade — for images and modals */
export const scaleFade = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

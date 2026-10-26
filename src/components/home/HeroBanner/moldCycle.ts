import { MOLD_FIGURE } from "./moldFigure.generated";

/*
 * One molding cycle of the hero figure as a pure function of time, so the idle
 * tour, pointer scrubbing and the reduced-motion still all read the same pose.
 * The closed-mold steps are kept short: a visitor should see the mold move
 * within a second of arriving, so the tour starts at "open".
 *
 *   0.00  inject   mold closed and clamped, melt fills the cavities
 *   0.60  cool
 *   1.20  open     moving half travels the full stroke
 *   2.40  strip    stripper plate carries the preforms off the cores
 *   3.00  drop     neck ring slides split sideways, preforms fall (real g)
 *   3.70  close    neck rings close, stripper returns, mold closes
 *   6.00  next shot
 */
export const CYCLE = 6;

const OPEN = [1.2, 2.4] as const;
const STRIP = [2.4, 3.0] as const;
const SPLIT = [3.0, 3.25] as const;
const UNSPLIT = [3.7, 3.95] as const;
const UNSTRIP = [3.95, 4.55] as const;
const CLOSE = [4.55, 5.75] as const;
const RELEASE = SPLIT[1];
const GRAVITY = 9810; // mm/s²

export const STEPS = ["inject", "cool", "open", "strip", "drop", "close"] as const;
export type Step = (typeof STEPS)[number];

/** Where each step starts, for the tour's first frame and keyboard stepping. */
export const STEP_AT: Record<Step, number> = {
  inject: 0,
  cool: 0.6,
  open: OPEN[0],
  strip: STRIP[0],
  drop: SPLIT[0],
  close: UNSPLIT[0],
};

export type Pose = {
  step: Step;
  /** Moving half travel, mm. */
  open: number;
  /** Stripper travel toward the cavity face, mm. */
  strip: number;
  /** Each neck ring half's travel off the preform, mm. */
  split: number;
  /** Drop of each preform below its core, mm; null while it is still held. */
  drops: (number | null)[];
  /** Preforms that have dropped out of sight. */
  gone: boolean[];
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
// Smootherstep: zero velocity and acceleration at both ends, like a platen's
// ramped velocity profile.
const ramp = (t: number, [a, b]: readonly [number, number]) => {
  const k = clamp01((t - a) / (b - a));
  return k * k * k * (k * (k * 6 - 15) + 10);
};

export const wrap = (t: number) => ((t % CYCLE) + CYCLE) % CYCLE;

export function stepAt(time: number): Step {
  const t = wrap(time);
  let step: Step = "inject";
  for (const name of STEPS) if (t >= STEP_AT[name]) step = name;
  return step;
}

export function poseAt(time: number): Pose {
  const t = wrap(time);
  const open = MOLD_FIGURE.stroke * (ramp(t, OPEN) - ramp(t, CLOSE));
  const strip = MOLD_FIGURE.strip * (ramp(t, STRIP) - ramp(t, UNSTRIP));
  const split = MOLD_FIGURE.split * (ramp(t, SPLIT) - ramp(t, UNSPLIT));
  const fallen = t >= RELEASE && t < CLOSE[1] ? t - RELEASE : null;
  const drops = MOLD_FIGURE.drops.map((limit) => (fallen === null ? null : Math.min(limit, 0.5 * GRAVITY * fallen * fallen)));
  const gone = drops.map((d, i) => d !== null && d >= MOLD_FIGURE.drops[i]);
  return { step: stepAt(t), open, strip, split, drops, gone };
}

export type Shot = {
  /** Where the camera looks, in viewBox px. */
  x: number;
  y: number;
  /** 1 shows the whole drawing. */
  zoom: number;
};

const { ex, shots } = MOLD_FIGURE;
const along = ([x, y]: readonly [number, number], travel: number): [number, number] => [x + ex[0] * travel, y + ex[1] * travel];

/**
 * The shot for each step: the camera closes in on whatever is working (the
 * nozzle while filling, the cavities while cooling, the neck rings as they
 * strip, the chute as the preforms fall) and pulls back while the platen
 * travels. Targets on the moving half ride along with it.
 */
export function cameraAt(time: number): Shot {
  const pose = poseAt(time);
  const carried = pose.open - pose.strip;
  const shot = (point: readonly [number, number], zoom: number) => ({ x: point[0], y: point[1], zoom });
  switch (pose.step) {
    case "inject":
      return shot(shots.nozzle, 1.8);
    case "cool":
      return shot(shots.cavity, 1.9);
    case "open":
      return shot(along(shots.travel, (pose.open - MOLD_FIGURE.stroke) / 2), 1.25);
    case "strip":
      return shot(along(shots.neck, carried), 1.9);
    case "drop":
      return shot(along(shots.chute, MOLD_FIGURE.stroke - MOLD_FIGURE.strip), 1.5);
    case "close":
      return shot(shots.press, 1);
  }
}

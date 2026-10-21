import { MOLD_FIGURE } from "./moldFigure.generated";

/*
 * One molding cycle of the hero figure as a pure function of time, so the idle
 * tour, pointer scrubbing and the reduced-motion still all read the same pose.
 *
 *   0.00  filling          mold closed and clamped, melt fills the cavities
 *   1.10  holding/cooling
 *   2.60  opening          moving half travels the full stroke
 *   3.80  stripping        stripper plate carries the preforms off the cores
 *   4.40  neck rings open  slides split sideways, preforms drop (real g)
 *   5.10  neck rings close, then the stripper returns
 *   5.95  closing
 *   7.15  clamping, then the next shot
 */
export const CYCLE = 8;

const OPEN = [2.6, 3.8] as const;
const STRIP = [3.8, 4.4] as const;
const SPLIT = [4.4, 4.65] as const;
const UNSPLIT = [5.1, 5.35] as const;
const UNSTRIP = [5.35, 5.95] as const;
const CLOSE = [5.95, 7.15] as const;
const RELEASE = SPLIT[1];
const GRAVITY = 9810; // mm/s²

export type Phase =
  | "filling"
  | "cooling"
  | "opening"
  | "stripping"
  | "release"
  | "reset"
  | "closing"
  | "clamping";

/** Phase starts, for keyboard stepping. */
export const STOPS: readonly number[] = [0, 1.1, OPEN[0], STRIP[0], SPLIT[0], UNSPLIT[0], CLOSE[0], CLOSE[1]];

export type Pose = {
  phase: Phase;
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

export function poseAt(time: number): Pose {
  const t = wrap(time);
  const open = MOLD_FIGURE.stroke * (ramp(t, OPEN) - ramp(t, CLOSE));
  const strip = MOLD_FIGURE.strip * (ramp(t, STRIP) - ramp(t, UNSTRIP));
  const split = MOLD_FIGURE.split * (ramp(t, SPLIT) - ramp(t, UNSPLIT));
  const fallen = t >= RELEASE && t < CLOSE[1] ? t - RELEASE : null;
  const drops = MOLD_FIGURE.drops.map(() => (fallen === null ? null : 0.5 * GRAVITY * fallen * fallen));
  const gone = MOLD_FIGURE.drops.map((limit, i) => {
    const d = drops[i];
    return d !== null && d >= limit;
  });
  let phase: Phase = "clamping";
  if (t < 1.1) phase = "filling";
  else if (t < OPEN[0]) phase = "cooling";
  else if (t < OPEN[1]) phase = "opening";
  else if (t < STRIP[1]) phase = "stripping";
  else if (t < UNSPLIT[0]) phase = "release";
  else if (t < CLOSE[0]) phase = "reset";
  else if (t < CLOSE[1]) phase = "closing";
  return { phase, open, strip, split, drops: drops.map((d, i) => (d === null ? null : Math.min(d, MOLD_FIGURE.drops[i]))), gone };
}

/** The number a phase reports, from the same pose that moves the parts. */
export function readoutValue(pose: Pose): number | null {
  if (pose.phase === "opening" || pose.phase === "closing") return Math.round(pose.open);
  if (pose.phase === "stripping") return Math.round(pose.strip);
  return null;
}

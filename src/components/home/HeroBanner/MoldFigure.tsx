"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { preload } from "react-dom";
import { MOLD_FIGURE } from "./moldFigure.generated";
import { CYCLE, STEPS, STEP_AT, poseAt, wrap, type Step } from "./moldCycle";
import "./iso.css";
import "./moldFigure.css";
import styles from "./HeroBanner.module.css";

export type MoldCopy = {
  fig: string;
  title: string;
  hint: string;
  hintTouch: string;
  label: string;
  caption: string;
  steps: Record<Step, string>;
};

// The drawing is static art built by scripts/hero-figure/build.mjs. It is
// preloaded with the page and injected after hydration, so the headline never
// waits for it.
const SRC = "/images/hero/preform-mold.svg";
const START = STEP_AT.open; // the tour opens straight away: no waiting on a closed mold
const REST = STEP_AT.strip - 0.01; // reduced motion: fully open, preforms still on the cores
const STOPS = STEPS.map((step) => STEP_AT[step]);
const IDLE_RESUME = 3.6;

const { ex, ey, ez } = MOLD_FIGURE;
const shift = (x: number, y: number, z: number) => {
  const sx = ex[0] * x + ey[0] * y + ez[0] * z;
  const sy = ex[1] * x + ey[1] * y + ez[1] * z;
  return Math.abs(sx) < 0.005 && Math.abs(sy) < 0.005 ? "" : `translate(${sx.toFixed(2)} ${sy.toFixed(2)})`;
};

const SVG_NS = "http://www.w3.org/2000/svg";
const FLOW_GAP = 22; // viewBox px between arrows
const FLOW_SPEED = { water: 26, oil: 70 } as const; // viewBox px per second at full flow
const PLATEN_TOP_SPEED = (1.875 * MOLD_FIGURE.stroke) / (STEP_AT.strip - STEP_AT.open); // smootherstep peak, mm/s
const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/**
 * How hard each hose flows at this instant, -1..1, signed along its drawn
 * direction. Cooling water always runs; the clamp cylinder's oil follows the
 * moving platen: opening fills the rod side, closing fills the cap side.
 */
function flowLevel(id: string, time: number) {
  if (id === "water-in" || id === "water-out") return 1;
  const h = 0.01;
  const velocity = (poseAt(time + h).open - poseAt(time - h).open) / (2 * h) / PLATEN_TOP_SPEED;
  return id === "rod" ? -velocity : velocity;
}

/** Arrows riding a hose's screen polyline. */
function flowArrows(svg: SVGSVGElement) {
  const lines = MOLD_FIGURE.flows.map((flow) => {
    const layer = svg.querySelector(`[data-flows="${flow.kind}"]`);
    const lengths = [0];
    for (let i = 1; i < flow.points.length; i++) {
      const [ax, ay] = flow.points[i - 1];
      const [bx, by] = flow.points[i];
      lengths.push(lengths[i - 1] + Math.hypot(bx - ax, by - ay));
    }
    const total = lengths[lengths.length - 1];
    const arrows = Array.from({ length: Math.max(1, Math.floor(total / FLOW_GAP)) }, () => {
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("class", "mf-flow");
      path.setAttribute("data-kind", flow.kind);
      path.setAttribute("d", flow.kind === "oil" ? "M-2.8 -3L1.8 0L-2.8 3" : "M-2.2 -2.4L1.4 0L-2.2 2.4");
      layer?.appendChild(path);
      return path;
    });
    return { ...flow, lengths, total, arrows, offset: 0 };
  });

  function at(line: (typeof lines)[number], s: number) {
    let i = 1;
    while (i < line.lengths.length - 1 && line.lengths[i] < s) i++;
    const [ax, ay] = line.points[i - 1];
    const [bx, by] = line.points[i];
    const span = line.lengths[i] - line.lengths[i - 1] || 1;
    const k = (s - line.lengths[i - 1]) / span;
    return [ax + (bx - ax) * k, ay + (by - ay) * k, (Math.atan2(by - ay, bx - ax) * 180) / Math.PI];
  }

  /** `dt` advances the water; `dTime` (cycle time moved) advances the oil. */
  return (time: number, dt: number, dTime: number) => {
    for (const line of lines) {
      const level = flowLevel(line.id, time);
      const sign = level < 0 ? -1 : 1;
      line.offset = (line.offset + FLOW_SPEED[line.kind] * level * (line.kind === "water" ? dt : dTime)) % FLOW_GAP;
      const strength = Math.min(1, Math.abs(level) * 2.5);
      line.arrows.forEach((arrow, i) => {
        const s = (((line.offset + i * FLOW_GAP) % line.total) + line.total) % line.total;
        const [x, y, angle] = at(line, s);
        const fade = strength * smooth(0, 8, s) * smooth(0, 8, line.total - s);
        arrow.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(sign < 0 ? angle + 180 : angle).toFixed(0)})`);
        arrow.setAttribute("opacity", fade.toFixed(2));
      });
    }
  };
}

/** Wires the injected drawing to the cycle; returns its teardown. */
function animate(stage: HTMLDivElement, stepList: HTMLElement | null, copy: MoldCopy) {
  const svg = stage.querySelector("svg");
  if (!svg) return () => {};
  svg.setAttribute("aria-label", copy.label);

  const groups = (selector: string) => Array.from(svg.querySelectorAll<SVGGElement>(selector));
  const moving = groups('[data-m="open"]');
  const stripping = groups('[data-m="strip"]');
  const neckA = groups('[data-m="neck-a"]');
  const neckB = groups('[data-m="neck-b"]');
  const preforms = groups("[data-pf]").map((el) => {
    const index = Number(el.dataset.pf);
    const slot = svg.querySelector<SVGGElement>(`[data-slot="${index}"]`)!;
    const y = MOLD_FIGURE.columns[index < MOLD_FIGURE.cavities / 2 ? 0 : 1];
    const fall = svg.querySelector<SVGGElement>(`[data-fall="${y}"]`)!;
    return { el, index, slot, fall, falling: false, shown: true, transform: "" };
  });
  const written = new Map<Element, string>();
  const write = (el: Element, transform: string) => {
    if (written.get(el) === transform) return;
    written.set(el, transform);
    if (transform) el.setAttribute("transform", transform);
    else el.removeAttribute("transform");
  };

  const flows = flowArrows(svg);
  const stepButtons = Array.from(stepList?.querySelectorAll<HTMLButtonElement>("[data-step]") ?? []);
  let lastStep: Step | null = null;
  function place(time: number) {
    const pose = poseAt(time);
    const open = shift(pose.open, 0, 0);
    const carried = pose.open - pose.strip;
    moving.forEach((el) => write(el, open));
    stripping.forEach((el) => write(el, shift(carried, 0, 0)));
    neckA.forEach((el) => write(el, shift(carried, -pose.split, 0)));
    neckB.forEach((el) => write(el, shift(carried, pose.split, 0)));
    for (const p of preforms) {
      const drop = pose.drops[p.index];
      const falling = drop !== null;
      if (falling !== p.falling) {
        (falling ? p.fall : p.slot).appendChild(p.el);
        p.falling = falling;
      }
      const shown = !pose.gone[p.index];
      if (shown !== p.shown) {
        p.el.style.display = shown ? "" : "none";
        p.shown = shown;
      }
      write(p.el, falling ? shift(MOLD_FIGURE.stroke - MOLD_FIGURE.strip, 0, -drop) : shift(carried, 0, 0));
    }
    if (pose.step !== lastStep) {
      lastStep = pose.step;
      for (const button of stepButtons) {
        const on = button.dataset.step === pose.step;
        button.toggleAttribute("data-active", on);
        button.setAttribute("aria-current", on ? "step" : "false");
      }
      stage.setAttribute("aria-valuenow", String(STEPS.indexOf(pose.step)));
      stage.setAttribute("aria-valuetext", copy.steps[pose.step]);
    }
  }

  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  let t = still.matches ? REST : START;
  let target = t;
  let touring = !still.matches;
  let visible = false;
  let frame = 0;
  let last = 0;
  let idle = 0;

  let previous = t;
  function tick(now: number) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    previous = t;
    if (touring) {
      t += dt;
      target = t;
    } else if (still.matches) {
      t = target;
    } else {
      // follow the scrub target the short way round the cycle
      const gap = wrap(target - t + CYCLE / 2) - CYCLE / 2;
      t = Math.abs(gap) < 0.002 ? target : t + gap * (1 - Math.exp(-dt / 0.22));
    }
    place(t);
    flows(t, still.matches ? 0 : dt, wrap(t - previous + CYCLE / 2) - CYCLE / 2);
    // the cooling water never stops, so the loop runs while the figure is on screen
    const settled = still.matches && t === target;
    frame = visible && !settled && !document.hidden ? requestAnimationFrame(tick) : 0;
  }
  const run = () => {
    if (!frame && visible && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  const steer = (next: number) => {
    touring = false;
    target = wrap(next);
    window.clearTimeout(idle);
    if (!still.matches) {
      idle = window.setTimeout(() => {
        touring = true;
        run();
      }, IDLE_RESUME * 1000);
    }
    run();
  };

  const scrub = (clientX: number) => {
    const box = stage.getBoundingClientRect();
    const share = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    steer(share * CYCLE * 0.999);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "mouse" || stage.hasPointerCapture(event.pointerId)) scrub(event.clientX);
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse") return;
    stage.setPointerCapture(event.pointerId);
    scrub(event.clientX);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  };
  const onKey = (event: KeyboardEvent) => {
    const here = wrap(target);
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = STOPS.find((stop) => stop > here + 0.01) ?? 0;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = [...STOPS].reverse().find((stop) => stop < here - 0.01) ?? STOPS[STOPS.length - 1];
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = STOPS[STOPS.length - 1];
    if (next === null) return;
    event.preventDefault();
    steer(next);
  };
  const onVisibility = () => (document.hidden ? undefined : run());
  const onStep = (event: MouseEvent) => {
    const step = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-step]")?.dataset.step as Step | undefined;
    if (step) steer(STEP_AT[step] + 0.01);
  };
  stepList?.addEventListener("click", onStep);

  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerdown", onPointerDown);
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", onPointerUp);
  stage.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onVisibility);
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) run();
    },
    { rootMargin: "120px 0px" },
  );
  io.observe(stage);
  place(t);
  flows(t, 0, 0);

  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(idle);
    io.disconnect();
    stage.removeEventListener("pointermove", onPointerMove);
    stage.removeEventListener("pointerdown", onPointerDown);
    stage.removeEventListener("pointerup", onPointerUp);
    stage.removeEventListener("pointercancel", onPointerUp);
    stage.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", onVisibility);
    stepList?.removeEventListener("click", onStep);
  };
}

export default function MoldFigure({ copy }: { copy: MoldCopy }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  preload(SRC, { as: "fetch", crossOrigin: "anonymous" });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let cancelled = false;
    let teardown = () => {};
    fetch(SRC)
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error(String(response.status)))))
      .then((markup) => {
        if (cancelled) return;
        stage.innerHTML = markup;
        stage.dataset.ready = "";
        teardown = animate(stage, stepsRef.current, copy);
      })
      .catch(() => {
        if (!cancelled) stage.dataset.failed = "";
      });
    return () => {
      cancelled = true;
      teardown();
    };
  }, [copy]);

  return (
    <figure className={`iso mf ${styles.figure}`} data-theme="dark">
      <div className="iso-plate">
        <div className="iso-plate-corners" aria-hidden="true">
          <span className="iso-plate-corner" data-corner="fig">
            {copy.fig}
          </span>
          <span className="iso-plate-corner" data-corner="title">
            {copy.title}
          </span>
        </div>
        <div
          ref={stageRef}
          className={styles.stage}
          style={
            {
              aspectRatio: `${MOLD_FIGURE.width} / ${MOLD_FIGURE.height}`,
              "--focus-x": `${(MOLD_FIGURE.focus[0] * 100).toFixed(1)}%`,
              "--focus-y": `${(MOLD_FIGURE.focus[1] * 100).toFixed(1)}%`,
            } as CSSProperties
          }
          tabIndex={0}
          role="slider"
          aria-label={copy.label}
          aria-valuemin={0}
          aria-valuemax={STOPS.length - 1}
          aria-valuenow={STEPS.indexOf("open")}
          aria-valuetext={copy.steps.open}
        />
        <ol ref={stepsRef} className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step}>
              <button type="button" data-step={step} data-active={step === "open" ? "" : undefined} aria-current={step === "open" ? "step" : "false"}>
                <span className={styles.stepNum}>{String(index + 1).padStart(2, "0")}</span>
                {copy.steps[step]}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.captionHint}>
          <span className={styles.hintMouse}>{copy.hint}</span>
          <span className={styles.hintTouch}>{copy.hintTouch}</span>
        </span>
        {copy.caption}
      </figcaption>
    </figure>
  );
}

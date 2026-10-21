"use client";

import { useEffect, useRef } from "react";
import { MOLD_FIGURE } from "./moldFigure.generated";
import { CYCLE, STOPS, poseAt, readoutValue, wrap, type Phase, type Pose } from "./moldCycle";
import "./iso.css";
import "./moldFigure.css";
import styles from "./HeroBanner.module.css";

export type MoldCopy = Record<Phase, string> & {
  fig: string;
  title: string;
  hint: string;
  hintTouch: string;
  label: string;
  caption: string;
};

// The drawing is static art built by scripts/hero-figure/build.mjs; it is
// fetched after hydration so the headline never waits for it.
const SRC = "/images/hero/preform-mold.svg";
const REST = STOPS[3] - 0.01; // reduced motion: fully open, preforms still on the cores
const IDLE_RESUME = 3.6;

const { ex, ey, ez } = MOLD_FIGURE;
const shift = (x: number, y: number, z: number) => {
  const sx = ex[0] * x + ey[0] * y + ez[0] * z;
  const sy = ex[1] * x + ey[1] * y + ez[1] * z;
  return Math.abs(sx) < 0.005 && Math.abs(sy) < 0.005 ? "" : `translate(${sx.toFixed(2)} ${sy.toFixed(2)})`;
};

/** The phase alone, without its live number, for screen readers. */
const phaseName = (copy: MoldCopy, phase: Phase) => copy[phase].replace(/\s*·\s*\{mm\}.*$/, "");

function textOf(copy: MoldCopy, pose: Pose) {
  const value = readoutValue(pose);
  return copy[pose.phase].replace("{mm}", value === null ? "" : String(value));
}

/** Wires the injected drawing to the cycle; returns its teardown. */
function animate(stage: HTMLDivElement, readout: HTMLElement | null, copy: MoldCopy) {
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

  let lastPhase: Phase | null = null;
  let lastText = "";
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
    const text = textOf(copy, pose);
    if (readout && text !== lastText) {
      readout.textContent = text;
      lastText = text;
    }
    if (pose.phase !== lastPhase) {
      lastPhase = pose.phase;
      stage.setAttribute("aria-valuenow", String(STOPS.filter((stop) => wrap(time) >= stop).length - 1));
      stage.setAttribute("aria-valuetext", phaseName(copy, pose.phase));
    }
  }

  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  let t = still.matches ? REST : 0;
  let target = t;
  let touring = !still.matches;
  let visible = false;
  let frame = 0;
  let last = 0;
  let idle = 0;

  function tick(now: number) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
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
    const settled = !touring && t === target;
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
  };
}

export default function MoldFigure({ copy }: { copy: MoldCopy }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

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
        teardown = animate(stage, readoutRef.current, copy);
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
          <span className="iso-plate-corner" data-corner="hint">
            <span className={styles.hintMouse}>{copy.hint}</span>
            <span className={styles.hintTouch}>{copy.hintTouch}</span>
          </span>
          <span className="iso-plate-corner" data-corner="readout" data-readout ref={readoutRef}>
            {copy.filling}
          </span>
        </div>
        <div
          ref={stageRef}
          className={styles.stage}
          style={{ aspectRatio: `${MOLD_FIGURE.width} / ${MOLD_FIGURE.height}` }}
          tabIndex={0}
          role="slider"
          aria-label={copy.label}
          aria-valuemin={0}
          aria-valuemax={STOPS.length - 1}
          aria-valuenow={0}
          aria-valuetext={copy.filling}
        />
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.captionHint} aria-hidden="true">
          {copy.hintTouch}
        </span>
        {copy.caption}
      </figcaption>
    </figure>
  );
}

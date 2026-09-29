"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { GHOST_STATION, MOLD_PARTS, TURRET } from "./moldModel";
import styles from "./HeroBanner.module.css";

type HeroBannerProps = {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  skipLabel: string;
};

/*
 * Intro timeline (seconds)
 *   0.0 – 5.5  parts are traced one by one in an exploded view
 *   6.0 – 8.8  parts slide together along the mold axis
 *   8.8 – 11.5 camera pulls back, rotary turret stations appear
 *   10.0       headline and CTAs fade in
 *   12.0       intro complete, model keeps idling
 */
const INTRO_END = 12;
const REVEAL_AT = 10.0;
const DRAW_START = 0.8;
const DRAW_STAGGER = 0.55;
const DRAW_DURATION = 1.4;
const GHOST_COUNT = 10;
const GHOST_RADIUS = 4.6;
const GHOST_SCALE = 0.5;

const STEEL = "120, 200, 255";
const ACCENT = "214, 180, 96";
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

const PHASES = [
  { at: 0, label: "01 GEOMETRY" },
  { at: 6, label: "02 ASSEMBLY" },
  { at: 8.8, label: "03 PRODUCTION" },
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const phase = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export default function HeroBanner({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
  skipLabel,
}: HeroBannerProps) {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [revealed, setRevealed] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!hero || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let t = reduced ? INTRO_END + 1 : 0;
    let last = 0;
    let raf = 0;
    let running = false;
    let onScreen = true;
    let doneReported = false;
    let revealReported = false;

    // Projection state, refreshed once per frame
    let f = 1, dist = 17, cy = 0, ox = 0, oy = 0;
    let cY = 1, sY = 0, cP = 1, sP = 0;
    let px = 0, py = 0, pd = 0;

    function project(x: number, y: number, z: number) {
      y -= cy;
      const x1 = x * cY + z * sY;
      const z1 = -x * sY + z * cY;
      const y2 = y * cP - z1 * sP;
      const z2 = y * sP + z1 * cP;
      pd = dist - z2;
      px = ox + (f * x1) / pd;
      py = oy - (f * y2) / pd;
    }

    /** Adds `fraction` of the segment list to the current path. */
    function tracePath(
      segs: Float32Array,
      fraction: number,
      tx = 0,
      ty = 0,
      tz = 0,
      scale = 1,
    ) {
      const n = segs.length / 6;
      const drawn = fraction * n;
      const full = Math.floor(drawn);
      const limit = Math.min(n, full + 1);
      for (let i = 0; i < limit; i++) {
        const o = i * 6;
        const k = i < full ? 1 : drawn - full;
        if (k <= 0) break;
        const x1 = segs[o] * scale + tx;
        const y1 = segs[o + 1] * scale + ty;
        const z1 = segs[o + 2] * scale + tz;
        const x2 = lerp(x1, segs[o + 3] * scale + tx, k);
        const y2 = lerp(y1, segs[o + 4] * scale + ty, k);
        const z2 = lerp(z1, segs[o + 5] * scale + tz, k);
        project(x1, y1, z1);
        if (pd < 0.5) continue;
        const ax = px;
        const ay = py;
        project(x2, y2, z2);
        if (pd < 0.5) continue;
        ctx!.moveTo(ax, ay);
        ctx!.lineTo(px, py);
      }
    }

    function strokeGlow(rgb: string, alpha: number, width = 1) {
      ctx!.strokeStyle = `rgba(${rgb}, ${alpha * 0.14})`;
      ctx!.lineWidth = width * 4;
      ctx!.stroke();
      ctx!.strokeStyle = `rgba(${rgb}, ${alpha})`;
      ctx!.lineWidth = width;
      ctx!.stroke();
    }

    function drawHud(time: number, desktop: boolean) {
      const c = ctx!;
      const inset = desktop ? 24 : 14;
      const arm = desktop ? 26 : 16;
      c.lineWidth = 1;
      c.strokeStyle = `rgba(${STEEL}, 0.45)`;
      c.beginPath();
      for (const [x, y, dx, dy] of [
        [inset, inset, 1, 1],
        [W - inset, inset, -1, 1],
        [inset, H - inset, 1, -1],
        [W - inset, H - inset, -1, -1],
      ]) {
        c.moveTo(x, y + dy * arm);
        c.lineTo(x, y);
        c.lineTo(x + dx * arm, y);
      }
      c.stroke();

      const tc = Math.min(time, INTRO_END);
      c.font = `500 ${desktop ? 11 : 10}px ${MONO}`;
      c.textBaseline = "middle";
      c.fillStyle = `rgba(${STEEL}, 0.75)`;
      c.textAlign = "left";
      c.fillText(
        desktop ? "LIHE PRECISION // PET CLOSURE COMPRESSION MOLD" : "LIHE // PET COMPRESSION MOLD",
        inset + 12,
        inset + 14,
      );
      c.textAlign = "right";
      c.fillText(
        time >= INTRO_END ? "SYSTEM READY" : `T+${tc.toFixed(1).padStart(4, "0")}S`,
        W - inset - 12,
        inset + 14,
      );

      // Progress rail with phase markers
      const railY = H - inset - 12;
      const railX0 = inset + 12;
      const railX1 = W - inset - 12;
      const railW = railX1 - railX0;
      c.fillStyle = `rgba(${STEEL}, 0.18)`;
      c.fillRect(railX0, railY, railW, 1);
      c.fillStyle = `rgba(${ACCENT}, 0.9)`;
      c.fillRect(railX0, railY - 0.5, railW * (tc / INTRO_END), 2);
      if (!desktop) return;
      c.textAlign = "left";
      PHASES.forEach((p, i) => {
        const x = railX0 + railW * (p.at / INTRO_END);
        const next = PHASES[i + 1]?.at ?? Infinity;
        const active = tc >= p.at && tc < next && time < INTRO_END;
        c.fillStyle = active ? `rgba(${ACCENT}, 0.95)` : `rgba(${STEEL}, 0.45)`;
        c.fillRect(x, railY - 4, 1, 9);
        c.fillText(p.label, x + 8, railY - 12);
      });
    }

    function draw(time: number) {
      const c = ctx!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      if (!W || !H) return;

      const desktop = W >= 900;
      const tc = Math.min(time, INTRO_END);
      const assembleAll = ease(phase(time, 6.0, 8.8));
      const pullBack = ease(phase(time, 8.8, 11.5));
      const shift = ease(phase(time, 8.9, 10.8));

      f = Math.min(H, W * 1.25);
      dist = lerp(18.5, 17.5, phase(time, 0, 5.8));
      dist = lerp(dist, 10, ease(phase(time, 5.8, 8.8)));
      dist = lerp(dist, desktop ? 15.5 : 17, pullBack);
      cy = lerp(1.4, 0.8, assembleAll);
      const yaw = -0.6 + 0.22 * tc + 0.1 * Math.max(0, time - INTRO_END);
      const pitch = lerp(0.28, 0.45, pullBack);
      cY = Math.cos(yaw);
      sY = Math.sin(yaw);
      cP = Math.cos(pitch);
      sP = Math.sin(pitch);
      ox = desktop ? W / 2 + W * 0.2 * shift : lerp(W * 0.36, W / 2, assembleAll);
      oy = H / 2 + (desktop ? 0 : -H * 0.14 * shift);
      const dim = desktop ? 1 : 1 - 0.55 * shift;

      c.globalCompositeOperation = "lighter";
      c.lineCap = "round";

      // Floor grid
      const floorY = lerp(-5.2, -1.75, assembleAll);
      const gridAlpha = 0.08 * phase(time, 0.1, 1.2) * dim;
      c.beginPath();
      for (let i = -8; i <= 8; i++) {
        project(i, floorY, -8);
        if (pd > 0.5) {
          c.moveTo(px, py);
          project(i, floorY, 8);
          if (pd > 0.5) c.lineTo(px, py);
        }
        project(-8, floorY, i);
        if (pd > 0.5) {
          c.moveTo(px, py);
          project(8, floorY, i);
          if (pd > 0.5) c.lineTo(px, py);
        }
      }
      c.strokeStyle = `rgba(${STEEL}, ${gridAlpha})`;
      c.lineWidth = 1;
      c.stroke();

      // Assembly axis (dashed) and rising scan plane during the exploded view
      const axisAlpha = phase(time, 0.4, 1.2) * (1 - phase(time, 6.0, 8.0)) * dim;
      if (axisAlpha > 0) {
        c.setLineDash([6, 7]);
        c.beginPath();
        project(0, -5.6, 0);
        c.moveTo(px, py);
        project(0, 8.4, 0);
        c.lineTo(px, py);
        c.strokeStyle = `rgba(${STEEL}, ${0.35 * axisAlpha})`;
        c.stroke();
        c.setLineDash([]);
      }
      const scan = phase(time, DRAW_START, 5.6);
      if (scan > 0 && scan < 1) {
        const sy = lerp(-5.2, 8.2, scan);
        const s = 2.8;
        c.beginPath();
        project(-s, sy, -s);
        c.moveTo(px, py);
        for (const [x, z] of [[s, -s], [s, s], [-s, s], [-s, -s]]) {
          project(x, sy, z);
          c.lineTo(px, py);
        }
        strokeGlow(STEEL, 0.3 * Math.sin(scan * Math.PI) * dim);
      }

      // Mold parts
      const impact = time >= 8.75 ? 1 - phase(time, 8.75, 9.8) : 0;
      MOLD_PARTS.forEach((part, i) => {
        const drawStart = DRAW_START + i * DRAW_STAGGER;
        const drawP = ease(phase(time, drawStart, drawStart + DRAW_DURATION));
        if (drawP <= 0) return;
        const assembled = ease(phase(time, 6.0 + i * 0.06, 8.4 + i * 0.06));
        const dy = part.explodeY * (1 - assembled);
        c.beginPath();
        tracePath(part.segs, drawP, 0, dy, 0);
        const rgb = part.accent ? ACCENT : STEEL;
        const alpha = (part.accent ? 0.95 : 0.8) * dim;
        strokeGlow(rgb, Math.min(1, alpha * (1 + (part.accent ? 1.2 : 0.4) * impact)), part.accent ? 1.3 : 1);

        // Callout label
        const labelAlpha =
          phase(time, drawStart + DRAW_DURATION - 0.3, drawStart + DRAW_DURATION + 0.2) *
          (1 - phase(time, 5.6, 6.1));
        if (labelAlpha <= 0) return;
        const wy = part.anchorY + dy;
        project(part.anchorR * cY, wy, part.anchorR * sY);
        const ax = px;
        const ay = py;
        const lx = Math.min(ox + f * (desktop ? 0.24 : 0.2), W - (desktop ? 210 : 140));
        c.beginPath();
        c.moveTo(ax, ay);
        c.lineTo(lx - 8, ay);
        c.strokeStyle = `rgba(${STEEL}, ${0.5 * labelAlpha})`;
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = `rgba(${part.accent ? ACCENT : STEEL}, ${labelAlpha})`;
        c.fillRect(ax - 2, ay - 2, 4, 4);
        c.textAlign = "left";
        c.textBaseline = "middle";
        c.font = `600 ${desktop ? 11 : 9}px ${MONO}`;
        c.fillStyle = `rgba(230, 240, 255, ${0.95 * labelAlpha})`;
        c.fillText(`0${i + 1}  ${part.label}`, lx, ay - 6);
        c.font = `400 ${desktop ? 10 : 9}px ${MONO}`;
        c.fillStyle = `rgba(${STEEL}, ${0.6 * labelAlpha})`;
        c.fillText(`Y ${wy >= 0 ? "+" : ""}${wy.toFixed(2)}  SEG ${part.segs.length / 6}`, lx, ay + 8);
      });

      // Impact ring when the stack closes
      if (impact > 0 && impact < 1) {
        const r = lerp(1.95, 5.5, 1 - impact);
        c.beginPath();
        const n = 64;
        for (let k = 0; k <= n; k++) {
          const a = (k / n) * Math.PI * 2;
          project(r * Math.cos(a), 0.25, r * Math.sin(a));
          if (k === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        strokeGlow(ACCENT, 0.7 * impact * dim, 1.2);
      }

      // Rotary turret with ghost stations
      const ghostP = ease(phase(time, 9.0, 11.2));
      if (ghostP > 0) {
        const ringA = Math.max(0, time - 9) * 0.12;
        c.beginPath();
        tracePath(TURRET, ghostP);
        strokeGlow(STEEL, 0.22 * dim);
        c.beginPath();
        for (let k = 0; k < GHOST_COUNT; k++) {
          const a = (k / GHOST_COUNT) * Math.PI * 2 + ringA;
          tracePath(
            GHOST_STATION,
            ghostP,
            GHOST_RADIUS * Math.cos(a),
            -0.8,
            GHOST_RADIUS * Math.sin(a),
            GHOST_SCALE,
          );
        }
        strokeGlow(STEEL, 0.24 * dim);
      }

      c.globalCompositeOperation = "source-over";
      drawHud(time, desktop);
    }

    function resize() {
      const rect = hero!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      if (!running) draw(t);
    }

    function frame(now: number) {
      t += Math.min(0.1, (now - last) / 1000);
      last = now;
      draw(t);
      if (!revealReported && t >= REVEAL_AT) {
        revealReported = true;
        setRevealed(true);
      }
      if (!doneReported && t >= INTRO_END) {
        doneReported = true;
        setIntroDone(true);
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduced || !onScreen || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    skipRef.current = () => {
      if (t < INTRO_END) t = INTRO_END;
      setRevealed(true);
      setIntroDone(true);
      revealReported = doneReported = true;
      if (!running) draw(t);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(hero);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    if (reduced) {
      setRevealed(true);
      setIntroDone(true);
      revealReported = doneReported = true;
    } else {
      start();
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={`${styles.hero} ${revealed ? styles.revealed : ""}`}
      aria-label="Hero"
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.scanline} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          <h1 className={styles.headline}>{headline}</h1>
          <p className={styles.subheadline}>{subheadline}</p>
          <div className={styles.ctas}>
            <Button href={ctaHref} variant="primary" size="lg">
              {ctaLabel}
            </Button>
            <Button
              href={ctaSecondaryHref}
              variant="secondary"
              size="lg"
              className={styles.secondaryBtn}
            >
              {ctaSecondaryLabel}
            </Button>
          </div>
        </div>
      </div>

      {!introDone && (
        <button type="button" className={styles.skip} onClick={() => skipRef.current()}>
          {skipLabel} <span aria-hidden="true">&rarr;</span>
        </button>
      )}
    </section>
  );
}

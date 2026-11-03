"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Stats.module.css";

type StatItem = {
  value: string;
  label: string;
};

type StatsProps = {
  stats: StatItem[];
};

const COUNT_DURATION = 2000;
// Mobile shows one stat at a time: count up, hold, then move to the next.
const MOBILE_HOLD = 1500;
const MOBILE_QUERY = "(max-width: 768px)";

function parseNumeric(value: string): { num: number; prefix: string; suffix: string } {
  const match = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return { num: 0, prefix: "", suffix: value };
  const prefix = match[1];
  const num = parseInt(match[2].replace(/,/g, ""), 10);
  const suffix = match[3];
  return { num, prefix, suffix };
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

type AnimatedStatProps = StatItem & {
  // 0 = not started; any new positive value restarts the count from zero.
  run: number;
  active: boolean;
  onDone?: () => void;
};

function AnimatedStat({ value, label, run, active, onDone }: AnimatedStatProps) {
  const [display, setDisplay] = useState("0");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const { num, prefix, suffix } = parseNumeric(value);

  useEffect(() => {
    if (!run) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : COUNT_DURATION;
    const startTime = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = duration ? Math.min((now - startTime) / duration, 1) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatNumber(Math.round(num * eased)));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        onDoneRef.current?.();
      }
    }

    setDisplay("0");
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, num]);

  return (
    <div className={styles.stat} data-active={active || undefined}>
      <span className={styles.value}>
        {prefix}
        {run ? display : "0"}
        {suffix}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default function Stats({ stats }: StatsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [started, setStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(1);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => clearTimeout(holdTimer.current), []);
  useEffect(() => clearTimeout(holdTimer.current), [isMobile]);

  const handleDone = useCallback(() => {
    if (!isMobile || stats.length < 2) return;
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      setActive((i) => (i + 1) % stats.length);
      setCycle((c) => c + 1);
    }, MOBILE_HOLD);
  }, [isMobile, stats.length]);

  return (
    <section className={styles.section} aria-label="Key statistics" ref={sectionRef}>
      <div className={styles.grid}>
        {stats.map((stat, idx) => {
          const isActive = idx === active;
          const run = !started ? 0 : isMobile ? (isActive ? cycle : 0) : 1;
          return (
            <AnimatedStat
              key={stat.label}
              value={stat.value}
              label={stat.label}
              run={run}
              active={isActive}
              onDone={isActive ? handleDone : undefined}
            />
          );
        })}
      </div>
      {stats.length > 1 && (
        <div className={styles.dots} aria-hidden="true">
          {stats.map((stat, idx) => (
            <span
              key={stat.label}
              className={styles.dot}
              data-active={idx === active || undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Stats.module.css";

type StatItem = {
  value: string;
  label: string;
};

type StatsProps = {
  stats: StatItem[];
};

function parseNumeric(value: string): { num: number; prefix: string; suffix: string } {
  const match = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return { num: 0, prefix: "", suffix: value };
  const prefix = match[1];
  const num = parseInt(match[2].replace(/,/g, ""), 10);
  const suffix = match[3];
  return { num, prefix, suffix };
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function AnimatedStat({ value, label }: StatItem) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);
  const { num, prefix, suffix } = parseNumeric(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();

          const duration = 2000;
          const startTime = performance.now();

          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(num * eased);
            setDisplay(formatNumber(current));
            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [num, hasAnimated]);

  return (
    <div className={styles.stat} ref={ref}>
      <span className={styles.value}>
        {prefix}
        {hasAnimated ? display : "0"}
        {suffix}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default function Stats({ stats }: StatsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {stats.map((stat, i) => (
          <AnimatedStat key={i} value={stat.value} label={stat.label} />
        ))}
      </div>
    </section>
  );
}

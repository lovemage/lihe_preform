"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import styles from "./HeroBanner.module.css";

type HeroBannerProps = {
  banners: { src: string; alt: string }[];
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

export default function HeroBanner({
  banners,
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
}: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, paused]);

  // Pause when page is hidden
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) setPaused(true);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <section
      className={styles.hero}
      aria-label="Hero banner"
      ref={heroRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (heroRef.current && !heroRef.current.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <div className={styles.slides}>
        {banners.map((banner, i) => (
          <div
            key={banner.src}
            className={`${styles.slide} ${i === current ? styles.active : ""}`}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className={styles.image}
            />
          </div>
        ))}
      </div>

      <div className={styles.overlay} />

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

      <div className={styles.controls}>
        <div className={styles.dots} role="tablist" aria-label="Banner slides">
          {banners.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
              onClick={() => setCurrent(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          className={styles.pauseBtn}
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
        >
          {paused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}

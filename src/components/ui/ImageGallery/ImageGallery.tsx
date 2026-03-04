"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./ImageGallery.module.css";

type GalleryImage = {
  src: string;
  alt: string;
};

type ImageGalleryProps = {
  images: GalleryImage[];
};

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goToPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox, goToPrev, goToNext]);

  if (!images.length) return null;

  const currentImage = images[selectedIndex];

  return (
    <div className={styles.gallery}>
      <button
        type="button"
        className={styles.mainImageButton}
        onClick={() => setLightboxOpen(true)}
        aria-label="Open image in lightbox"
      >
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          width={800}
          height={600}
          className={styles.mainImage}
          priority
        />
      </button>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.thumbnail} ${index === selectedIndex ? styles.active : ""}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}: ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={120}
                height={90}
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className={styles.lightbox}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              &times;
            </button>

            {images.length > 1 && (
              <button
                type="button"
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={goToPrev}
                aria-label="Previous image"
              >
                &#8249;
              </button>
            )}

            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              width={1200}
              height={900}
              className={styles.lightboxImage}
            />

            {images.length > 1 && (
              <button
                type="button"
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={goToNext}
                aria-label="Next image"
              >
                &#8250;
              </button>
            )}

            <div className={styles.lightboxCounter}>
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

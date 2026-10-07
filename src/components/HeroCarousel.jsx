"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Film,
} from "lucide-react";

/* =========================================================
   STATIC IMAGE FALLBACK
   ---------------------------------------------------------
   Images only fallback to these when Admin API has no
   usable media or an image fails to load.
========================================================= */

const FALLBACK_SLIDES = [
  {
    id: "fallback-1",
    type: "image",
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=2200&q=90",
  },
  {
    id: "fallback-2",
    type: "image",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2200&q=90",
  },
  {
    id: "fallback-3",
    type: "image",
    url: "https://images.unsplash.com/photo-1581093458791-9d42e3c9c4c6?auto=format&fit=crop&w=2200&q=90",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const parseMediaList = (data) => {
  if (!data || typeof data !== "object") {
    return [];
  }

  const result = [];

  /* -------------------------------------------------------
     MEDIA ARRAY
  ------------------------------------------------------- */

  if (Array.isArray(data.media)) {
    data.media.forEach((item, index) => {
      if (!item) return;

      if (typeof item === "string") {
        const url = item.trim();

        if (url) {
          const isVideo =
            /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) ||
            url.includes("video");

          result.push({
            id: `media-${index}`,
            type: isVideo ? "video" : "image",
            url,
          });
        }

        return;
      }

      if (typeof item === "object") {
        const url = getString(
          item.url ||
          item.src ||
          item.imageUrl ||
          item.videoUrl ||
          item.downloadURL ||
          item.downloadUrl
        );

        if (!url) return;

        const type = getString(item.type).toLowerCase();

        const isVideo =
          type === "video" ||
          /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) ||
          url.includes("video");

        result.push({
          id: item.id || `media-${index}`,
          type: isVideo ? "video" : "image",
          url,
        });
      }
    });
  }

  /* -------------------------------------------------------
     IMAGES ARRAY
  ------------------------------------------------------- */

  if (Array.isArray(data.images)) {
    data.images.forEach((item, index) => {
      if (!item) return;

      if (typeof item === "string") {
        const url = item.trim();

        if (url) {
          result.push({
            id: `image-${index}`,
            type: "image",
            url,
          });
        }

        return;
      }

      if (typeof item === "object") {
        const url = getString(
          item.url ||
          item.src ||
          item.imageUrl ||
          item.downloadURL ||
          item.downloadUrl
        );

        if (url) {
          result.push({
            id: item.id || `image-${index}`,
            type: "image",
            url,
          });
        }
      }
    });
  }

  /* -------------------------------------------------------
     SINGLE IMAGE
  ------------------------------------------------------- */

  const singleImage = getString(
    data.imageUrl || data.image
  );

  if (singleImage) {
    result.push({
      id: "single-image",
      type: "image",
      url: singleImage,
    });
  }

  /* -------------------------------------------------------
     VIDEOS ARRAY
  ------------------------------------------------------- */

  if (Array.isArray(data.videos)) {
    data.videos.forEach((item, index) => {
      if (!item) return;

      if (typeof item === "string") {
        const url = item.trim();

        if (url) {
          result.push({
            id: `video-${index}`,
            type: "video",
            url,
          });
        }

        return;
      }

      if (typeof item === "object") {
        const url = getString(
          item.url ||
          item.src ||
          item.videoUrl ||
          item.downloadURL ||
          item.downloadUrl
        );

        if (url) {
          result.push({
            id: item.id || `video-${index}`,
            type: "video",
            url,
          });
        }
      }
    });
  }

  /* -------------------------------------------------------
     SINGLE VIDEO
  ------------------------------------------------------- */

  const singleVideo = getString(data.videoUrl);

  if (singleVideo) {
    result.push({
      id: "single-video",
      type: "video",
      url: singleVideo,
    });
  }

  /* -------------------------------------------------------
     REMOVE DUPLICATES
  ------------------------------------------------------- */

  const unique = [];
  const seen = new Set();

  result.forEach((item) => {
    if (!item?.url) return;

    if (seen.has(item.url)) return;

    seen.add(item.url);
    unique.push(item);
  });

  return unique;
};

/* =========================================================
   HERO CAROUSEL
========================================================= */

export default function HeroCarousel({
  homeData = null,
  loading = false,
  makeLink = (path) => path,
}) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  const intervalRef = useRef(null);

  /* =======================================================
     DYNAMIC MEDIA
  ======================================================= */

  const dbSlides = parseMediaList(homeData);

  /*
   * Images:
   * Admin API → Dynamic
   * No Admin API image → Static fallback
   */
  const slides =
    dbSlides.length > 0
      ? dbSlides
      : FALLBACK_SLIDES;

  /* =======================================================
     DYNAMIC TEXT
  ======================================================= */

  const heroTitle = getString(homeData?.title);

  const heroDescription = getString(
    homeData?.description
  );

  const btn1Text = getString(
    homeData?.button1Text
  );

  const btn2Text = getString(
    homeData?.button2Text
  );

  /* =======================================================
     STATIC BUTTON LINKS
  ======================================================= */

  const btn1Href = makeLink("/items");
  const btn2Href = makeLink("/contact");

  /* =======================================================
     RESET INDEX IF REQUIRED
  ======================================================= */

  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  /* =======================================================
     AUTOPLAY
  ======================================================= */

  useEffect(() => {
    if (!isPlaying || slides.length <= 1) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrent(
        (prev) => (prev + 1) % slides.length
      );
    }, 6000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, slides.length]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goNext = () => {
    setCurrent(
      (prev) => (prev + 1) % slides.length
    );
  };

  const goPrev = () => {
    setCurrent(
      (prev) =>
        (prev - 1 + slides.length) %
        slides.length
    );
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  /* =======================================================
     IMAGE ERROR
  ======================================================= */

  const handleImageError = (event, slideIndex) => {
    const fallback =
      FALLBACK_SLIDES[
      slideIndex % FALLBACK_SLIDES.length
      ];

    setImageErrors((prev) => ({
      ...prev,
      [slideIndex]: true,
    }));

    event.currentTarget.src = fallback.url;
  };

  /* =======================================================
     ACTIVE SLIDE
  ======================================================= */

  const activeSlide =
    slides[current] || FALLBACK_SLIDES[0];

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-slate-900">
        <div className="relative min-h-[500px] w-full animate-pulse bg-slate-800">
          <div className="absolute inset-0 bg-black/30" />

          <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl items-center px-5 py-16 sm:px-8 lg:px-8">
            <div className="max-w-3xl space-y-5">
              <div className="h-4 w-36 rounded-full bg-white/20" />

              <div className="h-12 w-full max-w-2xl rounded-xl bg-white/20" />

              <div className="h-4 w-full max-w-xl rounded-full bg-white/20" />

              <div className="flex gap-3 pt-3">
                <div className="h-11 w-40 rounded-xl bg-white/20" />

                <div className="h-11 w-40 rounded-xl bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-slate-950">

      {/* =================================================
          BACKGROUND IMAGE / VIDEO
      ================================================= */}

      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id || current}
            initial={{
              opacity: 0,
              scale: 1.02,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.7,
              ease: "easeInOut",
            }}
            className="absolute inset-0"
          >
            {activeSlide.type === "video" ? (
              <video
                key={activeSlide.url}
                src={activeSlide.url}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={
                  imageErrors[current]
                    ? FALLBACK_SLIDES[
                      current %
                      FALLBACK_SLIDES.length
                    ].url
                    : activeSlide.url
                }
                alt={heroTitle || "Biomedical Equipment"}
                fetchPriority={current === 0 ? "high" : "auto"}
                decoding="async"
                className="h-full w-full object-cover"
                onError={(event) =>
                  handleImageError(
                    event,
                    current
                  )
                }
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* =================================================
            IMAGE VISIBILITY / OVERLAY
            -------------------------------------------------
            Previous version was too dark.
            Overlay reduced so image is more visible.
        ================================================= */}

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/10" />
      </div>

      {/* =================================================
          MAIN CONTENT
          -------------------------------------------------
          Compact height restored.
      ================================================= */}

      <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl items-center px-5 py-16 sm:px-8 lg:min-h-[540px] lg:px-8 lg:py-20">
        <div className="w-full max-w-3xl">

          {/* =================================================
              LABEL
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:text-sm"
          >
            <Sparkles size={14} />

            <span>
              Advanced Biomedical Solutions
            </span>
          </motion.div>

          {/* =================================================
              DYNAMIC TITLE
          ================================================= */}

          {heroTitle && (
            <motion.h1
              key={`title-${current}-${heroTitle}`}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.05,
              }}
              className="max-w-3xl text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {heroTitle}
            </motion.h1>
          )}

          {/* =================================================
              DYNAMIC DESCRIPTION
          ================================================= */}

          {heroDescription && (
            <motion.p
              key={`description-${current}-${heroDescription}`}
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.12,
              }}
              className="mt-5 max-w-2xl text-sm leading-6 text-white/90 sm:text-base sm:leading-7 md:text-lg"
            >
              {heroDescription}
            </motion.p>
          )}

          {/* =================================================
              DYNAMIC BUTTONS
          ================================================= */}

          {(btn1Text || btn2Text) && (
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              {/* BUTTON 1 */}

              {btn1Text && (
                <Link
                  href={btn1Href}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:px-6"
                >
                  <span>
                    {btn1Text}
                  </span>

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              )}

              {/* BUTTON 2 */}

              {btn2Text && (
                <Link
                  href={btn2Href}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold !text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 sm:px-6"
                >
                  <PhoneCall size={16} />

                  <span>
                    {btn2Text}
                  </span>
                </Link>
              )}
            </motion.div>
          )}

          {/* =================================================
              TRUST POINTS
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.3,
            }}
            className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/85 sm:text-sm"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              <span>
                Precision Focused
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              <span>
                Reliable Technology
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              <span>
                Professional Support
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =================================================
          SLIDE COUNTER
      ================================================= */}

      {slides.length > 1 && (
        <div className="absolute bottom-5 left-5 z-20 sm:left-8 lg:left-10">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[11px] text-white/90 backdrop-blur-md">
            <span className="font-semibold">
              {String(current + 1).padStart(
                2,
                "0"
              )}
            </span>

            <span className="text-white/40">
              /
            </span>

            <span>
              {String(slides.length).padStart(
                2,
                "0"
              )}
            </span>
          </div>
        </div>
      )}

      {/* =================================================
          PREVIOUS / NEXT
      ================================================= */}

      {slides.length > 1 && (
        <div className="absolute bottom-4 right-5 z-20 flex items-center gap-2 sm:right-8 lg:right-10">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-slate-900"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-slate-900"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* =================================================
          PLAY / PAUSE
      ================================================= */}

      {slides.length > 1 && (
        <button
          type="button"
          onClick={() =>
            setIsPlaying(
              (prev) => !prev
            )
          }
          aria-label={
            isPlaying
              ? "Pause carousel"
              : "Play carousel"
          }
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-slate-900 sm:right-8 sm:top-6"
        >
          {isPlaying ? (
            <Pause size={15} />
          ) : (
            <Play
              size={15}
              className="ml-0.5"
            />
          )}
        </button>
      )}

      {/* =================================================
          DOTS
      ================================================= */}

      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={
                slide.id ||
                `dot-${index}`
              }
              type="button"
              onClick={() =>
                goToSlide(index)
              }
              aria-label={`Go to slide ${index + 1
                }`}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === current
                ? "w-7 bg-white"
                : "w-1.5 bg-white/45 hover:bg-white/75"
                }`}
            />
          ))}
        </div>
      )}

      {/* =================================================
          MEDIA TYPE
      ================================================= */}

      {slides.length > 1 && (
        <div className="absolute right-5 top-[72px] z-20 hidden sm:block">
          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur-md">
            {activeSlide.type ===
              "video" ? (
              <>
                <Film size={12} />
                <span>Video</span>
              </>
            ) : (
              <>
                <ImageIcon size={12} />
                <span>Image</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          BOTTOM GRADIENT
      ================================================= */}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16 bg-gradient-to-t from-slate-950/25 to-transparent" />
    </section>
  );
}
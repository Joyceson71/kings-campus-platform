"use client";

import { createElement, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Music, Sparkles, Volume2, VolumeX } from "lucide-react";
import styles from "./birthday.module.css";

declare global {
  interface Window {
    lottie?: {
      loadAnimation: (options: {
        container: Element;
        renderer: "svg";
        loop: boolean;
        autoplay: boolean;
        path: string;
      }) => { play: () => void; stop: () => void; destroy: () => void };
    };
  }
}

const assetBase = "/birthday-assets";

export default function BirthdayPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lottieRef = useRef<HTMLDivElement>(null);
  const lottieAnimationRef = useRef<{ play: () => void; stop: () => void; destroy: () => void } | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [lottieReady, setLottieReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);
    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!lottieReady || !window.lottie || !lottieRef.current || lottieAnimationRef.current) return;

    lottieAnimationRef.current = window.lottie.loadAnimation({
      container: lottieRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: `${assetBase}/cake_blowout.json`
    });

    return () => {
      lottieAnimationRef.current?.destroy();
      lottieAnimationRef.current = null;
    };
  }, [lottieReady]);

  async function handleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (soundOn) {
      audio.pause();
      setSoundOn(false);
      return;
    }

    audio.muted = false;
    audio.volume = 0.56;
    try {
      await audio.play();
      setSoundOn(true);
    } catch {
      setSoundOn(false);
    }
  }

  function handleWish() {
    lottieAnimationRef.current?.stop();
    lottieAnimationRef.current?.play();
  }

  return (
    <main className={styles.page}>
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.4/lottie.min.js"
        strategy="afterInteractive"
        onLoad={() => setLottieReady(true)}
      />

      <div className={styles.particles} aria-hidden="true" />
      <section className={styles.hero} aria-label="Private birthday wish">
        <div className={styles.visualWrap}>
          <img
            className={styles.poster}
            src={`${assetBase}/cake_poster.png`}
            alt="Birthday cake with lit candles"
          />
          {createElement("model-viewer", {
            className: styles.model,
            src: `${assetBase}/cake_anim.glb`,
            poster: `${assetBase}/cake_poster.png`,
            alt: "Birthday cake with lit candles",
            "aria-label": "Birthday cake with lit candles",
            "camera-controls": true,
            "auto-rotate": reducedMotion ? undefined : true,
            "rotation-per-second": "8deg",
            "shadow-intensity": "0.42",
            "environment-image": "neutral",
            "interaction-prompt": "none",
            loading: "lazy",
            reveal: "interaction"
          })}
        </div>

        <div className={styles.copyPanel}>
          <p className={styles.kicker}>A quiet birthday note</p>
          <h1>Happy Birthday!</h1>
          <p className={styles.subtext}>Wishing you a peaceful year ahead, filled with small joys and steady light.</p>

          <div className={styles.actions}>
            <button className={styles.primaryButton} type="button" onClick={handleWish}>
              <Sparkles aria-hidden="true" size={18} />
              Make a Wish
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={handleAudio}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Pause music" : "Play music"}
            >
              {soundOn ? <VolumeX aria-hidden="true" size={18} /> : <Volume2 aria-hidden="true" size={18} />}
              {soundOn ? "Pause Music" : "Play Music"}
            </button>
          </div>

          <div className={styles.lottieShell} aria-hidden="true">
            <div ref={lottieRef} className={styles.lottie} />
          </div>
        </div>
      </section>

      <section className={styles.noteBand} aria-label="A birthday message">
        <div className={styles.noteInner}>
          <Music aria-hidden="true" size={20} />
          <p>Feel free to play the music, or simply let the page stay still and quiet.</p>
        </div>
      </section>

      <audio ref={audioRef} loop muted preload="metadata">
        <source src={`${assetBase}/ambient_bed_loop.wav`} type="audio/wav" />
      </audio>
    </main>
  );
}

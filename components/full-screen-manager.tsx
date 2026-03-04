"use client";

import { useEffect, useState } from "react";

interface DocumentElementWithFullscreen extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
}

// ─── Global print-mode flag ───────────────────────────────────────────────
let _printMode = false;

export function setKioskPrintMode(printing: boolean) {
  _printMode = printing;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function isInFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as FullscreenDocument;
  return !!(doc.fullscreenElement || doc.webkitFullscreenElement);
}

async function requestFullscreen(): Promise<boolean> {
  if (isInFullscreen()) return true;
  const elem = document.documentElement as DocumentElementWithFullscreen;
  try {
    if (elem.requestFullscreen) await elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen)
      await elem.webkitRequestFullscreen();
    else if (elem.mozRequestFullScreen) await elem.mozRequestFullScreen();
    else return false;
    return true;
  } catch {
    return false;
  }
}

export async function exitFullscreen(): Promise<void> {
  if (!isInFullscreen()) return;
  const doc = document as FullscreenDocument;
  try {
    if (doc.exitFullscreen) await doc.exitFullscreen();
    else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
  } catch {
    /* ignore */
  }
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as unknown as { standalone: boolean }).standalone)
  );
}

function isMobilePhone(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPod/i.test(navigator.userAgent);
}

function isMobileRoute(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/mobile");
}

// ─── Component ────────────────────────────────────────────────────────────
export function FullscreenManager() {
  // Show a splash overlay until fullscreen is achieved (or skipped)
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isMobilePhone() || isStandalone() || isMobileRoute()) {
      setShowSplash(false);
      return;
    }

    // Try entering fullscreen immediately (works in some kiosk setups)
    requestFullscreen().then((ok) => {
      if (ok && isInFullscreen()) {
        setShowSplash(false);
      }
    });

    // ── Re-enter if fullscreen is lost (except during printing) ──
    const onFullscreenChange = () => {
      if (isInFullscreen()) {
        setShowSplash(false);
        return;
      }
      if (_printMode) return;
      setTimeout(() => {
        if (!_printMode && !isInFullscreen()) {
          requestFullscreen();
        }
      }, 150);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
    };
  }, []);

  // The splash tap handler — enters fullscreen on the first gesture
  const handleSplashTap = async () => {
    const ok = await requestFullscreen();
    if (ok || !document.fullscreenEnabled) {
      setShowSplash(false);
    }
  };

  if (!showSplash) return null;

  return (
    <div
      onClick={handleSplashTap}
      onTouchStart={handleSplashTap}
      className="fixed inset-0 z-[9999] bg-[#F3EEE7] flex flex-col items-center justify-center cursor-pointer select-none"
      style={{ touchAction: "manipulation" }}
    >
      <h1
        className="text-6xl font-bold text-[#2A3B26] mb-6"
        style={{ fontFamily: "var(--font-national-park), sans-serif" }}
      >
        Posta
      </h1>
      <p className="text-[#52525B] text-lg animate-pulse">
        Tap anywhere to start
      </p>
    </div>
  );
}

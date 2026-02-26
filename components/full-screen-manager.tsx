"use client";

import { useEffect } from "react";

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
    else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
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

// ─── Component ────────────────────────────────────────────────────────────
export function FullscreenManager() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;

    // Skip on small phones
    if (/iPhone|iPod/i.test(navigator.userAgent)) return;

    // Already standalone (Add to Home Screen) — no API needed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as unknown as { standalone: boolean }).standalone)
    )
      return;

    // Track whether fullscreen was ever successfully entered.
    // Once true, we stop listening on touch/click so gestures (crop, slider)
    // are never stolen by a requestFullscreen() call.
    let achieved = false;

    // ── Phase 1: enter fullscreen on the first user gesture ──
    // Removed immediately once fullscreen is confirmed.
    const onFirstGesture = async () => {
      if (_printMode || achieved) return;

      const ok = await requestFullscreen();
      if (ok && isInFullscreen()) {
        achieved = true;
        cleanup();
      }
    };

    const cleanup = () => {
      document.removeEventListener("touchstart", onFirstGesture);
      document.removeEventListener("click", onFirstGesture);
    };

    document.addEventListener("touchstart", onFirstGesture, { passive: true });
    document.addEventListener("click", onFirstGesture);

    // ── Phase 2: re-enter if fullscreen is lost (except during printing) ──
    const onFullscreenChange = () => {
      if (isInFullscreen()) {
        // Mark achieved in case it was entered externally
        if (!achieved) {
          achieved = true;
          cleanup();
        }
        return;
      }

      // Fullscreen was exited
      if (_printMode) return;

      // Re-enter after a very short delay
      setTimeout(() => {
        if (!_printMode && !isInFullscreen()) {
          requestFullscreen();
        }
      }, 150);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    return () => {
      cleanup();
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
    };
  }, []);

  return null;
}

"use client";

import { useEffect, useCallback } from "react";

interface DocumentElementWithFullscreen extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
}

// ─── Global print-mode flag ───────────────────────────────────────────────
// While true the manager will NOT auto-re-enter fullscreen, giving the
// browser room to show the print dialog.  The payment page sets this
// before exiting fullscreen and clears it once printing is done.
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

async function requestFullscreen(): Promise<void> {
  if (isInFullscreen()) return;

  const elem = document.documentElement as DocumentElementWithFullscreen;
  try {
    if (elem.requestFullscreen) await elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
    else if (elem.mozRequestFullScreen) await elem.mozRequestFullScreen();
  } catch {
    /* gesture required or API unavailable — silently ignore */
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
// Renders nothing — works entirely through side-effects.
export function FullscreenManager() {
  const enter = useCallback(async () => {
    if (_printMode) return;
    await requestFullscreen();
  }, []);

  useEffect(() => {
    // Skip on small phones (the mobile upload page shouldn't go fullscreen)
    if (
      typeof navigator !== "undefined" &&
      /iPhone|iPod/i.test(navigator.userAgent)
    )
      return;

    // Already running as a standalone web-app (Add to Home Screen) — no need
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator &&
          (navigator as unknown as { standalone: boolean }).standalone))
    )
      return;

    // ── Enter fullscreen on every user gesture until it succeeds ──
    // Browsers require a user gesture to enter fullscreen. By listening on
    // every touch/click, the very first tap the user makes (e.g. "Start")
    // will trigger fullscreen silently — no prompt needed.
    const onInteraction = () => {
      if (!isInFullscreen() && !_printMode) {
        requestFullscreen();
      }
    };

    document.addEventListener("touchstart", onInteraction, { passive: true });
    document.addEventListener("click", onInteraction);

    // ── Re-enter fullscreen when it's exited (unless printing) ──
    const onFullscreenChange = () => {
      if (!isInFullscreen() && !_printMode) {
        setTimeout(() => {
          if (!_printMode) requestFullscreen();
        }, 300);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("touchstart", onInteraction);
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
    };
  }, [enter]);

  return null;
}

"use client";

import { useLayoutEffect } from "react";

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

function isMobileRoute(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/mobile");
}

// ─── Component — renders nothing, runs before first paint ─────────────────
export function FullscreenManager() {
  useLayoutEffect(() => {
    if (typeof navigator === "undefined") return;
    if (/iPhone|iPod/i.test(navigator.userAgent)) return;
    if (isMobileRoute()) return;
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as unknown as { standalone: boolean }).standalone)
    )
      return;

    // ── Attempt fullscreen immediately (works in kiosk shells) ──
    requestFullscreen();

    // ── Enter fullscreen on first gesture ──
    let achieved = false;

    const onGesture = async () => {
      if (_printMode || achieved) return;
      const ok = await requestFullscreen();
      if (ok && isInFullscreen()) {
        achieved = true;
        document.removeEventListener("touchstart", onGesture);
        document.removeEventListener("click", onGesture);
      }
    };

    document.addEventListener("touchstart", onGesture, { passive: true });
    document.addEventListener("click", onGesture);

    // ── Re-enter fullscreen when lost (unless printing) ──
    const onFsChange = () => {
      if (isInFullscreen()) {
        if (!achieved) {
          achieved = true;
          document.removeEventListener("touchstart", onGesture);
          document.removeEventListener("click", onGesture);
        }
        return;
      }
      if (_printMode) return;
      setTimeout(() => {
        if (!_printMode && !isInFullscreen()) requestFullscreen();
      }, 150);
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    // ── Block every iOS gesture that can break fullscreen ──

    // Prevent swipe-to-navigate and pull-to-refresh.
    // Allow through touches on crop area, sliders, buttons.
    const onTouchMove = (e: TouchEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (
        t.closest("[data-allow-touch]") ||
        t.closest(".ReactCrop") ||
        t.closest("[data-slot='slider-thumb']")
      )
        return;
      e.preventDefault();
    };

    // Prevent pinch-zoom (iPad two-finger gesture)
    const onGestureStart = (e: Event) => e.preventDefault();
    const onGestureChange = (e: Event) => e.preventDefault();

    // Prevent double-tap zoom
    let lastTap = 0;
    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 300) e.preventDefault();
      lastTap = now;
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("gesturestart", onGestureStart, {
      passive: false,
    });
    document.addEventListener("gesturechange", onGestureChange, {
      passive: false,
    });
    document.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("touchstart", onGesture);
      document.removeEventListener("click", onGesture);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("gesturestart", onGestureStart);
      document.removeEventListener("gesturechange", onGestureChange);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}

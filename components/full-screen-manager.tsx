"use client";

import { useEffect, useState } from "react";

interface DocumentElementWithFullscreen extends HTMLElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

function isIPad(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isMobilePhone(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const w = window.innerWidth;
  return (
    /iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (/Android/i.test(ua) && w < 600) ||
    (w < 600 && !isIPad())
  );
}

function supportsFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as DocumentElementWithFullscreen;
  return !!(
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen
  );
}

function isStandaloneWebApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator &&
      (window.navigator as unknown as { standalone: boolean }).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function FullscreenManager() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [deviceType, setDeviceType] = useState<
    "desktop" | "ipad" | "mobile"
  >("desktop");

  useEffect(() => {
    if (isMobilePhone()) {
      setDeviceType("mobile");
      return;
    }
    if (isIPad()) {
      setDeviceType("ipad");
    }

    if (isStandaloneWebApp()) return;

    const interacted = sessionStorage.getItem("fullscreen_interacted");
    if (interacted) {
      setHasInteracted(true);
    }

    const enterFullscreen = async () => {
      if (!supportsFullscreen()) {
        if (!interacted) setShowPrompt(true);
        return;
      }
      try {
        if (document.fullscreenElement) return;

        const elem =
          document.documentElement as DocumentElementWithFullscreen;

        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen)
          await elem.webkitRequestFullscreen();
        else if (elem.mozRequestFullScreen) await elem.mozRequestFullScreen();
        else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();

        setShowPrompt(false);
      } catch {
        if (!interacted) setShowPrompt(true);
      }
    };

    if (interacted) {
      enterFullscreen();
    } else {
      setShowPrompt(true);
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasInteracted) {
        setTimeout(enterFullscreen, 100);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange,
    );
    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, [hasInteracted]);

  if (deviceType === "mobile" || !showPrompt) return null;

  const handleEnterFullscreen = async () => {
    sessionStorage.setItem("fullscreen_interacted", "true");
    setHasInteracted(true);

    if (supportsFullscreen()) {
      try {
        const elem =
          document.documentElement as DocumentElementWithFullscreen;
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen)
          await elem.webkitRequestFullscreen();
        else if (elem.mozRequestFullScreen) await elem.mozRequestFullScreen();
        else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();
      } catch {
        /* handled below */
      }
    }
    setShowPrompt(false);
  };

  // iPad: Fullscreen API is not available — show kiosk setup instructions
  if (deviceType === "ipad" && !supportsFullscreen()) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-[#18181B] mb-3">
            iPad Kiosk Setup
          </h2>
          <p className="text-[#52525B] mb-6 text-sm leading-relaxed">
            For a fullscreen kiosk experience on iPad:
          </p>

          <div className="text-left space-y-3 mb-6 text-sm text-[#52525B]">
            <div className="flex gap-3">
              <span className="font-bold text-primary shrink-0">1.</span>
              <span>
                Open this page in <strong>Safari</strong>, tap the Share button,
                then <strong>&quot;Add to Home Screen&quot;</strong>.
              </span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-primary shrink-0">2.</span>
              <span>
                Launch the app from the Home Screen — it opens fullscreen
                without browser chrome.
              </span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-primary shrink-0">3.</span>
              <span>
                Go to <strong>Settings → Accessibility → Guided Access</strong>{" "}
                and turn it on. Triple-click the side button to lock the iPad
                into this app.
              </span>
            </div>
          </div>

          <button
            onClick={handleEnterFullscreen}
            className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-full shadow-lg"
          >
            Continue Without Fullscreen
          </button>
        </div>
      </div>
    );
  }

  // Desktop / other: standard fullscreen prompt
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#18181B] mb-3">
          Enter Fullscreen Mode
        </h2>
        <p className="text-[#52525B] mb-8">
          For the best experience, this application works in fullscreen mode.
        </p>
        <button
          onClick={handleEnterFullscreen}
          className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-full shadow-lg"
        >
          Enter Fullscreen
        </button>
      </div>
    </div>
  );
}

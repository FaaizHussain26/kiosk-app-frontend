"use client";

import { useEffect, useState } from "react";

interface DocumentElementWithFullscreen extends HTMLElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface DocumentWithFullscreen extends Document {
  mozFullScreenElement?: Element;
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
}

export function FullscreenManager() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();

    // Also check on resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Don't run fullscreen logic on mobile
    if (isMobile) {
      return;
    }
    // Check if user has already interacted
    const interacted = sessionStorage.getItem("fullscreen_interacted");
    if (interacted) {
      setHasInteracted(true);
    }

    const enterFullscreen = async () => {
      try {
        if (document.fullscreenElement) {
          return;
        }

        const elem = document.documentElement as DocumentElementWithFullscreen;

        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          setShowPrompt(false);
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
          setShowPrompt(false);
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
          setShowPrompt(false);
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
          setShowPrompt(false);
        }
      } catch (err) {
        // If automatic fullscreen fails, show the prompt
        if (!hasInteracted) {
          setShowPrompt(true);
        }
      }
    };

    // Try to enter fullscreen immediately if user has interacted before
    if (interacted) {
      enterFullscreen();
    } else {
      // Show prompt on first visit
      setShowPrompt(true);
    }

    // Re-enter fullscreen if user exits
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasInteracted) {
        setTimeout(enterFullscreen, 100);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [hasInteracted, isMobile]);

  // Don't render anything on mobile devices
  if (isMobile) {
    return null;
  }

  const handleEnterFullscreen = async () => {
    try {
      const elem = document.documentElement as DocumentElementWithFullscreen;

      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }

      // Remember that user has interacted
      sessionStorage.setItem("fullscreen_interacted", "true");
      setHasInteracted(true);
      setShowPrompt(false);
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
    }
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center z-2000">
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
          Click below to continue.
        </p>

        <button
          onClick={handleEnterFullscreen}
          className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Enter Fullscreen
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Press ESC to exit fullscreen anytime
        </p>
      </div>
    </div>
  );
}

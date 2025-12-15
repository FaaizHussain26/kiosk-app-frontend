"use client";

import { useEffect, useState } from "react";

export function FullscreenManager() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
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

        const elem = document.documentElement;

        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          setShowPrompt(false);
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
          setShowPrompt(false);
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
          setShowPrompt(false);
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
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
  }, [hasInteracted]);

  const handleEnterFullscreen = async () => {
    try {
      const elem = document.documentElement;

      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-blue-500"
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

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Enter Fullscreen Mode
        </h2>

        <p className="text-gray-600 mb-8">
          For the best experience, this application works in fullscreen mode.
          Click below to continue.
        </p>

        <button
          onClick={handleEnterFullscreen}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
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

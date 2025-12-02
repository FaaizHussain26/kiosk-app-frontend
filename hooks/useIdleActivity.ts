import { useRef, useState, useEffect, useCallback } from "react";

const EVENTS = [
  "mousedown",
  "mousemove",
  "keypress",
  "scroll",
  "touchstart",
  "click",
];

type UseIdleActivityOptions = {
  idleModalMs?: number;
  redirectMs?: number;
};

/**
 * useIdleActivity
 *
 * Shows an "idle" state after a period of inactivity, then triggers a callback
 * (e.g. navigate home) if the user stays idle while the modal is visible.
 *
 * Default timings:
 * - 90 seconds until the modal is shown
 * - 30 seconds after the modal before the callback runs
 */
const useIdleActivity = (
  callback: () => void,
  { idleModalMs = 90_000, redirectMs = 30_000 }: UseIdleActivityOptions = {},
) => {
  const [showModal, setShowModal] = useState(false);

  const lastActivityTime = useRef(Date.now());
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    lastActivityTime.current = Date.now();
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setShowModal(false);
  }, []);

  // Check for idle time and show modal / trigger callback
  useEffect(() => {
    const checkIdleTime = () => {
      const idleTime = Date.now() - lastActivityTime.current;

      if (!showModal && idleTime >= idleModalMs) {
        setShowModal(true);
        console.log('Redirecting to home');

        setTimeout(() => {
          callback();
        }, redirectMs);
        
      }
    };

    const interval = setInterval(checkIdleTime, 1_000);
    return () => {
      clearInterval(interval);
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [callback, idleModalMs, redirectMs, showModal]);

  // Track user activity and reset timers
  useEffect(() => {
    const handleActivity = () => {
      resetIdleTimer();
    };

    EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return { showModal, resetIdleTimer };
};

export default useIdleActivity;

import { useRef, useState, useEffect, useCallback } from "react";

const EVENTS: (keyof WindowEventMap)[] = [
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
 * Shows an "idle" modal after inactivity, then fires a callback if the user
 * remains idle for an additional period.
 *
 * Defaults: 90 s until modal, 30 s after modal until callback.
 */
const useIdleActivity = (
  callback: () => void,
  { idleModalMs = 90_000, redirectMs = 30_000 }: UseIdleActivityOptions = {},
) => {
  const [showModal, setShowModal] = useState(false);

  const lastActivityTime = useRef(Date.now());
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const resetIdleTimer = useCallback(() => {
    lastActivityTime.current = Date.now();
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    setShowModal(false);
  }, []);

  useEffect(() => {
    const checkIdleTime = () => {
      const idleTime = Date.now() - lastActivityTime.current;

      if (!showModal && idleTime >= idleModalMs) {
        setShowModal(true);

        // Store the timeout ref so resetIdleTimer can cancel it
        redirectTimeoutRef.current = setTimeout(() => {
          callbackRef.current();
        }, redirectMs);
      }
    };

    const interval = setInterval(checkIdleTime, 1_000);
    return () => {
      clearInterval(interval);
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [idleModalMs, redirectMs, showModal]);

  useEffect(() => {
    const handleActivity = () => resetIdleTimer();

    EVENTS.forEach((event) => window.addEventListener(event, handleActivity));
    return () => {
      EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    };
  }, [resetIdleTimer]);

  return { showModal, resetIdleTimer };
};

export default useIdleActivity;

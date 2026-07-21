"use client";

import { getSessionInactivityMs } from "@/lib/session-inactivity";
import { useCallback, useEffect, useRef } from "react";

const ACTIVITY_THROTTLE_MS = 1_000;

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

/**
 * Signs the user out after {@link getSessionInactivityMs} without pointer/keyboard activity.
 * Call `onTimeout` to invalidate the server session and clear local auth state.
 */
export function useInactivityLogout(
  enabled: boolean,
  onTimeout: () => void | Promise<void>
) {
  const onTimeoutRef = useRef(onTimeout);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());
  const firingRef = useRef(false);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(() => {
    clearTimer();
    const ms = getSessionInactivityMs();
    timerRef.current = setTimeout(() => {
      if (firingRef.current) return;
      firingRef.current = true;
      void Promise.resolve(onTimeoutRef.current()).finally(() => {
        firingRef.current = false;
      });
    }, ms);
  }, [clearTimer]);

  const bumpActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityRef.current = now;
    schedule();
  }, [schedule]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    lastActivityRef.current = Date.now();
    schedule();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, bumpActivity, { passive: true });
    }

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const idle = Date.now() - lastActivityRef.current;
      const limit = getSessionInactivityMs();
      if (idle >= limit) {
        if (firingRef.current) return;
        firingRef.current = true;
        void Promise.resolve(onTimeoutRef.current()).finally(() => {
          firingRef.current = false;
        });
        return;
      }
      schedule();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimer();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, bumpActivity);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, bumpActivity, schedule, clearTimer]);
}

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackScrollDepth, trackDwell } from "@/lib/analytics";

/* Fires scroll_depth(25/50/75/100) at most once per (path, depth)
   pair, then resets on route change. Cheap — just listens to scroll
   and reads documentElement.scrollHeight. */
export function useScrollDepth() {
  const { pathname } = useLocation();
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    firedRef.current = new Set();

    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) return;
      const pct = (window.scrollY / total) * 100;
      const thresholds: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];
      for (const t of thresholds) {
        if (pct >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t);
          trackScrollDepth(t, pathname);
        }
      }
    };

    /* passive: true so we never block the smooth-scroll thread */
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
}

/* Fires page_dwell(path, ms) when:
   - the user navigates to a different path (just before unmount of this hook's effect)
   - the tab is hidden (visibilitychange)
   - the page is closing (pagehide)
   Whichever comes first. */
export function usePageDwell() {
  const { pathname } = useLocation();
  const enteredAtRef = useRef<number>(performance.now());
  const sentRef = useRef(false);

  useEffect(() => {
    enteredAtRef.current = performance.now();
    sentRef.current = false;

    const flush = () => {
      if (sentRef.current) return;
      const ms = Math.round(performance.now() - enteredAtRef.current);
      if (ms < 500) return; /* skip drive-by renders */
      trackDwell(pathname, ms);
      sentRef.current = true;
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [pathname]);
}

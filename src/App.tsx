import React, { createContext, useContext, useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Home from '@/components/pages/home/home';
/* Home stays eager — it's the landing/LCP route, so bundling it inline avoids
   an extra chunk round-trip on first paint. Every other route is split into
   its own chunk so the initial download doesn't carry the whole site. */
const About = lazy(() => import('@/components/pages/about').then((m) => ({ default: m.About })));
const Projects = lazy(() => import('@/components/pages/projects').then((m) => ({ default: m.Projects })));
const Work = lazy(() => import('@/components/pages/work').then((m) => ({ default: m.Work })));
const Contact = lazy(() => import('@/components/pages/contact').then((m) => ({ default: m.Contact })));
const NotFound = lazy(() => import('@/components/pages/notfound').then((m) => ({ default: m.NotFound })));
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useScrollDepth, usePageDwell } from '@/Hooks/useAnalytics';
import { trackNav } from '@/lib/analytics';

gsap.registerPlugin(ScrollTrigger);

/* Lenis instance is shared via context so RouteEffects can reset scroll
   through Lenis (window.scrollTo is hijacked when Lenis owns scrolling).
   Exported so any component can lenis.scrollTo(target) — native
   element.scrollIntoView() fights Lenis and ends up doing nothing. */
export const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /* useState (not useRef) so context consumers re-render with the live
     instance. Previous version used a ref + create-in-render, which broke
     under StrictMode: cleanup destroyed Lenis and nulled the ref, but
     since 'create in render' never re-fires after the initial render,
     the context was left holding a dead reference. Anything calling
     lenis.scrollTo() (the agent CTA) silently no-op'd. */
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });
    setLenis(instance);

    const update = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => ScrollTrigger.update();
    instance.on('scroll', onScroll);

    return () => {
      gsap.ticker.remove(update);
      instance.off('scroll', onScroll);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
};

/* On every route change:
   1. Stop and reset Lenis to scroll 0 immediately. Lenis owns window.scrollY
      while smooth scroll is active, so calling window.scrollTo bypasses it
      and the new page would land at whatever scroll position the previous
      page was on - which produced the "page lands mid-horizontal-scroll
      showing one stray project badge" bug.
   2. Refresh ScrollTrigger after the new DOM has settled. */
const RouteEffects: React.FC = () => {
  const { pathname } = useLocation();
  const lenis = useLenis();
  const prevPathRef = React.useRef<string | null>(null);

  useScrollDepth();
  usePageDwell();

  useEffect(() => {
    /* Skip the first call (initial mount) — page_view fires automatically
       via @vercel/analytics on every history change. We only need to log
       our own "nav" event with from→to context. */
    if (prevPathRef.current !== null && prevPathRef.current !== pathname) {
      trackNav(pathname, prevPathRef.current);
    }
    prevPathRef.current = pathname;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (lenis) {
      lenis.stop();
      lenis.scrollTo(0, { immediate: true, force: true });
      requestAnimationFrame(() => lenis.start());
    } else {
      window.scrollTo(0, 0);
    }
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname, lenis]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <SmoothScroll>
        <RouteEffects />
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/work" element={<Work />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </SmoothScroll>
    </Router>
  );
};

export default App;

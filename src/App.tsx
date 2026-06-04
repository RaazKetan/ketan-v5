import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Home from './components/pages/home/home';
import { About } from './components/pages/about';
import { Projects } from './components/pages/projects';
import { Work } from './components/pages/work';
import { Contact } from './components/pages/contact';
import { NotFound } from './components/pages/notfound';
import { ErrorBoundary } from './components/error/ErrorBoundary';

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

  useEffect(() => {
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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/work" element={<Work />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </SmoothScroll>
    </Router>
  );
};

export default App;

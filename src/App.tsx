import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Home from './components/pages/home/home';
import { About } from './components/pages/about';
import { Projects } from './components/pages/projects';
import { Work } from './components/pages/work';
import { Contact } from './components/pages/contact';

gsap.registerPlugin(ScrollTrigger);

/* Smooth-scroll wrapper. Lenis lerps the scroll position so fast wheel
   flicks don't translate into instant jumps — animations driven by
   ScrollTrigger therefore play smoothly regardless of input speed. */
const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    /* Bridge Lenis to GSAP's ticker so ScrollTrigger updates in lockstep. */
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    /* When Lenis emits a scroll event, refresh ScrollTrigger's cache so
       it reads the smoothed scroll position rather than the native one. */
    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    return () => {
      gsap.ticker.remove(update);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
};

/* On every route change:
   1. Scroll back to top so the new page lands at the hero.
   2. Refresh ScrollTrigger once the new DOM has settled so the new page's
      triggers re-measure against the new layout.
   We do NOT kill ScrollTriggers here — each page's useEffect cleanup runs
   ctx.revert() on unmount, which handles its own teardown. Killing here
   would race with the new page's mount and wipe its just-created triggers,
   leaving from-state elements hidden. */
const RouteEffects: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <SmoothScroll>
        <RouteEffects />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/work" element={<Work />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </SmoothScroll>
    </Router>
  );
};

export default App;

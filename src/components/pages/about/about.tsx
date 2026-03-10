import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TopBar } from "../../Navbar/TopBar";
import { MainNavbar } from "../../Navbar/MainNavbar";
import { NavbarIntersectionContrast } from "../../Navbar/behaviors/NavbarIntersectionContrast";
import { useIsMobile } from "../../../Hooks";
import { usePersonalData } from "../../../context/PersonalDataContext";
import { useNavigate } from "react-router-dom";
import { usePageTransition } from "../../../Hooks";

gsap.registerPlugin(ScrollTrigger);

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: 0.1 * i, 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] as const 
    },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { 
      delay: 0.1 * i, 
      duration: 1, 
      ease: [0.16, 1, 0.3, 1] as const 
    },
  }),
};

const tagVariant = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      delay: 0.04 * i, 
      duration: 0.6, 
      ease: [0.16, 1, 0.3, 1] as const 
    },
  }),
};

/* ─── 3D Tilt Card Component ─── */
const TiltCard: React.FC<{ children: React.ReactNode; index: number }> = ({ children, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative group bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl p-6 cursor-default
                 hover:border-amber-200 transition-all duration-300"
    >
      <motion.div
        animate={{
          boxShadow: isHovered 
            ? "0 20px 60px rgba(251, 191, 36, 0.15)" 
            : "0 4px 20px rgba(0, 0, 0, 0.05)"
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-2xl"
        style={{ transform: "translateZ(-10px)" }}
      />
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

/* ─── Magnetic Button Component ─── */
const MagneticButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

export const About: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const collapsableDivRef = useRef<HTMLDivElement>(null);
  const backgroundDivRef = useRef<HTMLDivElement>(null);
  const mainNavbarRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const { MainNavbarData, AboutPageData } = usePersonalData();
  const navigate = useNavigate();
  const { navigateWithCenterFill } = usePageTransition();

  /* ─── GSAP entrance timeline with enhanced effects ─── */
  useEffect(() => {
    const tl = gsap.timeline();

    // Smooth fade in for content
    tl.fromTo(
      contentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    // Hero elements with stagger
    if (heroRef.current) {
      tl.fromTo(
        heroRef.current.children,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.12,
        },
        "-=0.6"
      );
    }

    // Navbar reveal
    tl.to(
      "#main-navbar",
      { height: "auto", opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.8"
    );

    const navItems = document.querySelectorAll(
      "#main-navbar span.cursor-pointer"
    );
    tl.to(
      navItems,
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
      },
      "-=0.4"
    );
  }, []);

  /* ─── Parallax scroll effects ─── */
  useEffect(() => {
    if (parallaxRef.current) {
      gsap.to(parallaxRef.current, {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }
  }, []);

  /* ─── GSAP scroll reveal for sections with enhanced animations ─── */
  useEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>(".scroll-section");

    sections.forEach((section, index) => {
      // Different animation styles for variety
      const animationType = index % 2 === 0 ? { opacity: 0, y: 40 } : { opacity: 0, scale: 0.95 };
      
      gsap.fromTo(
        section.children,
        animationType,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  /* ─── Navbar hover interactions (preserved) ─── */
  useEffect(() => {
    const navItems = document.querySelectorAll(
      "#main-navbar span.cursor-pointer, #navbar .raaz-brand"
    );

    navItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
          let labelHTML = "";
          let numberHTML = "";

          if ((item as HTMLElement).classList.contains("raaz-brand")) {
            const dataText = (item as HTMLElement).dataset.text ?? "00 Home";
            const [number, label] = dataText.split(" ");
            numberHTML = `<span style="font-weight: 700; color: #fbbf24;">${number}</span><br/>`;
            labelHTML = `<span>${label}</span>`;
          } else {
            const itemIndex = parseInt(
              (item as HTMLElement).dataset.index || "0"
            );
            const data = MainNavbarData.navItems[itemIndex];

            numberHTML = data.number
              ? `<span style="font-weight: 700; color: #fbbf24;">${data.number}</span><br/>`
              : "";
            labelHTML = `<span>${data.label}</span>`;
          }

          backgroundDivRef.current.innerHTML = numberHTML + labelHTML;
          const targetHeight =
            typeof window !== "undefined" && window.innerWidth > 1440
              ? 200
              : 100;

          gsap.set(collapsableDivRef.current, {
            backgroundImage: "linear-gradient(#000, #000)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: `100% 0px`,
          });

          gsap.to(collapsableDivRef.current, {
            backgroundSize: `100% ${targetHeight}px`,
            duration: 1,
            ease: "power3.out",
            onStart: () => {
              if (!(item as HTMLElement).classList.contains("raaz-brand")) {
                (item as HTMLElement).style.color = "white";
              }
            },
          });

          gsap.set(backgroundDivRef.current, {
            position: "absolute",
            left: 0,
            top: "50%",
            yPercent: -50,
            width: "100%",
            height: targetHeight,
            zIndex: 1,
            opacity: 0,
            scale: 2,
            pointerEvents: "none",
          });

          gsap.to(backgroundDivRef.current, {
            opacity: 0.34,
            duration: 1,
            ease: "power2.out",
          });
        }
      });

      item.addEventListener("mouseleave", () => {
        if (collapsableDivRef.current && backgroundDivRef.current) {
          gsap.to(collapsableDivRef.current, {
            backgroundSize: "100% 0px",
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
              if (collapsableDivRef.current) {
                collapsableDivRef.current.style.backgroundImage = "";
                collapsableDivRef.current.style.backgroundRepeat = "";
                collapsableDivRef.current.style.backgroundPosition = "";
                collapsableDivRef.current.style.backgroundSize = "";
              }
              if (!(item as HTMLElement).classList.contains("raaz-brand")) {
                (item as HTMLElement).style.color = "";
              }
            },
          });

          gsap.to(backgroundDivRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              if (backgroundDivRef.current) {
                backgroundDivRef.current.textContent = "";
                backgroundDivRef.current.style.position = "";
                backgroundDivRef.current.style.top = "";
                backgroundDivRef.current.style.left = "";
                backgroundDivRef.current.style.width = "";
                backgroundDivRef.current.style.height = "";
                backgroundDivRef.current.style.transform = "";
                backgroundDivRef.current.style.zIndex = "";
              }
            },
          });
        }
      });

      item.addEventListener("click", () => {
        const label = (
          item.querySelector("span:last-child")?.textContent || ""
        ).trim();
        const routeMap: Record<string, string> = {
          About: "/about",
          Home: "/",
          "Agent Office": "/office",
        };

        if ((item as HTMLElement).classList.contains("raaz-brand")) {
          navigateWithCenterFill(navigate, "/");
          return;
        }

        const path = routeMap[label] || "/";
        navigateWithCenterFill(navigate, path);
      });
    });
  }, [MainNavbarData, navigate, navigateWithCenterFill]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white overflow-x-hidden text-gray-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      <NavbarIntersectionContrast />

      {/* Animated gradient orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Top Bar */}
      <div ref={contentRef}>
        <TopBar />
      </div>

      {/* Main Navbar */}
      {!isMobile && (
        <MainNavbar
          collapsableDivRef={collapsableDivRef}
          backgroundDivRef={backgroundDivRef}
          mainNavbarRef={mainNavbarRef}
        />
      )}

      {/* ━━ Hero — enhanced with gradient text and animations ━━ */}
      <section
        ref={heroRef}
        className="relative flex flex-col justify-center px-6 md:px-20 max-w-7xl mx-auto pt-32 pb-20"
        data-nav-contrast="light"
      >
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "4rem", opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const, delay: 0.4 }}
          className="h-[3px] bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 mb-10 rounded-full"
        />
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
          {AboutPageData.positioning.statement}
        </h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed mb-4"
        >
          {AboutPageData.positioning.subStatement}
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-base md:text-lg text-amber-600 font-medium"
        >
          {AboutPageData.positioning.focus}
        </motion.p>

        {/* Decorative element */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="absolute -right-20 top-1/2 w-72 h-72 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-3xl -z-10"
        />
      </section>

      {/* ━━ Philosophy — 3D tilt cards with enhanced design ━━ */}
      <section
        className="scroll-section px-6 md:px-20 py-20 relative"
        data-nav-contrast="light"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600 mb-12 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-amber-400" />
              {AboutPageData.philosophy.heading}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AboutPageData.philosophy.principles.map((p, i) => (
              <TiltCard key={i} index={i}>
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-xs font-mono font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold mb-3 text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {p.description}
                </p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Background — enhanced media gallery with parallax ━━ */}
      <section
        className="scroll-section px-6 md:px-20 py-24 relative overflow-hidden"
        data-nav-contrast="light"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* Narrative with enhanced typography */}
            <motion.div 
              className="lg:w-[40%] flex-shrink-0 sticky top-32"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600 mb-8 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-amber-400" />
                {AboutPageData.background.heading}
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-light">
                {AboutPageData.background.narrative}
              </p>
              
              {/* Decorative quote mark */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-[200px] font-serif text-amber-500 leading-none mt-8 select-none"
              >
                "
              </motion.div>
            </motion.div>

            {/* Enhanced media gallery with parallax */}
            <div ref={parallaxRef} className="lg:w-[60%] relative">
              <div className="grid grid-cols-2 gap-4">
                {AboutPageData.background.videos.map((video, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                    whileHover={{ 
                      scale: 1.05, 
                      zIndex: 10,
                      transition: { duration: 0.3 }
                    }}
                    className={`relative rounded-2xl overflow-hidden group cursor-pointer ${
                      i === 0 ? 'col-span-2 h-80' : 'h-64'
                    }`}
                  >
                    {video.src.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={video.src}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={video.src}
                        alt={video.caption}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Caption */}
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 p-6"
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <span className="text-sm font-medium text-white tracking-wide uppercase">
                        {video.caption}
                      </span>
                    </motion.div>

                    {/* Hover border effect */}
                    <div className="absolute inset-0 border-2 border-amber-400/0 group-hover:border-amber-400/50 rounded-2xl transition-all duration-300" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Explorations — animated floating tags with magnetic effect ━━ */}
      <section
        className="scroll-section px-6 md:px-20 py-24 bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden"
        data-nav-contrast="dark"
      >
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500 mb-12 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-amber-400" />
              {AboutPageData.explorations.heading}
            </h2>
          </motion.div>
          
          <div className="flex flex-wrap gap-3">
            {AboutPageData.explorations.items.map((item, i) => (
              <MagneticButton key={i}>
                <motion.span
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={tagVariant}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(251, 191, 36, 0.1)",
                    borderColor: "rgba(251, 191, 36, 0.6)",
                    color: "#fbbf24",
                    transition: { duration: 0.2 },
                  }}
                  className="inline-block px-5 py-3 border border-gray-800 rounded-full text-sm text-gray-300 cursor-pointer transition-all backdrop-blur-sm"
                >
                  {item}
                </motion.span>
              </MagneticButton>
            ))}
          </div>

          {/* Decorative glow */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"
          />
        </div>
      </section>

      {/* ━━ How I Work + Ambition — split layout with enhanced visuals ━━ */}
      <section
        className="scroll-section px-6 md:px-20 py-24 bg-gradient-to-b from-white to-gray-50/50"
        data-nav-contrast="light"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* How I Work */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600 mb-10 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-amber-400" />
                {AboutPageData.workingWithMe.heading}
              </h2>
              
              <div className="space-y-6">
                {AboutPageData.workingWithMe.items.map((item, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    className="flex items-start gap-4 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-sm font-bold text-amber-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed pt-2">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Ambition quote with enhanced design */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
              className="relative lg:sticky lg:top-32"
            >
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 md:p-12 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
                
                {/* Quote mark */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 0.15, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="absolute top-8 left-8 text-[120px] font-serif text-amber-500 leading-none select-none"
                >
                  "
                </motion.div>
                
                <div className="relative z-10">
                  <p className="text-2xl md:text-3xl font-light text-white leading-relaxed mb-6">
                    {AboutPageData.ambition.text}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500" />
                    <span className="text-sm text-amber-400 font-medium tracking-wider uppercase">
                      Vision
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom spacing with decorative element */}
      <div className="relative h-32" data-nav-contrast="light">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        />
      </div>
    </div>
  );
};
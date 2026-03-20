"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { HeroSlide, DEFAULT_HERO_SLIDES } from "@/lib/constants/hero-slides";
import { TEACHERS } from "@/lib/constants/teachers";
import { useTheme } from "@/components/providers/theme-provider";

/* ══════════════════════════════════════════════════════
   PARTICLE FIELD — mouse repulsion physics
══════════════════════════════════════════════════════ */
function ParticleField({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let mouse = { x: -999, y: -999 };

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = Math.min(80, Math.floor(window.innerWidth / 15));
    type P = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; gold: boolean };
    const particles: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      size: Math.random() * 1.6 + 0.3, alpha: Math.random() * 0.45 + 0.1, gold: Math.random() > 0.62,
    }));

    const onMM = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onTM = (e: TouchEvent) => { if (!e.touches[0]) return; const r = canvas.getBoundingClientRect(); mouse = { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top }; };
    const onML = () => { mouse = { x: -999, y: -999 }; };

    canvas.addEventListener("mousemove", onMM);
    canvas.addEventListener("mouseleave", onML);
    canvas.addEventListener("touchmove", onTM, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 0.1) { const f = ((130 - dist) / 130) * 0.1; p.vx += (dx / dist) * f; p.vy += (dy / dist) * f; }
        p.vx *= 0.97; p.vy *= 0.97;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -5) p.x = canvas.width + 5; if (p.x > canvas.width + 5) p.x = -5;
        if (p.y < -5) p.y = canvas.height + 5; if (p.y > canvas.height + 5) p.y = -5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? "#D4AF37" : "#F09226"; ctx.globalAlpha = p.alpha; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const cd = Math.sqrt((q.x - p.x) ** 2 + (q.y - p.y) ** 2);
          if (cd < 100) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "#F09226"; ctx.globalAlpha = (1 - cd / 100) * 0.07; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    gsap.from(canvas, { opacity: 0, duration: 1.5, ease: "power2.out", delay: 0.5 });
    draw();

    return () => {
      cancelAnimationFrame(animId); window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMM); canvas.removeEventListener("mouseleave", onML); canvas.removeEventListener("touchmove", onTM);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ opacity: isDark ? 0.55 : 0.22 }} />;
}

/* ══════════════════════════════════════════════════════
   SPLIT LINE — overflow:hidden per char
══════════════════════════════════════════════════════ */
function SplitLine({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`block leading-[0.92] ${className ?? ""}`} style={style}>
      {text.split("").map((ch, i) => (
        <span key={i} className="inline-block" style={{ overflow: "hidden", verticalAlign: "bottom" }}>
          <span data-char className="inline-block">{ch === " " ? "\u00A0" : ch}</span>
        </span>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   STAT RING — SVG arc progress
══════════════════════════════════════════════════════ */
function StatRing({ pct, size = 52, color = "#F09226" }: { pct: number; size?: number; color?: string }) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  const circleRef = useRef<SVGCircleElement>(null);
  useEffect(() => {
    if (!circleRef.current) return;
    gsap.fromTo(circleRef.current, { strokeDashoffset: c }, { strokeDashoffset: c * (1 - pct), duration: 1.8, ease: "power2.out", delay: 1.3 });
  }, [c, pct]);
  return (
    <svg width={size} height={size} className="absolute top-3 right-3 opacity-25" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="1.2"
        strokeDasharray={c} strokeDashoffset={c} strokeLinecap="round" ref={circleRef} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   CELL HANDLERS — cursor glow + 3D tilt
   data-no-tilt disables the 3D effect (main cell)
══════════════════════════════════════════════════════ */
function onCellMove(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
  e.currentTarget.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  if ((e.currentTarget as HTMLElement).dataset.noTilt) return;
  const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
  const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
  gsap.to(e.currentTarget, { rotateX: -dy * 2.5, rotateY: dx * 2.5, duration: 0.55, ease: "power2.out", transformPerspective: 900 });
}
function onCellLeave(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
}

/* ══════════════════════════════════════════════════════
   CORNER BRACKETS decorator
══════════════════════════════════════════════════════ */
function Brackets({ color = "rgba(240,146,38,0.22)" }: { color?: string }) {
  const s = { borderColor: color } as React.CSSProperties;
  return (
    <>
      <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" style={s} />
      <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" style={s} />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l" style={s} />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r" style={s} />
    </>
  );
}

/* ══════════════════════════════════════════════════════
   TEACHERS CELL — auto-rotating faculty showcase
══════════════════════════════════════════════════════ */
function TeachersCell({ mobile, fill, isDark, href }: { mobile?: boolean; fill?: boolean; isDark: boolean; href?: string }) {
  const [activeTeacher, setActiveTeacher] = useState(0);
  const activeTeacherRef = useRef(0);
  const isTransitioningTeacher = useRef(false);
  const teacherContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (isTransitioningTeacher.current) return;
      isTransitioningTeacher.current = true;
      const next = (activeTeacherRef.current + 1) % TEACHERS.length;

      gsap.to(teacherContentRef.current, {
        opacity: 0, x: 6, duration: 0.22, ease: "power2.in",
        onComplete: () => {
          activeTeacherRef.current = next;
          setActiveTeacher(next);
          requestAnimationFrame(() => {
            gsap.fromTo(teacherContentRef.current,
              { opacity: 0, x: -6 },
              {
                opacity: 1, x: 0, duration: 0.32, ease: "power2.out",
                onComplete: () => { isTransitioningTeacher.current = false; },
              }
            );
          });
        },
      });
    }, 3200);

    return () => clearInterval(id);
  }, []);

  const t = TEACHERS[activeTeacher];

  const cellStyle = {
    ...(mobile
      ? { flex: "1 1 0%", minHeight: "25vh" }
      : fill
      ? { flex: "2 1 0%" }
      : { width: "200px", flexShrink: 0 }),
    background: isDark ? "rgba(2,0,38,0.75)" : "rgba(255,255,255,0.92)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.07)"}`,
    borderLeft: `2px solid ${t.color}44`,
  };

  const cellClass = "bento-interactive rounded-sm px-5 py-5 flex flex-col justify-between relative overflow-hidden";

  const inner = (
    <>
      <div
        className="text-[0.75rem] font-bold tracking-[0.28em] uppercase"
        style={{ color: isDark ? "rgba(180,180,190,0.6)" : "rgba(0,0,0,0.4)" }}
      >
        Docenti
      </div>

      <div ref={teacherContentRef} className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[0.75rem] font-black flex-shrink-0 overflow-hidden"
          style={{
            background: `${t.color}18`,
            border: `1px solid ${t.color}40`,
            color: t.color,
          }}
        >
          {t.image_url
            ? <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
            : t.name.split(" ").map((w) => w[0]).slice(0, 2).join("")
          }
        </div>
        <div className="min-w-0">
          <div
            className="text-[0.88rem] font-bold leading-tight truncate"
            style={{ color: isDark ? "#ffffff" : "#111111" }}
          >
            {t.name}
          </div>
          <div
            className="text-[0.75rem] font-medium uppercase tracking-wider mt-0.5 truncate"
            style={{ color: isDark ? "rgba(180,180,190,0.55)" : "rgba(0,0,0,0.45)" }}
          >
            {t.role}
          </div>
        </div>
      </div>

      {/* Dot navigation */}
      <div className="flex items-center gap-1.5">
        {TEACHERS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              height: "3px",
              width: i === activeTeacher ? "14px" : "4px",
              background: i === activeTeacher ? t.color : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"),
            }}
          />
        ))}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cellClass}
        style={cellStyle}
        onMouseMove={onCellMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        onMouseLeave={onCellLeave as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      className={cellClass}
      style={cellStyle}
      onMouseMove={onCellMove}
      onMouseLeave={onCellLeave}
    >
      {inner}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   VIDEO PRESENTATION CELL — GIF preview + Vimeo modal
══════════════════════════════════════════════════════ */
function VideoPresentationCell({ mobile, fill, isDark }: { mobile?: boolean; fill?: boolean; isDark: boolean }) {
  const [open, setOpen] = useState(false);

  const modal = open ? createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10"
      style={{ background: "rgba(1,0,18,0.92)", backdropFilter: "blur(14px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute -top-10 right-0 flex items-center gap-1.5 text-[0.75rem] font-bold tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
        >
          <span>Chiudi</span>
          <span className="text-lg leading-none font-light">×</span>
        </button>

        {/* 16:9 Vimeo embed */}
        <div
          className="relative w-full rounded-sm overflow-hidden"
          style={{
            paddingBottom: "56.25%",
            background: "#000",
            border: "1px solid rgba(240,146,38,0.18)",
            boxShadow: "0 0 80px rgba(240,146,38,0.1), 0 0 160px rgba(240,146,38,0.04)",
          }}
        >
          <iframe
            src="https://player.vimeo.com/video/1161847546?autoplay=1&title=0&byline=0&portrait=0&dnt=1"
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Bento cell */}
      <div
        className="bento-interactive rounded-sm relative overflow-hidden cursor-pointer group"
        style={
          mobile
            ? {
                width: "100%",
                minHeight: "40vh",
                flexShrink: 0,
                border: `1px solid ${isDark ? "rgba(240,146,38,0.12)" : "rgba(240,146,38,0.2)"}`,
                background: isDark ? "rgba(1,0,18,0.92)" : "rgba(245,243,238,0.95)",
              }
            : fill
            ? {
                flex: "1 1 0%",
                minHeight: 0,
                border: `1px solid ${isDark ? "rgba(240,146,38,0.12)" : "rgba(240,146,38,0.2)"}`,
                background: isDark ? "rgba(1,0,18,0.92)" : "rgba(245,243,238,0.95)",
              }
            : {
                width: "220px",
                flexShrink: 0,
                border: `1px solid ${isDark ? "rgba(240,146,38,0.12)" : "rgba(240,146,38,0.2)"}`,
                background: isDark ? "rgba(1,0,18,0.92)" : "rgba(245,243,238,0.95)",
              }
        }
        onClick={() => setOpen(true)}
        onMouseMove={onCellMove}
        onMouseLeave={onCellLeave}
      >
        {/* GIF background */}
        <img
          src="https://training-hub.lacertosus.com/assets/traininghub-demo-lq.gif.pagespeed.ce.w52WxtgIG2.gif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: 0.85 }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(240,146,38,0.1) 0%, transparent 70%)" }} />

        <div className="relative z-10 h-full flex flex-col justify-between p-5">
          <div
            className="text-[0.75rem] font-bold tracking-[0.28em] uppercase"
            style={{ color: "rgba(180,180,190,0.6)" }}
          >
            Presentazione
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
              style={{
                background: "rgba(240,146,38,0.16)",
                border: "1.5px solid rgba(240,146,38,0.5)",
                boxShadow: "0 0 20px rgba(240,146,38,0.14)",
              }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="#F09226">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
            <div>
              <div
                className="text-[0.75rem] font-bold leading-tight"
                style={{ color: "#ffffff" }}
              >
                Guarda il video
              </div>
              <div
                className="text-[0.75rem] font-medium mt-0.5 uppercase tracking-wide"
                style={{ color: "rgba(180,180,190,0.55)" }}
              >
                Academy in 2 min
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════ */
export function HeroSection({ slides = DEFAULT_HERO_SLIDES }: { slides?: HeroSlide[] }) {
  const sectionRef    = useRef<HTMLElement>(null);
  const bgGridRef     = useRef<HTMLDivElement>(null);
  const scanRef       = useRef<HTMLDivElement>(null);
  const hBeamRef      = useRef<HTMLDivElement>(null);
  const vBeamRef      = useRef<HTMLDivElement>(null);
  const line1Ref      = useRef<HTMLDivElement>(null);
  const line2Ref      = useRef<HTMLDivElement>(null);
  const mainCellRef   = useRef<HTMLDivElement>(null);
  const rightColRef   = useRef<HTMLDivElement>(null);
  const bottomRowRef  = useRef<HTMLDivElement>(null);
  const ctaWrapRef    = useRef<HTMLDivElement>(null);
  const slideContentRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  /* ── Slider state ── */
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  const isTransitioning = useRef(false);
  const isHovering = useRef(false);

  /* ── Slide transition ── */
  const goToSlide = useCallback((idx: number) => {
    if (isTransitioning.current || idx === activeIdxRef.current) return;
    isTransitioning.current = true;
    gsap.to(slideContentRef.current, {
      opacity: 0, y: -8, duration: 0.3, ease: "power2.in",
      onComplete: () => {
        activeIdxRef.current = idx;
        setActiveIdx(idx);
        requestAnimationFrame(() => {
          gsap.fromTo(slideContentRef.current,
            { opacity: 0, y: 12 },
            {
              opacity: 1, y: 0, duration: 0.45, ease: "power2.out",
              onComplete: () => { isTransitioning.current = false; },
            }
          );
        });
      },
    });
  }, []);

  /* ── Auto-advance ── */
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      if (!isHovering.current) {
        goToSlide((activeIdxRef.current + 1) % slides.length);
      }
    }, 5200);
    return () => clearInterval(id);
  }, [slides.length, goToSlide]);

  /* ── GSAP timeline ── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const chars1 = line1Ref.current?.querySelectorAll("[data-char]");
      const chars2 = line2Ref.current?.querySelectorAll("[data-char]");
      const tl = gsap.timeline({ delay: 0.12 });

      /* backgrounds */
      tl.from(bgGridRef.current, { opacity: 0, duration: 2, ease: "power2.out" });

      /* scanning line */
      tl.fromTo(scanRef.current, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.95, ease: "power2.inOut" }, "<0.35");
      tl.to(scanRef.current, { opacity: 0, duration: 0.4 }, "+=0.05");

      /* main cell */
      tl.from(mainCellRef.current, { opacity: 0, y: 32, duration: 0.85, ease: "power3.out" }, "<-0.45");

      /* chars */
      if (chars1?.length) tl.from(chars1, { y: "108%", duration: 0.72, stagger: 0.019, ease: "power3.out" }, "-=0.55");
      if (chars2?.length) tl.from(chars2, { y: "108%", duration: 0.72, stagger: 0.019, ease: "power3.out" }, "-=0.56");

      /* sub-elements */
      tl.from(mainCellRef.current?.querySelectorAll("[data-hero-sub]") ?? [], {
        opacity: 0, y: 18, duration: 0.5, stagger: 0.12, ease: "power2.out",
      }, "-=0.3");

      /* right column */
      if (rightColRef.current) {
        tl.from(Array.from(rightColRef.current.children), {
          opacity: 0, x: 28, duration: 0.6, stagger: 0.1, ease: "power3.out",
        }, "-=0.45");
      }

      /* bottom row — fromTo to guarantee final y:0 */
      if (bottomRowRef.current) {
        tl.fromTo(
          Array.from(bottomRowRef.current.children),
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.09, ease: "power3.out" },
          "-=0.35"
        );
      }


      /* ── Light beams — horizontal sweep ── */
      const hTl = gsap.timeline({ repeat: -1, delay: 4, repeatDelay: 7 });
      hTl
        .set(hBeamRef.current, { top: "0%", opacity: 0 })
        .to(hBeamRef.current, { opacity: 1, duration: 0.4, ease: "power2.out" })
        .to(hBeamRef.current, { top: "105%", duration: 5, ease: "none" }, "<")
        .to(hBeamRef.current, { opacity: 0, duration: 0.5, ease: "power2.in" }, "-=0.5");

      /* ── Light beams — vertical sweep ── */
      const vTl = gsap.timeline({ repeat: -1, delay: 9, repeatDelay: 10 });
      vTl
        .set(vBeamRef.current, { left: "0%", opacity: 0 })
        .to(vBeamRef.current, { opacity: 1, duration: 0.4, ease: "power2.out" })
        .to(vBeamRef.current, { left: "105%", duration: 7, ease: "none" }, "<")
        .to(vBeamRef.current, { opacity: 0, duration: 0.5, ease: "power2.in" }, "-=0.5");

      /* scroll parallax */
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.85,
        onUpdate: (self) => {
          const p = self.progress;
          if (mainCellRef.current)  gsap.set(mainCellRef.current,  { y: p * 40, opacity: 1 - p * 1.2 });
          if (rightColRef.current)  gsap.set(rightColRef.current,  { y: p * 28 });
          if (bottomRowRef.current) gsap.set(bottomRowRef.current, { y: p * 16 });
          if (bgGridRef.current)    gsap.set(bgGridRef.current,    { y: p * 55 });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Magnetic CTA ── */
  useEffect(() => {
    const el = ctaWrapRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * 0.28, y: (e.clientY - (r.top + r.height / 2)) * 0.28, duration: 0.4, ease: "power2.out" });
    };
    const handleLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: "elastic.out(1, 0.5)" });
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => { el.removeEventListener("mousemove", handleMove); el.removeEventListener("mouseleave", handleLeave); };
  }, []);

  const slide = slides[activeIdx] ?? slides[0];

  /* ── Computed theme values ── */
  const sectionBg = d ? "#010015" : "#f5f3ee";
  const cardBg    = d ? "rgba(2,0,38,0.75)"   : "rgba(255,255,255,0.92)";
  const cardBorder = d ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.08)";
  const accentCardBg = d ? "rgba(8,4,40,0.85)" : "rgba(255,250,242,0.95)";
  const accentBorder = d ? "rgba(240,146,38,0.18)" : "rgba(240,146,38,0.2)";
  const titleColor = d ? "#ffffff" : "#111111";
  const descColor  = d ? "rgba(160,155,175,1)" : "#666666";
  const labelColor = d ? "rgba(180,180,190,0.6)" : "rgba(0,0,0,0.4)";
  const subtitleColor = d ? "rgba(160,155,175,0.85)" : "#777777";
  const slideOverlay = "linear-gradient(160deg, rgba(1,0,18,0.22) 0%, rgba(1,0,18,0.42) 100%)";
  const inactiveDot = d ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)";
  const dividerColor = d ? "rgba(240,146,38,0.15)" : "rgba(240,146,38,0.2)";
  const bottomGradient = d ? "rgba(1,0,24,0.97)" : "rgba(245,243,238,0.97)";

  /* ────────────────────────── JSX ────────────────────────── */
  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: sectionBg }}>

      {/* Particles */}
      <ParticleField isDark={d} />

      {/* BG Grid */}
      <div ref={bgGridRef} className="absolute inset-0" style={{
        opacity: d ? 0.22 : 0.07,
        backgroundImage:
          "linear-gradient(rgba(240,146,38,1) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(240,146,38,1) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }} />


      {/* Horizontal light beam */}
      <div ref={hBeamRef} className="pointer-events-none absolute left-0 right-0 z-[1]" style={{
        height: "180px",
        background: "linear-gradient(180deg, transparent 0%, rgba(240,146,38,0.06) 40%, rgba(212,175,55,0.08) 50%, rgba(240,146,38,0.06) 60%, transparent 100%)",
        top: 0, opacity: 0,
      }} />

      {/* Vertical light beam */}
      <div ref={vBeamRef} className="pointer-events-none absolute top-0 bottom-0 z-[1]" style={{
        width: "180px",
        background: "linear-gradient(90deg, transparent 0%, rgba(240,146,38,0.05) 40%, rgba(212,175,55,0.07) 50%, rgba(240,146,38,0.05) 60%, transparent 100%)",
        left: 0, opacity: 0,
      }} />

      {/* Scan line */}
      <div ref={scanRef} className="pointer-events-none absolute left-0 top-1/2 h-px w-full origin-left" style={{
        background: "linear-gradient(90deg, transparent, rgba(240,146,38,0.55) 25%, rgba(212,175,55,0.35) 50%, rgba(240,146,38,0.55) 75%, transparent)",
      }} />

      {/* Side decoration lines */}
      {["left-5", "right-5"].map((side) => (
        <div key={side} className={`pointer-events-none absolute top-20 bottom-16 ${side} hidden w-px xl:block`} style={{
          background: "linear-gradient(180deg, transparent, rgba(240,146,38,0.12) 30%, rgba(240,146,38,0.12) 70%, transparent)",
        }} />
      ))}

      {/* ════════════════════════════════════════════════════
          DESKTOP BENTO (lg+)
      ════════════════════════════════════════════════════ */}
      <div className="relative z-10 hidden lg:flex flex-1 flex-col mx-auto w-full max-w-[1440px] px-[5%] md:px-10 pt-[88px] pb-8">

        {/* Top row: main + right column */}
        <div className="flex flex-1 gap-3 min-h-0">

          {/* ── MAIN CELL — slider, no-tilt ── */}
          <div
            ref={mainCellRef}
            data-no-tilt="1"
            className="bento-interactive rounded-sm flex flex-col p-9 relative overflow-hidden"
            style={{
              flex: "1 1 0%",
              background: "rgba(2,0,38,0.75)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
            onMouseMove={onCellMove}
            onMouseEnter={() => { isHovering.current = true; }}
            onMouseLeave={(e) => { isHovering.current = false; onCellLeave(e); }}
          >
            <Brackets color="rgba(240,146,38,0.22)" />

            {/* Slide background image */}
            {slide.bg_image_url && (
              <div className="absolute inset-0 z-0" style={{
                backgroundImage: `url(${slide.bg_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}>
                <div className="absolute inset-0" style={{ background: slideOverlay }} />
              </div>
            )}

            {/* Badge */}
            <div data-hero-sub className="flex items-center gap-2.5 mb-auto relative z-10">
              <span className="h-1.5 w-1.5 rounded-full bg-academy-gold flex-shrink-0" style={{ boxShadow: "0 0 8px rgba(212,175,55,0.6)" }} />
              <span className="text-[0.75rem] font-bold tracking-[0.3em] text-academy-orange uppercase">
                Certificazione FIPE × LACERTOSUS Inclusa
              </span>
            </div>

            {/* Slide content — fades in/out on transition */}
            <div ref={slideContentRef} className="my-auto py-5 relative z-10">
              <div ref={line1Ref}>
                <SplitLine
                  text={slide.title_white}
                  className="text-[clamp(2.2rem,4.6vw,5.8rem)] font-black tracking-[-0.03em]"
                  style={{ color: "#ffffff" }}
                />
              </div>
              <div ref={line2Ref} className="mt-1">
                <SplitLine
                  text={slide.title_orange}
                  className="text-[clamp(2.2rem,4.6vw,5.8rem)] font-black tracking-[-0.03em]"
                  style={{ color: "#F09226" }}
                />
              </div>
              <p data-hero-sub className="mt-6 max-w-md text-[clamp(0.78rem,1.05vw,0.94rem)] leading-[1.75]" style={{ color: "rgba(160,155,175,1)" }}>
                {slide.description}
              </p>
              {slide.cta_href && slide.cta_label && (
                <Link
                  href={slide.cta_href}
                  className="mt-5 inline-flex items-center gap-2.5 text-[0.75rem] font-bold tracking-[0.18em] uppercase text-academy-orange hover:text-academy-orange-light transition-colors duration-200"
                >
                  {slide.cta_label}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              )}
            </div>

            {/* Path indicator */}
            <div data-hero-sub className="mt-auto relative z-10">
              <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, rgba(240,146,38,0.15), transparent)" }} />
              <div className="flex items-center gap-4 text-[0.75rem] font-black tracking-[0.3em] uppercase">
                <span style={{ color: "#CD7F32" }}>CORPUS</span>
                <span style={{ color: "rgba(240,146,38,0.2)", letterSpacing: "0.05em" }}>———</span>
                <span style={{ color: "#C0C0C0" }}>VIS</span>
                <span style={{ color: "rgba(240,146,38,0.2)", letterSpacing: "0.05em" }}>———</span>
                <span style={{ color: "#D4AF37" }}>VICTOR</span>
              </div>
            </div>

            {/* Slide navigation dots */}
            {slides.length > 1 && (
              <div className="absolute bottom-5 right-5 flex items-center gap-1.5 z-10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className="rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      height: "4px",
                      width: i === activeIdx ? "18px" : "5px",
                      background: i === activeIdx ? "#F09226" : "rgba(255,255,255,0.18)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div
            ref={rightColRef}
            className="flex flex-col gap-3 flex-shrink-0 min-h-0"
            style={{ width: "252px" }}
          >
            {/* Durata */}
            <div
              className="bento-interactive rounded-sm p-5 flex flex-col justify-between relative overflow-hidden min-h-0 hide-short-screen"
              style={{
                flex: "1 1 0%",
                background: accentCardBg,
                border: `1px solid ${accentBorder}`,
              }}
              onMouseMove={onCellMove}
              onMouseLeave={onCellLeave}
            >
              <StatRing pct={0.75} size={46} color="#F09226" />
              <div className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/80 uppercase">Durata percorso</div>
              <div>
                <div className="text-[3.8rem] font-black text-academy-orange tabular-nums leading-none">9</div>
                <div className="text-[0.75rem] font-semibold uppercase tracking-wider mt-0.5" style={{ color: subtitleColor }}>mesi di formazione</div>
              </div>
            </div>

            {/* Video Presentazione */}
            <VideoPresentationCell isDark={d} fill />

            {/* FIPE Cert */}
            <div
              className="bento-interactive rounded-sm p-5 flex flex-col justify-between relative overflow-hidden min-h-0"
              style={{
                flex: "1 1 0%",
                background: d ? "rgba(8,6,30,0.9)" : "rgba(252,250,240,0.95)",
                border: `1px solid ${d ? "rgba(212,175,55,0.18)" : "rgba(212,175,55,0.25)"}`,
              }}
              onMouseMove={onCellMove}
              onMouseLeave={onCellLeave}
            >
              <div className="absolute inset-0" style={{
                background: "radial-gradient(ellipse at 30% 30%, rgba(212,175,55,0.18) 0%, transparent 68%)",
              }} />
              <div className="relative text-[0.75rem] font-bold tracking-[0.28em] text-academy-gold/75 uppercase">
                Certificazione Ufficiale
              </div>
              <div className="relative flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full border border-academy-gold/30 flex-shrink-0 flex items-center justify-center"
                  style={{ background: "radial-gradient(circle, rgba(212,175,55,0.16) 0%, transparent 70%)" }}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <path d="M12 2L3 7v6c0 5.25 3.75 10.18 9 11.25C17.25 23.18 21 18.25 21 13V7L12 2z"
                      stroke="#D4AF37" strokeWidth="1.3" fill="rgba(212,175,55,0.1)" />
                    <path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-[1.15rem] font-black text-academy-gold tracking-tight leading-none">FIPE</div>
                  <div className="text-[0.75rem] text-academy-gold/60 tracking-[0.25em] my-0.5">×</div>
                  <div className="text-[0.75rem] font-black text-academy-gold/90 tracking-[0.14em]">LACERTOSUS</div>
                </div>
              </div>
              <div className="relative text-[0.75rem] font-semibold tracking-[0.15em] text-academy-gold/60 uppercase">
                Riconosciuta a livello nazionale
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: CTA | Teachers | Workshop | Presenza ── */}
        <div ref={bottomRowRef} className="flex gap-3 mt-3" style={{ height: "138px" }}>

          {/* ① CTA — leftmost, flex-1 */}
          <div
            className="bento-interactive rounded-sm px-6 py-5 flex flex-col items-center justify-center gap-3.5 relative overflow-hidden"
            style={{
              flex: "3 1 0%",
              background: accentCardBg,
              border: `1px solid ${accentBorder}`,
            }}
            onMouseMove={onCellMove}
            onMouseLeave={onCellLeave}
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse at 50% 50%, rgba(240,146,38,0.1) 0%, transparent 70%)",
            }} />
            <div ref={ctaWrapRef} className="w-full relative z-10">
              <Link
                href="#pack"
                className="group flex items-center justify-center gap-2.5 w-full font-black text-[0.75rem] tracking-[0.2em] uppercase py-4 px-5 transition-all duration-200"
                style={{ background: "#F09226", color: "#010015" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5a84d"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F09226"; }}
              >
                Scopri i Pack
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">→</span>
              </Link>
            </div>
            <div className="w-full flex items-center gap-2 relative z-10">
              <div className="flex-1 h-px" style={{ background: "rgba(240,146,38,0.18)" }} />
              <span className="text-[0.75rem] font-bold tracking-[0.22em] uppercase" style={{ color: labelColor }}>oppure</span>
              <div className="flex-1 h-px" style={{ background: "rgba(240,146,38,0.18)" }} />
            </div>
            <Link
              href="/percorso"
              className="group relative z-10 flex items-center gap-2 text-[0.75rem] font-semibold tracking-[0.14em] uppercase hover:text-academy-orange transition-colors duration-200"
              style={{ color: subtitleColor }}
            >
              Il Percorso Completo
            </Link>
          </div>

          {/* ② Docenti */}
          <TeachersCell isDark={d} fill href="/docenti" />

          {/* ③ 8 Masterclass */}
          <Link
            href="/masterclass"
            className="bento-interactive rounded-sm p-5 flex flex-col justify-between relative overflow-hidden"
            style={{ flex: "2 1 0%", background: cardBg, border: `1px solid ${cardBorder}` }}
            onMouseMove={onCellMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
            onMouseLeave={onCellLeave as unknown as React.MouseEventHandler<HTMLAnchorElement>}
          >
            <div className="text-[0.75rem] font-bold tracking-[0.25em] uppercase" style={{ color: labelColor }}>Masterclass</div>
            <div>
              <div className="text-[3.6rem] font-black tabular-nums leading-none" style={{ color: titleColor }}>8</div>
              <div className="text-[0.75rem] font-semibold uppercase tracking-wider mt-0.5" style={{ color: subtitleColor }}>specialistici</div>
            </div>
          </Link>

          {/* ④ 100% Presenza */}
          <div
            className="bento-interactive rounded-sm p-5 flex flex-col justify-between relative overflow-hidden"
            style={{ flex: "2 1 0%", background: cardBg, border: `1px solid ${cardBorder}` }}
            onMouseMove={onCellMove}
            onMouseLeave={onCellLeave}
          >
            <div className="text-[0.75rem] font-bold tracking-[0.25em] uppercase" style={{ color: labelColor }}>Modalità</div>
            <div>
              <div className="text-[3rem] font-black tabular-nums leading-none" style={{ color: titleColor }}>
                100<span className="text-xl" style={{ color: "#F09226" }}>%</span>
              </div>
              <div className="text-[0.75rem] font-semibold uppercase tracking-wider mt-0.5" style={{ color: subtitleColor }}>in presenza</div>
            </div>
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MOBILE / TABLET LAYOUT (< lg)
      ════════════════════════════════════════════════════ */}
      <div className="relative z-10 lg:hidden flex flex-col w-full px-[5%] pt-24 pb-12 gap-3">

        {/* ① SLIDER */}
        <div
          className="rounded-sm p-6 relative overflow-hidden flex flex-col"
          style={{ minHeight: "52vh", background: "rgba(2,0,38,0.75)", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          {slide.bg_image_url && (
            <div className="absolute inset-0 z-0" style={{
              backgroundImage: `url(${slide.bg_image_url})`,
              backgroundSize: "cover", backgroundPosition: "center",
            }}>
              <div className="absolute inset-0" style={{ background: slideOverlay }} />
            </div>
          )}
          {/* Content */}
          <div className="relative z-10 flex-1">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-academy-gold flex-shrink-0" style={{ boxShadow: "0 0 6px rgba(212,175,55,0.6)" }} />
              <span className="text-[0.75rem] font-bold tracking-[0.3em] text-academy-orange uppercase">Certificazione FIPE × LACERTOSUS Inclusa</span>
            </div>
            {/* Title */}
            <SplitLine text={slide.title_white} className="text-[clamp(2.2rem,10vw,3.6rem)] font-black tracking-[-0.025em]" style={{ color: "#ffffff" }} />
            <SplitLine text={slide.title_orange} className="text-[clamp(2.2rem,10vw,3.6rem)] font-black tracking-[-0.025em]" style={{ color: "#F09226" }} />
            <p className="mt-4 text-[0.88rem] leading-relaxed" style={{ color: "rgba(160,155,175,1)" }}>{slide.description}</p>
            {slide.cta_href && slide.cta_label && (
              <Link href={slide.cta_href} className="mt-4 inline-flex items-center gap-2 text-[0.75rem] font-bold tracking-[0.18em] uppercase text-academy-orange">
                {slide.cta_label} →
              </Link>
            )}
          </div>
          {/* Path — pinned to bottom */}
          <div className="relative z-10 mt-4">
            <div className="h-px mb-3" style={{ background: "linear-gradient(90deg, rgba(240,146,38,0.15), transparent)" }} />
            <div className="flex items-center gap-3 text-[0.75rem] font-black tracking-[0.28em] uppercase">
              <span style={{ color: "#CD7F32" }}>PRIMAL</span>
              <span style={{ color: "rgba(240,146,38,0.2)" }}>—</span>
              <span style={{ color: "#C0C0C0" }}>VIS</span>
              <span style={{ color: "rgba(240,146,38,0.2)" }}>—</span>
              <span style={{ color: "#D4AF37" }}>VICTOR</span>
            </div>
          </div>
          {/* Slide dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-10">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goToSlide(i)} className="rounded-full transition-all duration-300" style={{
                  height: "4px",
                  width: i === activeIdx ? "16px" : "5px",
                  background: i === activeIdx ? "#F09226" : "rgba(255,255,255,0.18)",
                }} />
              ))}
            </div>
          )}
        </div>

        {/* ② CTA */}
        <div
          className="rounded-sm px-5 py-4 flex flex-col items-center gap-3 relative overflow-hidden"
          style={{ background: accentCardBg, border: `1px solid ${accentBorder}` }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(240,146,38,0.08) 0%, transparent 70%)",
          }} />
          <Link href="#pack" className="w-full text-center font-black text-[0.8rem] tracking-[0.2em] uppercase py-3.5 relative z-10 transition-colors"
            style={{ background: "#F09226", color: "#010015" }}>
            Scopri i Pack →
          </Link>
          <div className="w-full flex items-center gap-2 relative z-10">
            <div className="flex-1 h-px" style={{ background: "rgba(240,146,38,0.18)" }} />
            <span className="text-[0.75rem] font-bold tracking-[0.22em] uppercase" style={{ color: labelColor }}>oppure</span>
            <div className="flex-1 h-px" style={{ background: "rgba(240,146,38,0.18)" }} />
          </div>
          <Link href="/percorso" className="relative z-10 flex items-center gap-2 text-[0.75rem] font-semibold tracking-[0.14em] uppercase" style={{ color: subtitleColor }}>
            Il Percorso Completo
          </Link>
        </div>

        {/* ③ DURATA */}
        <div
          className="rounded-sm p-4 flex flex-col justify-between relative overflow-hidden"
          style={{ height: "110px", background: accentCardBg, border: `1px solid ${accentBorder}` }}
        >
          <div className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/80 uppercase">Durata percorso</div>
          <div className="flex items-baseline gap-3">
            <div className="text-[2.8rem] font-black text-academy-orange tabular-nums leading-none">9</div>
            <div className="text-[0.75rem] font-semibold uppercase tracking-wider" style={{ color: subtitleColor }}>mesi di formazione</div>
          </div>
        </div>

        {/* ④ CERTIFICAZIONE */}
        <div
          className="rounded-sm p-6 flex flex-col justify-between relative overflow-hidden"
          style={{
            minHeight: "25vh",
            background: d ? "rgba(8,6,30,0.9)" : "rgba(252,250,240,0.95)",
            border: `1px solid ${d ? "rgba(212,175,55,0.18)" : "rgba(212,175,55,0.25)"}`,
          }}
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(212,175,55,0.15) 0%, transparent 65%)" }} />
          <div className="relative text-[0.75rem] font-bold tracking-[0.25em] text-academy-gold/75 uppercase">Certificazione Ufficiale</div>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border border-academy-gold/30 flex-shrink-0 flex items-center justify-center"
              style={{ background: "radial-gradient(circle, rgba(212,175,55,0.16) 0%, transparent 70%)" }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                <path d="M12 2L3 7v6c0 5.25 3.75 10.18 9 11.25C17.25 23.18 21 18.25 21 13V7L12 2z"
                  stroke="#D4AF37" strokeWidth="1.3" fill="rgba(212,175,55,0.1)" />
                <path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[1.6rem] font-black text-academy-gold leading-none">FIPE</span>
                <span className="text-[0.75rem] text-academy-gold/60 tracking-[0.2em]">×</span>
                <span className="text-[1rem] font-black text-academy-gold/90 tracking-[0.14em]">LACERTOSUS</span>
              </div>
            </div>
          </div>
          <div className="relative text-[0.75rem] font-semibold tracking-[0.15em] text-academy-gold/55 uppercase">Riconosciuta a livello nazionale</div>
        </div>

        {/* ⑤ VIDEO PRESENTAZIONE */}
        <VideoPresentationCell mobile isDark={d} />

        {/* ⑥ DOCENTI */}
        <TeachersCell mobile isDark={d} href="/docenti" />

        {/* ⑦ MASTERCLASS + MODALITÀ */}
        <div className="flex gap-3" style={{ height: "110px" }}>
          <Link
            href="/masterclass"
            className="rounded-sm p-4 flex flex-col justify-between relative overflow-hidden"
            style={{ flex: "1 1 0%", background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div className="text-[0.75rem] font-bold tracking-[0.25em] uppercase" style={{ color: labelColor }}>Masterclass</div>
            <div>
              <div className="text-[2.4rem] font-black tabular-nums leading-none" style={{ color: titleColor }}>8</div>
              <div className="text-[0.75rem] font-semibold uppercase tracking-wider mt-0.5" style={{ color: subtitleColor }}>specialistici</div>
            </div>
          </Link>
          <div
            className="rounded-sm p-4 flex flex-col justify-between relative overflow-hidden"
            style={{ flex: "1 1 0%", background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div className="text-[0.75rem] font-bold tracking-[0.25em] uppercase" style={{ color: labelColor }}>Modalità</div>
            <div>
              <div className="text-[2.2rem] font-black tabular-nums leading-none" style={{ color: titleColor }}>
                100<span className="text-base" style={{ color: "#F09226" }}>%</span>
              </div>
              <div className="text-[0.75rem] font-semibold uppercase tracking-wider mt-0.5" style={{ color: subtitleColor }}>in presenza</div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom gradient — bleeds into social proof */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28" style={{
        background: `linear-gradient(to bottom, transparent, ${bottomGradient})`,
      }} />
    </section>
  );
}

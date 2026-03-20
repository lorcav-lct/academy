"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { getBundles, type AcademyProduct } from "@/lib/constants/packs";
import { getTeachersByCourse, type Teacher } from "@/lib/constants/teachers";
import { MasterclassSelector } from "@/components/packs/masterclass-selector";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER: Record<string, { color: string; rgb: string; label: string; roman: string }> = {
  bronzo:  { color: "#CD7F32", rgb: "205,127,50",  label: "BRONZO",  roman: "I"   },
  argento: { color: "#C0C0C0", rgb: "192,192,192", label: "ARGENTO", roman: "II"  },
  oro:     { color: "#D4AF37", rgb: "212,175,55",  label: "ORO",     roman: "III" },
};

const BLOCK_SLUGS = ["corpus", "vis", "victor"] as const;
const BLOCK_LABELS: Record<string, string> = { corpus: "CORPUS", vis: "VIS", victor: "VICTOR" };

function getBundleTeachers(): Record<string, Teacher[]> {
  return {
    corpus: getTeachersByCourse("corpus"),
    vis:    getTeachersByCourse("vis"),
    victor: getTeachersByCourse("victor"),
  };
}

// ─── Initials ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// ─── Pack Modal ───────────────────────────────────────────────────────────────

function PackModal({
  pack,
  onClose,
  onBuy,
}: {
  pack: AcademyProduct;
  onClose: () => void;
  onBuy: (pack: AcademyProduct) => void;
}) {
  const tier = TIER[pack.slug] ?? TIER.bronzo;
  const teachers = getBundleTeachers();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  // Entrance animation + load video after mount
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "power2.out" });
    tl.fromTo(panelRef.current, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.1");
    // Load video after animation
    const timeout = setTimeout(() => {
      setVideoSrc("https://player.vimeo.com/video/1161847546?autoplay=0&title=0&byline=0&portrait=0&dnt=1");
    }, 400);

    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function close() {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panelRef.current, { opacity: 0, y: 24, duration: 0.28, ease: "power2.in" });
    tl.to(overlayRef.current, { opacity: 0, duration: 0.18 }, "-=0.1");
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex items-stretch justify-center"
      style={{ background: "rgba(1,0,18,0.88)", backdropFilter: "blur(16px)" }}
      onClick={close}
    >
      <div
        ref={panelRef}
        className="relative flex w-full max-w-[1180px] m-auto flex-col lg:flex-row overflow-hidden rounded-sm"
        style={{ border: `1px solid ${tier.color}28`, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── LEFT: Info ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-7 overflow-y-auto p-8 lg:w-[44%] lg:p-10"
          style={{ background: "rgba(2,0,32,0.97)" }}
        >
          {/* Tier badge */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center text-sm font-black"
              style={{ border: `2px solid ${tier.color}60`, color: tier.color }}
            >
              {tier.roman}
            </div>
            <span className="text-xs font-black tracking-[0.32em] uppercase" style={{ color: tier.color }}>
              Pack {tier.label}
            </span>
          </div>

          {/* Name + subtitle */}
          <div>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-black leading-[0.95] tracking-tight text-white">
              {pack.name}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-academy-gray-400">{pack.subtitle}</p>
          </div>

          {/* Includes */}
          <div>
            <p className="mb-4 text-[0.7rem] font-black tracking-[0.3em] uppercase" style={{ color: `${tier.color}80` }}>
              Cosa include
            </p>
            <ul className="space-y-3">
              {pack.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-academy-gray-300">
                  <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: tier.color }}>
                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth={2} strokeLinecap="square" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Teachers */}
          <div>
            <p className="mb-4 text-[0.7rem] font-black tracking-[0.3em] uppercase" style={{ color: `${tier.color}80` }}>
              I Docenti
            </p>
            <div className="space-y-4">
              {BLOCK_SLUGS.map((slug) => (
                <div key={slug}>
                  <p className="mb-2 text-[0.65rem] font-bold tracking-[0.25em] uppercase text-academy-gray-600">
                    {BLOCK_LABELS[slug]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {teachers[slug].map((t) => (
                      <div
                        key={t.slug}
                        className="flex items-center gap-2 rounded-full px-2.5 py-1.5"
                        style={{ background: `${t.color}10`, border: `1px solid ${t.color}28` }}
                        title={t.role}
                      >
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.55rem] font-black"
                          style={{ background: `${t.color}22`, color: t.color }}
                        >
                          {t.image_url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={t.image_url} alt={t.name} className="h-full w-full rounded-full object-cover" />
                            : initials(t.name)
                          }
                        </div>
                        <span className="text-[0.72rem] font-semibold leading-none text-academy-gray-300 whitespace-nowrap">
                          {t.name.split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-auto pt-2">
            <button
              onClick={() => onBuy(pack)}
              className="w-full py-4 text-center text-sm font-black tracking-[0.18em] uppercase transition-all duration-200"
              style={{
                background: tier.color,
                color: pack.slug === "argento" ? "#111111" : "#010015",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              Scegli {tier.label} →
            </button>
            <p className="mt-3 text-center text-[0.7rem] text-academy-gray-600">
              Nessun pagamento richiesto ora · Completa il profilo per procedere
            </p>
          </div>
        </div>

        {/* ── RIGHT: Video ────────────────────────────────────────────── */}
        <div
          className="relative flex flex-col justify-center lg:w-[56%]"
          style={{ background: "rgba(1,0,20,0.98)" }}
        >
          {/* Tier glow BG */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 60% 40%, rgba(${tier.rgb},0.07) 0%, transparent 65%)` }}
          />

          <div className="relative z-10 p-6 lg:p-10">
            <p className="mb-4 text-[0.7rem] font-black tracking-[0.3em] uppercase" style={{ color: `${tier.color}80` }}>
              L&apos;Academy in 2 minuti
            </p>

            {/* 16:9 video container */}
            <div
              className="relative w-full overflow-hidden"
              style={{
                paddingBottom: "56.25%",
                background: "#000",
                border: `1px solid ${tier.color}20`,
                boxShadow: `0 0 60px rgba(${tier.rgb},0.08)`,
              }}
            >
              {videoSrc ? (
                <iframe
                  src={videoSrc}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                /* Placeholder while loading */
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      background: `rgba(${tier.rgb},0.14)`,
                      border: `1.5px solid rgba(${tier.rgb},0.4)`,
                      boxShadow: `0 0 24px rgba(${tier.rgb},0.15)`,
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill={tier.color}>
                      <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Stat strip below video */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { val: "9", label: "mesi" },
                { val: "100%", label: "in presenza" },
                { val: "33+", label: "docenti" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 p-3 text-center"
                  style={{ border: `1px solid rgba(${tier.rgb},0.12)` }}
                >
                  <span className="text-xl font-black" style={{ color: tier.color }}>{s.val}</span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-academy-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={close}
          className="absolute right-5 top-5 z-20 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.22em] uppercase text-white/40 hover:text-white/80 transition-colors"
        >
          Chiudi <span className="text-lg font-light">×</span>
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Cell tilt helpers ────────────────────────────────────────────────────────

function onMove(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
  e.currentTarget.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
  const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
  gsap.to(e.currentTarget, { rotateX: -dy * 3, rotateY: dx * 3, duration: 0.5, ease: "power2.out", transformPerspective: 900 });
}
function onLeave(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
}

// ─── Pack Card ────────────────────────────────────────────────────────────────

function PackCard({
  pack,
  isDark,
  onClick,
}: {
  pack: AcademyProduct;
  isDark: boolean;
  onClick: () => void;
}) {
  const tier = TIER[pack.slug] ?? TIER.bronzo;
  const teachers = getBundleTeachers();
  // Count total teachers across all blocks
  const totalTeachers = BLOCK_SLUGS.reduce((acc, s) => acc + teachers[s].length, 0);
  // Take first 5 teacher avatars to show as a strip
  const avatarTeachers = BLOCK_SLUGS.flatMap((s) => teachers[s]).slice(0, 5);

  const isHighlighted = pack.highlighted;

  return (
    <div
      data-pack-card
      className="bento-interactive relative flex cursor-pointer flex-col overflow-hidden rounded-sm"
      style={{
        background: isDark
          ? `linear-gradient(160deg, rgba(${tier.rgb},0.06) 0%, rgba(2,0,32,0.95) 100%)`
          : `linear-gradient(160deg, rgba(${tier.rgb},0.08) 0%, rgba(255,255,255,0.98) 100%)`,
        border: isHighlighted
          ? `2px solid ${tier.color}55`
          : `1px solid rgba(${tier.rgb},0.18)`,
        boxShadow: isHighlighted
          ? `0 0 60px rgba(${tier.rgb},0.1), 0 20px 80px rgba(0,0,0,0.3)`
          : undefined,
        transform: isHighlighted ? "scale(1.025)" : undefined,
      }}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}00)` }} />

      {isHighlighted && (
        <div
          className="py-1.5 text-center text-[0.65rem] font-black tracking-[0.25em] uppercase"
          style={{ background: `${tier.color}18`, color: tier.color }}
        >
          Più scelto
        </div>
      )}

      <div className="flex flex-1 flex-col gap-5 p-7 lg:p-8">
        {/* Roman numeral + tier */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[0.65rem] font-black tracking-[0.35em] uppercase" style={{ color: `${tier.color}80` }}>
              Pack
            </span>
            <div
              className="mt-1 text-[clamp(2.6rem,3.8vw,4rem)] font-black leading-none tracking-tight"
              style={{ color: tier.color }}
            >
              {tier.label}
            </div>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center text-xl font-black opacity-25"
            style={{ border: `1px solid ${tier.color}`, color: tier.color }}
          >
            {tier.roman}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(180,180,190,0.65)" : "#666666" }}>
          {pack.subtitle}
        </p>

        {/* Blocks included */}
        <div className="flex flex-col gap-2">
          {BLOCK_SLUGS.map((slug) => (
            <div key={slug} className="flex items-center gap-2.5">
              <span className="h-1 w-1 shrink-0" style={{ background: tier.color }} />
              <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#444" }}>
                {BLOCK_LABELS[slug]}
              </span>
            </div>
          ))}
          {(pack.masterclassSelectionCount ?? 0) > 0 && (
            <div className="flex items-center gap-2.5">
              <span className="h-1 w-1 shrink-0" style={{ background: tier.color }} />
              <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: `${tier.color}cc` }}>
                {pack.masterclassSelectionCount} Masterclass a scelta
              </span>
            </div>
          )}
          {pack.includesAccommodation && (
            <div className="flex items-center gap-2.5">
              <span className="h-1 w-1 shrink-0" style={{ background: tier.color }} />
              <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: `${tier.color}cc` }}>
                Vitto &amp; Alloggio
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          {/* Teacher avatars strip */}
          <div className="flex items-center">
            {avatarTeachers.map((t, i) => (
              <div
                key={t.slug}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[0.55rem] font-black"
                style={{
                  background: `${t.color}22`,
                  border: `1.5px solid ${isDark ? "rgba(1,0,18,0.8)" : "#fff"}`,
                  color: t.color,
                  marginLeft: i === 0 ? 0 : "-8px",
                  zIndex: avatarTeachers.length - i,
                  position: "relative",
                }}
                title={t.name}
              >
                {t.image_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={t.image_url} alt={t.name} className="h-full w-full rounded-full object-cover" />
                  : initials(t.name)
                }
              </div>
            ))}
            <span className="ml-2 text-[0.7rem] font-semibold" style={{ color: isDark ? "rgba(180,180,190,0.5)" : "#999" }}>
              +{totalTeachers - avatarTeachers.length} docenti
            </span>
          </div>

          {/* Arrow CTA */}
          <div
            className="flex items-center gap-1.5 text-[0.75rem] font-black tracking-[0.15em] uppercase transition-all duration-200"
            style={{ color: tier.color }}
          >
            Esplora
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PackPreview() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  const [activeModal, setActiveModal] = useState<AcademyProduct | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<AcademyProduct | null>(null);

  const bundles = getBundles();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
        opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
      });
      const cards = cardsRef.current?.querySelectorAll("[data-pack-card]");
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: { trigger: cardsRef.current, start: "top 78%", once: true },
          opacity: 0, y: 50, duration: 0.75, stagger: 0.14, ease: "power3.out",
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  async function handleBuy(pack: AcademyProduct) {
    setActiveModal(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const dest = `/checkout?pack=${pack.slug}`;

    if (!user) {
      localStorage.setItem("pending_checkout", dest);
      window.location.href = `/auth/register?next=${encodeURIComponent(dest)}`;
      return;
    }

    if ((pack.masterclassSelectionCount ?? 0) > 0) {
      setSelectedPack(pack);
      setSelectorOpen(true);
    } else {
      window.location.href = dest;
    }
  }

  function handleSelectorConfirm(slugs: string[]) {
    setSelectorOpen(false);
    if (!selectedPack) return;
    const params = new URLSearchParams({ pack: selectedPack.slug });
    if (slugs[0]) params.set("mc1", slugs[0]);
    if (slugs[1]) params.set("mc2", slugs[1]);
    router.push(`/checkout?${params.toString()}`);
  }

  const th = d ? undefined : "#111111";
  const tb = d ? undefined : "#555555";

  return (
    <>
      <section
        ref={sectionRef}
        id="pack"
        className="themed-section relative overflow-hidden py-24 md:py-32"
      >
        <div className="absolute inset-0 section-bg-alt" />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(240,146,38,0.03) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">

          {/* Header */}
          <div ref={headRef} className="mb-14">
            <span className="label-tag mb-3 block">I Pacchetti Formativi</span>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2
                className="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight"
                style={{ color: th }}
              >
                Costruisci il tuo{" "}
                <span className="gradient-text">percorso.</span>
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-academy-gray-400" style={{ color: tb }}>
                Tre livelli di accesso allo stesso percorso d&apos;eccellenza. Clicca su un pack per scoprire tutti i dettagli.
              </p>
            </div>
          </div>

          {/* Cards */}
          <div
            ref={cardsRef}
            className="grid gap-4 md:grid-cols-3"
            style={{ perspective: "1200px" }}
          >
            {bundles.map((pack) => (
              <PackCard
                key={pack.slug}
                pack={pack}
                isDark={d}
                onClick={() => setActiveModal(pack)}
              />
            ))}
          </div>

          {/* Footer note */}
          <div
            className="mt-6 flex items-center gap-3 p-4"
            style={{ border: "1px solid rgba(212,175,55,0.12)", background: d ? "rgba(212,175,55,0.03)" : "rgba(212,175,55,0.04)" }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-academy-gold" />
            <p className="text-xs text-academy-gray-500" style={{ color: tb }}>
              <span className="font-bold text-academy-gold">Certificazione FipexLacertosus</span>
              {" — "}inclusa nei pack Argento e Oro. Riconosciuta professionalmente a livello nazionale.
            </p>
          </div>

        </div>
      </section>

      {/* Modal */}
      {activeModal && (
        <PackModal
          pack={activeModal}
          onClose={() => setActiveModal(null)}
          onBuy={handleBuy}
        />
      )}

      {/* Masterclass selector (for Argento/Oro) */}
      {selectorOpen && selectedPack && (
        <MasterclassSelector
          packSlug={selectedPack.slug}
          count={selectedPack.masterclassSelectionCount ?? 2}
          onConfirm={handleSelectorConfirm}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </>
  );
}

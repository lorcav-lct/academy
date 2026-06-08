"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { saveFairLead } from "@/app/actions/fair-lead";

type Field = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
};

const FIELDS: Field[] = [
  {
    id: "first_name",
    label: "Nome",
    type: "text",
    placeholder: "Marco",
    required: true,
  },
  {
    id: "last_name",
    label: "Cognome",
    type: "text",
    placeholder: "Rossi",
    required: true,
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "marco@email.com",
    required: true,
  },
  {
    id: "phone",
    label: "Telefono",
    type: "tel",
    placeholder: "+39 320 000 0000",
    required: false,
  },
];

const ORANGE = "#F09226";

export function LeadCaptureFloat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [composerOpen, setComposerOpen] = useState(false);
  const [viaExitIntent, setViaExitIntent] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Snapshot dello stato corrente per l'handler exit-intent (deps stabili)
  const stateRef = useRef({ open, composerOpen, success });
  stateRef.current = { open, composerOpen, success };

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstInputRef.current?.focus(), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onOpen = () => setComposerOpen(true);
    const onClose = () => setComposerOpen(false);
    window.addEventListener("lacertosus:composer-open", onOpen);
    window.addEventListener("lacertosus:composer-close", onClose);
    return () => {
      window.removeEventListener("lacertosus:composer-open", onOpen);
      window.removeEventListener("lacertosus:composer-close", onClose);
    };
  }, []);

  // Exit-intent: desktop only, una sola volta per sessione. Apre il modale
  // quando il cursore esce dal bordo superiore della finestra.
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // no touch
    const KEY = "lacertosus:exit-intent-shown";
    if (sessionStorage.getItem(KEY)) return;

    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 3000);

    const onMouseOut = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY > 0 || e.relatedTarget) return; // solo uscita dall'alto
      const { open: o, composerOpen: c, success: s } = stateRef.current;
      if (o || c || s) return;
      sessionStorage.setItem(KEY, "1");
      setViaExitIntent(true);
      setOpen(true);
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setForm({});
      setError(null);
      setSuccess(false);
      setViaExitIntent(false);
    }, 300);
  }

  function handleChange(id: string, value: string) {
    setForm((prev) => ({ ...prev, [id]: value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveFairLead({
        first_name: form.first_name ?? "",
        last_name: form.last_name ?? "",
        email: form.email ?? "",
        phone: form.phone,
      });
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Errore sconosciuto.");
      }
    });
  }

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────── */}
      <div
        aria-hidden
        onClick={handleClose}
        className="fixed inset-0 z-[45] transition-opacity duration-300"
        style={{
          background: "rgba(10,10,15,0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* ── FAB pill — left side ──────────────────────────────────── */}
      <div
        className="fixed left-0 z-50 flex items-center bottom-5 md:bottom-50"
        style={{
          opacity: open || composerOpen ? 0 : 1,
          transform:
            open || composerOpen
              ? "translateX(-16px) scale(0.96)"
              : "translateX(0) scale(1)",
          pointerEvents: open || composerOpen ? "none" : "auto",
          transition:
            "opacity 220ms ease, transform 280ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Voglio rimanere aggiornato"
          className="inline-flex items-center gap-2 active:scale-95 h-12 md:h-14 pr-4 pl-3.5 md:pr-5 md:pl-4 relative overflow-hidden"
          style={{
            background: "#ffffff",
            color: "#1a1a1a",
            borderTopRightRadius: 9999,
            borderBottomRightRadius: 9999,
            boxShadow: `0 14px 36px rgba(240,146,38,0.30), 0 4px 12px rgba(0,0,0,0.18)`,
            transition: "box-shadow 200ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              `0 18px 40px rgba(240,146,38,0.45), 0 6px 16px rgba(0,0,0,0.20)`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              `0 14px 36px rgba(240,146,38,0.30), 0 4px 12px rgba(0,0,0,0.18)`;
          }}
        >
          <span
            className="relative text-[12px] font-black tracking-[0.22em] uppercase leading-none"
            style={{ color: "#1a1a1a" }}
          >
            <span className="hidden md:inline">
              🚀 Voglio rimanere aggiornato
            </span>
            <span className="hidden min-[350px]:inline md:hidden">
              🚀 Rimani aggiornato
            </span>
            <span className="inline min-[350px]:hidden">🚀 Iscriviti</span>
          </span>
        </button>
      </div>

      {/* ── Modal ────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lascia i tuoi dati"
        aria-hidden={!open}
        className="fixed z-[46] inset-0 flex items-end sm:items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-md"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 20,
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.25), 0 0 0 1px rgba(240,146,38,0.10)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transform: open
              ? "translateY(0) scale(1)"
              : "translateY(24px) scale(0.96)",
            transformOrigin: "bottom center",
            transition:
              "opacity 260ms ease, transform 320ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Header */}
          <div
            className="relative px-6 pt-6 pb-4 flex items-start justify-between gap-4"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
          >
            <div>
              <h2
                className="text-[20px] font-black leading-tight"
                style={{ color: "#1a1a1a" }}
              >
                {viaExitIntent
                  ? "Aspetta, prima di andare via"
                  : "Inizia il tuo percorso"}
              </h2>
              <p
                className="mt-1 text-[13px] leading-relaxed"
                style={{ color: "rgba(0,0,0,0.45)" }}
              >
                {viaExitIntent
                  ? "Solo 30 posti per l'edizione 2026/27. Lascia i tuoi contatti: ti avvisiamo per primo su date, posti e novità del percorso."
                  : "Lascia i tuoi contatti — ti raggiungiamo noi con tutti i dettagli."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Chiudi"
              className="shrink-0 mt-0.5 inline-flex items-center justify-center h-8 w-8 transition-colors"
              style={{
                background: "rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 9999,
                color: "rgba(0,0,0,0.40)",
              }}
            >
              <svg
                viewBox="0 0 14 14"
                width="10"
                height="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="square"
              >
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {success ? (
              <div className="flex flex-col items-center text-center py-6 gap-3">
                <div
                  className="flex items-center justify-center h-14 w-14 rounded-full mb-2"
                  style={{
                    background: `rgba(240,146,38,0.10)`,
                    border: `1.5px solid rgba(240,146,38,0.25)`,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="26"
                    height="26"
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3
                  className="font-black text-[18px]"
                  style={{ color: "#1a1a1a" }}
                >
                  Perfetto!
                </h3>
                <p
                  style={{
                    color: "rgba(0,0,0,0.50)",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  Dati salvati. Ti contatteremo a breve per tutti i dettagli sul
                  percorso.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-2 px-6 py-2.5 rounded-full text-[13px] font-black tracking-widest uppercase active:scale-95 transition-transform"
                  style={{ background: ORANGE, color: "#fff" }}
                >
                  Chiudi
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-3.5"
              >
                <div className="grid grid-cols-2 gap-3">
                  {FIELDS.slice(0, 2).map((field, i) => (
                    <div key={field.id} className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`lead-${field.id}`}
                        className="text-[11px] font-bold tracking-[0.12em] uppercase"
                        style={{ color: "rgba(0,0,0,0.45)" }}
                      >
                        {field.label}
                        {field.required && (
                          <span style={{ color: ORANGE }}> *</span>
                        )}
                      </label>
                      <input
                        ref={i === 0 ? firstInputRef : undefined}
                        id={`lead-${field.id}`}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.id] ?? ""}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full px-3.5 py-2.5 text-[13.5px] outline-none transition-all"
                        style={{
                          background: "rgba(0,0,0,0.04)",
                          border: "1px solid rgba(0,0,0,0.12)",
                          borderRadius: 10,
                          color: "#1a1a1a",
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = `1px solid ${ORANGE}`;
                          e.currentTarget.style.background =
                            "rgba(240,146,38,0.05)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border =
                            "1px solid rgba(0,0,0,0.12)";
                          e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                        }}
                      />
                    </div>
                  ))}
                </div>
                {FIELDS.slice(2).map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`lead-${field.id}`}
                      className="text-[11px] font-bold tracking-[0.12em] uppercase"
                      style={{ color: "rgba(0,0,0,0.45)" }}
                    >
                      {field.label}
                      {field.required && (
                        <span style={{ color: ORANGE }}> *</span>
                      )}
                    </label>
                    <input
                      id={`lead-${field.id}`}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.id] ?? ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.required}
                      className="w-full px-3.5 py-2.5 text-[13.5px] outline-none transition-all"
                      style={{
                        background: "rgba(0,0,0,0.04)",
                        border: "1px solid rgba(0,0,0,0.12)",
                        borderRadius: 10,
                        color: "#1a1a1a",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border = `1px solid ${ORANGE}`;
                        e.currentTarget.style.background =
                          "rgba(240,146,38,0.05)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border =
                          "1px solid rgba(0,0,0,0.12)";
                        e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                      }}
                    />
                  </div>
                ))}

                {error && (
                  <p
                    className="text-[12.5px] px-3 py-2 rounded-lg"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      color: "#dc2626",
                      border: "1px solid rgba(239,68,68,0.18)",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-1 w-full py-3.5 rounded-full text-[13px] font-black tracking-[0.20em] uppercase active:scale-[0.98] transition-all disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${ORANGE} 0%, #e07a10 100%)`,
                    color: "#fff",
                    boxShadow: `0 8px 24px rgba(240,146,38,0.35)`,
                  }}
                >
                  {isPending ? "Salvataggio…" : "Invia i dati →"}
                </button>

                <p
                  className="text-center text-[10.5px] leading-relaxed"
                  style={{ color: "rgba(0,0,0,0.30)" }}
                >
                  I tuoi dati sono al sicuro. Nessuno spam, solo informazioni
                  sul percorso.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

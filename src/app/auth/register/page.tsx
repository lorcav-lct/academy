"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PAGE_BG = "#f5f3ef";
const TEXT_PRIMARY = "#111111";
const TEXT_SECONDARY = "rgba(17,17,17,0.62)";
const TEXT_TERTIARY = "rgba(17,17,17,0.42)";
const DIVIDER = "rgba(17,17,17,0.1)";

function Field({
  id,
  label,
  hint,
  ...inputProps
}: {
  id: string;
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="block font-mono text-[0.62rem] font-bold tracking-[0.3em] uppercase"
          style={{ color: TEXT_TERTIARY }}
        >
          {label}
        </label>
        {hint && (
          <span
            className="font-mono text-[0.6rem] font-medium tracking-[0.18em] uppercase"
            style={{ color: TEXT_TERTIARY }}
          >
            {hint}
          </span>
        )}
      </div>
      <input
        id={id}
        {...inputProps}
        className="block w-full border-0 border-b bg-transparent px-0 py-3 text-[1rem] outline-none transition-colors"
        style={{
          color: TEXT_PRIMARY,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: DIVIDER,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderBottomColor = "#F09226";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderBottomColor = DIVIDER;
        }}
      />
    </div>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (next) {
      localStorage.setItem("pending_checkout", next);
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <section
        className="relative min-h-screen overflow-hidden pt-32 pb-24"
        style={{ background: PAGE_BG, color: TEXT_PRIMARY }}
      >
        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
          <div className="grid gap-14 md:grid-cols-12 md:gap-20">
            <div className="md:col-span-5">
              <h1
                className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-black leading-[1.02] tracking-[-0.025em]"
                style={{ color: TEXT_PRIMARY }}
              >
                Controlla la tua
                <br />
                <span className="text-academy-orange">email.</span>
              </h1>
            </div>

            <div className="md:col-span-7">
              <div className="w-full">
                <p
                  className="text-[1rem] leading-[1.7]"
                  style={{ color: TEXT_SECONDARY }}
                >
                  Ti abbiamo inviato un link di conferma a{" "}
                  <span className="font-bold" style={{ color: TEXT_PRIMARY }}>
                    {formData.email}
                  </span>
                  . Clicca sul link per completare l&apos;attivazione del tuo
                  account.
                </p>

                <div
                  className="mt-12 h-px w-full"
                  style={{ background: DIVIDER }}
                />

                <p
                  className="mt-6 font-mono text-[0.62rem] font-bold tracking-[0.28em] uppercase"
                  style={{ color: TEXT_TERTIARY }}
                >
                  Non hai ricevuto la mail? Controlla lo spam o riprova fra
                  qualche minuto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-screen overflow-hidden pt-32 pb-24 md:pt-36 md:pb-32"
      style={{ background: PAGE_BG, color: TEXT_PRIMARY }}
    >
      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <div className="grid gap-14 md:grid-cols-12 md:gap-20">
          {/* Left — editorial intro */}
          <div className="md:col-span-5 md:self-start">
            <h1
              className="text-[clamp(2.2rem,4.6vw,3.8rem)] font-black leading-[1.02] tracking-[-0.025em]"
              style={{ color: TEXT_PRIMARY }}
            >
              Crea il tuo profilo.
              <br />
              <span className="text-academy-orange">
                Inizia il tuo percorso.
              </span>
            </h1>

            <p
              className="mt-6 max-w-md text-[0.95rem] leading-[1.65]"
              style={{ color: TEXT_SECONDARY }}
            >
              Apri il tuo account personale per gestire ordini, ticket QR e
              accessi alle masterclass.
            </p>

            <div className="mt-10 hidden items-center gap-4 md:flex">
              <span className="font-mono text-[0.62rem] font-bold tracking-[0.3em] uppercase text-academy-orange tabular-nums">
                Cohort 001
              </span>
              <span className="h-px flex-1" style={{ background: DIVIDER }} />
              <span
                className="font-mono text-[0.62rem] font-bold tracking-[0.3em] uppercase"
                style={{ color: TEXT_TERTIARY }}
              >
                Founding Edition
              </span>
            </div>
          </div>

          {/* Right — form */}
          <div className="md:col-span-7">
            <div className="w-full">
              <form onSubmit={handleRegister} className="space-y-7">
                <Field
                  id="fullName"
                  label="Nome completo"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  required
                  placeholder="Mario Rossi"
                  autoComplete="name"
                />
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  placeholder="la-tua@email.com"
                  autoComplete="email"
                />
                <Field
                  id="phone"
                  label="Telefono"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                  placeholder="+39 333 1234567"
                  autoComplete="tel"
                />
                <Field
                  id="password"
                  label="Password"
                  hint="min 8 caratteri"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />

                {error && (
                  <p className="font-mono text-[0.72rem] font-bold tracking-[0.18em] uppercase text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 inline-flex h-14 w-full items-center justify-center overflow-hidden bg-academy-orange px-8 font-mono text-[0.78rem] font-black tracking-[0.32em] uppercase text-[#111111] transition-all duration-300 hover:bg-academy-orange-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {loading ? "Invio in corso…" : "Crea il mio profilo"}
                  </span>
                  {!loading && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="square"
                      aria-hidden
                      className="relative z-10 ml-3 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M4 2 L9 7 L4 12" />
                    </svg>
                  )}
                </button>
              </form>

              <div
                className="mt-12 h-px w-full"
                style={{ background: DIVIDER }}
              />

              <div className="mt-6 flex items-baseline justify-between gap-4">
                <p
                  className="font-mono text-[0.62rem] font-bold tracking-[0.28em] uppercase"
                  style={{ color: TEXT_TERTIARY }}
                >
                  Hai già un account?
                </p>
                <Link
                  href={
                    next
                      ? `/auth/login?next=${encodeURIComponent(next)}`
                      : "/auth/login"
                  }
                  className="inline-flex items-center gap-2 font-mono text-[0.72rem] font-black tracking-[0.28em] uppercase text-academy-orange transition-colors hover:text-academy-orange-dark"
                >
                  <span>Accedi</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    aria-hidden
                  >
                    <path d="M4 2 L9 7 L4 12" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: PAGE_BG }} />
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

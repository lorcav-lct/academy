"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
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

    // Persist pending checkout so account page can redirect after email confirmation
    if (next) {
      localStorage.setItem("pending_checkout", next);
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <section className="flex min-h-screen items-center pt-24">
        <SectionContainer>
          <div className="mx-auto max-w-md text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center bg-academy-orange/10">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-academy-orange" stroke="currentColor" strokeWidth={2}>
                <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-black">Controlla la tua Email</h1>
            <p className="text-academy-gray-400">
              Ti abbiamo inviato un link di conferma a <span className="font-semibold text-academy-gray-200">{formData.email}</span>.
              Clicca sul link per completare la registrazione.
            </p>
          </div>
        </SectionContainer>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen items-center pt-24">
      <SectionContainer>
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-black">
              <GradientText>Registrati</GradientText>
            </h1>
            <p className="text-sm text-academy-gray-400">
              Crea il tuo account per iscriverti ai corsi
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-academy-gray-400 uppercase">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                required
                className="w-full border border-academy-orange/20 bg-academy-navy/50 px-4 py-3 text-academy-gray-100 outline-none transition-colors focus:border-academy-orange/50"
                placeholder="Mario Rossi"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-academy-gray-400 uppercase">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                className="w-full border border-academy-orange/20 bg-academy-navy/50 px-4 py-3 text-academy-gray-100 outline-none transition-colors focus:border-academy-orange/50"
                placeholder="la-tua@email.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-academy-gray-400 uppercase">
                Telefono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full border border-academy-orange/20 bg-academy-navy/50 px-4 py-3 text-academy-gray-100 outline-none transition-colors focus:border-academy-orange/50"
                required
                placeholder="+39 333 1234567"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-academy-gray-400 uppercase">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                minLength={8}
                className="w-full border border-academy-orange/20 bg-academy-navy/50 px-4 py-3 text-academy-gray-100 outline-none transition-colors focus:border-academy-orange/50"
                placeholder="Minimo 8 caratteri"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Registrazione in corso..." : "Registrati"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-academy-gray-500">
            Hai gia un account?{" "}
            <Link
              href={next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login"}
              className="font-semibold text-academy-orange hover:text-academy-orange-light"
            >
              Accedi
            </Link>
          </p>
        </div>
      </SectionContainer>
    </section>
  );
}

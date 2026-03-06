"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email o password non corretti");
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <section className="flex min-h-screen items-center pt-24">
      <SectionContainer>
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-black">
              <GradientText>Accedi</GradientText>
            </h1>
            <p className="text-sm text-academy-gray-400">
              Accedi al tuo account Lacertosus Academy
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-academy-gray-400 uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-academy-orange/20 bg-academy-navy/50 px-4 py-3 text-academy-gray-100 outline-none transition-colors focus:border-academy-orange/50"
                placeholder="la-tua@email.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-academy-gray-400 uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-academy-orange/20 bg-academy-navy/50 px-4 py-3 text-academy-gray-100 outline-none transition-colors focus:border-academy-orange/50"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-academy-gray-500">
            Non hai un account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-academy-orange hover:text-academy-orange-light"
            >
              Registrati
            </Link>
          </p>
        </div>
      </SectionContainer>
    </section>
  );
}

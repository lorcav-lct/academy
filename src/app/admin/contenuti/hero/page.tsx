"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SlideRow {
  id: string;
  title_white: string;
  title_orange: string;
  description: string;
  cta_label: string | null;
  cta_href: string | null;
  bg_image_url: string | null;
  sort_order: number;
  active: boolean;
}

const emptySlide = (): Omit<SlideRow, "id"> => ({
  title_white: "",
  title_orange: "",
  description: "",
  cta_label: null,
  cta_href: null,
  bg_image_url: null,
  sort_order: 0,
  active: true,
});

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<SlideRow[]>([]);
  const [editing, setEditing] = useState<
    (SlideRow | Omit<SlideRow, "id">) | null
  >(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    if (data) setSlides(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(slide: SlideRow) {
    const supabase = createClient();
    await supabase
      .from("hero_slides")
      .update({ active: !slide.active })
      .eq("id", slide.id);
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, active: !s.active } : s)),
    );
  }

  async function deleteSlide(id: string) {
    if (!confirm("Eliminare questa slide? L'operazione non è reversibile."))
      return;
    const supabase = createClient();
    await supabase.from("hero_slides").delete().eq("id", id);
    setSlides((prev) => prev.filter((s) => s.id !== id));
  }

  async function moveSlide(slide: SlideRow, dir: -1 | 1) {
    const newOrder = slide.sort_order + dir;
    const other = slides.find((s) => s.sort_order === newOrder);
    if (!other) return;
    const supabase = createClient();
    await Promise.all([
      supabase
        .from("hero_slides")
        .update({ sort_order: newOrder })
        .eq("id", slide.id),
      supabase
        .from("hero_slides")
        .update({ sort_order: slide.sort_order })
        .eq("id", other.id),
    ]);
    setSlides((prev) =>
      prev
        .map((s) => {
          if (s.id === slide.id) return { ...s, sort_order: newOrder };
          if (s.id === other.id) return { ...s, sort_order: slide.sort_order };
          return s;
        })
        .sort((a, b) => a.sort_order - b.sort_order),
    );
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    if (isNew) {
      const { data, error: err } = await supabase
        .from("hero_slides")
        .insert({
          ...(editing as Omit<SlideRow, "id">),
          sort_order: slides.length,
        })
        .select()
        .single();
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
      if (data) setSlides((prev) => [...prev, data]);
    } else {
      const { id, ...fields } = editing as SlideRow;
      const { error: err } = await supabase
        .from("hero_slides")
        .update(fields)
        .eq("id", id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
      setSlides((prev) =>
        prev.map((s) => (s.id === id ? (editing as SlideRow) : s)),
      );
    }

    setSaving(false);
    setEditing(null);
    setIsNew(false);
  }

  const inputCls =
    "w-full bg-[#0a0a3a] border border-white/10 px-3 py-2 text-sm text-white placeholder-academy-gray-600 focus:outline-none focus:border-academy-orange/50";
  const labelCls =
    "block text-[0.65rem] font-bold tracking-[0.2em] text-academy-gray-500 uppercase mb-1";

  return (
    <section className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link
              href="/admin/contenuti"
              className="text-[0.62rem] text-academy-gray-500 hover:text-academy-orange uppercase tracking-[0.2em] mb-3 block"
            >
              ← Contenuti
            </Link>
            <h1 className="text-3xl font-black text-white">
              Hero <span className="text-academy-orange">Slides</span>
            </h1>
            <p className="text-sm text-academy-gray-400 mt-1">
              Gestisci le slide dello slider principale nella home.
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(emptySlide());
              setIsNew(true);
            }}
            className="font-black text-[0.72rem] tracking-[0.2em] uppercase px-6 py-3 transition-colors"
            style={{ background: "#F09226", color: "#111111" }}
          >
            + Nuova Slide
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 text-sm text-red-400 border border-red-500/20 bg-red-500/5">
            {error}
          </div>
        )}

        {/* Slides list */}
        <div className="flex flex-col gap-3 mb-10">
          {slides.length === 0 && (
            <div className="text-center py-16 text-academy-gray-600 text-sm">
              Nessuna slide trovata. Creane una nuova.
            </div>
          )}
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="card-squared p-5 flex items-center gap-5"
              style={{ opacity: slide.active ? 1 : 0.45 }}
            >
              {/* Order indicator */}
              <div className="flex-shrink-0 text-center">
                <div className="text-xl font-black text-academy-gray-700 tabular-nums leading-none">
                  {idx + 1}
                </div>
                <div className="flex flex-col gap-1 mt-1.5">
                  <button
                    onClick={() => moveSlide(slide, -1)}
                    disabled={idx === 0}
                    className="text-academy-gray-600 hover:text-academy-orange disabled:opacity-20 text-xs"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSlide(slide, 1)}
                    disabled={idx === slides.length - 1}
                    className="text-academy-gray-600 hover:text-academy-orange disabled:opacity-20 text-xs"
                  >
                    ↓
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="flex-1 min-w-0">
                <div className="text-base font-black leading-tight">
                  <span className="text-white">
                    {slide.title_white || "—"}{" "}
                  </span>
                  <span className="text-academy-orange">
                    {slide.title_orange || ""}
                  </span>
                </div>
                <p className="text-[0.65rem] text-academy-gray-500 mt-1 line-clamp-1">
                  {slide.description}
                </p>
                {(slide.cta_label || slide.bg_image_url) && (
                  <div className="flex items-center gap-3 mt-1.5">
                    {slide.cta_label && (
                      <span className="text-[0.5rem] font-bold tracking-[0.2em] text-academy-orange uppercase border border-academy-orange/25 px-1.5 py-0.5">
                        CTA: {slide.cta_label}
                      </span>
                    )}
                    {slide.bg_image_url && (
                      <span className="text-[0.5rem] font-bold tracking-[0.2em] text-academy-gray-500 uppercase">
                        🖼 Immagine
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(slide)}
                  className="text-[0.5rem] font-bold tracking-[0.18em] uppercase px-2.5 py-1 border transition-colors"
                  style={
                    slide.active
                      ? {
                          color: "#F09226",
                          borderColor: "rgba(240,146,38,0.4)",
                        }
                      : {
                          color: "#48484a",
                          borderColor: "rgba(255,255,255,0.08)",
                        }
                  }
                >
                  {slide.active ? "Attiva" : "Inattiva"}
                </button>
                <button
                  onClick={() => {
                    setEditing({ ...slide });
                    setIsNew(false);
                  }}
                  className="text-[0.55rem] font-bold tracking-[0.18em] uppercase text-academy-gray-400 hover:text-white transition-colors"
                >
                  Modifica
                </button>
                <button
                  onClick={() => deleteSlide(slide.id)}
                  className="text-[0.55rem] font-bold tracking-[0.18em] uppercase text-academy-gray-600 hover:text-red-400 transition-colors"
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit / Create form */}
        {editing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
              background: "rgba(1,0,18,0.88)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="w-full max-w-lg card-squared p-8 overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-black text-white mb-6">
                {isNew ? "Nuova Slide" : "Modifica Slide"}
              </h2>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Titolo (bianco)</label>
                    <input
                      className={inputCls}
                      placeholder="NON FORMIAMO"
                      value={editing.title_white}
                      onChange={(e) =>
                        setEditing({ ...editing, title_white: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Titolo (arancione)</label>
                    <input
                      className={inputCls}
                      placeholder="ISTRUTTORI."
                      value={editing.title_orange}
                      onChange={(e) =>
                        setEditing({ ...editing, title_orange: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Descrizione</label>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    placeholder="Descrizione della slide..."
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>CTA Label (opzionale)</label>
                    <input
                      className={inputCls}
                      placeholder="Scopri il Percorso"
                      value={editing.cta_label ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          cta_label: e.target.value || null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>CTA URL (opzionale)</label>
                    <input
                      className={inputCls}
                      placeholder="/percorso"
                      value={editing.cta_href ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          cta_href: e.target.value || null,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    Immagine di sfondo URL (opzionale)
                  </label>
                  <input
                    className={inputCls}
                    placeholder="https://..."
                    value={editing.bg_image_url ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        bg_image_url: e.target.value || null,
                      })
                    }
                  />
                  <p className="text-[0.5rem] text-academy-gray-600 mt-1 tracking-wide">
                    L&apos;immagine verrà ridimensionata per coprire
                    l&apos;intera area. Usa immagini ad alta risoluzione.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setEditing({ ...editing, active: !editing.active })
                    }
                    className="text-[0.55rem] font-bold tracking-[0.2em] uppercase px-3 py-1.5 border transition-colors"
                    style={
                      editing.active
                        ? {
                            color: "#F09226",
                            borderColor: "rgba(240,146,38,0.4)",
                          }
                        : {
                            color: "#48484a",
                            borderColor: "rgba(255,255,255,0.1)",
                          }
                    }
                  >
                    {editing.active ? "Attiva" : "Inattiva"}
                  </button>
                  <span className="text-[0.52rem] text-academy-gray-600">
                    {editing.active
                      ? "La slide sarà visibile nella home."
                      : "La slide non sarà visibile."}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 text-sm text-red-400">{error}</div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="font-black text-[0.72rem] tracking-[0.2em] uppercase px-6 py-3 transition-all disabled:opacity-50"
                  style={{ background: "#F09226", color: "#111111" }}
                >
                  {saving ? "Salvando..." : "Salva"}
                </button>
                <button
                  onClick={() => {
                    setEditing(null);
                    setIsNew(false);
                    setError(null);
                  }}
                  className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-academy-gray-500 hover:text-white transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

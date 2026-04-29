"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GradientText } from "@/components/shared/gradient-text";
import {
  IconArrowLeft,
  IconArrowUp,
  IconArrowDown,
  IconClose,
  IconEdit,
  IconImage,
  IconPlus,
  IconTrash,
} from "../../_components/icons";

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

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link
          href="/admin/contenuti"
          className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase transition-colors hover:text-academy-orange"
        >
          <IconArrowLeft className="h-3 w-3" />
          Contenuti
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
              Hero <GradientText>Slides</GradientText>
            </h1>
            <p className="mt-2 text-sm text-academy-gray-500">
              Gestisci le slide dello slider principale nella home.
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(emptySlide());
              setIsNew(true);
            }}
            className="flex items-center gap-2 bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Nuova slide
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Slides list */}
      {slides.length === 0 ? (
        <EmptyState
          onCreate={() => {
            setEditing(emptySlide());
            setIsNew(true);
          }}
        />
      ) : (
        <ul className="space-y-3">
          {slides.map((slide, idx) => (
            <li
              key={slide.id}
              className={`border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all ${
                slide.active
                  ? "border-black/[0.08]"
                  : "border-black/[0.06] opacity-60"
              }`}
            >
              <div className="flex items-stretch">
                {/* Order indicator */}
                <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 border-r border-black/[0.06] bg-black/[0.02] px-3 py-4">
                  <span className="text-base font-black text-academy-gray-700 tabular-nums leading-none">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveSlide(slide, -1)}
                      disabled={idx === 0}
                      className="flex h-5 w-5 items-center justify-center text-academy-gray-500 transition-colors hover:text-academy-orange disabled:opacity-20"
                      aria-label="Sposta su"
                    >
                      <IconArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveSlide(slide, 1)}
                      disabled={idx === slides.length - 1}
                      className="flex h-5 w-5 items-center justify-center text-academy-gray-500 transition-colors hover:text-academy-orange disabled:opacity-20"
                      aria-label="Sposta giù"
                    >
                      <IconArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-black leading-tight">
                      <span className="text-academy-gray-800">
                        {slide.title_white || "—"}{" "}
                      </span>
                      <span className="text-academy-orange">
                        {slide.title_orange || ""}
                      </span>
                    </div>
                    {slide.description && (
                      <p className="mt-1 line-clamp-1 text-[12px] text-academy-gray-500">
                        {slide.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {slide.cta_label && (
                        <span className="border border-academy-orange/25 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-academy-orange uppercase">
                          CTA: {slide.cta_label}
                        </span>
                      )}
                      {slide.bg_image_url && (
                        <span className="flex items-center gap-1 bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-academy-gray-600 uppercase">
                          <IconImage className="h-2.5 w-2.5" />
                          Immagine
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleActive(slide)}
                      className={`border px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] uppercase transition-colors ${
                        slide.active
                          ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                          : "border-black/[0.08] bg-white text-academy-gray-500"
                      }`}
                    >
                      {slide.active ? "Attiva" : "Inattiva"}
                    </button>
                    <button
                      onClick={() => {
                        setEditing({ ...slide });
                        setIsNew(false);
                      }}
                      className="flex h-8 w-8 items-center justify-center border border-black/[0.08] bg-white text-academy-gray-500 transition-colors hover:border-academy-orange/30 hover:text-academy-orange"
                      aria-label="Modifica"
                    >
                      <IconEdit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSlide(slide.id)}
                      className="flex h-8 w-8 items-center justify-center border border-black/[0.08] bg-white text-academy-gray-500 transition-colors hover:border-red-500/30 hover:text-red-600"
                      aria-label="Elimina"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit modal */}
      {editing && (
        <SlideEditor
          editing={editing}
          isNew={isNew}
          saving={saving}
          error={error}
          onChange={setEditing}
          onSave={save}
          onClose={() => {
            setEditing(null);
            setIsNew(false);
            setError(null);
          }}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Editor modal
// ──────────────────────────────────────────────────────────────────────

function SlideEditor({
  editing,
  isNew,
  saving,
  error,
  onChange,
  onSave,
  onClose,
}: {
  editing: SlideRow | Omit<SlideRow, "id">;
  isNew: boolean;
  saving: boolean;
  error: string | null;
  onChange: (s: SlideRow | Omit<SlideRow, "id">) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const inputCls =
    "w-full border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-academy-gray-800 outline-none transition-colors focus:border-academy-orange/50";
  const labelCls =
    "mb-1.5 block text-[11px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border border-black/[0.08] bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-academy-orange uppercase">
              {isNew ? "Crea" : "Modifica"}
            </p>
            <h2 className="mt-0.5 text-lg font-black text-academy-gray-800">
              {isNew ? "Nuova slide" : "Modifica slide"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="border border-black/[0.1] p-2 text-academy-gray-500 transition-colors hover:border-black/30 hover:text-academy-gray-800"
            aria-label="Chiudi"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Titolo (scuro)</label>
              <input
                className={inputCls}
                placeholder="NON FORMIAMO"
                value={editing.title_white}
                onChange={(e) =>
                  onChange({ ...editing, title_white: e.target.value })
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
                  onChange({ ...editing, title_orange: e.target.value })
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
                onChange({ ...editing, description: e.target.value })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>CTA Label (opzionale)</label>
              <input
                className={inputCls}
                placeholder="Scopri il Percorso"
                value={editing.cta_label ?? ""}
                onChange={(e) =>
                  onChange({
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
                  onChange({
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
                onChange({
                  ...editing,
                  bg_image_url: e.target.value || null,
                })
              }
            />
            <p className="mt-1.5 text-[11px] text-academy-gray-500">
              L&apos;immagine verrà ridimensionata per coprire l&apos;intera
              area. Usa immagini ad alta risoluzione.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-black/[0.06] pt-4">
            <button
              onClick={() => onChange({ ...editing, active: !editing.active })}
              className={`border px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${
                editing.active
                  ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                  : "border-black/[0.1] bg-white text-academy-gray-500"
              }`}
            >
              {editing.active ? "Attiva" : "Inattiva"}
            </button>
            <span className="text-[12px] text-academy-gray-500">
              {editing.active
                ? "La slide sarà visibile nella home."
                : "La slide non sarà visibile."}
            </span>
          </div>

          {error && (
            <div className="border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-black/[0.06] bg-black/[0.015] px-6 py-4">
          <button
            onClick={onClose}
            className="text-[12px] font-bold tracking-wider text-academy-gray-500 uppercase transition-colors hover:text-academy-gray-800"
          >
            Annulla
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-academy-orange px-6 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center border border-black/[0.08] bg-white p-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="mb-5 flex h-16 w-16 items-center justify-center bg-black/[0.04] text-academy-gray-500">
        <IconImage className="h-8 w-8" />
      </div>
      <p className="text-base font-bold text-academy-gray-800">Nessuna slide</p>
      <p className="mt-1 max-w-sm text-sm text-academy-gray-500">
        Crea la prima slide per popolare la sezione hero della home.
      </p>
      <button
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-1.5 bg-academy-orange px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:brightness-110"
      >
        <IconPlus className="h-3.5 w-3.5" />
        Nuova slide
      </button>
    </div>
  );
}

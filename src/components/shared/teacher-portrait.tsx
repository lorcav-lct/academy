import Image from "next/image";
import { Logo } from "@/components/layout/logo";
import type { Teacher } from "@/lib/constants/teachers";

interface TeacherPortraitProps {
  teacher: Pick<Teacher, "name" | "image_url" | "color">;
  /** Tailwind sizing for the wrapper. Image always 4:5 inside. */
  className?: string;
  /** Show name + role overlaid at the bottom (used in /docenti grid) */
  overlayName?: boolean;
  overlayRole?: string;
  /** Optional sizes attr for next/image responsive loading */
  sizes?: string;
  /** Loading priority for above-the-fold images */
  priority?: boolean;
  /** Fallback theme: 'dark' uses orange-on-dark, 'light' uses orange-on-cream */
  fallbackTheme?: "dark" | "light";
}

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";

export function TeacherPortrait({
  teacher,
  className = "",
  overlayName = false,
  overlayRole,
  sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw",
  priority = false,
  fallbackTheme = "dark",
}: TeacherPortraitProps) {
  const hasImage = Boolean(teacher.image_url);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: "4 / 5" }}
    >
      {hasImage ? (
        <Image
          src={teacher.image_url as string}
          alt={teacher.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      ) : (
        <FallbackLogoBg theme={fallbackTheme} />
      )}

      {overlayName && (
        <div
          className="absolute inset-x-0 bottom-0 px-4 pt-12 pb-4 md:px-5 md:pb-5"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.92) 100%)",
          }}
        >
          <p className="text-[1.05rem] md:text-[1.18rem] font-black leading-tight tracking-tight text-white">
            {teacher.name}
          </p>
          {overlayRole && (
            <p
              className="mt-1 text-[0.7rem] md:text-[0.72rem] font-bold uppercase tracking-[0.16em] line-clamp-2"
              style={{ color: ORANGE }}
            >
              {overlayRole}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FallbackLogoBg({ theme }: { theme: "dark" | "light" }) {
  const isDark = theme === "dark";
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: isDark
          ? `linear-gradient(155deg, rgba(${ORANGE_RGB},0.14) 0%, rgba(20,20,24,0.95) 60%, rgba(10,10,14,1) 100%)`
          : `linear-gradient(155deg, rgba(${ORANGE_RGB},0.10) 0%, rgba(245,243,238,1) 100%)`,
      }}
    >
      {/* Brand corner brackets */}
      <span
        className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t border-l"
        style={{ borderColor: `rgba(${ORANGE_RGB},0.45)` }}
      />
      <span
        className="pointer-events-none absolute top-3 right-3 h-3 w-3 border-t border-r"
        style={{ borderColor: `rgba(${ORANGE_RGB},0.45)` }}
      />
      <span
        className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l"
        style={{ borderColor: `rgba(${ORANGE_RGB},0.45)` }}
      />
      <span
        className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r"
        style={{ borderColor: `rgba(${ORANGE_RGB},0.45)` }}
      />
      <Logo
        width={140}
        academyColor={isDark ? "rgba(255,255,255,0.9)" : "#1a1a1a"}
        className="opacity-90"
      />
    </div>
  );
}

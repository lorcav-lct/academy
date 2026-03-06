import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
  withReflection?: boolean;
}

export function SectionContainer({
  children,
  className,
  id,
  withReflection = false,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative px-4 py-20 sm:px-6 lg:px-8 md:py-28",
        withReflection && "light-reflection",
        className
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

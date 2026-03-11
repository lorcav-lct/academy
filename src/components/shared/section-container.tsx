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
        "relative py-20 md:py-28",
        withReflection && "light-reflection",
        className
      )}
    >
      <div className="mx-auto w-[90%] max-w-[1440px]">{children}</div>
    </section>
  );
}

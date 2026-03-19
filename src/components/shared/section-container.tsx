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
      <div className="mx-auto max-w-[1440px] px-[5%] md:px-10">{children}</div>
    </section>
  );
}

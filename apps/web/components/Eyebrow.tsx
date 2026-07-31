import React from "react";

// Small red kicker label used above section headings, matching the
// approved homepage mockup ("Why NR MotorMarket", "Latest Arrivals", etc).
export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-red-600 dark:text-red-500">
      <span className="h-[2px] w-[22px] bg-red-600 dark:bg-red-500" />
      {children}
    </span>
  );
}

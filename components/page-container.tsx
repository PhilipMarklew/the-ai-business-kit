import type { ReactNode } from "react";

/** Reading column used by content pages. Headers and footers use max-w-page directly. */
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-measure px-5 py-12 sm:px-8 md:py-20">{children}</div>
  );
}

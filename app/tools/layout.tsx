import type { ReactNode } from "react";
import { SignupForm } from "@/components/signup-form";
import { ToolShellHeading } from "@/components/tool-shell-heading";
import { copy } from "@/lib/copy";

/** Shell for every /tools/<slug> page: title, then the tool, then the signup block. */
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-page px-5 py-12 sm:px-8 md:py-20">
      <ToolShellHeading />
      <div>{children}</div>
      <section aria-labelledby="tool-signup" className="mt-16 max-w-measure rounded-panel border border-line bg-surface p-6 sm:p-8">
        <h2 id="tool-signup" className="mb-5 text-title font-heading">
          {copy.toolShell.signupHeading}
        </h2>
        <SignupForm placement="tool_page" />
      </section>
    </div>
  );
}

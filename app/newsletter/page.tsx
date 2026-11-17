import type { Metadata } from "next";
import { FollowLinks } from "@/components/follow-links";
import { SignupForm } from "@/components/signup-form";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: copy.newsletter.title,
  description: copy.newsletter.description,
};

/** The form is the page. Promise on the left, form on the right from tablet up. */
export default function NewsletterPage() {
  return (
    <div className="mx-auto grid w-full max-w-page gap-10 px-5 pb-8 pt-12 sm:px-8 md:grid-cols-[1fr_1fr] md:gap-16 md:pt-20">
      <div className="flex flex-col gap-6">
        <h1 className="animate-rise text-display font-heading">{copy.newsletter.heading}</h1>
        <ul className="flex flex-col gap-4">
          {copy.newsletter.points.map((p) => {
            const [label, ...rest] = p.split(": ");
            return (
              <li key={p} className="flex gap-3 text-lg">
                <span aria-hidden="true" className="mt-2.5 size-2.5 shrink-0 rotate-45 rounded-[0.15rem] bg-accent" />
                <span>
                  {rest.length > 0 ? (
                    <>
                      <strong className="font-bold">{label}:</strong> {rest.join(": ")}
                    </>
                  ) : (
                    p
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <FollowLinks />
      </div>
      <div className="self-start rounded-panel border border-line bg-surface p-6 sm:p-8">
        <SignupForm />
      </div>
    </div>
  );
}

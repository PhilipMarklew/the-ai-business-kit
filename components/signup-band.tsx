import { FollowLinks } from "@/components/follow-links";
import { SignupForm } from "@/components/signup-form";
import { copy } from "@/lib/copy";

/**
 * The one bold colour block on a page: coral band with the signup form.
 * Text on coral is always --on-accent (7.3:1). Social follow sits underneath
 * as the fallback for people not ready to give an email.
 */
export function SignupBand({
  id = "signup",
  heading = copy.band.heading,
  body = copy.band.body,
}: {
  id?: string;
  heading?: string;
  body?: string;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-6 rounded-panel bg-accent px-5 py-8 text-on-accent sm:px-10 sm:py-12"
    >
      <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
        <div className="flex flex-col gap-3">
          <h2 id={headingId} className="text-headline font-extrabold">
            {heading}
          </h2>
          <p className="text-lg">{body}</p>
          <FollowLinks tone="accent" className="mt-2" />
        </div>
        <SignupForm tone="accent" />
      </div>
    </section>
  );
}

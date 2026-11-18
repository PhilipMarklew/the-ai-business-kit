import { FollowLinks } from "@/components/follow-links";
import { SignupForm } from "@/components/signup-form";
import { copy } from "@/lib/copy";

/**
 * Signup at the end of a listing or an article. An open block under a thick
 * coral rule: no filled panel, so it reads as part of the page instead of a
 * bolted-on "join the newsletter" banner.
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
    <section id={id} aria-labelledby={headingId} className="scroll-mt-6 border-t-4 border-accent pt-8">
      <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div className="flex flex-col gap-3">
          <h2 id={headingId} className="text-headline font-heading">
            {heading}
          </h2>
          <p className="max-w-[44ch] text-lg text-muted">{body}</p>
          <FollowLinks className="mt-1" />
        </div>
        <SignupForm placement="band" />
      </div>
    </section>
  );
}

/**
 * Compact signup for the home page's side column, next to the latest guides.
 * Same form, tighter heading, so it sits with the headlines instead of after them.
 */
export function SignupAside({ id = "signup" }: { id?: string }) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-6 rounded-panel bg-accent p-6 text-on-accent sm:p-7"
    >
      <h2 id={headingId} className="text-title font-heading">
        {copy.band.heading}
      </h2>
      <p className="mt-2 mb-5">{copy.band.body}</p>
      <SignupForm tone="accent" placement="home_aside" />
      <FollowLinks tone="accent" className="mt-4" />
    </section>
  );
}

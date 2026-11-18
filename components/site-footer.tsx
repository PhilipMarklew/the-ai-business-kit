import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import { TiktokLogo, XLogo, YoutubeLogo } from "@phosphor-icons/react/ssr";
import { FollowLink } from "@/components/tracked-link";
import { copy } from "@/lib/copy";
import { site } from "@/lib/site";
import { liveSocial } from "@/lib/social";

const socialIcons: Record<string, Icon> = {
  TikTok: TiktokLogo,
  YouTube: YoutubeLogo,
  X: XLogo,
};

// Module scope so it is fixed at build time (Cache Components forbids
// new Date() during render). Each deploy refreshes it.
const year = new Date().getFullYear();

/**
 * One centred stack below a key line: social icons, then copyright and the
 * privacy link. Only live profiles show (see lib/social.ts).
 */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line text-sm text-muted md:mt-32">
      <div className="mx-auto flex w-full max-w-page flex-col items-center gap-5 px-5 py-10 text-center sm:px-8">
        {liveSocial.length > 0 && (
          <ul className="flex items-center gap-2">
            {liveSocial.map((s) => {
              const SocialIcon = socialIcons[s.name];
              return (
                <li key={s.url}>
                  <FollowLink
                    network={s.name}
                    placement="footer"
                    href={s.url}
                    rel="me noopener"
                    aria-label={s.name}
                    className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
                  >
                    {SocialIcon ? <SocialIcon size={22} aria-hidden /> : s.name}
                  </FollowLink>
                </li>
              );
            })}
          </ul>
        )}
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span>
            © {year} {site.name}
          </span>
          <Link href="/privacy" className="text-muted hover:text-ink">
            {copy.footer.privacy}
          </Link>
        </p>
      </div>
    </footer>
  );
}

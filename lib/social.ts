/**
 * Social profiles. The accounts do not exist yet (brief item 12).
 * TODO(phil): add each URL once the account is live. Anything left null is not
 * shown anywhere, so the site never links to a profile that is not there.
 * Also feeds the Organization JSON-LD `sameAs` list.
 */
export type SocialProfile = { name: string; url: string | null };

export const social: SocialProfile[] = [
  { name: "TikTok", url: null },
  { name: "YouTube", url: null },
  { name: "X", url: null },
];

export const liveSocial = social.filter((s): s is { name: string; url: string } => s.url !== null);

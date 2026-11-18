/**
 * Social profiles (brief item 12). X and TikTok are live; YouTube to follow.
 * TODO(phil): add each URL once the account is live. Anything left null is not
 * shown anywhere, so the site never links to a profile that is not there.
 * Also feeds the Organization JSON-LD `sameAs` list.
 */
export type SocialProfile = { name: string; url: string | null };

export const social: SocialProfile[] = [
  { name: "TikTok", url: "https://www.tiktok.com/@the.ai.business.ki" },
  { name: "YouTube", url: null },
  { name: "X", url: "https://x.com/TheAIBizKit" },
];

export const liveSocial = social.filter((s): s is { name: string; url: string } => s.url !== null);

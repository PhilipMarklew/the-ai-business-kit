/**
 * All page copy lives here so it can be edited in one file.
 *
 * Voice: Phil, first person, plain and direct. No em dashes. Checked against
 * docs/writing-style-phil.md and stop-slop on 17 Nov 2026.
 *
 * Open markers (grep for them before launch):
 *   TODO(phil)   needs a fact or a decision from Phil. Visible in [brackets]
 *                inside strings where the page would otherwise say something false.
 *   TODO(d2)     true for Kit (the recommended email provider), may differ if
 *                Phil picks another. Swap `provider` and `providerFacts` below.
 *   TODO(viktor) the GA4 / cookie consent question. Not decided here.
 *
 * ---------------------------------------------------------------------------
 * PRIVACY AND CONSENT COPY: NOT LEGAL ADVICE. PHIL TO REVIEW.
 * (This note is for the file only. It is not shown on the live page.)
 *
 * ICO pages read on 17 Nov 2026:
 *  - PECR, electronic mail marketing (consent needed for individuals; opt-out in
 *    every message; say who you are; page is marked under review because of the
 *    Data (Use and Access) Act):
 *    https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/
 *  - Direct marketing guidance (lawful basis, absolute right to object; last
 *    updated 28 Apr 2026):
 *    https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/direct-marketing-guidance/
 *  - What is valid consent (opt-in by clear action, no pre-ticked boxes, name the
 *    organisation, easy withdrawal, keep records; marked under review):
 *    https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/what-is-valid-consent/
 *  - Right to be informed (what a privacy notice must cover: identity, purposes,
 *    lawful basis, retention, recipients, transfers, rights). Found via search
 *    summary; the page itself was not opened:
 *    https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/
 *  - Storage and access technologies (cookies; updated 29 Apr 2026). The page body
 *    did not load, so the analytics / "statistical purposes" exception was NOT read:
 *    https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/
 *
 * Open question for Viktor: does GA4 need a PECR cookie consent banner? The ICO
 * guidance mentions a "statistical purposes" exception added by the Data (Use and
 * Access) Act. Whether GA4's configuration qualifies is not decided here. Until
 * it is, the privacy copy says no analytics cookies are used, which stops being
 * true the day GA4 ships. Rewrite that section first.
 *
 * Consent record (architecture D-008): the provider holds email, time, form and
 * confirmation. The wording is tracked by `signup.consentVersion`. Bump it on ANY
 * change to `signup.consent` and keep the old wording in git history.
 * ---------------------------------------------------------------------------
 */

/**
 * Hub name. Client components (the signup form) cannot read lib/site.ts, because
 * SITE_NAME is server-only. Keep this equal to the default in lib/site.ts.
 */
const brand = "The AI Business Kit";

/** TODO(d2): the one place the email provider is named. Change it here. */
const provider = "Kit";

/**
 * TODO(d2): provider-specific facts, written for Kit from the D2 comparison in
 * docs/specs/S00-1-architecture.md (Kit DPA, kit.com/dpa, checked 17 Nov 2026).
 * Re-check each line against the chosen provider's DPA before launch.
 * Buttondown, if chosen: its data location, sub-processors and transfer terms
 * differ, and its double opt-in is on by default for API signups.
 */
const providerFacts = {
  /** Where the provider stores data. */
  location: "the United States",
  /** The transfer tool the provider's DPA relies on. */
  transferTool: "the UK International Data Transfer Agreement",
  /** Sub-processors worth naming. Kit's list includes OpenAI. */
  subprocessors: "Its list of service providers includes OpenAI.",
  /** Double opt-in: the provider emails a confirmation link first. */
  doubleOptIn:
    "After you sign up, I send one email asking you to confirm. You are not on the list until you click the link.",
};

/** Privacy notice. Sections are separated by blank lines; the page keeps line breaks. */
const privacyBody = `Last updated: 17 November 2026

Who I am
I am Phil, and I run ${brand}. I decide how your data is used, so I am the controller under UK data protection law. [TODO(phil): add your full name, whether you trade as a sole trader or a company, and a contact email or postal address.]

What I collect
If you sign up, I collect your email address. ${provider} also records when you signed up, which form you used, which version of the consent wording you saw, and when you confirmed. I ask for nothing else.

Why I use it, and the legal basis
I use your email address to send you new tools and guides from ${brand}. I do it because you agreed. Consent is the legal basis under UK GDPR, and consent is what the Privacy and Electronic Communications Regulations (PECR) require for marketing email. I do not sell your address or use it for anything else.

Who handles it
I use ${provider} to store your email address and send the emails. ${provider} is my processor, so it can only use your data on my instructions. ${providerFacts.subprocessors} ${provider} stores data in ${providerFacts.location}. The transfer from the UK relies on ${providerFacts.transferTool} in ${provider}'s data processing agreement.

This site runs on Railway. Web servers keep technical logs, which can include your IP address. When you submit the signup form, the site also checks your IP address to block spam. It holds that in memory for a few minutes and does not store it.

Confirming your address
${providerFacts.doubleOptIn}

How long I keep it
I keep your email address until you unsubscribe or ask me to delete it. If you unsubscribe, I keep a note that you opted out so I do not email you again.

Unsubscribing
Every email has an unsubscribe link. One click and you are off the list. You can also email me and I will remove you.

Your rights
You can ask me for a copy of your data. You can ask me to correct it or delete it, object to how I use it, or withdraw your consent at any time. Withdrawing does not undo anything I did before. Email me at [TODO(phil): contact email]. If you are unhappy with my answer, you can complain to the Information Commissioner's Office at ico.org.uk.

Cookies and analytics
This site does not use analytics or advertising cookies today. [TODO(viktor): GA4 is due to be added. Decide whether it needs a cookie consent banner under PECR, then rewrite this section before GA4 goes live.]

Changes
If how I use your data changes, I will update this page and the date at the top.`;

export const copy = {
  // Used for meta description, Open Graph and JSON-LD.
  siteDescription:
    "Free AI tools and plain-English guides that help small businesses get found online, earn trust and run better.",

  home: {
    title: "Plain-English AI for small businesses",
    intro:
      "Guides and free tools that help you get found, earn trust and take the busywork off your plate. No jargon, and nothing to buy.",
    latestHeading: "Latest posts",
    allPostsLink: "See every post",
    emptyHeading: "The first posts are on their way",
    emptyBody:
      "I'm writing the first guides now. Sign up below and you'll get each one as soon as it's out.",
    toolsHeading: "Free tools",
    toolsLink: "All tools",
    // TODO(phil): the robots.txt tester is the planned first tool (W2-3). Confirm before launch.
    toolsComing:
      "The first tool checks whether Google and AI search tools like ChatGPT are allowed to read your website. It's being built now.",
  },

  band: {
    heading: "Get the next guide in your inbox",
    body: "One email when something new is ready. Free tools and plain-English guides, nothing else.",
  },

  blog: {
    title: "Blog",
    description: "Plain-English guides on getting found, earning trust and running a small business better with AI.",
    heading: "The blog",
    intro: "Short, practical guides for small business owners. Pick a topic or read the lot.",
    empty: "Nothing here yet. The first guides are being written now.",
  },

  topicPage: {
    empty: "No posts in this topic yet. They're on the way.",
  },

  article: {
    contents: "On this page",
    related: "Read next",
    byline: "Written by",
  },

  tools: {
    title: "Free tools",
    description: "Free tools that each do one job for your small business website. No sign-up needed to use them.",
    heading: "Free tools",
    intro: "Each tool does one job, runs in your browser and costs nothing. No sign-up needed to use them.",
    comingHeading: "Coming next",
  },

  about: {
    title: "About",
    description: "Who runs this site and why.",
    heading: "About this site",
    body: `${brand} helps small businesses get found online, earn trust and run better, using AI where it helps.

I think AI is a useful tool for getting things done faster. Most people do not know how to get the result they need from it. The tools and guides here try to close that gap.

Everything is free. There are no subscriptions and no affiliate links. The site is new, and the first tools are still being built.`,
    // TODO(phil): add one or two true lines on your background and why you are building this. Nothing is invented here.
    authorBio:
      "Phil runs the site and writes everything on it. [TODO(phil): add one or two lines on your background and why you are building this.]",
  },

  privacy: {
    title: "Privacy",
    description: "What data this site collects, why, and how to unsubscribe or ask for it to be deleted.",
    heading: "Privacy",
    body: privacyBody,
  },

  newsletter: {
    title: "Newsletter",
    description: "Free tools and plain guides for small businesses, by email, when each one is ready.",
    heading: "Get the first tool by email",
    points: [
      "What arrives: free tools and plain-English guides for small businesses, as each one is ready.",
      // TODO(phil): confirm the cap.
      "How often: no more than one email a week.",
      "Leave any time: every email has an unsubscribe link. One click and you are off the list.",
    ],
  },

  notFound: {
    title: "Page not found",
    heading: "That page is not here.",
    body: "It may have moved, or the link was wrong.",
  },

  footer: {
    tagline: "Plain-English AI guides and free tools for small businesses. No jargon, no upsell.",
    // Reads "Built by Phil". TODO(phil): add a surname in lib/site.ts if you want it shown.
    builtBy: "Built by",
  },

  toolShell: {
    signupHeading: "Get the next tool by email",
  },

  signup: {
    label: "Email address",
    button: "Subscribe",
    sending: "Sending",
    /**
     * Shown as the label of an unticked checkbox, with the privacy link after it.
     * Names who is asking, what they get, and how to leave. Change this and you
     * must bump `consentVersion`.
     */
    consent: `I agree to get emails from Phil at ${brand} when a new tool or guide is ready. I can unsubscribe at any time.`,
    privacyLinkText: "Privacy notice",
    /** Sent to the provider as the tag `consent-v2026-11` (architecture D-008). */
    consentVersion: "consent-v2026-11",
    // TODO(d2): assumes double opt-in, as with Kit. Reword if the provider does not confirm by email.
    success:
      "Check your inbox. I have sent an email to confirm your address. Click the link in it to finish signing up. If you do not see it in a few minutes, check your spam folder.",
    errors: {
      invalid_email: "That email address does not look right. Check it and try again.",
      consent_required: "Tick the box to agree before you subscribe.",
      rate_limited: "Too many tries. Wait a few minutes and try again.",
      provider_unavailable: "Something went wrong on our side. Try again in a moment.",
      network: "Could not reach the server. Check your connection and try again.",
    },
  },
} as const;

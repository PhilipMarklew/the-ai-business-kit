/**
 * All page copy lives here so it can be edited in one file.
 *
 * Voice: Phil, first person, plain and direct. No em dashes. Checked against
 * docs/writing-style-phil.md and stop-slop on 18 Nov 2026.
 *
 * Open markers (grep for them before launch):
 *   TODO(phil)   needs a fact or a decision from Phil. Visible in [brackets]
 *                inside strings where the page would otherwise say something false.
 *
 * Settled and removed: the email provider is Kit (D-006) and double opt-in is on
 * and confirmed working. `provider` and `providerFacts` stay as the one place to
 * change either. Viktor's Umami checks are in, and the "Cookies and analytics"
 * section follows his finding U1 (docs/.project-memory/specs/security-audit-S00-1.md).
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
 *  - Storage and access technologies (cookies; guidance finalised 29 Apr 2026).
 *    Viktor read the "What are the exceptions?" page on 18 Nov 2026 (see
 *    docs/.project-memory/specs/security-audit-S00-1.md):
 *    https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/
 *
 * Analytics: Umami Cloud Hobby (free, 6 months retention, per umami.is/pricing,
 * read 18 Nov 2026). The "Cookies and analytics" section is written to fit the
 * statistical purposes exception: sole purpose is statistics to improve the
 * service, clear information, a simple and free way to object, no longer kept
 * than needed, and the provider is a processor. Each of those has a matching
 * line in the section. If any of them stops being true, the exception no longer
 * applies and consent is needed.
 * The section says Umami stores visit data in the EU. That holds only if Phil
 * picks the EU region at Umami signup. The region cannot be changed afterwards.
 * Say "pseudonymous" if needed. Never call the visitor code "anonymous".
 * The section names "legitimate interests" as the UK GDPR basis for counting
 * visits. Phil confirmed this on 18 Nov 2026.
 * Opt-out storage: the choice lives in this browser only (Umami's disable flag).
 * The `optOut` copy and the last paragraph of the section say so. Keep them true
 * if Yuki changes how it is stored.
 * Do Not Track is already honoured. The section also says Global Privacy Control
 * is honoured, which is true only once Yuki's GPC check ships.
 *
 * Kit facts (kit.com/dpa, read 18 Nov 2026 via a page summary):
 * TODO(phil): open kit.com/dpa and confirm three lines in `providerFacts`
 * before launch. Section 5.3 relies on the SCCs "in tandem with the UK IDTA",
 * which the document defines as an Addendum. Attachment 3 (updated 9 Oct 2026)
 * lists OpenAI OpCo, LLC for application AI functionality, and every
 * sub-processor processes in the USA. The DPA does not state Kit's own primary
 * location.
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

/** The one place the email provider is named. Kit Free, decision D-006. */
const provider = "Kit";

/**
 * Provider-specific facts, written for Kit (see the Kit note in the header).
 * If the provider ever changes, re-check each line against its DPA.
 */
const providerFacts = {
  /** Where the provider stores data. */
  location: "the United States",
  /** The transfer tool the provider's DPA relies on. */
  transferTool: "the UK International Data Transfer Addendum",
  /** Sub-processors worth naming. Kit's list includes OpenAI. */
  subprocessors: "Its list of service providers includes OpenAI.",
  /** Double opt-in: the provider emails a confirmation link first. */
  doubleOptIn:
    "After you sign up, I send one email asking you to confirm. You are not on the list until you click the link.",
};

/**
 * Analytics facts, written for Umami Cloud from Viktor's verification of
 * 18 Nov 2026 (finding U1). Assumes Phil picks the EU data region.
 */
const analyticsFacts = {
  tool: "Umami Cloud",
  /** How Umami tells visitors apart. Pseudonymous, so never "anonymous". */
  identification:
    "Umami Cloud tells visitors apart with a code made from your IP address and browser details, mixed with a value that changes each month. It does not store your IP address with your visits. The code changes at the start of each month, so it cannot link this month's visits to last month's. I treat the code as personal data.",
  /** Where Umami Cloud stores the data, and how UK transfers are covered. */
  location:
    "It stores the visit data in the EU. Umami is a US company, and some of its service providers, for example for hosting and support, are in the US. Transfers from the UK are covered by the UK Addendum to the EU standard contractual clauses in Umami's data processing agreement.",
  /** Retention on the free plan, per umami.is/pricing, read 18 Nov 2026. */
  retention: "6 months",
};

/** Privacy notice. Sections are separated by blank lines; the page keeps line breaks. */
const privacyBody = `Last updated: 18 November 2026

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

Changes
If how I use your data changes, I will update this page and the date at the top.

Cookies and analytics
This site sets no cookies. I use ${analyticsFacts.tool} to count visits. It shows me which pages and tools people use, and where they leave before signing up. I use that to improve this site and for nothing else. My legal basis is legitimate interests, because I need to know which pages and tools work.

For each visit, ${analyticsFacts.tool} records:
- the page address and title
- the site you came from, and any campaign tags on the link
- your browser and its version
- your operating system
- your device type and screen size
- your language
- your country, region and city, worked out from your IP address

It also counts these actions:
- signing up, and which form you used
- signup errors
- clicks on my social links
- using a tool

${analyticsFacts.tool} does not receive anything you type into a form, including your email address. It stores no name or email address with a visit, and I do not link visits to the signup list.

${analyticsFacts.identification} Umami Cloud and its providers may keep IP addresses in short-term security logs.

${analyticsFacts.tool} is my processor. It can only use this data to give me these statistics, and I do not share it with anyone for advertising. ${analyticsFacts.location} On the free plan it keeps data for ${analyticsFacts.retention}.

Browsers that send Do Not Track or Global Privacy Control are not counted.

You can opt out at any time with the button below. Opting out saves one setting in this browser to remember your choice. Nothing else is stored on your device.`;

export const copy = {
  // Used for meta description, Open Graph and JSON-LD.
  siteDescription:
    "Plain-English guides and free tools that show small business owners how to get useful results from AI. Written and built by Phil.",
  /** Full <title> for the home page. Other pages get " | <site name>" added. */
  homeMetaTitle: `${brand}: Free AI Guides for Small Business`,
  /** Text on the default share image, and its alt text. */
  shareStrapline: "Plain-English AI guides and free tools for small business",

  home: {
    title: "Your customers are probably asking AI before Google.",
    /** The words in `title` that get the hand-drawn marker. Must appear in `title` exactly. */
    titleMark: "asking AI",
    heroPrimary: "Read the latest guide",
    heroSecondary: "Get new guides by email",
    intro:
      "I write plain-English guides and build free tools that help small business owners get more from AI.",
    latestHeading: "Latest guides",
    moreHeading: "Earlier guides",
    allPostsLink: "All posts",
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
    description:
      "Short, practical guides that help small business owners get found online and get more done with AI. Pick a topic or read them all.",
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
    description:
      "Free tools that each do one job for your small business website. They run in your browser and need no sign-up.",
    heading: "Free tools",
    intro: "Each tool does one job and runs in your browser. You don't need to sign up to use them.",
    comingHeading: "Coming next",
    listHeading: "The tools so far",
  },

  about: {
    title: "About",
    description: `Phil runs ${brand}: plain-English AI guides and free tools for small businesses. No subscriptions and no affiliate links.`,
    heading: "About this site",
    body: `${brand} helps small businesses use AI to get found online and save time.

I think AI is a useful tool for getting things done faster. Most people do not know how to get the result they need from it. The tools and guides here try to close that gap.

Everything is free. There are no subscriptions and no affiliate links. The site is new, and the first tools are still being built.`,
    // TODO(phil): add one or two true lines on your background and why you are building this. Nothing is invented here.
    authorBio:
      "Phil runs the site and writes everything on it. [TODO(phil): add one or two lines on your background and why you are building this.]",
  },

  privacy: {
    title: "Privacy",
    description:
      "How this site handles your data: what it collects, why, who holds it, how visits are counted, and how to unsubscribe or opt out.",
    heading: "Privacy",
    /** Ends with the "Cookies and analytics" section. Render the opt-out control directly after it. */
    body: privacyBody,
    /**
     * Copy for the visit-counting opt-out control, shown under the body.
     * `heading` is the control's heading. `stopCounting` and `countAgain` are the
     * button labels (the button shows the action that is available now).
     * `confirmStopped` and `confirmCounting` appear after a click, in an
     * aria-live region. `browserNote` is always visible.
     */
    optOut: {
      heading: "Opt out of visit counting",
      explanation: "Stop Umami Cloud counting your visits to this site.",
      stopCounting: "Stop counting my visits",
      countAgain: "Count my visits again",
      confirmStopped: "Done. Visits from this browser are no longer counted.",
      confirmCounting: "Visits from this browser are counted again.",
      browserNote:
        "Your choice is saved in this browser only. Repeat it on each browser and device you use. Clearing your site data in this browser removes it.",
    },
  },

  newsletter: {
    title: "Newsletter",
    // TODO(phil): once the weekly cap is confirmed, end with "One email a week at most, and you can leave any time."
    description:
      "Get free tools and plain-English guides for small businesses by email when each one is ready. Every email has an unsubscribe link.",
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
    privacy: "Privacy policy",
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
    /** Double opt-in is on and confirmed working with Kit. */
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

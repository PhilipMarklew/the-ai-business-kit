/**
 * All placeholder page copy lives here so Margot can replace it in one file.
 * Every string marked TODO(copy) is a stand-in, not final wording.
 */
export const copy = {
  // TODO(copy): site description, used for meta description, Open Graph and JSON-LD
  siteDescription:
    "Free AI tools and plain guides to help small businesses get found, build trust and run better online.",

  home: {
    title: "Get found, build trust, run better online", // TODO(copy)
    intro:
      "Free tools and short guides for small businesses that want to use AI without the hype.", // TODO(copy)
    newsletterLink: "Get new tools by email", // TODO(copy)
    listHeading: "What you will find here", // TODO(copy)
    listItems: [
      "Free tools that each do one job and run in your browser.", // TODO(copy)
      "Guides written in plain English, with no jargon for its own sake.", // TODO(copy)
      "One email when something new is ready.", // TODO(copy)
    ],
    signupHeading: "Get the next tool by email", // TODO(copy)
  },

  about: {
    title: "About",
    description: "Who runs this site and why.", // TODO(copy)
    heading: "About this site", // TODO(copy)
    body: "TODO(copy): about text. Margot writes this once Phil has confirmed what he wants to say.",
    authorBio: "TODO(copy): author bio.",
  },

  privacy: {
    title: "Privacy",
    description: "How this site handles your data.", // TODO(copy)
    heading: "Privacy",
    body: "TODO(copy): privacy notice. Margot writes this (UK GDPR and PECR). Phil reviews it.",
  },

  newsletter: {
    title: "Newsletter",
    description: "Get new tools and guides by email.", // TODO(copy)
    heading: "Get new tools by email", // TODO(copy)
    points: [
      "What arrives: TODO(copy)", // TODO(copy)
      "How often: TODO(copy)",
      "Leave any time: TODO(copy)",
    ],
  },

  notFound: {
    title: "Page not found",
    heading: "That page is not here.", // TODO(copy)
    body: "It may have moved, or the link was wrong.", // TODO(copy)
  },

  footer: {
    // TODO(copy): Phil confirms the named-author wording (surname or not).
    builtBy: "Built by",
  },

  toolShell: {
    signupHeading: "Got a result? Get the next tool by email.", // TODO(copy)
  },

  signup: {
    label: "Email address", // TODO(copy)
    button: "Subscribe", // TODO(copy)
    sending: "Sending", // TODO(copy)
    consent:
      "TODO(copy): consent wording (UK GDPR / PECR), written by Margot. Shown next to the button.",
    success: "TODO(copy): Check your inbox and confirm your email address.",
    errors: {
      invalid_email: "That email address does not look right. Check it and try again.", // TODO(copy)
      consent_required: "Tick the box to agree before you subscribe.", // TODO(copy)
      rate_limited: "Too many tries. Wait a few minutes and try again.", // TODO(copy)
      provider_unavailable: "Something went wrong on our side. Try again in a moment.", // TODO(copy)
      network: "Could not reach the server. Check your connection and try again.", // TODO(copy)
    },
  },
} as const;

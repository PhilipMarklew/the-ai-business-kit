/**
 * The three topics. They are the three halves of the positioning line in
 * PRODUCT.md: get found, get trusted, run better. Every post belongs to one.
 */
export type TopicSlug = "get-found" | "get-trusted" | "run-better";

export type Topic = {
  slug: TopicSlug;
  name: string;
  /** One line for the topic page and the topic nav. */
  summary: string;
};

export const topics: Topic[] = [
  {
    slug: "get-found",
    name: "Get found",
    summary: "Show up when people search, on Google and in AI tools like ChatGPT.",
  },
  {
    slug: "get-trusted",
    name: "Get trusted",
    summary: "Give people a reason to pick you once they land on your site.",
  },
  {
    slug: "run-better",
    name: "Run better",
    summary: "Use AI to take the repetitive work off your plate.",
  },
];

export function getTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function isTopicSlug(value: unknown): value is TopicSlug {
  return typeof value === "string" && topics.some((t) => t.slug === value);
}

import "server-only";
import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";

/** Internal links use next/link; external ones open in place but say so to screen readers. */
function MdxLink({ href = "", children, ...rest }: ComponentProps<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} rel="noopener" {...rest}>
      {children}
    </a>
  );
}

const components: MDXComponents = { a: MdxLink };

/**
 * Compile and render a post body. Runs at build time only (posts are static),
 * so the cost of compiling MDX never reaches a visitor.
 * Post files are authored by Phil and committed to git: they are trusted input.
 */
export async function renderMdx(source: string) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    rehypePlugins: [rehypeSlug],
  });
  return <Content components={components} />;
}

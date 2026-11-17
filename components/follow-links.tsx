import { liveSocial } from "@/lib/social";
import { cn } from "@/lib/utils";

/**
 * "Not ready to sign up? Follow along." The secondary call to action from
 * PRODUCT.md. Renders nothing until at least one profile URL is set.
 */
export function FollowLinks({ tone = "default", className }: { tone?: "default" | "accent"; className?: string }) {
  if (liveSocial.length === 0) return null;
  return (
    <p className={cn("text-sm", tone === "accent" ? "text-on-accent" : "text-muted", className)}>
      Not ready for email? Follow along on{" "}
      {liveSocial.map((s, i) => (
        <span key={s.name}>
          {i > 0 && (i === liveSocial.length - 1 ? " or " : ", ")}
          <a
            href={s.url}
            rel="me noopener"
            className={cn("font-semibold underline", tone === "accent" && "text-on-accent hover:text-on-accent")}
          >
            {s.name}
          </a>
        </span>
      ))}
      .
    </p>
  );
}

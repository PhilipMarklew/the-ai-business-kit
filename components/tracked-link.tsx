"use client";

import type { ComponentProps } from "react";
import { track } from "@/lib/analytics";

/** External profile link that records a follow_click (network name only). */
export function FollowLink({
  network,
  placement,
  ...props
}: ComponentProps<"a"> & { network: string; placement: "follow_links" | "footer" }) {
  return <a {...props} onClick={() => track("follow_click", { network, placement })} />;
}

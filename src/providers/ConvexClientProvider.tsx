"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    // Always provide a non-empty URL to prevent build-time errors
    // If NEXT_PUBLIC_CONVEX_URL is not set, use a placeholder that Convex accepts
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";
    return new ConvexReactClient(convexUrl);
  }, []);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}


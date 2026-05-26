import type { MetadataRoute } from "next";

// -----------------------------------------------------------------------
// Apply the rule below to every crawler/bot.
// Disallow indexing of the entire site — this is an internal
// call-viewer portal and must not appear in public search results.
// -----------------------------------------------------------------------

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}

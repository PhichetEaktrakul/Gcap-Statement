import type { RuntimeConfig } from "@/lib/config";

// ----------------------------------------------------------------------------------
// Backend-for-frontend config endpoint. The browser fetches this to learn the
// backend URLs instead of having them baked into the bundle at build time.
// Reading process.env here (NOT NEXT_PUBLIC_) means a single standalone image
// serves whatever the container's environment provides — change env, restart,
// done. See lib/config.ts and components/config-provider.tsx.
// Read env per request and never prerender/cache, so the response always
// reflects the live container environment.
// ----------------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export async function GET() {
  const config: RuntimeConfig = {
    baseUrl: process.env.BASE_URL ?? "",
    priceBaseUrl: process.env.PRICE_BASE_URL ?? "",
  };

  return Response.json(config, {
    headers: { "Cache-Control": "no-store" },
  });
}

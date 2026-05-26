// ----------------------------------------------------------------------------------
// Runtime backend config served per-environment from /api/config.
// Lifecycle: ConfigProvider calls loadRuntimeConfig() and blocks rendering
// until it resolves, so the synchronous accessors below always see populated
// values on the client. On the server we read process.env directly.
// See app/api/config/route.ts and components/config-provider.tsx.
// ----------------------------------------------------------------------------------

export type RuntimeConfig = { baseUrl: string; priceBaseUrl: string };

const EMPTY: RuntimeConfig = { baseUrl: "", priceBaseUrl: "" };

const CONFIG_ENDPOINT = "/api/config";

let cached: RuntimeConfig | null = null;
let inflight: Promise<RuntimeConfig> | null = null;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = fetch(CONFIG_ENDPOINT, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`Config request failed: ${res.status}`);
      return res.json() as Promise<RuntimeConfig>;
    })
    .then((cfg) => {
      cached = {
        baseUrl: cfg.baseUrl ?? "",
        priceBaseUrl: cfg.priceBaseUrl ?? "",
      };
      return cached;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

// ----------------------------------------------------------------------------------
// Synchronous accessor used by the axios clients and SignalR hook. Server
// reads env directly; client returns the value loaded at startup, falling
// back to EMPTY only if somehow called before ConfigProvider resolved.
// ----------------------------------------------------------------------------------

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === "undefined") {
    return {
      baseUrl: process.env.BASE_URL ?? "",
      priceBaseUrl: process.env.PRICE_BASE_URL ?? "",
    };
  }
  return cached ?? EMPTY;
}

export const getApiBaseUrl = () => `${getRuntimeConfig().baseUrl}/api`;
export const getSignalrHubUrl = () => `${getRuntimeConfig().baseUrl}/hubs/app`;
export const getPriceBaseUrl = () => getRuntimeConfig().priceBaseUrl;

// Backend endpoints, resolved at call time rather than baked in at build time.
// Deliberately NOT NEXT_PUBLIC_ (which would inline one env's URLs into the
// image). The root layout reads the container env per request and injects it
// into the browser; getRuntimeConfig reads env on the server and that injected
// global on the client. So a single standalone image works across environments.

export type RuntimeConfig = { baseUrl: string; priceBaseUrl: string };

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window !== "undefined") {
    return window.__APP_CONFIG__ ?? { baseUrl: "", priceBaseUrl: "" };
  }
  return {
    baseUrl: process.env.BASE_URL ?? "",
    priceBaseUrl: process.env.PRICE_BASE_URL ?? "",
  };
}

export const getApiBaseUrl = () => `${getRuntimeConfig().baseUrl}/api`;
export const getSignalrHubUrl = () => `${getRuntimeConfig().baseUrl}/hubs/app`;
export const getPriceBaseUrl = () => getRuntimeConfig().priceBaseUrl;

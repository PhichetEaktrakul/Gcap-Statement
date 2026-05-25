import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL } from "@/lib/config";

const baseURL = API_BASE_URL;
const priceURL = process.env.PRICE_BASE_URL ?? "";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Separate client for the public gold-price feed. No auth interceptors,
// no withCredentials — it's a different host with its own contract.
export const priceClient: AxiosInstance = axios.create({
  baseURL: priceURL,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
});

const TOKEN_STORAGE_KEY = "gcap.access_token";
const TOKEN_COOKIE_KEY = "access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    document.cookie = `${TOKEN_COOKIE_KEY}=${token}; path=/; SameSite=Lax`;
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    document.cookie = `${TOKEN_COOKIE_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
  }
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const headers = config.headers;
    const alreadyAuthed =
      headers &&
      (headers.has?.("Authorization") || !!(headers as any).Authorization);
    if (!alreadyAuthed) {
      const token = getAccessToken();
      if (token && headers) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Refresh-token plumbing — single in-flight refresh, queued retries.
type RefreshResponse = {
  success: boolean;
  data: { token: string };
};

let refreshingPromise: Promise<string> | null = null;

function performRefresh(): Promise<string> {
  if (refreshingPromise) return refreshingPromise;
  refreshingPromise = axios
    .post<RefreshResponse>(
      `${baseURL}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    )
    .then((res) => {
      const token = res.data?.data?.token;
      if (!token) throw new Error("Missing token in refresh response");
      setAccessToken(token);
      return token;
    })
    .finally(() => {
      refreshingPromise = null;
    });
  return refreshingPromise;
}

export function refreshAccessToken(): Promise<string> {
  return performRefresh();
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const status = error.response?.status;

    if (!original || status !== 401) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints (login, refresh itself, registration stages).
    const url = original.url ?? "";
    if (url.includes("/auth/") || original._retried) {
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      const newToken = await performRefresh();
      if (original.headers) {
        original.headers.set("Authorization", `Bearer ${newToken}`);
      }
      return apiClient.request(original);
    } catch (refreshErr) {
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshErr);
    }
  },
);

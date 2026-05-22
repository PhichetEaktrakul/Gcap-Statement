const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export const API_BASE_URL = `${BASE_URL}/api`;
export const SIGNALR_HUB_URL = `${BASE_URL}/hubs/app`;

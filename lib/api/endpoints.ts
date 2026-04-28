export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    verifyOtp: "/auth/verify-otp",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  dashboard: {
    summary: "/dashboard/summary",
    marginCover: "/dashboard/margin-cover",
  },
  portfolio: {
    list: "/portfolio",
    detail: (ticket: string) => `/portfolio/${ticket}`,
  },
  history: {
    list: "/history",
  },
  leaveOrder: {
    list: "/leave-orders",
    create: "/leave-orders",
    cancel: (id: string) => `/leave-orders/${id}/cancel`,
  },
} as const;

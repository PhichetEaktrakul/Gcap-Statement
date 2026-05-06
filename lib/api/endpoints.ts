export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    verifyOtp: "/auth/verify-otp",
    setPassword: "/auth/set-password",
    refresh: "/auth/refresh",
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
  gcalltrade: {
    customer: {
      profile: "/gcalltrade/customer/profile",
      assets: "/gcalltrade/customer/assets",
      marginCover: "/gcalltrade/customer/margin-cover",
    },
    trade: {
      ticketsHistory: "/gcalltrade/trade/tickets/history",
    },
  },
} as const;

export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    verifyOtp: "/auth/verify-otp",
    setPassword: "/auth/set-password",
    validatePassword: "/auth/validate-password",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  gcalltrade: {
    customer: {
      profile: "/gcalltrade/customer/profile",
      assets: "/gcalltrade/customer/assets",
      marginCover: "/gcalltrade/customer/margin-cover",
    },
    trade: {
      ticketsHistory: "/gcalltrade/trade/tickets/history",
      ticketsActive: "/gcalltrade/trade/tickets/active",
      leaveOrders: "/gcalltrade/trade/leave-orders",
    },
  },
  gold: {
    latest: "/api/gold-gcap/latest",
  },
} as const;

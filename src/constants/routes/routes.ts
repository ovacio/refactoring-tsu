export const ADMIN_ROUTES = {
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_USER: (userId: string): string => `/admin/users/${userId}`,
  ADMIN_USEFUL_SERVICES: "/admin/usefulservices",
  ADMIN_EVENTS: "/admin/events",
  ADMIN_EVENTS_CREATE: "/admin/events/creating",
  ADMIN_EVENTS_EDIT: (eventId?: string): string =>
    `/admin/events/editing/${eventId}`,
  ADMIN_EVENT: (eventId: string): string => `/admin/event/${eventId}`,
} as const;

export const PUBLIC_ROUTES = {
  DEFAULT: "/",
  LOGIN: "/login",
  SERVER_ERROR: "/server-error",
  NOT_FOUND: "*",
  PROFILE: "/profile",
  USEFUL_SERVICES: "/usefulservices",
  CERTIFICATES: "/certificates",
  EVENTS: "/events",
  EVENT: (eventId: string): string => `/events/${eventId}`,
} as const;

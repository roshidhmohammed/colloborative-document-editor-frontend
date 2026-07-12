export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/",
  LOGOUT: "/auth/logout",
  USER_AUTH: "/auth/check-user-auth",
  USER_PROFILE: "/user/profile",
  DOCUMENTS: "/document",
  DOCUMENT_BY_TOKEN: (documentToken: string) =>
    `/document/${encodeURIComponent(documentToken)}`,
  DOCUMENT_COLLABORATORS: (documentId: string) =>
    `/document/${documentId}/collaborators`,
} as const;

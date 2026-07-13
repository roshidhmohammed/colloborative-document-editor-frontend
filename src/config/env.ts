export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "https://colloborative-doc-editor-backend-production.up.railway.app/api",
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV!,
  SOCKET_URL:process.env.NEXT_PUBLIC_SOCKET_URL || "https://colloborative-doc-editor-backend-production.up.railway.app/"
};
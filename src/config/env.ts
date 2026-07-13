export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "https://colloborative-doc-editor-backend-production.up.railway.app/api",
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV!,
  SOCKET_URL:process.env.NEXT_PUBLIC_SOCKET_URL || "https://colloborative-doc-editor-backend-production.up.railway.app/"
};


console.log("===== ENV DEBUG =====");
console.log("API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("APP_ENV:", process.env.NEXT_PUBLIC_APP_ENV);
console.log("SOCKET_URL:", process.env.NEXT_PUBLIC_SOCKET_URL);
console.log("=====================");
/** The public web address of the store, e.g. https://zarghoon.com */
export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  // Set automatically by Vercel.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

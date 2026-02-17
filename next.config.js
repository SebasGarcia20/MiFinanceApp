/** @type {import('next').NextConfig} */
const nextConfig = {
  // If you see "No link element found for chunk app_globals_*.css" with Turbopack,
  // run: npm run dev:webpack
  experimental: {
    // Inline global CSS in production to avoid chunk load issues (dev still uses link tags)
    inlineCss: true,
  },
};

module.exports = nextConfig;

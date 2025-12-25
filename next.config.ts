import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Firebase Hosting
  output: "export",

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Disable Turbopack if experiencing panics
  // Remove this if the issue is resolved
  // experimental: {
  //   turbo: false,
  // },

  // Security Headers Configuration (Note: headers don't work with static export)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              'camera=(self), microphone=(self), geolocation=(self), interest-cohort=()',
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Script sources: เพิ่ม reCAPTCHA Enterprise script source
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://www.google.com/recaptcha/",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // Connect sources: เพิ่ม google-analytics.com และ reCAPTCHA API endpoints, รวม Firebase Cloud Functions
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.google.com https://api.geoapify.com https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://content-firebaseappcheck.googleapis.com https://*.cloudfunctions.net",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              // Frame sources: เพิ่ม reCAPTCHA iframe sources และ Firebase domains สำหรับ App Check
              "frame-src 'self' https://www.google.com https://www.googletagmanager.com https://www.google.com/recaptcha/ https://*.firebaseapp.com https://*.web.app https://*.firebaseappcheck.googleapis.com",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

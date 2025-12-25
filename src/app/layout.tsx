import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppCheckProvider } from "@/components/firebase/AppCheckProvider";
import { PermissionsPolicy } from "@/components/common/PermissionsPolicy";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LogiTrack",
  description: "LogiTrack Driver Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get reCAPTCHA site key from environment variables
  // Priority: Enterprise > v3 > default
  const recaptchaSiteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY ||
    process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY ||
    process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ||
    "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF";
  
  // Determine if using Enterprise or v3
  const isEnterprise = !!process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const recaptchaScriptUrl = isEnterprise
    ? `https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`
    : `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;

  // #region agent log
  // Log site key used in script (server-side, will be logged at build time)
  if (typeof window === "undefined") {
    console.log("[DEBUG] reCAPTCHA Script URL:", recaptchaScriptUrl);
    console.log("[DEBUG] Site key used:", recaptchaSiteKey.substring(0, 20) + "...");
  }
  // #endregion

  return (
    <html lang="en">
      <head>
        {/* reCAPTCHA Script (Enterprise or v3) */}
        <Script
          src={recaptchaScriptUrl}
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PermissionsPolicy />
        <AppCheckProvider>{children}</AppCheckProvider>
      </body>
    </html>
  );
}

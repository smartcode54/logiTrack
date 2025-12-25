import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PermissionsPolicy } from "@/components/common/PermissionsPolicy";
import { AppCheckProvider } from "@/components/firebase/AppCheckProvider";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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

  return (
    <html lang="en">
      <head>
        {/* reCAPTCHA Script (Enterprise or v3) */}
        <Script src={recaptchaScriptUrl} strategy="afterInteractive" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PermissionsPolicy />
        <AppCheckProvider>{children}</AppCheckProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PermissionsPolicy />
        <AppCheckProvider>{children}</AppCheckProvider>
      </body>
    </html>
  );
}

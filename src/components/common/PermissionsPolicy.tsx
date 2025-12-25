"use client";

import { useEffect } from "react";

export const PermissionsPolicy = () => {
  useEffect(() => {
    // Remove existing meta tag if present
    const existing = document.querySelector(
      'meta[http-equiv="Permissions-Policy"]'
    );
    if (existing) {
      existing.remove();
    }

    // Create and add the meta tag
    // Note: private-token is for Private State Tokens (Trust Tokens) used by reCAPTCHA
    const meta = document.createElement("meta");
    meta.httpEquiv = "Permissions-Policy";
    meta.content =
      'camera=(self), microphone=(self), geolocation=(self), private-token=(self "https://www.google.com" "https://www.gstatic.com")';
    document.head.appendChild(meta);

    return () => {
      // Cleanup on unmount
      const metaToRemove = document.querySelector(
        'meta[http-equiv="Permissions-Policy"]'
      );
      if (metaToRemove) {
        metaToRemove.remove();
      }
    };
  }, []);

  return null;
};

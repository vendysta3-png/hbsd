import { useState, useEffect, useCallback } from "react";

const BRANDING_TEXT_KEY = "app-branding-text";
const BRANDING_LOGO_KEY = "app-branding-logo";
const DEFAULT_TEXT = "Gestion Retours";

export function useBranding() {
  const [appName, setAppName] = useState(() => localStorage.getItem(BRANDING_TEXT_KEY) || DEFAULT_TEXT);
  const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem(BRANDING_LOGO_KEY));

  useEffect(() => {
    const handler = () => {
      setAppName(localStorage.getItem(BRANDING_TEXT_KEY) || DEFAULT_TEXT);
      setLogoUrl(localStorage.getItem(BRANDING_LOGO_KEY));
    };
    window.addEventListener("branding-updated", handler);
    return () => window.removeEventListener("branding-updated", handler);
  }, []);

  const updateAppName = useCallback((name: string) => {
    const value = name.trim() || DEFAULT_TEXT;
    localStorage.setItem(BRANDING_TEXT_KEY, value);
    setAppName(value);
    window.dispatchEvent(new Event("branding-updated"));
  }, []);

  const updateLogo = useCallback((dataUrl: string | null) => {
    if (dataUrl) {
      localStorage.setItem(BRANDING_LOGO_KEY, dataUrl);
    } else {
      localStorage.removeItem(BRANDING_LOGO_KEY);
    }
    setLogoUrl(dataUrl);
    window.dispatchEvent(new Event("branding-updated"));
  }, []);

  return { appName, logoUrl, updateAppName, updateLogo };
}

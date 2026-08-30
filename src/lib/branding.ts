"use client";

export type Branding = {
  companyName: string;
  email: string;
  logoPlaceholder: string; // can be text or URL in future
};

const STORAGE_KEY = "branding_settings";

export function getBranding(): Branding {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      return JSON.parse(raw) as Branding;
    }
  } catch {
    // ignore parse errors
  }
  return {
    companyName: "[Nama Perusahaan Anda]",
    email: "info@perusahaan.com",
    logoPlaceholder: "[Logo]",
  };
}

export function setBranding(b: Branding) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
  } catch {
    // ignore
  }
}

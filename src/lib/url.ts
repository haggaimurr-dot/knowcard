import type { StoreResult } from "./types";

export function normalizeHttpsUrl(input: string): StoreResult<string> {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2000) {
    return { ok: false, error: trimmed.length > 2000 ? "too_long" : "invalid_url" };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: "invalid_url" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "https_only" };
  }

  if (!url.hostname) {
    return { ok: false, error: "invalid_url" };
  }

  return { ok: true, data: url.toString() };
}

export function isHttpsUrl(input: string): boolean {
  return normalizeHttpsUrl(input).ok;
}

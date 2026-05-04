import type { HomeMaterial } from "../types";

export function formatRelativeTime(
  iso: string | undefined,
  locale: string
): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const now = Date.now();
  const diffSec = Math.round((then - now) / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHours = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHours / 24);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, "day");
  }
  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffMin) >= 1) {
    return rtf.format(diffMin, "minute");
  }
  return rtf.format(0, "second");
}

export function materialFileBadge(
  materialType?: HomeMaterial["materialType"]
): string {
  return materialType === "UPLOAD" ? "PDF" : "DOCX";
}

import type { GuestGender } from "./types";

export const ENTRY_ID_PATTERN = /^(\d{4}|\d{6})$/;

export const sanitizeEntryId = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }

  const digitsOnly = value.replace(/\D/g, "");
  return ENTRY_ID_PATTERN.test(digitsOnly) ? digitsOnly : "";
};

export const formatGuestName = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

export const normalizeNameKey = (value: string | null | undefined): string =>
  formatGuestName(value).toLowerCase();

export const sanitizeFreeText = (
  value: string | null | undefined,
  maxLength = 250
): string => {
  if (!value) {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
};

export const coerceGuestGender = (value: unknown): GuestGender => {
  if (value === "Male" || value === "Female") {
    return value;
  }

  return "Unknown";
};

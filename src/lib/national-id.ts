export const NATIONAL_ID_DIGIT_LENGTH = 11;

/** Strip non-digits and cap at 11 characters (BVN / NIN). */
export function sanitizeNationalIdInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, NATIONAL_ID_DIGIT_LENGTH);
}

export function nationalIdDigits(value: string | undefined): string {
  return value?.replace(/\D/g, "") ?? "";
}

/** No error when empty; requires exactly 11 digits when provided. */
export function validateNationalIdField(
  value: string | undefined,
  label: "BVN" | "NIN"
): string | null {
  const digits = nationalIdDigits(value);
  if (!digits) return null;
  if (digits.length !== NATIONAL_ID_DIGIT_LENGTH) {
    return `${label} must be exactly 11 digits.`;
  }
  return null;
}

export function isValidOptionalNationalId(value: string | undefined): boolean {
  const digits = nationalIdDigits(value);
  return digits.length === 0 || digits.length === NATIONAL_ID_DIGIT_LENGTH;
}

/**
 * Shared classNames join helper (KI-011).
 * Join conditional Tailwind classNames tanpa dependency npm baru (DS-D04/DS-D05).
 */

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

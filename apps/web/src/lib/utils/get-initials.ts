/**
 * Derives up to 2 uppercase initials from a display name, for `AvatarFallback`
 * (shadcn `Avatar` has no built-in "name" -> initials prop, unlike Astryx's
 * `Avatar name=...`, T-098). Single word -> first 2 chars; multiple words ->
 * first char of first + last word.
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

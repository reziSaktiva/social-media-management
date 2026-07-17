/** Shared value objects — no business logic. */

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export type Email = string & { readonly _brand: "Email" };
export type Url = string & { readonly _brand: "Url" };

export function asEmail(value: string): Email {
  return value as Email;
}

export function asUrl(value: string): Url {
  return value as Url;
}

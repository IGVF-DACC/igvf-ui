/**
 * Possible request methods for a fetch request.
 */
export type FetchMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH";

/**
 * HTTP request headers.
 */
export interface HttpHeaders {
  Accept?: string;
  "Content-Type"?: string;
  Cookie?: string;
  "X-CSRF-Token"?: string;
}

/**
 * Arguments for a FetchRequest constructor.
 */
export interface FetchRequestInitializer {
  cookie?: string;
  session?: SessionObject;
  backend?: boolean;
}

/**
 * Format of standard error responses.
 */
export interface ErrorObject {
  isError: true;
  "@type": Array<string>;
  code: number;
  description: string;
  detail: string;
  status: string;
  title: string;
}

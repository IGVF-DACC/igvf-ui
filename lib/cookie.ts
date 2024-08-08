// node_modules
import { cookies } from "next/headers";

/**
 * The cookie we send to igvfd for server-side requests composes all the cookie values from the
 * browser. Take the array of cookie keys and their values and compose a single cookie string from
 * them that we can send to igvfd for each request to the igvfd server.
 * @param cookieElements Array of objects with cookie keys and values
 * @returns Composed cookie string
 */
export function composeCookie(
  cookieElements: { name: string; value: string }[]
): string {
  const singleCookies = cookieElements.map(
    (cookieElement) => `${cookieElement.name}=${cookieElement.value}`
  );
  return singleCookies.join("; ");
}

/**
 * Gets the current cookies from the browser and composes a single cookie string from them that we
 * can send in each request to the igvfd server.
 * @returns Composed cookie string
 */
export function getCookie(): string {
  const cookieElements = cookies().getAll();
  return composeCookie(cookieElements);
}

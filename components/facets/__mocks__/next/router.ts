/**
 * Mock for next/router used in facet component tests. This mock automatically gets used when
 * jest.mock('next/router') is called in any test file within components/facets/__tests__/
 */

export function useRouter() {
  return {
    route: "/",
    pathname: "",
    query: "",
    asPath: "",
    push: jest.fn().mockImplementation((href) => {
      window.location.href = `https://www.example.com${href}`;
    }),
  };
}

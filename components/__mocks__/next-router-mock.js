/**
 * Mock the Next.js router.
 */
import { jest } from "@jest/globals";

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "",
      push: jest.fn().mockImplementation((href) => {
        window.location.href = href;
      }),
    };
  },
}));

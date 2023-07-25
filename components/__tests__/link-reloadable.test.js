import { render, screen } from "@testing-library/react";
import GlobalContext from "../global-context";
import Link from "../link-reloadable";

describe("Test Link wrapper that can reload the page", () => {
  it("renders a link that reloads the page", () => {
    render(
      <GlobalContext.Provider value={{ linkReload: { isEnabled: true } }}>
        <Link href="/test">Test</Link>
      </GlobalContext.Provider>,
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Test")).toHaveAttribute("href", "/test");
    expect(screen.getByTestId("link-reload")).toBeInTheDocument();
  });

  it("renders a link that doesn't reload the page", () => {
    render(
      <GlobalContext.Provider value={{ linkReload: { isEnabled: false } }}>
        <Link href="/test">Test</Link>
      </GlobalContext.Provider>,
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Test")).toHaveAttribute("href", "/test");
    expect(screen.getByTestId("link-normal")).toBeInTheDocument();
  });
});

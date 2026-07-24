import { render, screen, fireEvent } from "@testing-library/react";
import { type PluginProps } from "../types";
import TocNavigation from "../toc-navigation";

const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "matchMedia"
);

describe("TocNavigation", () => {
  afterEach(() => {
    document
      .querySelectorAll("#user-content-section-1")
      .forEach((element) => element.remove());

    jest.restoreAllMocks();

    // Restore the original matchMedia property after each test to avoid side effects.
    if (originalMatchMediaDescriptor) {
      Object.defineProperty(window, "matchMedia", originalMatchMediaDescriptor);
    } else {
      delete (window as { matchMedia?: Window["matchMedia"] }).matchMedia;
    }
  });

  const items: PluginProps = {
    "Section 1": "#section-1",
    "Section 2": "#section-2",
  };

  it("renders the TOC items", () => {
    render(<TocNavigation {...items} />);

    // Check if the toggle button is rendered
    const tocButton = screen.getByTestId("toc-toggle-button");
    expect(tocButton).toBeInTheDocument();

    // Make sure the TOC content is not visible initially.
    expect(screen.queryByTestId("toc-content")).not.toBeInTheDocument();

    // Click the toggle button to open the TOC
    fireEvent.click(tocButton);

    // Check if the TOC content is now visible
    const tocContent = screen.getByTestId("toc-content");
    expect(tocContent).toBeInTheDocument();

    // Check if the TOC items are rendered correctly
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
  });

  it("scrolls to an anchor target", () => {
    // Create a mock target element for the anchor link.
    const target = document.createElement("div");
    target.id = "user-content-section-1";
    target.scrollIntoView = jest.fn();
    document.body.appendChild(target);

    // Mock the matchMedia function to simulate a user preference for reduced motion.
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: jest.fn().mockReturnValue({
        matches: false,
        media: "",
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });

    // Spy on the pushState method to verify that it is called correctly.
    const pushStateSpy = jest.spyOn(window.history, "pushState");

    // Render the TocNavigation component and simulate a click on the TOC item.
    render(<TocNavigation {...items} />);
    fireEvent.click(screen.getByTestId("toc-toggle-button"));
    fireEvent.click(screen.getByRole("link", { name: "Section 1" }));

    // Verify that the target element's scrollIntoView method was called with the expected parameters.
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(pushStateSpy).toHaveBeenCalledWith(
      null,
      "",
      "#user-content-section-1"
    );
  });

  it("returns when the anchor target cannot be found", () => {
    render(<TocNavigation {...items} />);
    fireEvent.click(screen.getByTestId("toc-toggle-button"));

    const link = screen.getByRole("link", { name: "Section 1" });

    const getElementSpy = jest
      .spyOn(document, "getElementById")
      .mockReturnValue(null);

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
    const pushStateSpy = jest.spyOn(window.history, "pushState");

    link.dispatchEvent(clickEvent);

    expect(getElementSpy).toHaveBeenCalledWith("user-content-section-1");
    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it("disables smooth scrolling when reduced motion is preferred", () => {
    const target = document.createElement("div");
    target.id = "user-content-section-1";
    target.scrollIntoView = jest.fn();
    document.body.appendChild(target);

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: jest.fn().mockReturnValue({
        matches: true,
      }),
    });

    render(<TocNavigation {...items} />);
    fireEvent.click(screen.getByTestId("toc-toggle-button"));
    fireEvent.click(screen.getByRole("link", { name: "Section 1" }));

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
  });

  it("uses smooth scrolling when matchMedia is unavailable", () => {
    delete (window as { matchMedia?: Window["matchMedia"] }).matchMedia;

    const target = document.createElement("div");
    target.id = "user-content-section-1";
    target.scrollIntoView = jest.fn();
    document.body.appendChild(target);

    render(<TocNavigation {...items} />);
    fireEvent.click(screen.getByTestId("toc-toggle-button"));
    fireEvent.click(screen.getByRole("link", { name: "Section 1" }));

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("renders nothing when there are no TOC items", () => {
    const emptyItems: PluginProps = {};
    const { container } = render(<TocNavigation {...emptyItems} />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render invalid TOC items", () => {
    const items = {
      Valid: "#valid-section",
      Invalid: "/invalid-section",
    };
    render(<TocNavigation {...items} />);
    // Make sure the TOC trigger exists.
    const tocButton = screen.getByTestId("toc-toggle-button");
    expect(tocButton).toBeInTheDocument();

    // Open the TOC and check that only the valid item is rendered.
    fireEvent.click(screen.getByTestId("toc-toggle-button"));

    expect(screen.getByRole("link", { name: "Valid" })).toBeInTheDocument();
    expect(screen.queryByText("Invalid")).not.toBeInTheDocument();
  });

  it("renders nothing when all TOC items are invalid", () => {
    const items = {
      Invalid1: "/invalid-section-1",
      Invalid2: "invalid-section-2",
      Invalid3: "section-3",
    };

    render(<TocNavigation {...items} />);

    const tocButton = screen.queryByTestId("toc-toggle-button");
    expect(tocButton).not.toBeInTheDocument();
  });
});

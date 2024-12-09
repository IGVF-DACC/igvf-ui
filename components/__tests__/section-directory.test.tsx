import { ReactNode } from "react";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import {
  getSecDirTargets,
  SecDir,
  secDirId,
  useSecDir,
} from "../section-directory";
import SessionContext from "../session-context";

describe("Test secDirId function", () => {
  it("should return empty string if id is empty", () => {
    expect(secDirId("")).toBe("");
  });

  it("should return ID with the section directory prefix", () => {
    expect(secDirId("test-id")).toBe("sec-dir-test-id");
  });
});

describe("Test getSecDirTargets function", () => {
  it("returns all elements with ids starting with the specified prefix", () => {
    // Arrange: Render a component with elements having ids starting with the prefix
    render(
      <>
        <div id="sec-dir-element-1">Element 1</div>
        <div id="sec-dir-element-2">Element 2</div>
        <div id="sec-dir-element-3">Element 3</div>
      </>
    );

    // Act: Call the function
    const elements = getSecDirTargets();

    // Assert: Verify the function returns the correct elements
    expect(elements).toHaveLength(3);
    expect(elements[0].id).toBe("sec-dir-element-1");
    expect(elements[1].id).toBe("sec-dir-element-2");
    expect(elements[2].id).toBe("sec-dir-element-3");
  });

  it("returns an empty NodeList when no matching elements are present", () => {
    // Arrange: Render a component without any matching elements
    render(
      <>
        <div id="other-id-1">Element 1</div>
        <div id="other-id-2">Element 2</div>
      </>
    );

    // Act: Call the function
    const elements = getSecDirTargets();

    // Assert: Verify the function returns an empty NodeList
    expect(elements).toHaveLength(0);
  });
});

interface MockSessionProviderProps {
  children: ReactNode;
  value: any; // Replace `any` with the type used in your context
}

export function MockSessionProvider({
  children,
  value,
}: MockSessionProviderProps): JSX.Element {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

describe("Test useSecDir() custom React hook", () => {
  jest.useFakeTimers();

  const mockSessionContextValue = {
    sessionProperties: {
      "auth.userid": "test-user",
    },
  };

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MockSessionProvider value={mockSessionContextValue}>
        <div id="sec-dir-section-1">Section 1</div>
        <div id="sec-dir-section-2">Section 2</div>
        {children}
      </MockSessionProvider>
    );
  }

  const mockSessionContextValueEmpty = {};

  function WrapperEmpty({ children }: { children: ReactNode }) {
    return (
      <MockSessionProvider value={mockSessionContextValueEmpty}>
        <div id="sec-dir-section-1">Section 1</div>
        <div id="sec-dir-section-2">Section 2</div>
        {children}
      </MockSessionProvider>
    );
  }

  it("should update the sections based on the DOM elements", () => {
    const { result } = renderHook(() => useSecDir(), {
      wrapper: Wrapper,
    });

    act(() => {
      // Force React to re-evaluate the effect.
      jest.runAllTimers();
    });

    // Assert the sections are updated
    expect(result.current?.items).toEqual([
      { id: "sec-dir-section-1", title: "Section 1" },
      { id: "sec-dir-section-2", title: "Section 2" },
    ]);
  });

  it("should update the sections based on the DOM elements", () => {
    const { result } = renderHook(() => useSecDir(), {
      wrapper: WrapperEmpty,
    });

    act(() => {
      // Force React to re-evaluate the effect.
      jest.runAllTimers();
    });

    // Assert the sections are updated
    expect(result.current?.items).toEqual([
      { id: "sec-dir-section-1", title: "Section 1" },
      { id: "sec-dir-section-2", title: "Section 2" },
    ]);
  });
});

describe("Test SecDir component", () => {
  beforeAll(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false, // You can set this to true or false depending on your test
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    window.scrollTo = jest.fn();
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  jest.useFakeTimers();

  const mockSessionContextValue = {
    sessionProperties: {},
  };

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MockSessionProvider value={mockSessionContextValue}>
        <div id="sec-dir-donor-table">Donor Section</div>
        <div id="sec-dir-modifications">Modification Section</div>
        <div id="sec-dir-section-2">Attr Section</div>
        {children}
      </MockSessionProvider>
    );
  }

  it("should render the section directory", () => {
    const sections = {
      items: [
        { id: "sec-dir-donor-table", title: "Donors" },
        { id: "sec-dir-modifications", title: "Modifications" },
        { id: "sec-dir-attribution", title: "Attribution" },
      ],
      renderer: null,
    };

    render(<SecDir sections={sections} />, {
      wrapper: Wrapper,
    });

    // Assert the section directory is rendered
    expect(screen.queryByText("Donors")).toBeNull();
    expect(screen.queryByText("Modifications")).toBeNull();
    expect(screen.queryByText("Attribution")).toBeNull();

    // Click the menu button and make sure the menu appears
    const menuButton = screen.getByRole("button");
    act(() => {
      menuButton.click();
    });
    expect(screen.getByText("Donors")).toBeInTheDocument();
    expect(screen.getByText("Modifications")).toBeInTheDocument();
    expect(screen.getByText("Attribution")).toBeInTheDocument();

    // Click the menu button again to close the menu
    act(() => {
      menuButton.click();
    });
    expect(screen.queryByText("Donors")).toBeNull();
    expect(screen.queryByText("Modifications")).toBeNull();
    expect(screen.queryByText("Attribution")).toBeNull();

    // Click the menu button and then click the Donors item, then make sure the window scrolls.
    act(() => {
      menuButton.click();
    });
    const donorsItem = screen.getByText("Donors");
    expect(donorsItem).toBeInTheDocument(); // Ensure the element exists
    act(() => {
      donorsItem.click();
    });
    expect(window.scrollTo).toHaveBeenCalled();

    // Wait two seconds to let the highlight time expire
    act(() => {
      jest.advanceTimersByTime(2100);
    });
  });

  test("the dropdown stays open while the mouse is over the menu", () => {
    const sections = {
      items: [
        { id: "sec-dir-donor-table", title: "Donors" },
        { id: "sec-dir-modifications", title: "Modifications" },
        { id: "sec-dir-attribution", title: "Attribution" },
      ],
      renderer: null,
    };

    render(<SecDir sections={sections} />, {
      wrapper: Wrapper,
    });

    // Click the menu button to open the menu
    const menuButton = screen.getByRole("button");
    fireEvent.click(menuButton);

    // Wait 400 milliseconds to let the close delay expire to demonstrate the menu stays open
    // anyway.
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Assert the menu is still open
    expect(screen.getByText("Top of Page")).toBeInTheDocument();
    expect(screen.getByText("Donors")).toBeInTheDocument();
    expect(screen.getByText("Modifications")).toBeInTheDocument();
    expect(screen.getByText("Attribution")).toBeInTheDocument();

    // Hover over the dropdown menu
    const menu = screen.getByRole("menu");
    fireEvent.pointerEnter(menu);

    // Wait 400 milliseconds to let the close delay expire to demonstrate the menu stays open
    // anyway.
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Stop hovering over the menu
    fireEvent.pointerLeave(menu);

    // Wait 500 milliseconds to let the close delay expire
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Assert the menu is closed
    expect(screen.queryByText("Top of Page")).toBeNull();
    expect(screen.queryByText("Donors")).toBeNull();
    expect(screen.queryByText("Modifications")).toBeNull();
    expect(screen.queryByText("Attribution")).toBeNull();

    // Click the menu button to open the menu again.
    fireEvent.click(menuButton);

    // Assert the menu is open again.
    expect(screen.getByText("Top of Page")).toBeInTheDocument();
    expect(screen.getByText("Donors")).toBeInTheDocument();
    expect(screen.getByText("Modifications")).toBeInTheDocument();
    expect(screen.getByText("Attribution")).toBeInTheDocument();

    // Stop hovering over the menu button.
    fireEvent.pointerLeave(menuButton);

    // Wait 500 milliseconds to let the close delay expire
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Assert the menu is closed
    expect(screen.queryByText("Top of Page")).toBeNull();
    expect(screen.queryByText("Donors")).toBeNull();
    expect(screen.queryByText("Modifications")).toBeNull();
    expect(screen.queryByText("Attribution")).toBeNull();

    // Click the menu button to open the menu again.
    fireEvent.click(menuButton);

    // Click the Top of Page button to scroll to the top of the page.
    const topOfPageItem = screen.getByText("Top of Page");
    fireEvent.click(topOfPageItem);

    // See if the page scrolled.
    expect(window.scrollTo).toHaveBeenCalled();
  });

  test("the dropdown works properly on touch devices", () => {
    // Mock implementation of window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false, // Default to false
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        dispatchEvent: jest.fn(),
      })),
    });
    (window.matchMedia as jest.Mock).mockImplementation((query) => ({
      matches: query === "(pointer: coarse)",
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      dispatchEvent: jest.fn(),
    }));

    const sections = {
      items: [
        { id: "sec-dir-donor-table", title: "Donors" },
        { id: "sec-dir-modifications", title: "Modifications" },
        { id: "sec-dir-attribution", title: "Attribution" },
      ],
      renderer: null,
    };

    render(<SecDir sections={sections} />, {
      wrapper: Wrapper,
    });

    // Click the menu button to open the menu
    const menuButton = screen.getByRole("button");
    fireEvent.click(menuButton);

    // Assert the menu is open.
    expect(screen.getByText("Top of Page")).toBeInTheDocument();
    expect(screen.getByText("Donors")).toBeInTheDocument();
    expect(screen.getByText("Modifications")).toBeInTheDocument();
    expect(screen.getByText("Attribution")).toBeInTheDocument();

    // Click the menu button again to close the menu
    fireEvent.click(menuButton);

    // Assert the menu is closed
    expect(screen.queryByText("Top of Page")).toBeNull();
    expect(screen.queryByText("Donors")).toBeNull();
    expect(screen.queryByText("Modifications")).toBeNull();
    expect(screen.queryByText("Attribution")).toBeNull();

    // Click the menu button to open the menu again.
    fireEvent.click(menuButton);

    // Assert the menu is open again.
    expect(screen.getByText("Top of Page")).toBeInTheDocument();
    expect(screen.getByText("Donors")).toBeInTheDocument();
    expect(screen.getByText("Modifications")).toBeInTheDocument();
    expect(screen.getByText("Attribution")).toBeInTheDocument();

    // Click the Donor item.
    const donorsItem = screen.getByText("Donors");
    fireEvent.click(donorsItem);

    // Assert the menu is closed
    expect(screen.queryByText("Top of Page")).toBeNull();
    expect(screen.queryByText("Donors")).toBeNull();
    expect(screen.queryByText("Modifications")).toBeNull();
    expect(screen.queryByText("Attribution")).toBeNull();
  });

  it("uses a custom renderer component", () => {
    const sections = {
      items: [
        { id: "sec-dir-donor-table", title: "Donors" },
        { id: "sec-dir-modifications", title: "Modifications" },
        { id: "sec-dir-attribution", title: "Attribution" },
      ],
      renderer: ({ section }) => <div>TEST {section.title} TEST</div>,
    };

    render(<SecDir sections={sections} />, {
      wrapper: Wrapper,
    });

    // Click the menu button to open the menu
    const menuButton = screen.getByRole("button");
    fireEvent.click(menuButton);

    // Assert the menu is open
    expect(screen.getByText("TEST Donors TEST")).toBeInTheDocument();
    expect(screen.getByText("TEST Modifications TEST")).toBeInTheDocument();
    expect(screen.getByText("TEST Attribution TEST")).toBeInTheDocument();
  });
});

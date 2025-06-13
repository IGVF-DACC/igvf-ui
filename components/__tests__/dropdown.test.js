import { act, render, screen } from "@testing-library/react";
import {
  Dropdown,
  DropdownPortalRoot,
  DropdownRef,
  useDropdown,
} from "../../components/dropdown";

describe("Test dropdown components", () => {
  test("DropdownRef renders", async () => {
    let dropdownAttr = null;
    function Selector() {
      dropdownAttr = useDropdown("test-selector");
      return (
        <div>
          <div>
            <DropdownRef dropdownAttr={dropdownAttr}>
              <button className="h-6 rounded-sm border border-button-primary bg-button-primary px-2 text-xs text-button-primary">
                Selector
              </button>
            </DropdownRef>
            <Dropdown dropdownAttr={dropdownAttr}>
              <div className="max-h-52 w-64 overflow-y-auto p-2">
                <div>{"One"}</div>
                <div>{"Two"}</div>
                <div>{"Three"}</div>
              </div>
            </Dropdown>
          </div>
          <DropdownPortalRoot />
        </div>
      );
    }

    await act(async () => render(<Selector />));

    // No dropdown text should appear.
    expect(screen.getByText("Selector")).toBeInTheDocument();
    expect(screen.queryByText("One")).not.toBeInTheDocument();
    expect(screen.queryByText("Two")).not.toBeInTheDocument();
    expect(screen.queryByText("Three")).not.toBeInTheDocument();
    expect(screen.getByTestId("dropdown-portal-root")).toBeEmptyDOMElement();
    expect(dropdownAttr.isVisible).toBe(false);

    // Click the dropdown ref button.
    await act(async () => {
      const button = screen.getByText("Selector");
      button.click();
    });

    // Make sure the dropdown text appears within the dropdown portal root.
    expect(screen.getByTestId("dropdown-portal-root")).toHaveTextContent("One");
    expect(screen.getByTestId("dropdown-portal-root")).toHaveTextContent("Two");
    expect(screen.getByTestId("dropdown-portal-root")).toHaveTextContent(
      "Three"
    );
    expect(dropdownAttr.isVisible).toBe(true);

    // Click the dropdown ref button again to close the dropdown.
    await act(async () => {
      const button = screen.getByText("Selector");
      button.click();
    });

    // Make sure the dropdown contents don't appear anywhere.
    expect(screen.queryByText("One")).not.toBeInTheDocument();
    expect(screen.queryByText("Two")).not.toBeInTheDocument();
    expect(screen.queryByText("Three")).not.toBeInTheDocument();
    expect(dropdownAttr.isVisible).toBe(false);

    // Setting the dropdownAttr.isVisible property to true should cause the dropdown to appear.
    await act(async () => {
      dropdownAttr.isVisible = true;
    });

    // Make sure the dropdown text appears within the dropdown portal root.
    expect(screen.getByTestId("dropdown-portal-root")).toHaveTextContent("One");
    expect(screen.getByTestId("dropdown-portal-root")).toHaveTextContent("Two");
    expect(screen.getByTestId("dropdown-portal-root")).toHaveTextContent(
      "Three"
    );
    expect(dropdownAttr.isVisible).toBe(true);

    // Setting the dropdownAttr.isVisible property to false should cause the dropdown to disappear.
    await act(async () => {
      dropdownAttr.isVisible = false;
    });

    // Make sure the dropdown contents don't appear anywhere.
    expect(screen.queryByText("One")).not.toBeInTheDocument();
    expect(screen.queryByText("Two")).not.toBeInTheDocument();
    expect(screen.queryByText("Three")).not.toBeInTheDocument();
    expect(dropdownAttr.isVisible).toBe(false);
  });
});

describe("Test error conditions in the dropdown components", () => {
  beforeEach(() => {
    // console.error() shows errors even if we catch them in these tests, so mock it to show
    // nothing.
    jest.spyOn(console, "error").mockImplementation(() => jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("detects an invalid alignment value", () => {
    function Selector() {
      const dropdownAttr = useDropdown("test-selector", "UNDEFINED_ALIGNMENT");
      return (
        <div>
          <div>
            <DropdownRef dropdownAttr={dropdownAttr}>
              <button className="h-6 rounded-sm border border-button-primary bg-button-primary px-2 text-xs text-button-primary">
                Selector
              </button>
            </DropdownRef>
            <Dropdown dropdownAttr={dropdownAttr}>
              <div className="max-h-52 w-64 overflow-y-auto p-2">
                <div>{"One"}</div>
                <div>{"Two"}</div>
                <div>{"Three"}</div>
              </div>
            </Dropdown>
          </div>
          <DropdownPortalRoot />
        </div>
      );
    }

    expect(() => render(<Selector />)).toThrow(
      "Invalid value for alignment: UNDEFINED_ALIGNMENT"
    );
  });
});

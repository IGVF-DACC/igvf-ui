import { render, screen } from "@testing-library/react";
import {
  CollapseControlInline,
  CollapseControlVertical,
  useCollapseControl,
} from "../collapse-control";

describe("Test the inline collapse control", () => {
  it("displays the control and calls our callback when clicked", () => {
    const setIsCollapsed = jest.fn();

    function Component() {
      const items = ["Test", "Test", "Test", "Test", "Test"];
      const collapser = useCollapseControl(items, 2);

      return (
        <>
          <div>
            {collapser.items.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
          {collapser.isCollapseControlVisible && (
            <CollapseControlInline
              length={items.length}
              isCollapsed={true}
              setIsCollapsed={setIsCollapsed}
            />
          )}
        </>
      );
    }

    render(<Component />);

    // Result shows the control and calls our callback when clicked.
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getAllByText("Test").length).toBe(2);
    screen.getByRole("button").click();
    expect(setIsCollapsed).toHaveBeenCalled();
  });

  it("displays all items if fewer items than the maximum", () => {
    const setIsCollapsed = jest.fn();

    function Component() {
      const items = ["Test", "Test", "Test", "Test", "Test"];
      const collapser = useCollapseControl(items, 6, true);

      return (
        <>
          <div>
            {collapser.items.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
          {collapser.isCollapseControlVisible && (
            <CollapseControlInline
              length={items.length}
              isCollapsed={true}
              setIsCollapsed={setIsCollapsed}
            />
          )}
        </>
      );
    }

    render(<Component />);

    // Result shows the control and calls our callback when clicked.
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByText("Test").length).toBe(5);
  });

  it("displays all items if isCollapsible is false", () => {
    const setIsCollapsed = jest.fn();

    function Component() {
      const items = ["Test", "Test", "Test", "Test", "Test"];
      const collapser = useCollapseControl(items, 2, false);

      return (
        <>
          <div>
            {collapser.items.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
          {collapser.isCollapseControlVisible && (
            <CollapseControlInline
              length={5}
              isCollapsed={true}
              setIsCollapsed={setIsCollapsed}
            />
          )}
        </>
      );
    }

    render(<Component />);

    // Result shows the control and calls our callback when clicked.
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByText("Test").length).toBe(5);
  });
});

describe("Test the vertical collapse control", () => {
  it("displays the control and calls our callback when clicked", () => {
    const setIsCollapsed = jest.fn();

    function Component() {
      const items = ["Test", "Test", "Test", "Test", "Test"];
      const collapser = useCollapseControl(items, 2);

      return (
        <>
          <div>
            {collapser.items.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
          {collapser.isCollapseControlVisible && (
            <CollapseControlVertical
              length={items.length}
              isCollapsed={true}
              setIsCollapsed={setIsCollapsed}
              isFullBorder={true}
            />
          )}
        </>
      );
    }

    render(<Component />);

    // Result shows the control and calls our callback when clicked.
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getAllByText("Test").length).toBe(2);
    screen.getByRole("button").click();
    expect(setIsCollapsed).toHaveBeenCalled();
  });

  it("displays all items if fewer items than the maximum", () => {
    const setIsCollapsed = jest.fn();

    function Component() {
      const items = ["Test", "Test", "Test", "Test", "Test"];
      const collapser = useCollapseControl(items);

      return (
        <>
          <div>
            {collapser.items.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
          {collapser.isCollapseControlVisible && (
            <CollapseControlVertical
              length={items.length}
              isCollapsed={true}
              setIsCollapsed={setIsCollapsed}
            />
          )}
        </>
      );
    }

    render(<Component />);

    // Result shows the control and calls our callback when clicked.
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByText("Test").length).toBe(5);
  });

  it("displays all items if isCollapsible is false", () => {
    const setIsCollapsed = jest.fn();

    function Component() {
      const items = ["Test", "Test", "Test", "Test", "Test"];
      const collapser = useCollapseControl(items, 2, false);

      return (
        <>
          <div>
            {collapser.items.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>
          {collapser.isCollapseControlVisible && (
            <CollapseControlVertical
              length={items.length}
              isCollapsed={true}
              setIsCollapsed={setIsCollapsed}
            />
          )}
        </>
      );
    }

    render(<Component />);

    // Result shows the control and calls our callback when clicked.
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByText("Test").length).toBe(5);
  });
});

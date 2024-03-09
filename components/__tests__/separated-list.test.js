import { act, render, screen } from "@testing-library/react";
import SeparatedList from "../separated-list";

describe("Test SeparatedList that's not collapsible", () => {
  it("displays a default comma-separated list", () => {
    render(
      <SeparatedList>
        <a key="1">Item 1</a>
        <a key="2">Item 2</a>
      </SeparatedList>
    );

    // Result shows the two test items with a single comma.
    expect(screen.getAllByText(/Item {1,2}/)).toHaveLength(2);
    expect(screen.getAllByText(",")).toHaveLength(1);
  });

  it("displays a list with a custom separator", () => {
    render(
      <SeparatedList separator=".">
        <a key="1">Item 1</a>
        <a key="2">Item 2</a>
      </SeparatedList>
    );

    // Result shows the two test items with a single period separator.
    expect(screen.getAllByText(/Item {1,2}/)).toHaveLength(2);
    expect(screen.getAllByText(".")).toHaveLength(1);
  });

  it("displays no separator with only one item", () => {
    render(
      <SeparatedList separator={<span data-testid="comma">, </span>}>
        <a key="1">Item 1</a>
      </SeparatedList>
    );

    // Result shows a single test item and no separator.
    expect(screen.getAllByText(/Item 1/)).toHaveLength(1);
    expect(screen.queryByTestId("comma")).toBeNull();
  });

  it("displays nothing with no items", () => {
    render(<SeparatedList separator={<span data-testid="comma">, </span>} />);

    // Result shows no items and no separator.
    expect(screen.queryByTestId("comma")).toBeNull();
  });
});

describe("Test SeparatedList that's collapsible", () => {
  it("displays a list with a collapsible control", () => {
    render(
      <SeparatedList
        separator={<span data-testid="separator"> sep </span>}
        isCollapsible
        maxItemsBeforeCollapse={3}
      >
        <div key="1" data-testid="item">
          Item 1
        </div>
        <div key="2" data-testid="item">
          Item 2
        </div>
        <div key="3" data-testid="item">
          Item 3
        </div>
        <div key="4" data-testid="item">
          Item 4
        </div>
      </SeparatedList>
    );

    // Result shows the two test items with a single comma and a collapsible control.
    expect(screen.getAllByText(/Item [0-9]/)).toHaveLength(3);
    expect(screen.getAllByTestId("separator")).toHaveLength(2);
    expect(screen.getByTestId("collapse-control-inline")).toBeInTheDocument();

    // Click the control to expand the list to all three items
    act(() => {
      screen.getByTestId("collapse-control-inline").click();
    });
    expect(screen.getAllByText(/Item [0-9]/)).toHaveLength(4);
    expect(screen.getAllByTestId("separator")).toHaveLength(3);

    // Click the control to collapse the list back to two items
    act(() => {
      screen.getByTestId("collapse-control-inline").click();
    });
    expect(screen.getAllByText(/Item [0-9]/)).toHaveLength(3);
    expect(screen.getAllByTestId("separator")).toHaveLength(2);
  });
});

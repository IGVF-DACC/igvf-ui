import { render, screen } from "@testing-library/react";
import SeparatedList from "../separated-list";

describe("SeparatedList", () => {
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
});

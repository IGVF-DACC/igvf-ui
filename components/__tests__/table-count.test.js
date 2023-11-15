import { render, screen } from "@testing-library/react";
import TableCount from "../table-count";

describe("Test <TableCount> component", () => {
  it("renders count of a single item in a collection", () => {
    render(<TableCount count={1} />);

    expect(screen.getByText("1 item")).toBeInTheDocument();
  });

  it("renders count of a multiple items in a collection", () => {
    render(<TableCount count={2} />);

    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("renders nothing for an empty collection", () => {
    render(<TableCount count={0} />);

    expect(screen.queryByText("item")).not.toBeInTheDocument();
  });
});

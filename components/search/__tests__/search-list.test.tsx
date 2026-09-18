import { render, screen } from "@testing-library/react";
import { SearchList } from "../../search";
import type { DatabaseObject } from "../../../globals";

const items: DatabaseObject[] = [
  {
    "@id": "/unknown-items/one/",
    "@type": ["UnknownItem", "Item"],
    status: "released",
    title: "First item",
  },
  {
    "@id": "/unknown-items/two/",
    "@type": ["UnknownItem", "Item"],
    status: "released",
    title: "Second item",
  },
];

describe("SearchList", () => {
  it("renders every item with the fallback renderer and default margins", () => {
    render(<SearchList items={items} className="custom-list" />);

    expect(screen.getByTestId("search-list")).toHaveClass("custom-list");
    expect(screen.getByText("First item")).toBeInTheDocument();
    expect(screen.getByText("Second item")).toBeInTheDocument();
    expect(
      screen.getByTestId("search-list-item-/unknown-items/one/")
    ).toHaveClass("first:mt-0", "last:mb-0");
  });

  it("passes the disabled margin setting to each item", () => {
    render(<SearchList items={items} isItemMarginTrimmed={false} />);

    expect(
      screen.getByTestId("search-list-item-/unknown-items/one/")
    ).not.toHaveClass("first:mt-0");
  });
});

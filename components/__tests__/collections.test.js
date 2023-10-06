import { render, screen, within } from "@testing-library/react";
import Collections from "../collections";

describe("Test the Collections component", () => {
  it("should render multiple collections with the correct links and in alphabetical order", () => {
    render(<Collections collections={["MaveDB", "ENCODE", "GREGoR"]} />);

    const collections = screen.getAllByRole("link");
    expect(collections).toHaveLength(3);

    let image = within(collections[0]).getByRole("img");
    expect(image).toHaveAttribute("alt", "ENCODE collection");
    expect(collections[0]).toHaveAttribute("href", "/site-search?term=ENCODE");

    expect(collections[1]).toHaveTextContent("GREGoR");
    expect(collections[1]).toHaveAttribute("href", "/site-search?term=GREGoR");

    image = within(collections[2]).getByRole("img");
    expect(image).toHaveAttribute("alt", "MaveDB collection");
    expect(collections[2]).toHaveAttribute("href", "/site-search?term=MaveDB");
  });

  it("should render nothing for an empty collections array", () => {
    render(<Collections collections={[]} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("should render nothing for an undefined collections array", () => {
    render(<Collections />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});

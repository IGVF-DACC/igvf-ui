import { render, screen, within } from "@testing-library/react";
import Collections from "../collections";

describe("Test the Collections component", () => {
  it("should render multiple collections with the correct links and in alphabetical order", () => {
    render(
      <Collections
        collections={["MaveDB", "ENCODE", "Undefined"]}
        itemType="InVitroSystem"
      />
    );

    const collections = screen.getAllByRole("link");
    expect(collections).toHaveLength(3);

    let image = within(collections[0]).getByRole("img");
    expect(image).toHaveAttribute("alt", "ENCODE collection");
    expect(collections[0]).toHaveAttribute(
      "href",
      "/search?type=InVitroSystem&collections=ENCODE&status=released"
    );

    image = within(collections[1]).getByRole("img");
    expect(image).toHaveAttribute("alt", "MaveDB collection");
    expect(collections[1]).toHaveAttribute(
      "href",
      "/search?type=InVitroSystem&collections=MaveDB&status=released"
    );

    expect(collections[2]).toHaveTextContent("Undefined");
    expect(collections[2]).toHaveAttribute(
      "href",
      "/search?type=InVitroSystem&collections=Undefined&status=released"
    );
  });

  it("should render nothing for an empty collections array", () => {
    render(<Collections collections={[]} itemType="MatrixFile" />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("should render nothing for an undefined collections array", () => {
    render(<Collections itemType="Tissue" />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});

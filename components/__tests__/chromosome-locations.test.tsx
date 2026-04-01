import { render, screen } from "@testing-library/react";
import ChromosomeLocations, {
  ChromosomeLocation,
} from "../chromosome-locations";
import { type GeneLocation } from "../../lib/genes";

describe("Test the ChromosomeLocations component", () => {
  const locations: GeneLocation[] = [
    {
      chromosome: "1",
      start: 100,
      end: 200,
      assembly: "GRCh38",
    },
    {
      chromosome: "2",
      start: 300,
      end: 400,
      assembly: "GRCm39",
      name: "Gene 2",
    },
  ];

  it("should render a list of gene locations", () => {
    render(<ChromosomeLocations locations={locations} />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBe(2);
    expect(listItems[0].textContent).toBe("GRCh381:100-200");
    expect(listItems[1].textContent).toBe("GRCm392:300-400Gene 2");
  });

  it("should render a list of gene locations with Tailwind CSS classes on the ul", () => {
    render(
      <ChromosomeLocations locations={locations} className="absolute top-0" />
    );
    const list = screen.getAllByRole("list");
    expect(list.length).toBe(1);
    expect(list[0]).toHaveClass("absolute top-0");
  });
});

describe("Test the ChromosomeLocation component", () => {
  const location: GeneLocation = {
    chromosome: "1",
    start: 100,
    end: 200,
    assembly: "GRCh38",
  };

  it("should render a single gene location", () => {
    render(<ChromosomeLocation location={location} />);
    const div = screen.getAllByTestId("chromosome-location");
    expect(div.length).toBe(1);
    expect(div[0].textContent).toBe("GRCh381:100-200");
  });

  it("should render a single gene location with Tailwind CSS classes on the wrapper div", () => {
    render(
      <ChromosomeLocation location={location} className="absolute top-0" />
    );
    const div = screen.getAllByTestId("chromosome-location");
    expect(div.length).toBe(1);
    expect(div[0]).toHaveClass("absolute top-0");
  });
});

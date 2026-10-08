import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AlternativeIdentifiers,
  AlternateAccessions,
} from "../alternative-identifiers";
import type { DatabaseObject } from "../../globals";

describe("AlternativeIdentifiers", () => {
  const mockSupersedes: DatabaseObject[] = [
    {
      "@id": "/measurement-sets/IGVFDS0001AAAA/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      accession: "IGVFDS0001AAAA",
      status: "released",
    },
    {
      "@id": "/measurement-sets/IGVFDS0002AAAA/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      accession: "IGVFDS0002AAAA",
      status: "released",
    },
  ];

  const mockSupersededBy: DatabaseObject[] = [
    {
      "@id": "/measurement-sets/IGVFDS0003AAAA/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      accession: "IGVFDS0003AAAA",
      status: "released",
    },
  ];

  const mockAlternateAccessions = [
    "IGVFDS0001ALTR",
    "IGVFDS0003ALTR",
    "IGVFDS0002ALTR",
  ];

  it("renders nothing when no alternative identifiers exist", () => {
    const { container } = render(<AlternativeIdentifiers />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when all arrays are empty", () => {
    const { container } = render(
      <AlternativeIdentifiers
        alternateAccessions={[]}
        supersedes={[]}
        supersededBy={[]}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders alternate accessions section when provided", () => {
    const { container } = render(
      <AlternativeIdentifiers alternateAccessions={mockAlternateAccessions} />
    );
    expect(container.textContent).toContain("Alternate Accessions:");
    expect(container.textContent).toContain(
      "IGVFDS0001ALTR, IGVFDS0002ALTR, IGVFDS0003ALTR"
    );
  });

  it("renders supersedes section when provided", () => {
    render(<AlternativeIdentifiers supersedes={mockSupersedes} />);
    expect(screen.getByText("Supersedes:")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS0001AAAA")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS0002AAAA")).toBeInTheDocument();
  });

  it("renders superseded by section when provided", () => {
    render(<AlternativeIdentifiers supersededBy={mockSupersededBy} />);
    expect(screen.getByText("Superseded by:")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS0003AAAA")).toBeInTheDocument();
  });

  it("renders all sections when all data is provided", () => {
    const { container } = render(
      <AlternativeIdentifiers
        alternateAccessions={mockAlternateAccessions}
        supersedes={mockSupersedes}
        supersededBy={mockSupersededBy}
      />
    );

    expect(container.textContent).toContain("Alternate Accessions:");
    expect(container.textContent).toContain(
      "IGVFDS0001ALTR, IGVFDS0002ALTR, IGVFDS0003ALTR"
    );
    expect(screen.getByText("Supersedes:")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS0001AAAA")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS0002AAAA")).toBeInTheDocument();
    expect(screen.getByText("Superseded by:")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS0003AAAA")).toBeInTheDocument();
  });

  it("applies correct CSS classes to main container", () => {
    const { container } = render(
      <AlternativeIdentifiers alternateAccessions={["IGVFDS0001ALTR"]} />
    );
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass("text-sm", "text-gray-500");
  });

  it("displays and sorts items by a specified property", () => {
    const documents: DatabaseObject[] = [
      {
        "@id": "/documents/zebra/",
        "@type": ["Document", "Item"],
        description: "Zebra protocol",
        status: "released",
      },
      {
        "@id": "/documents/apple/",
        "@type": ["Document", "Item"],
        description: "apple protocol",
        status: "released",
      },
    ];

    render(
      <AlternativeIdentifiers supersedes={documents} property="description" />
    );

    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(
      ["apple protocol", "Zebra protocol"]
    );
  });

  it("displays the object @id when the specified property is missing or empty", () => {
    const documents: DatabaseObject[] = [
      {
        "@id": "/documents/missing/",
        "@type": ["Document", "Item"],
        status: "released",
      },
      {
        "@id": "/documents/empty/",
        "@type": ["Document", "Item"],
        description: "",
        status: "released",
      },
    ];

    render(
      <AlternativeIdentifiers supersededBy={documents} property="description" />
    );

    expect(
      screen.getByRole("link", { name: "/documents/missing/" })
    ).toHaveAttribute("href", "/documents/missing");
    expect(
      screen.getByRole("link", { name: "/documents/empty/" })
    ).toHaveAttribute("href", "/documents/empty");
  });

  it("truncates a long property and displays its full value in a tooltip", async () => {
    const user = userEvent.setup();
    const description =
      "This document description is long enough to require truncation";
    const documents: DatabaseObject[] = [
      {
        "@id": "/documents/long-description/",
        "@type": ["Document", "Item"],
        description,
        status: "released",
      },
    ];

    render(
      <AlternativeIdentifiers supersedes={documents} property="description" />
    );

    const link = screen.getByRole("link", {
      name: "This document description is long…",
    });
    expect(link).toHaveAttribute("href", "/documents/long-description");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await user.hover(link);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(description);
  });
});

describe("AlternateAccessions", () => {
  it("renders nothing when no alternate accessions provided", () => {
    const { container } = render(<AlternateAccessions />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when empty array provided", () => {
    const { container } = render(
      <AlternateAccessions alternateAccessions={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders single alternate accession with singular title", () => {
    const { container } = render(
      <AlternateAccessions alternateAccessions={["IGVFDS0001ALTR"]} />
    );
    expect(container.textContent).toContain("Alternate Accession:");
    expect(container.textContent).toContain("IGVFDS0001ALTR");
  });

  it("renders multiple alternate accessions with plural title", () => {
    const { container } = render(
      <AlternateAccessions
        alternateAccessions={[
          "IGVFDS0002ALTR",
          "IGVFDS0001ALTR",
          "IGVFDS0003ALTR",
        ]}
      />
    );
    expect(container.textContent).toContain("Alternate Accessions:");
    expect(container.textContent).toContain(
      "IGVFDS0001ALTR, IGVFDS0002ALTR, IGVFDS0003ALTR"
    );
  });

  it("sorts alternate accessions alphabetically", () => {
    const { container } = render(
      <AlternateAccessions alternateAccessions={["ZZZ", "AAA", "MMM"]} />
    );
    expect(container.textContent).toContain("AAA, MMM, ZZZ");
  });

  it("hides title when isTitleHidden is true", () => {
    render(
      <AlternateAccessions
        alternateAccessions={["IGVFDS0001ALTR"]}
        isTitleHidden={true}
      />
    );
    expect(screen.queryByText("Alternate Accession:")).not.toBeInTheDocument();
    expect(screen.getByText("IGVFDS0001ALTR")).toBeInTheDocument();
  });

  it("shows title by default when isTitleHidden is not provided", () => {
    const { container } = render(
      <AlternateAccessions alternateAccessions={["IGVFDS0001ALTR"]} />
    );
    expect(container.textContent).toContain("Alternate Accession:");
  });

  it("applies correct wrapper CSS classes", () => {
    const { container } = render(
      <AlternateAccessions alternateAccessions={["IGVFDS0001ALTR"]} />
    );
    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveClass("my-1", "first:mt-0", "last:mb-0");
  });
});

describe("Edge cases and integration", () => {
  it("handles mixed data types in supersedes/supersededBy", () => {
    const mixedItems: DatabaseObject[] = [
      {
        "@id": "/measurement-sets/IGVFDS0001AAAA/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        accession: "IGVFDS0001AAAA",
        status: "released",
      },
      {
        "@id": "/auxiliary-sets/IGVFDS0002AAAA/",
        "@type": ["AuxiliarySet", "FileSet", "Item"],
        accession: "IGVFDS0002AAAA",
        status: "released",
      },
    ];

    render(<AlternativeIdentifiers supersedes={mixedItems} />);
    expect(screen.getByText("Supersedes:")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS0001AAAA")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS0002AAAA")).toBeInTheDocument();
  });

  it("renders complex scenario with all identifier types", () => {
    const complexScenario = {
      alternateAccessions: ["IGVFDS0001ALTR", "IGVFDS0003ALTR"],
      supersedes: [
        {
          "@id": "/measurement-sets/IGVFDS1000AAAA/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          accession: "IGVFDS1000AAAA",
          status: "released",
        },
      ],
      supersededBy: [
        {
          "@id": "/measurement-sets/IGVFDS2000AAAA/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          accession: "IGVFDS2000AAAA",
          status: "released",
        },
      ],
    };

    const { container } = render(
      <AlternativeIdentifiers {...complexScenario} />
    );

    // Check all sections are rendered
    expect(container.textContent).toContain("Alternate Accessions:");
    expect(container.textContent).toContain("IGVFDS0001ALTR, IGVFDS0003ALTR"); // Should be sorted
    expect(screen.getByText("Supersedes:")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS1000AAAA")).toBeInTheDocument();
    expect(screen.getByText("Superseded by:")).toBeInTheDocument();
    expect(screen.getByText("IGVFDS2000AAAA")).toBeInTheDocument();
  });

  it("handles undefined vs empty array distinction", () => {
    // Should render nothing for undefined
    const { container: undefinedContainer } = render(
      <AlternativeIdentifiers
        alternateAccessions={undefined}
        supersedes={undefined}
        supersededBy={undefined}
      />
    );
    expect(undefinedContainer.firstChild).toBeNull();

    // Should also render nothing for empty arrays
    const { container: emptyContainer } = render(
      <AlternativeIdentifiers
        alternateAccessions={[]}
        supersedes={[]}
        supersededBy={[]}
      />
    );
    expect(emptyContainer.firstChild).toBeNull();
  });
});

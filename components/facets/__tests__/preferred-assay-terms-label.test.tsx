import React from "react";
import { render, screen } from "@testing-library/react";
import PreferredAssayTermsLabel from "../custom-facets/preferred-assay-terms-label";
import SessionContext from "../../session-context";
import { TooltipPortalRoot } from "../../tooltip";
import type { SearchResultsFacetTerm } from "../../../globals";

function renderWithSession(ui: React.ReactElement, profiles: any = null) {
  const providerValue: any = {
    session: null,
    sessionProperties: null,
    profiles,
    collectionTitles: null,
    dataProviderUrl: null,
  };
  return render(
    <SessionContext.Provider value={providerValue}>
      <TooltipPortalRoot />
      {ui}
    </SessionContext.Provider>
  );
}

const baseTerm: SearchResultsFacetTerm = {
  key: "STARR-seq",
  doc_count: 42,
};

describe("PreferredAssayTermsLabel", () => {
  it("renders the term key and doc_count when not negated and not a child term", () => {
    renderWithSession(
      <PreferredAssayTermsLabel
        term={baseTerm}
        isNegative={false}
        isChildTerm={false}
      />
    );
    expect(screen.getByText("STARR-seq")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("applies text-sm font-normal class when not a child term", () => {
    renderWithSession(
      <PreferredAssayTermsLabel
        term={baseTerm}
        isNegative={false}
        isChildTerm={false}
      />
    );
    const outerDiv = screen.getByText("STARR-seq").parentElement as HTMLElement;
    expect(outerDiv.className).toContain("text-sm");
    expect(outerDiv.className).toContain("font-normal");
  });

  it("applies text-xs font-light class when it is a child term", () => {
    renderWithSession(
      <PreferredAssayTermsLabel
        term={baseTerm}
        isNegative={false}
        isChildTerm={true}
      />
    );
    const outerDiv = screen.getByText("STARR-seq").parentElement as HTMLElement;
    expect(outerDiv.className).toContain("text-xs");
    expect(outerDiv.className).toContain("font-light");
  });

  it("does not render doc_count when isNegative is true", () => {
    renderWithSession(
      <PreferredAssayTermsLabel
        term={baseTerm}
        isNegative={true}
        isChildTerm={false}
      />
    );
    expect(screen.getByText("STARR-seq")).toBeInTheDocument();
    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });

  it("converts a numeric term key to a string", () => {
    const numericTerm: SearchResultsFacetTerm = { key: 7, doc_count: 3 };
    renderWithSession(
      <PreferredAssayTermsLabel
        term={numericTerm}
        isNegative={false}
        isChildTerm={false}
      />
    );
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("annotates the term key when profiles contain a matching enum_description", () => {
    const profiles = {
      MeasurementSet: {
        properties: {
          preferred_assay_titles: {
            items: {
              enum_descriptions: {
                "STARR-seq": "A high-throughput assay for regulatory regions.",
              },
            },
          },
        },
      },
    };
    renderWithSession(
      <PreferredAssayTermsLabel
        term={baseTerm}
        isNegative={false}
        isChildTerm={false}
      />,
      profiles
    );
    const el = screen.getByText("STARR-seq");
    expect(el).toHaveClass("underline");
    expect(el).toHaveAttribute("aria-describedby");
  });

  it("renders the term key without annotation when the profiles have no matching description", () => {
    const profiles = {
      MeasurementSet: {
        properties: {
          preferred_assay_titles: {
            items: {
              enum_descriptions: {
                "Other-assay": "Some other description.",
              },
            },
          },
        },
      },
    };
    renderWithSession(
      <PreferredAssayTermsLabel
        term={baseTerm}
        isNegative={false}
        isChildTerm={false}
      />,
      profiles
    );
    const el = screen.getByText("STARR-seq");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el).not.toHaveClass("underline");
  });
});

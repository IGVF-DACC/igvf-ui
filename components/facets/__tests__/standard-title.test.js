import React from "react";
import { render, screen } from "@testing-library/react";
import StandardTitle, {
  StandardTitleElement,
} from "../custom-facets/standard-title";

import { checkForBooleanFacet } from "../../../lib/facets";

describe("StandardTitleElement", () => {
  it("renders PlusIcon when closed", () => {
    render(
      <StandardTitleElement field="test" isFacetOpen={false}>
        Test Title
      </StandardTitleElement>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByTestId("facettitle-test")).toHaveTextContent(
      "Test Title"
    );
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("renders MinusIcon when open", () => {
    render(
      <StandardTitleElement field="test" isFacetOpen={true}>
        Test Title
      </StandardTitleElement>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByTestId("facettitle-test")).toHaveTextContent(
      "Test Title"
    );
    expect(document.querySelector("svg")).toBeInTheDocument();
  });
});

describe("StandardTitle", () => {
  it("renders NoTermCountTitle if checkForBooleanFacet returns true", () => {
    const termsFacet = {
      field: "taxa",
      title: "Taxa",
      terms: [
        {
          key: "Homo sapiens",
          doc_count: 8,
        },
        {
          key: "Mus musculus",
          doc_count: 3,
        },
      ],
      total: 11,
      type: "terms",
      appended: false,
      open_on_load: false,
    };

    const booleanFacet = {
      field: "controlled_access",
      title: "Controlled Access",
      terms: [
        {
          key: 1,
          key_as_string: "true",
          doc_count: 6,
        },
        {
          key: 0,
          key_as_string: "false",
          doc_count: 5,
        },
      ],
      total: 11,
      type: "terms",
    };

    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/genes/ENSG00000207705/",
          "@type": ["Gene", "Item"],
          dbxrefs: ["RefSeq:NR_029596.1", "miRBase:MI0000252", "HGNC:31512"],
          geneid: "ENSG00000207705",
          status: "released",
          symbol: "MIR129-1",
          synonyms: ["MIRN129-1", "mir-129-1", "hsa-mir-129-1", "MIR-129b"],
          title: "MIR129-1 (Homo sapiens)",
          uuid: "cb9e336d-f19e-41df-90ee-62599f04d77b",
        },
      ],
      "@id": "/search/?type=Gene&taxa=Homo+sapiens",
      "@type": ["Search"],
      clear_filters: "/search/?type=Gene",
      facets: [termsFacet, booleanFacet],
      filters: [
        {
          field: "taxa",
          term: "Homo sapiens",
          remove: "/search/?type=Gene",
        },
        {
          field: "type",
          term: "Gene",
          remove: "/search/?taxa=Homo+sapiens",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 11,
    };

    render(
      <StandardTitle
        facet={booleanFacet}
        searchResults={searchResults}
        isFacetOpen={true}
      />
    );
    expect(
      screen.getByTestId("facettitle-controlled_access")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("facet-term-count")).not.toBeInTheDocument();
  });
});

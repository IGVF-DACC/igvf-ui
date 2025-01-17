import { render, screen } from "@testing-library/react";
import { FacetTermCount } from "../facet-term-count";
import type { SearchResults } from "../../../globals.d";

describe("Test <FacetTermCount /> with no selections", () => {
  let searchResults: SearchResults;

  beforeAll(() => {
    searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/labs/hyejung-won/",
          "@type": ["Lab", "Item"],
          awards: [
            {
              "@id": "/awards/1UM1HG012003-01/",
              component: "functional characterization",
            },
          ],
          institute_label: "UNC",
          name: "hyejung-won",
          pi: "/users/7e51864b-2e2b-40cf-9abc-5cc2dc98f35d/",
          status: "current",
          title: "Hyejung Won, UNC",
          uuid: "fe27c988-4664-4245-a1ca-bab9e1c62a00",
        },
      ],
      "@id": "/search/?type=Lab",
      "@type": ["Search"],
      clear_filters: "/search/?type=Lab",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          field: "institute_label",
          terms: [
            {
              doc_count: 12,
              key: "Stanford",
            },
            {
              doc_count: 5,
              key: "UMich",
            },
            {
              doc_count: 4,
              key: "Broad",
            },
            {
              doc_count: 4,
              key: "Duke",
            },
            {
              doc_count: 4,
              key: "MSKCC",
            },
          ],
          title: "Institute",
          total: 29,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "Lab",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 29,
    };
  });

  it("displays the correct count of terms with the facet not open", () => {
    render(
      <FacetTermCount
        facet={searchResults.facets[0]}
        searchResults={searchResults}
      />
    );

    const facetTermCount = screen.getByTestId(
      "facet-term-count-institute_label"
    );
    expect(facetTermCount).toHaveAttribute(
      "aria-label",
      "0 selected of 5 terms"
    );
    expect(facetTermCount.children).toHaveLength(5);
    Array.from(facetTermCount.children).forEach((child) => {
      expect(child).toHaveClass("border-facet-counter");
    });
  });

  it("has the correct Tailwind CSS classes when the facet is open", () => {
    render(
      <FacetTermCount
        facet={searchResults.facets[0]}
        searchResults={searchResults}
        isFacetOpen
      />
    );

    const facetTermCount = screen.getByTestId(
      "facet-term-count-institute_label"
    );
    expect(facetTermCount).toHaveAttribute(
      "aria-label",
      "0 selected of 5 terms"
    );
    expect(facetTermCount.children).toHaveLength(5);
    Array.from(facetTermCount.children).forEach((child) => {
      expect(child).toHaveClass("border-facet-counter-open");
    });
  });
});

describe("Test <FacetTermCount /> with selections", () => {
  let searchResults: SearchResults;

  beforeAll(() => {
    searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/labs/hyejung-won/",
          "@type": ["Lab", "Item"],
          awards: [
            {
              "@id": "/awards/1UM1HG012003-01/",
              component: "functional characterization",
            },
          ],
          institute_label: "UNC",
          name: "hyejung-won",
          pi: "/users/7e51864b-2e2b-40cf-9abc-5cc2dc98f35d/",
          status: "current",
          title: "Hyejung Won, UNC",
          uuid: "fe27c988-4664-4245-a1ca-bab9e1c62a00",
        },
      ],
      "@id": "/search/?type=Lab&institute_label=Stanford&institute_label=UMich",
      "@type": ["Search"],
      clear_filters: "/search/?type=Lab",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          field: "institute_label",
          terms: [
            {
              doc_count: 12,
              key: "Stanford",
            },
            {
              doc_count: 5,
              key: "UMich",
            },
            {
              doc_count: 4,
              key: "Broad",
            },
            {
              doc_count: 4,
              key: "Duke",
            },
            {
              doc_count: 4,
              key: "MSKCC",
            },
          ],
          title: "Institute",
          total: 29,
        },
      ],
      filters: [
        {
          field: "institute_label",
          term: "Stanford",
          remove: "/search/?type=Lab&institute_label=UMich",
        },
        {
          field: "institute_label",
          term: "UMich",
          remove: "/search/?type=Lab&institute_label=Stanford",
        },
        {
          field: "type",
          term: "Lab",
          remove: "/search/?institute_label=Stanford&institute_label=UMich",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 29,
    };
  });

  it("displays the correct count of terms with the facet not open", () => {
    render(
      <FacetTermCount
        facet={searchResults.facets[0]}
        searchResults={searchResults}
      />
    );

    const facetTermCount = screen.getByTestId(
      "facet-term-count-institute_label"
    );
    expect(facetTermCount).toHaveAttribute(
      "aria-label",
      "2 selected of 5 terms"
    );
    expect(facetTermCount.children).toHaveLength(5);
    Array.from(facetTermCount.children).forEach((child, i) => {
      if (i < 2) {
        expect(child).toHaveClass("bg-facet-counter-selected");
      } else {
        expect(child).toHaveClass("border-facet-counter");
      }
    });
  });

  it("has the correct Tailwind CSS classes when the facet is open", () => {
    render(
      <FacetTermCount
        facet={searchResults.facets[0]}
        searchResults={searchResults}
        isFacetOpen
      />
    );

    const facetTermCount = screen.getByTestId(
      "facet-term-count-institute_label"
    );
    expect(facetTermCount).toHaveAttribute(
      "aria-label",
      "2 selected of 5 terms"
    );
    expect(facetTermCount.children).toHaveLength(5);
    Array.from(facetTermCount.children).forEach((child, i) => {
      if (i < 2) {
        expect(child).toHaveClass("bg-facet-counter-open-selected");
      } else {
        expect(child).toHaveClass("border-facet-counter-open");
      }
    });
  });
});

describe("Test <FacetTermCount /> with a single term", () => {
  let searchResults: SearchResults;

  beforeAll(() => {
    searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/labs/hyejung-won/",
          "@type": ["Lab", "Item"],
          awards: [
            {
              "@id": "/awards/1UM1HG012003-01/",
              component: "functional characterization",
            },
          ],
          institute_label: "UNC",
          name: "hyejung-won",
          pi: "/users/7e51864b-2e2b-40cf-9abc-5cc2dc98f35d/",
          status: "current",
          title: "Hyejung Won, UNC",
          uuid: "fe27c988-4664-4245-a1ca-bab9e1c62a00",
        },
      ],
      "@id": "/search/?type=Lab&institute_label=Stanford",
      "@type": ["Search"],
      clear_filters: "/search/?type=Lab",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          field: "institute_label",
          terms: [
            {
              doc_count: 12,
              key: "Stanford",
            },
          ],
          title: "Institute",
          total: 29,
        },
      ],
      filters: [
        {
          field: "institute_label",
          term: "Stanford",
          remove: "/search/",
        },
        {
          field: "type",
          term: "Lab",
          remove: "/search/?institute_label=Stanford",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 29,
    };
  });

  it("displays the correct help text", () => {
    render(
      <FacetTermCount
        facet={searchResults.facets[0]}
        searchResults={searchResults}
      />
    );

    const facetTermCount = screen.getByTestId(
      "facet-term-count-institute_label"
    );
    expect(facetTermCount.children).toHaveLength(1);
    expect(facetTermCount).toHaveAttribute(
      "aria-label",
      "1 selected of 1 term"
    );
  });
});

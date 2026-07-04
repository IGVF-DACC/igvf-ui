import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import PreferredAssayTitlesTerms from "../custom-facets/preferred-assay-titles-terms";
import type { DatabaseObject, SearchResults } from "../../../globals";
import { type MeasurementSetObject } from "../../../lib/file-sets";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

type MeasurementSetSearchResult = DatabaseObject &
  Partial<MeasurementSetObject>;

describe("PreferredAssayTitlesTerms", () => {
  const searchResults: SearchResults<MeasurementSetSearchResult> = {
    "@context": "/terms/",
    "@id": "/search/?type=MeasurementSet",
    "@type": ["Search"],
    "@graph": [
      {
        "@id": "/measurement-sets/IGVFDS0411SCTC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        accession: "IGVFDS0411SCTC",
        aliases: ["igvf:scATAC-seq"],
        assay_titles: ["single-cell ATAC-seq"],
        status: "released",
      },
    ],
    clear_filters: "/search/?type=MeasurementSet",
    columns: {},
    facets: [
      {
        field: "preferred_assay_titles",
        title: "Preferred Assay Titles",
        terms: [
          {
            key: "STARR-seq",
            doc_count: 3,
          },
          {
            key: "10x multiome",
            doc_count: 2,
          },
        ],
        type: "terms",
      },
      {
        field: "preferred_assay_slims",
        title: "Preferred Assay Slims",
        terms: [
          {
            key: "single cell",
            doc_count: 15,
          },
          {
            key: "gene expression",
            doc_count: 13,
          },
        ],
        total: 47,
        type: "terms",
        appended: false,
        category: "Measurement Set Details",
        description: "High-level classification of preferred assay slims.",
      },
    ],
    filters: [
      {
        field: "type",
        term: "MeasurementSet",
        remove: "/search/",
      },
    ],
    notification: "Success",
    title: "Search Results",
    total: 1,
  };

  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockRouter(query: Record<string, string | string[]>) {
    const mockPush = jest.fn();
    mockUseRouter.mockReturnValue({
      pathname: "/search/",
      query,
      push: mockPush,
    } as any);
    return mockPush;
  }

  it("renders without crashing", () => {
    const mockPush = mockRouter({
      type: "MeasurementSet",
      preferred_assay_titles: ["STARR-seq"],
    });

    const { rerender } = render(
      <PreferredAssayTitlesTerms
        searchResults={searchResults}
        facet={searchResults.facets[0]}
        updateQuery={jest.fn()}
      />
    );

    // Check if the "Categories" and "Check All" buttons are present in the document.
    const categoriesButton = screen.getByRole("button", {
      name: /Categories/,
    });
    expect(categoriesButton).toBeInTheDocument();
    const checkAllButton = screen.getByRole("button", {
      name: /Check All/,
    });
    expect(checkAllButton).toBeInTheDocument();

    // Check if the preferred assay titles terms are present in the document.
    const starrSeqTerm = screen.getByTestId(
      "facetterm-preferred_assay_titles-starr-seq"
    );
    expect(starrSeqTerm).toBeInTheDocument();
    const tenXMultiomeTerm = screen.getByTestId(
      "facetterm-preferred_assay_titles-10x-multiome"
    );
    expect(tenXMultiomeTerm).toBeInTheDocument();

    // Click the "Categories" button to open the menu. Check if the resulting menu contains "single
    // cell" and "gene expression" as menu items. Use act() on the click event to ensure that the
    // state updates are processed before the assertions.
    fireEvent.click(screen.getByRole("button", { name: /Categories/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: /single cell/i }));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/search/",
      query: {
        type: "MeasurementSet",
        preferred_assay_titles: ["STARR-seq"],
        preferred_assay_slims: "single cell",
      },
    });

    // Click the "Check All" button to select all preferred assay titles. Check if the resulting URL query parameters include all preferred assay titles. Use act() on the click event to ensure that the state updates are processed before the assertions.
    fireEvent.click(screen.getByRole("button", { name: /Check All/ }));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/search/",
      query: {
        type: "MeasurementSet",
        preferred_assay_titles: ["STARR-seq", "10x multiome"],
      },
    });

    rerender(
      <PreferredAssayTitlesTerms
        searchResults={{
          ...searchResults,
          filters: [
            ...searchResults.filters,
            {
              field: "preferred_assay_titles",
              term: "STARR-seq",
              remove: "/search/",
            },
            {
              field: "preferred_assay_titles",
              term: "10x multiome",
              remove: "/search/",
            },
          ],
        }}
        facet={searchResults.facets[0]}
        updateQuery={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /Uncheck All/ })
    ).toBeInTheDocument();

    // Click the "Uncheck All" button to deselect all preferred assay titles. Check if the resulting URL query parameters no longer include any preferred assay titles. Use act() on the click event to ensure that the state updates are processed before the assertions.
    fireEvent.click(screen.getByRole("button", { name: /Uncheck All/ }));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/search/",
      query: {
        type: "MeasurementSet",
      },
    });

    // Rerender the component with the `terms` property missing from the `facets` array.
    rerender(
      <PreferredAssayTitlesTerms
        searchResults={{
          ...searchResults,
          facets: [
            {
              field: "preferred_assay_titles",
              title: "Preferred Assay Titles",
              terms: "not facet terms",
              type: "terms",
            },
            searchResults.facets[1],
          ],
        }}
        facet={{
          ...searchResults.facets[0],
          terms: "not facet terms",
        }}
        updateQuery={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Check All/ }));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/search/",
      query: {
        type: "MeasurementSet",
        preferred_assay_titles: [],
      },
    });
  });

  it("clears a selected preferred assay slim from the category menu", () => {
    const mockPush = mockRouter({
      type: "MeasurementSet",
      preferred_assay_slims: "single cell",
      preferred_assay_titles: ["10x multiome"],
    });

    render(
      <PreferredAssayTitlesTerms
        searchResults={{
          ...searchResults,
          filters: [
            ...searchResults.filters,
            {
              field: "preferred_assay_slims",
              term: "single cell",
              remove: "/search/",
            },
          ],
        }}
        facet={searchResults.facets[0]}
        updateQuery={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /^single cell$/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^single cell$/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Clear Category/i }));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/search/",
      query: {
        type: "MeasurementSet",
        preferred_assay_titles: ["10x multiome"],
      },
    });
  });

  it("shows multiple categories when multiple preferred assay slims are selected", () => {
    mockRouter({
      type: "MeasurementSet",
      preferred_assay_slims: ["single cell", "gene expression"],
    });

    render(
      <PreferredAssayTitlesTerms
        searchResults={{
          ...searchResults,
          filters: [
            ...searchResults.filters,
            {
              field: "preferred_assay_slims",
              term: "single cell",
              remove: "/search/",
            },
            {
              field: "preferred_assay_slims",
              term: "gene expression",
              remove: "/search/",
            },
          ],
        }}
        facet={searchResults.facets[0]}
        updateQuery={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /Multiple Categories/i })
    ).toBeInTheDocument();
  });

  it("preserves preferred_assay_titles selections when selecting a preferred_assay_slims category", () => {
    const mockPush = mockRouter({
      type: "MeasurementSet",
      preferred_assay_titles: ["STARR-seq"],
    });

    render(
      <PreferredAssayTitlesTerms
        searchResults={searchResults}
        facet={searchResults.facets[0]}
        updateQuery={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Categories/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: /single cell/i }));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/search/",
      query: {
        type: "MeasurementSet",
        preferred_assay_titles: ["STARR-seq"],
        preferred_assay_slims: "single cell",
      },
    });
  });

  it("preserves preferred_assay_titles selections when clearing the preferred_assay_slims category", () => {
    const mockPush = mockRouter({
      type: "MeasurementSet",
      preferred_assay_titles: ["STARR-seq"],
      preferred_assay_slims: "single cell",
    });

    render(
      <PreferredAssayTitlesTerms
        searchResults={{
          ...searchResults,
          filters: [
            ...searchResults.filters,
            {
              field: "preferred_assay_slims",
              term: "single cell",
              remove: "/search/",
            },
          ],
        }}
        facet={searchResults.facets[0]}
        updateQuery={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /single cell/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Clear Category/i }));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/search/",
      query: {
        type: "MeasurementSet",
        preferred_assay_titles: ["STARR-seq"],
      },
    });
  });
});

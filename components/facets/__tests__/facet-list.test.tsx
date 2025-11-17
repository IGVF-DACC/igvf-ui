import { MouseEvent } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import SessionContext from "../../session-context";
import { FacetList } from "../facet-list";
import FacetSection from "../facet-section";
import type { SearchResults, SearchResultsFacet } from "../../../globals";

// Mock the window.location object so we can test the router.push() function.
const location = new URL("https://www.example.com") as any;
location.assign = jest.fn();
location.replace = jest.fn();
location.reload = jest.fn();
delete (window as any).location;
(window as any).location = location;

// Mock next/router (uses __mocks__/next/router.ts)
jest.mock("next/router");

// Mock motion/react (uses components/__mocks__/motion/react.tsx automatically)
jest.mock("motion/react");

/**
 * Method to mock the useAuth0 hook comes from:
 * https://stackoverflow.com/questions/45758366/how-to-change-jest-mock-function-return-value-in-each-testanswer-45758767
 * This method lets you change the return values of the hook between tests.
 */
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: jest.fn(),
}));

const mockUseAuth0 = useAuth0 as jest.MockedFunction<typeof useAuth0>;

// Test wrapper to manage facet open/close state
function FacetListWithState({
  searchResults,
  facets,
}: {
  searchResults: SearchResults;
  facets: SearchResultsFacet[];
}) {
  const [openedFacets, setOpenedFacets] = useState<Record<string, boolean>>({});

  function handleFacetOpen(e: MouseEvent, field: string) {
    setOpenedFacets((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  return (
    <FacetList
      searchResults={searchResults}
      facets={facets}
      openedFacets={openedFacets}
      onFacetOpen={handleFacetOpen}
      isEditOrderMode={false}
    />
  );
}

describe("Test <FacetList> component", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the correct facets", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search?type=Gene&taxa!=Homo+sapiens",
      columns: {},
      notification: "",
      title: "Search",
      total: 7,
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Gene",
              doc_count: 7,
            },
          ],
          total: 7,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "taxa",
          title: "Taxa",
          terms: [
            {
              key: "Homo sapiens",
              doc_count: 5,
            },
            {
              key: "Mus musculus",
              doc_count: 2,
            },
          ],
          total: 7,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [
            {
              key: "released",
              doc_count: 7,
            },
          ],
          total: 7,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "audit.WARNING.category",
          title: "Audit category: WARNING",
          terms: [
            {
              key: "missing plasmid map",
              doc_count: 2,
            },
          ],
          total: 3,
        },
      ],
      filters: [
        {
          field: "taxa!",
          remove: "/search/?type=Gene",
          term: "Homo sapiens",
        },
        {
          field: "type",
          term: "Gene",
          remove: "/search",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    // Check for the correct number of facets.
    const facetSections = screen.getAllByTestId(/^facet-container-/);
    expect(facetSections).toHaveLength(3);

    // Make sure the first facet has the correct title.
    const facetTitle = within(facetSections[0]).getByRole("heading", {
      name: /^Taxa$/,
    } as any);
    expect(facetTitle).toBeInTheDocument();

    // Click the facet button with data-testid="facet-trigger-taxa" to open it.
    const facetTrigger = screen.getByTestId(/^facettrigger-taxa$/);
    fireEvent.click(facetTrigger);

    const facetTerms = screen.getAllByTestId(/^facetterm-/);
    expect(facetTerms).toHaveLength(2);
    expect(facetTerms[0]).toHaveTextContent(/^Homo sapiens/);
    expect(facetTerms[1]).toHaveTextContent(/^Mus musculus/);
    expect(facetTerms[1]).toHaveTextContent(/2$/);

    // Click the same facet button again to close it and make sure all the terms disappear.
    fireEvent.click(facetTrigger);
    expect(screen.queryAllByTestId(/^facetterm-/)).toHaveLength(0);

    // Hold down the alt key and click the first facet button and make sure all facets open.
    fireEvent.click(facetTrigger, { altKey: true });
    expect(screen.getAllByTestId(/^facetterm-/)).toHaveLength(4);

    // Hold down the alt key and click the first facet button again and make sure all facets close.
    fireEvent.click(facetTrigger, { altKey: true });
    expect(screen.queryAllByTestId(/^facetterm-/)).toHaveLength(0);
  });

  it("renders no facets if only a type facet exists", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search?type=Gene",
      columns: {},
      notification: "",
      title: "Search",
      total: 7,
      facet_groups: [],
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Gene",
              doc_count: 7,
            },
          ],
          total: 7,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          term: "Gene",
          remove: "/search",
        },
      ],
    } as any;

    const facetsForDisplay = searchResults.facets.filter(
      (facet) => facet.field !== "type"
    );

    render(
      <FacetList
        searchResults={searchResults}
        facets={facetsForDisplay}
        openedFacets={{}}
        onFacetOpen={jest.fn()}
        isEditOrderMode={false}
      />
    );

    // Check for no facet group buttons.
    const facetGroupButtonSection = screen.queryByTestId("facet-group-buttons");
    expect(facetGroupButtonSection).toBeNull();

    // Check for no facets.
    const facetSections = screen.queryAllByTestId(/^facet-/);
    expect(facetSections).toHaveLength(0);
  });

  it("clears all filters when clicking the Clear All button", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO9494FQMY/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO9494FQMY",
          aliases: ["igvf:alias_human_donor_child"],
          award: {
            "@id": "/awards/HG012012/",
            component: "data coordination",
          },
          collections: ["ENCODE"],
          ethnicities: ["Eskimo", "Arab"],
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "38d6630f-5b87-47a1-ae7d-174eab5758d2",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor&sex=female",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facet_groups: [],
      facets: [
        {
          appended: false,
          field: "sex",
          open_on_load: false,
          terms: [
            {
              doc_count: 3,
              key: "female",
            },
            {
              doc_count: 1,
              key: "male",
            },
          ],
          title: "Sex",
          total: 4,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "sex",
          remove: "/search/?type=HumanDonor",
          term: "female",
        },
        {
          field: "type",
          remove: "/search/?sex=female",
          term: "HumanDonor",
        },
      ],
    };

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    // Click the Clear All button and check that the router push function was called with the
    // correct URL.
    const clearAllButton = screen.getByLabelText(/Clear all filters/);
    fireEvent.click(clearAllButton);
    expect(window.location.href).toBe(
      "https://www.example.com/search/?type=HumanDonor"
    );
  });

  it("reacts correctly to clicking a term", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO9494FQMY/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO9494FQMY",
          aliases: ["igvf:alias_human_donor_child"],
          award: {
            "@id": "/awards/HG012012/",
            component: "data coordination",
          },
          collections: ["ENCODE"],
          ethnicities: ["Eskimo", "Arab"],
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "38d6630f-5b87-47a1-ae7d-174eab5758d2",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor&sex=female",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facet_groups: [],
      facets: [
        {
          appended: false,
          field: "sex",
          open_on_load: false,
          terms: [
            {
              doc_count: 3,
              key: "female",
            },
            {
              doc_count: 1,
              key: "male",
            },
          ],
          title: "Sex",
          total: 4,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "sex",
          remove: "/search/?type=HumanDonor",
          term: "female",
        },
        {
          field: "type",
          remove: "/search/?sex=female",
          term: "HumanDonor",
        },
      ],
    };

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    // Open the sex facet by clicking its trigger.
    const facetTrigger = screen.getByTestId(/^facettrigger-sex$/);
    fireEvent.click(facetTrigger);

    // Click the female term and check that the router push function was called with the correct URL.
    const termItem = screen.getByTestId(/^facetterm-sex-female$/);
    const term = within(termItem).getByRole("checkbox");
    fireEvent.mouseDown(term);
    fireEvent.mouseUp(term);
    expect(window.location.href).toBe(
      "https://www.example.com/search/?type=HumanDonor"
    );

    // Click the female term again as a negative selection.
    fireEvent.mouseDown(term);
    await new Promise((r) => setTimeout(r, 500));
    fireEvent.mouseUp(term);
    expect(window.location.href).toBe(
      "https://www.example.com/search/?type=HumanDonor&sex!=female"
    );

    // Deselect the female term and select it again.
    fireEvent.mouseDown(term);
    fireEvent.mouseUp(term);
    expect(window.location.href).toBe(
      "https://www.example.com/search/?type=HumanDonor"
    );
    fireEvent.mouseDown(term);
    fireEvent.mouseUp(term);
    expect(window.location.href).toBe(
      "https://www.example.com/search/?type=HumanDonor&sex=female"
    );
  });

  it("displays no facets if no facets are visible", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO9494FQMY/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO9494FQMY",
          aliases: ["igvf:alias_human_donor_child"],
          award: {
            "@id": "/awards/HG012012/",
            component: "data coordination",
          },
          collections: ["ENCODE"],
          ethnicities: ["Eskimo", "Arab"],
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "38d6630f-5b87-47a1-ae7d-174eab5758d2",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor&sex=female",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facet_groups: [],
      facets: [
        {
          field: "type",
          title: "Object Type",
          terms: [
            {
              key: "File",
              doc_count: 7,
            },
            {
              key: "Item",
              doc_count: 7,
            },
            {
              key: "SequenceFile",
              doc_count: 7,
            },
          ],
          total: 7,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "sex",
          remove: "/search/?type=HumanDonor",
          term: "female",
        },
        {
          field: "type",
          remove: "/search/?sex=female",
          term: "HumanDonor",
        },
      ],
    };

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );
    expect(screen.queryByTestId(/^datapanel$/)).toBeNull();
  });

  it("renders a facet with lots of terms", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
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
      all: "/search/?type=Lab&limit=all",
      clear_filters: "/search/?type=Lab",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          appended: false,
          field: "institute_label",
          open_on_load: false,
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
            {
              doc_count: 4,
              key: "UCLA",
            },
            {
              doc_count: 4,
              key: "UCSD",
            },
            {
              doc_count: 4,
              key: "UW",
            },
            {
              doc_count: 3,
              key: "UCI",
            },
            {
              doc_count: 3,
              key: "UNC",
            },
            {
              doc_count: 3,
              key: "UT",
            },
            {
              doc_count: 3,
              key: "UW Madison",
            },
            {
              doc_count: 2,
              key: "Caltech",
            },
            {
              doc_count: 2,
              key: "DFCI",
            },
            {
              doc_count: 2,
              key: "JHU",
            },
            {
              doc_count: 2,
              key: "MGH",
            },
            {
              doc_count: 2,
              key: "UCSF",
            },
            {
              doc_count: 2,
              key: "UMass",
            },
            {
              doc_count: 2,
              key: "UToronto",
            },
            {
              doc_count: 2,
              key: "University of Pittsburgh",
            },
            {
              doc_count: 1,
              key: "BIH",
            },
            {
              doc_count: 1,
              key: "Brigham and Women's Hospital",
            },
            {
              doc_count: 1,
              key: "HSCI",
            },
            {
              doc_count: 1,
              key: "HSPH",
            },
            {
              doc_count: 1,
              key: "HSS",
            },
            {
              doc_count: 1,
              key: "MD Anderson",
            },
            {
              doc_count: 1,
              key: "MHI",
            },
            {
              doc_count: 1,
              key: "Mount Sinai",
            },
            {
              doc_count: 1,
              key: "Northeastern",
            },
            {
              doc_count: 1,
              key: "PreventionGenetics",
            },
          ],
          title: "Institute",
          total: 79,
          type: "terms",
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
      total: 79,
    };

    const facetsForDisplay = searchResults.facets.filter(
      (facet) => facet.field !== "type"
    );

    render(
      <FacetListWithState
        searchResults={searchResults}
        facets={facetsForDisplay}
      />
    );

    // Click the facet button with data-testid="facet-trigger-institute_label" to open it.
    const facetTrigger = screen.getByTestId(/^facettrigger-institute_label$/);
    fireEvent.click(facetTrigger);

    // Make sure the correct number of collapsed terms appears.
    let terms = screen.getAllByTestId(/^facetterm-/);
    expect(terms).toHaveLength(15);

    // Make sure the facet term filter exists.
    const facetTermFilter = screen.getByTestId(/^facet-term-filter-/);
    expect(facetTermFilter).toBeInTheDocument();

    // Make sure the collapse control exists.
    const collapseControl = screen.getByTestId(/^facet-term-collapse-/);
    expect(collapseControl).toBeInTheDocument();

    // Click the collapse control and make sure all the terms appear.
    fireEvent.click(collapseControl);
    terms = screen.getAllByTestId(/^facetterm-/);
    expect(terms).toHaveLength(30);

    // Type something into the term filter input and make sure the correct number of terms are
    // displayed.
    const termFilterInput = within(facetTermFilter).getByRole("textbox");
    fireEvent.change(termFilterInput, { target: { value: "uc" } });

    terms = screen.getAllByTestId(/^facetterm-institute_label-/);
    expect(terms).toHaveLength(4);

    // Clear the term filter and make sure all the terms appear again.
    fireEvent.click(within(facetTermFilter).getByTestId(/^facet-term-clear-/));
    terms = screen.getAllByTestId(/^facetterm-institute_label-/);
    expect(terms).toHaveLength(30);
  });

  it("loads saved opened facets if logged in", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    window.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sex: true }),
      });
    }) as any;

    const mockSessionProperties = {
      user: {
        "@id": "/users/123/",
        "@type": ["User"],
        uuid: "123",
        title: "Test User",
        submits_for: [],
        viewing_groups: [],
      },
    } as any;

    const searchResults = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO9494FQMY/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO9494FQMY",
          aliases: ["igvf:alias_human_donor_child"],
          award: {
            "@id": "/awards/HG012012/",
            component: "data coordination",
          },
          collections: ["ENCODE"],
          ethnicities: ["Eskimo", "Arab"],
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "38d6630f-5b87-47a1-ae7d-174eab5758d2",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor&sex=female",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facet_groups: [],
      facets: [
        {
          field: "sex",
          open_on_load: false,
          terms: [
            {
              doc_count: 3,
              key: "female",
            },
            {
              doc_count: 1,
              key: "male",
            },
          ],
          title: "Sex",
          total: 4,
          type: "terms",
        },
        {
          field: "samples.construct_library_sets.file_set_type",
          title: "Construct Library Data",
          terms: [
            {
              key: "expression vector library",
              doc_count: 2,
            },
            {
              key: "reporter library",
              doc_count: 1,
            },
          ],
          total: 23,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "sex",
          remove: "/search/?type=HumanDonor",
          term: "female",
        },
        {
          field: "type",
          remove: "/search/?sex=female",
          term: "HumanDonor",
        },
      ],
    };

    render(
      <SessionContext.Provider
        value={{ sessionProperties: mockSessionProperties } as any}
      >
        <FacetSection
          searchResults={searchResults}
          allFacets={searchResults.facets}
        />
      </SessionContext.Provider>
    );

    // Check that the sex terms expanded because of the saved opened facets.
    let facetTerms;
    await waitFor(() => {
      facetTerms = screen.getAllByTestId(/^facetterm-sex-/);
    });
    let facetTrigger = screen.getByTestId(/^facettrigger-sex$/);
    expect(facetTrigger).toHaveAttribute("aria-expanded", "true");
    expect(facetTerms).toHaveLength(2);

    // Check that the construct library data terms are collapsed because they were not saved.
    facetTerms = screen.queryAllByTestId(
      /^facetterm-samples.construct_library_sets.file_set_type/
    );
    expect(facetTerms).toHaveLength(0);

    // Click the construct library data facet button to open it, then wait for the save timer to
    // have run. Then make sure fetch was called with the updated object.
    facetTrigger = screen.getByTestId(
      /^facettrigger-samples.construct_library_sets.file_set_type$/
    );
    fireEvent.click(facetTrigger);
    await waitFor(() => {
      facetTerms = screen.getAllByTestId(
        /^facetterm-samples.construct_library_sets.file_set_type/
      );
    });
    expect(facetTerms).toHaveLength(2);

    // Delay Jest test execution for four seconds.
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Wait for three seconds, then make sure window.fetch was called.
    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith(
        "/api/facet-config/123/?type=HumanDonor",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("doesn't attempt to load facets when logged in if multiple types in the query string", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    window.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ "lab.title": true }),
      });
    }) as any;

    const mockSessionProperties = {
      user: {
        "@id": "/users/123/",
        "@type": ["User"],
        uuid: "123",
        title: "Test User",
        submits_for: [],
        viewing_groups: [],
      },
    } as any;

    const searchResults = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO9494FQMY/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO9494FQMY",
          aliases: ["igvf:alias_human_donor_child"],
          award: {
            "@id": "/awards/HG012012/",
            component: "data coordination",
          },
          collections: ["ENCODE"],
          ethnicities: ["Eskimo", "Arab"],
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "38d6630f-5b87-47a1-ae7d-174eab5758d2",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor&type=RodentDonor",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor&type=RodentDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facet_groups: [],
      facets: [
        {
          field: "lab.title",
          title: "Lab",
          terms: [
            {
              key: "Chongyuan Luo, UCLA",
              doc_count: 4,
            },
            {
              key: "J. Michael Cherry, Stanford",
              doc_count: 4,
            },
          ],
          total: 8,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "lab.title",
          remove: "/search/?type=HumanDonor",
          term: "J. Michael Cherry, Stanford",
        },
      ],
    };

    render(
      <SessionContext.Provider
        value={{ sessionProperties: mockSessionProperties } as any}
      >
        <FacetSection
          searchResults={searchResults}
          allFacets={searchResults.facets}
        />
      </SessionContext.Provider>
    );

    // Check that the lab facet didn't expand even though it was saved because we have multiple
    // types.
    const facetTrigger = screen.getByTestId(/^facettrigger-lab.title$/);
    expect(facetTrigger).toHaveAttribute("aria-expanded", "false");
  });
});

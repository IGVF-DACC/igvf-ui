import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import SessionContext from "../../session-context";
import FacetSection from "../facet-section";
import { Reorder } from "motion/react";
import { type ErrorObject } from "../../../lib/fetch-request";
import type { SearchResults } from "../../../globals";

// Mock the window.location object so we can test the router.push() function.
const location = new URL("https://www.example.com") as any;
location.assign = jest.fn();
location.replace = jest.fn();
location.reload = jest.fn();
delete (window as any).location;
(window as any).location = location;

// Mock next/router (uses __mocks__/next/router.ts)
jest.mock("next/router");

// Mock motion/react (uses components/__mocks__/motion/react.tsx)
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

describe("Test <FacetSection> component", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    // Mock fetch to return resolved promises immediately
    window.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
    );
    jest.clearAllTimers();
    // Use real timers to avoid act() warnings with async state updates
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.clearAllTimers();
    // Ensure we're back to real timers after each test
    jest.useRealTimers();
  });

  it("renders null when no visible facets exist", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search?type=Gene",
      "@graph": [],
      clear_filters: "/search",
      columns: {},
      notification: "",
      title: "Search",
      total: 0,
      facets: [],
      filters: [],
    } as any;

    const { container } = render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders facet section with Clear All button and facets", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search?type=HumanDonor&sex=female",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [{ key: "HumanDonor", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
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
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    // Check that Clear All button exists
    const clearAllButton = screen.getByRole("button", { name: /clear all/i });
    expect(clearAllButton).toBeInTheDocument();

    // Check that expand/collapse buttons exist
    const expandButton = screen.getByLabelText("Open all facets");
    const collapseButton = screen.getByLabelText("Close all facets");
    expect(expandButton).toBeInTheDocument();
    expect(collapseButton).toBeInTheDocument();

    // Check that help tip exists
    expect(
      screen.getByText(/Click and hold a term momentarily/i)
    ).toBeInTheDocument();

    // Check that facets are rendered (but type facet should be filtered out)
    const facets = screen.getAllByTestId(/^facet-container-/);
    expect(facets).toHaveLength(1); // Only sex facet, not type
  });

  it("clears all filters when clicking the Clear All button", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor&sex=female",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
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
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    const clearAllButton = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearAllButton);

    expect(window.location.href).toBe(
      "https://www.example.com/search/?type=HumanDonor"
    );
  });

  it("disables Clear All button when no filters are selected", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    const clearAllButton = screen.getByRole("button", { name: /clear all/i });
    expect(clearAllButton).toBeDisabled();
  });

  it("opens and closes a facet when clicking its title", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    const facetTrigger = screen.getByTestId("facettrigger-sex");

    // Facet should start closed
    expect(facetTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryAllByTestId(/^facetterm-sex-/)).toHaveLength(0);

    // Click to open
    fireEvent.click(facetTrigger);
    expect(facetTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByTestId(/^facetterm-sex-/)).toHaveLength(2);

    // Click to close
    fireEvent.click(facetTrigger);
    expect(facetTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryAllByTestId(/^facetterm-sex-/)).toHaveLength(0);
  });

  it("opens all facets when clicking with Alt key", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [{ key: "released", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    const sexFacetTrigger = screen.getByTestId("facettrigger-sex");

    // Click with Alt key to open all facets
    fireEvent.click(sexFacetTrigger, { altKey: true });

    // Both facets should be open
    expect(screen.getAllByTestId(/^facetterm-sex-/)).toHaveLength(2);
    expect(screen.getAllByTestId(/^facetterm-status-/)).toHaveLength(1);
  });

  it("closes all facets when clicking with Alt key on an open facet", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [{ key: "released", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    const sexFacetTrigger = screen.getByTestId("facettrigger-sex");

    // First, open the facet normally
    fireEvent.click(sexFacetTrigger);
    expect(screen.getAllByTestId(/^facetterm-sex-/)).toHaveLength(2);

    // Now click with Alt key to close all
    fireEvent.click(sexFacetTrigger, { altKey: true });
    expect(screen.queryAllByTestId(/^facetterm-sex-/)).toHaveLength(0);
    expect(screen.queryAllByTestId(/^facetterm-status-/)).toHaveLength(0);
  });

  it("opens all facets when clicking with Meta key (Command on Mac)", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [{ key: "released", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    const sexFacetTrigger = screen.getByTestId("facettrigger-sex");

    // Click with Meta key (Command on Mac) to open all facets
    fireEvent.click(sexFacetTrigger, { metaKey: true });

    // Both facets should be open
    expect(screen.getAllByTestId(/^facetterm-sex-/)).toHaveLength(2);
    expect(screen.getAllByTestId(/^facetterm-status-/)).toHaveLength(1);
  });

  it("opens all facets when clicking the expand button", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [{ key: "released", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    const expandButton = screen.getByLabelText("Open all facets");
    fireEvent.click(expandButton);

    // Both facets should be open
    expect(screen.getAllByTestId(/^facetterm-sex-/)).toHaveLength(2);
    expect(screen.getAllByTestId(/^facetterm-status-/)).toHaveLength(1);
  });

  it("closes all facets when clicking the collapse button", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [{ key: "released", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    // First open all facets
    const expandButton = screen.getByLabelText("Open all facets");
    fireEvent.click(expandButton);
    expect(screen.getAllByTestId(/^facetterm-sex-/)).toHaveLength(2);

    // Then collapse all
    const collapseButton = screen.getByLabelText("Close all facets");
    fireEvent.click(collapseButton);
    expect(screen.queryAllByTestId(/^facetterm-sex-/)).toHaveLength(0);
    expect(screen.queryAllByTestId(/^facetterm-status-/)).toHaveLength(0);
  });

  it("loads saved facet config when logged in with single type", async () => {
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
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

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

    // Wait for the saved config to load
    await waitFor(() => {
      const facetTrigger = screen.getByTestId("facettrigger-sex");
      expect(facetTrigger).toHaveAttribute("aria-expanded", "true");
    });

    // Verify the facet is open based on saved config
    expect(screen.getAllByTestId(/^facetterm-sex-/)).toHaveLength(2);
  });

  it("does not load saved facet config when not logged in", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const mockFetch = jest.fn();
    window.fetch = mockFetch as any;

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    // Verify fetch was not called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does not load saved facet config when multiple types are selected", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockFetch = jest.fn();
    window.fetch = mockFetch as any;

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
      "@id": "/search/?type=HumanDonor&type=RodentDonor",
      "@graph": [],
      clear_filters: "/search",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/?type=RodentDonor",
          term: "HumanDonor",
        },
        {
          field: "type",
          remove: "/search/?type=HumanDonor",
          term: "RodentDonor",
        },
      ],
    } as any;

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

    // Verify fetch was not called because multiple types are selected
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("saves facet config after opening a facet when logged in", async () => {
    // Enable fake timers for this test to control debounced saves
    jest.useFakeTimers();

    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockFetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
    window.fetch = mockFetch as any;

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
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

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

    // Wait for initial load
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/facet-config/123/?type=HumanDonor",
        expect.any(Object)
      );
    });

    mockFetch.mockClear();

    // Open a facet
    const facetTrigger = screen.getByTestId("facettrigger-sex");
    fireEvent.click(facetTrigger);

    // Fast-forward timers to trigger the save
    jest.advanceTimersByTime(3000);

    // Wait for the save to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/facet-config/123/?type=HumanDonor",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("does not save facet config when not logged in", () => {
    // Enable fake timers for this test to control debounced saves
    jest.useFakeTimers();

    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const mockFetch = jest.fn();
    window.fetch = mockFetch as any;

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    // Open a facet
    const facetTrigger = screen.getByTestId("facettrigger-sex");
    fireEvent.click(facetTrigger);

    // Fast-forward timers
    jest.advanceTimersByTime(3000);

    // Verify fetch was not called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("filters out type facet from visible facets", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [{ key: "HumanDonor", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    // Should only show sex facet, not type facet
    const facets = screen.getAllByTestId(/^facet-container-/);
    expect(facets).toHaveLength(1);
    expect(screen.getByTestId("facet-container-sex")).toBeInTheDocument();
    expect(
      screen.queryByTestId("facet-container-type")
    ).not.toBeInTheDocument();
  });

  it("handles duplicate filter fields in Clear Filter button", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const searchResults = {
      "@id": "/search/?type=HumanDonor&sex=female&sex=male",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "sex",
          remove: "/search/?type=HumanDonor&sex=male",
          term: "female",
        },
        {
          field: "sex",
          remove: "/search/?type=HumanDonor&sex=female",
          term: "male",
        },
        {
          field: "type",
          remove: "/search/?sex=female&sex=male",
          term: "HumanDonor",
        },
      ],
    } as any;

    render(
      <FacetSection
        searchResults={searchResults}
        allFacets={searchResults.facets}
      />
    );

    const clearAllButton = screen.getByRole("button", {
      name: /clear all filters/i,
    });
    expect(clearAllButton).not.toBeDisabled();
  });

  it("saves facet config immediately on facet state changes", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockFetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
    window.fetch = mockFetch as any;

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
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [{ key: "released", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

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

    // Wait for initial load
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // 1 for config, 1 for order
    });

    mockFetch.mockClear();

    // Open multiple facets
    const sexFacetTrigger = screen.getByTestId("facettrigger-sex");
    const statusFacetTrigger = screen.getByTestId("facettrigger-status");

    fireEvent.click(sexFacetTrigger);

    // Should have saved immediately after first click
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    fireEvent.click(statusFacetTrigger);

    // Should have saved immediately after second click
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();

      // Verify that config saves are happening
      const configSaves = mockFetch.mock.calls.filter(
        (call) => call[0] === "/api/facet-config/123/?type=HumanDonor"
      );

      // Expect at least 2 saves (one for each facet click), possibly more due to React rendering
      expect(configSaves.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("enters edit order mode when clicking the edit order button", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockSessionProperties = {
      user: {
        uuid: "123",
      },
    };

    const searchResults = {
      "@id": "/search?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [
            { key: "released", doc_count: 2 },
            { key: "in progress", doc_count: 2 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "HumanDonor",
        },
      ],
    } as any;

    const mockFetch = jest.fn();
    mockFetch.mockImplementation(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        }) as any
    );
    window.fetch = mockFetch as any;

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

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Find and click the edit order button
    const editOrderButton = screen.getByRole("button", {
      name: "Edit facet order",
    });
    fireEvent.click(editOrderButton);

    // Check that edit mode controls are now visible
    await waitFor(() => {
      const doneButton = screen
        .getAllByText("Done")
        .find((el) => el.tagName === "BUTTON");
      expect(doneButton).toBeInTheDocument();
      const cancelButton = screen
        .getAllByText("Cancel")
        .find((el) => el.tagName === "BUTTON");
      expect(cancelButton).toBeInTheDocument();
      const resetButton = screen
        .getAllByText("Reset")
        .find((el) => el.tagName === "BUTTON");
      expect(resetButton).toBeInTheDocument();
    });

    // mockFetch cleanup handled by beforeEach;
  });

  it("saves facet order when clicking Done in edit mode", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockSessionProperties = {
      user: {
        uuid: "123",
      },
    };

    const searchResults = {
      "@id": "/search?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [
            { key: "released", doc_count: 2 },
            { key: "in progress", doc_count: 2 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "HumanDonor",
        },
      ],
    } as any;

    const mockFetch = jest.fn();
    mockFetch.mockImplementation(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        }) as any
    );
    window.fetch = mockFetch as any;

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

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Enter edit mode
    const editOrderButton = screen.getByRole("button", {
      name: "Edit facet order",
    });
    fireEvent.click(editOrderButton);

    await waitFor(() => {
      const doneButton = screen
        .getAllByText("Done")
        .find((el) => el.tagName === "BUTTON");
      expect(doneButton).toBeInTheDocument();
    });

    mockFetch.mockClear();

    // Click Done button
    const doneButton = screen
      .getAllByText("Done")
      .find((el) => el.tagName === "BUTTON");
    fireEvent.click(doneButton);

    // Verify that the facet order was saved
    await waitFor(() => {
      const orderSaveCalls = mockFetch.mock.calls.filter(
        (call) => call[0] === "/api/facet-order/123/?type=HumanDonor"
      );
      expect(orderSaveCalls.length).toBeGreaterThan(0);
    });

    // Verify edit mode controls are no longer visible
    expect(screen.queryByText("Done")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();

    // mockFetch cleanup handled by beforeEach;
  });

  it("cancels edit mode without saving when clicking Cancel", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockSessionProperties = {
      user: {
        uuid: "123",
      },
    };

    const searchResults = {
      "@id": "/search?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [
            { key: "released", doc_count: 2 },
            { key: "in progress", doc_count: 2 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "HumanDonor",
        },
      ],
    } as any;

    const mockFetch = jest.fn();
    mockFetch.mockImplementation(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        }) as any
    );
    window.fetch = mockFetch as any;

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

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Enter edit mode
    const editOrderButton = screen.getByRole("button", {
      name: "Edit facet order",
    });
    fireEvent.click(editOrderButton);

    await waitFor(() => {
      const cancelButton = screen
        .getAllByText("Cancel")
        .find((el) => el.tagName === "BUTTON");
      expect(cancelButton).toBeInTheDocument();
    });

    mockFetch.mockClear();

    // Click Cancel button
    const cancelButton = screen
      .getAllByText("Cancel")
      .find((el) => el.tagName === "BUTTON");
    fireEvent.click(cancelButton);

    // Verify that no order save was made
    await waitFor(() => {
      const orderSaveCalls = mockFetch.mock.calls.filter(
        (call) => call[0] === "/api/facet-order/123/?type=HumanDonor"
      );
      expect(orderSaveCalls.length).toBe(0);
    });

    // Verify edit mode controls are no longer visible
    expect(screen.queryByText("Done")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();

    // mockFetch cleanup handled by beforeEach;
  });

  it("resets facet order to default when clicking Reset in edit mode", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockSessionProperties = {
      user: {
        uuid: "123",
      },
    };

    const searchResults = {
      "@id": "/search?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [
            { key: "released", doc_count: 2 },
            { key: "in progress", doc_count: 2 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "HumanDonor",
        },
      ],
    } as any;

    const mockFetch = jest.fn();
    mockFetch.mockImplementation(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        }) as any
    );
    window.fetch = mockFetch as any;

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

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Enter edit mode
    const editOrderButton = screen.getByRole("button", {
      name: "Edit facet order",
    });
    fireEvent.click(editOrderButton);

    await waitFor(() => {
      const resetButton = screen
        .getAllByText("Reset")
        .find((el) => el.tagName === "BUTTON");
      expect(resetButton).toBeInTheDocument();
    });

    // Click Reset button - this should reset to default order
    const resetButton = screen
      .getAllByText("Reset")
      .find((el) => el.tagName === "BUTTON");
    fireEvent.click(resetButton);

    // Reset keeps you in edit mode, so controls should still be visible
    expect(
      screen.getAllByText("Done").find((el) => el.tagName === "BUTTON")
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Cancel").find((el) => el.tagName === "BUTTON")
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Reset").find((el) => el.tagName === "BUTTON")
    ).toBeInTheDocument();

    // mockFetch cleanup handled by beforeEach;
  });

  it("loads saved facet order with missing fields added to the end", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockSessionProperties = {
      user: {
        uuid: "123",
      },
    };

    const searchResults = {
      "@id": "/search?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [
            { key: "released", doc_count: 2 },
            { key: "in progress", doc_count: 2 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "taxa",
          title: "Taxa",
          terms: [{ key: "Homo sapiens", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "HumanDonor",
        },
      ],
    } as any;

    const allFacets = searchResults.facets;

    const mockFetch = jest.fn();
    mockFetch.mockImplementation((url) => {
      if (url === "/api/facet-order/123/?type=HumanDonor") {
        // Return saved order that only has "sex" and "status" but not "taxa"
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(["status", "sex"]),
        }) as any;
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }) as any;
    });
    window.fetch = mockFetch as any;

    render(
      <SessionContext.Provider
        value={{ sessionProperties: mockSessionProperties } as any}
      >
        <FacetSection searchResults={searchResults} allFacets={allFacets} />
      </SessionContext.Provider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Verify that all three facets are rendered
    expect(screen.getByText("Sex")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Taxa")).toBeInTheDocument();

    // mockFetch cleanup handled by beforeEach;
  });

  it("prevents facet opening/closing while in edit order mode", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockSessionProperties = {
      user: {
        uuid: "123",
      },
    };

    const searchResults = {
      "@id": "/search?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search/",
          term: "HumanDonor",
        },
      ],
    } as any;

    const mockFetch = jest.fn();
    mockFetch.mockImplementation(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        }) as any
    );
    window.fetch = mockFetch as any;

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

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Enter edit mode
    const editOrderButton = screen.getByRole("button", {
      name: "Edit facet order",
    });
    fireEvent.click(editOrderButton);

    await waitFor(() => {
      const doneButton = screen
        .getAllByText("Done")
        .find((el) => el.tagName === "BUTTON");
      expect(doneButton).toBeInTheDocument();
    });

    mockFetch.mockClear();

    // Try to click a facet trigger while in edit mode
    const sexFacetTrigger = screen.getByTestId("facettrigger-sex");
    fireEvent.click(sexFacetTrigger);

    // Verify that no config save was made (facet shouldn't have opened)
    await waitFor(() => {
      const configSaveCalls = mockFetch.mock.calls.filter(
        (call) => call[0] === "/api/facet-config/123/?type=HumanDonor"
      );
      // There should be no new config save calls
      expect(configSaveCalls.length).toBe(0);
    });

    // mockFetch cleanup handled by beforeEach;
  });

  it("updates facet order when dragging in edit mode", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

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
      "@id": "/search/?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [
            { key: "female", doc_count: 3 },
            { key: "male", doc_count: 1 },
          ],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [{ key: "released", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

    const mockFetch = jest.fn();
    mockFetch.mockImplementation(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        }) as any
    );
    window.fetch = mockFetch as any;

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

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Enter edit mode
    const editOrderButton = screen.getByRole("button", {
      name: "Edit facet order",
    });
    fireEvent.click(editOrderButton);

    await waitFor(() => {
      const doneButton = screen
        .getAllByText("Done")
        .find((el) => el.tagName === "BUTTON");
      expect(doneButton).toBeInTheDocument();
    });

    // Verify that Reorder.Group was called with onReorder and onReorderComplete callbacks
    const reorderGroupCalls = (Reorder.Group as jest.Mock).mock.calls;
    // Find the most recent call that has onReorder (when in edit mode)
    const editModeCall = reorderGroupCalls
      .slice()
      .reverse()
      .find((call) => call[0].onReorder);

    expect(editModeCall).toBeDefined();
    expect(editModeCall[0].onReorder).toBeInstanceOf(Function);

    // Test the onReorder callback directly
    const onReorderCallback = editModeCall[0].onReorder;
    const newOrder = [
      searchResults.facets[1], // status first
      searchResults.facets[0], // sex second
    ];

    // Call onReorder to simulate drag - wrap in act to handle state updates
    act(() => {
      onReorderCallback(newOrder);
    });

    mockFetch.mockClear();

    // Click Done to save the new order
    const doneButton = screen
      .getAllByText("Done")
      .find((el) => el.tagName === "BUTTON");
    fireEvent.click(doneButton!);

    // Verify the new order was saved
    await waitFor(() => {
      const orderSaveCalls = mockFetch.mock.calls.filter(
        (call) => call[0] === "/api/facet-order/123/?type=HumanDonor"
      );
      expect(orderSaveCalls.length).toBeGreaterThan(0);
      const saveCall = orderSaveCalls[0];
      const body = JSON.parse(saveCall[1].body);
      // After dragging, order should be [status, sex]
      expect(body).toEqual(["status", "sex"]);
    });
  });

  it("logs console error when saving facet configuration fails", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockSessionProperties = {
      user: {
        "@id": "/users/123/",
        "@type": ["User"],
        uuid: "123",
        title: "Test User",
        submits_for: [],
        viewing_groups: [],
      },
    };

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock fetch to return error object when posting facet config
    const errorResponse: ErrorObject = {
      isError: true,
      "@type": ["NetworkError", "Error"],
      status: "error",
      code: 503,
      title: "Network error",
      description: "Failed to save",
      detail: "Network connection failed",
    };

    const mockFetch = jest.fn((url: string, options?: RequestInit) => {
      if (
        url === "/api/facet-config/123/?type=HumanDonor" &&
        options?.method === "POST"
      ) {
        // Return the error as JSON response
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve(errorResponse),
        } as Response);
      }

      // All other requests succeed
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });
    window.fetch = mockFetch;

    const searchResults: SearchResults = {
      "@id": "/search?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [{ key: "female", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

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

    // Wait for initial load to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Click to open a facet (triggers saveOpen which calls setFacetConfig).
    const facetTrigger = screen.getByTestId("facettrigger-sex");
    fireEvent.click(facetTrigger);

    // Wait for the async save to complete and error to be logged.
    await waitFor(
      () => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to save facet configuration:",
          errorResponse
        );
      },
      { timeout: 3000 }
    );
  });

  it("logs console error when saving facet order fails", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const mockSessionProperties = {
      user: {
        "@id": "/users/123/",
        "@type": ["User"],
        uuid: "123",
        title: "Test User",
        submits_for: [],
        viewing_groups: [],
      },
    };

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock fetch to return error object when posting facet order
    const errorResponse: ErrorObject = {
      isError: true,
      "@type": ["NetworkError", "Error"],
      status: "error",
      code: 503,
      title: "Redis error",
      description: "Failed to save order",
      detail: "Redis connection failed",
    };

    const mockFetch = jest.fn((url: string, options?: RequestInit) => {
      if (
        url === "/api/facet-order/123/?type=HumanDonor" &&
        options?.method === "POST"
      ) {
        // Return the error as JSON response
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve(errorResponse),
        } as Response);
      }
      // All other requests succeed
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });
    window.fetch = mockFetch;

    const searchResults: SearchResults = {
      "@id": "/search?type=HumanDonor",
      "@graph": [],
      clear_filters: "/search/?type=HumanDonor",
      columns: {},
      notification: "",
      title: "Search",
      total: 4,
      facets: [
        {
          field: "sex",
          title: "Sex",
          terms: [{ key: "female", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "status",
          title: "Status",
          terms: [{ key: "released", doc_count: 4 }],
          total: 4,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          remove: "/search",
          term: "HumanDonor",
        },
      ],
    } as any;

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

    // Wait for initial load.
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Enter edit mode.
    const editOrderButton = screen.getByRole("button", {
      name: "Edit facet order",
    });
    fireEvent.click(editOrderButton);

    await waitFor(() => {
      const doneButton = screen
        .getAllByText("Done")
        .find((el) => el.tagName === "BUTTON");
      expect(doneButton).toBeInTheDocument();
    });

    // Simulate reorder.
    const reorderGroupCalls = (Reorder.Group as jest.Mock).mock.calls;
    const editModeCall = reorderGroupCalls
      .slice()
      .reverse()
      .find((call) => call[0].onReorder);

    act(() => {
      editModeCall[0].onReorder([
        searchResults.facets[1],
        searchResults.facets[0],
      ]);
    });

    // Click Done to save (this will call setFacetOrder which will return error).
    const doneButton = screen
      .getAllByText("Done")
      .find((el) => el.tagName === "BUTTON");

    fireEvent.click(doneButton!);

    // Wait for the async save to complete and error to be logged
    await waitFor(
      () => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to save facet order:",
          errorResponse
        );
      },
      { timeout: 3000 }
    );
  });
});

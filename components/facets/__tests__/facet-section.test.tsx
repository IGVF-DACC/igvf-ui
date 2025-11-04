import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import SessionContext from "../../session-context";
import FacetSection from "../facet-section";

// Mock the window.location object so we can test the router.push() function.
const location = new URL("https://www.example.com") as any;
location.assign = jest.fn();
location.replace = jest.fn();
location.reload = jest.fn();
delete (window as any).location;
(window as any).location = location;

// Mock next/router (uses __mocks__/next/router.ts)
jest.mock("next/router");

// Mock framer-motion (uses components/__mocks__/framer-motion.tsx)
jest.mock("framer-motion");

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
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.runOnlyPendingTimers();
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
      <FacetSection searchResults={searchResults} />
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

    render(<FacetSection searchResults={searchResults} />);

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

    render(<FacetSection searchResults={searchResults} />);

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

    render(<FacetSection searchResults={searchResults} />);

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

    render(<FacetSection searchResults={searchResults} />);

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

    render(<FacetSection searchResults={searchResults} />);

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

    render(<FacetSection searchResults={searchResults} />);

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

    render(<FacetSection searchResults={searchResults} />);

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

    render(<FacetSection searchResults={searchResults} />);

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

    render(<FacetSection searchResults={searchResults} />);

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
        <FacetSection searchResults={searchResults} />
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

    const fetchSpy = jest.fn();
    window.fetch = fetchSpy as any;

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

    render(<FacetSection searchResults={searchResults} />);

    // Verify fetch was not called
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does not load saved facet config when multiple types are selected", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const fetchSpy = jest.fn();
    window.fetch = fetchSpy as any;

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
        <FacetSection searchResults={searchResults} />
      </SessionContext.Provider>
    );

    // Verify fetch was not called because multiple types are selected
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("saves facet config after opening a facet when logged in", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const fetchSpy = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
    window.fetch = fetchSpy as any;

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
        <FacetSection searchResults={searchResults} />
      </SessionContext.Provider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/facet-config/123/?type=HumanDonor",
        expect.any(Object)
      );
    });

    fetchSpy.mockClear();

    // Open a facet
    const facetTrigger = screen.getByTestId("facettrigger-sex");
    fireEvent.click(facetTrigger);

    // Fast-forward timers to trigger the save
    jest.advanceTimersByTime(3000);

    // Wait for the save to complete
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/facet-config/123/?type=HumanDonor",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("does not save facet config when not logged in", () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
    } as any);

    const fetchSpy = jest.fn();
    window.fetch = fetchSpy as any;

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

    render(<FacetSection searchResults={searchResults} />);

    // Open a facet
    const facetTrigger = screen.getByTestId("facettrigger-sex");
    fireEvent.click(facetTrigger);

    // Fast-forward timers
    jest.advanceTimersByTime(3000);

    // Verify fetch was not called
    expect(fetchSpy).not.toHaveBeenCalled();
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

    render(<FacetSection searchResults={searchResults} />);

    // Should only show sex facet, not type facet
    const facets = screen.getAllByTestId(/^facet-container-/);
    expect(facets).toHaveLength(1);
    expect(screen.getByTestId("facet-container-sex")).toBeInTheDocument();
    expect(
      screen.queryByTestId("facet-container-type")
    ).not.toBeInTheDocument();
  });

  it("handles duplicate filter fields in Clear All button", () => {
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

    render(<FacetSection searchResults={searchResults} />);

    const clearAllButton = screen.getByRole("button", { name: /clear all/i });
    expect(clearAllButton).not.toBeDisabled();
  });

  it("buffers multiple facet state changes before saving", async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const fetchSpy = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
    window.fetch = fetchSpy as any;

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
        <FacetSection searchResults={searchResults} />
      </SessionContext.Provider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    fetchSpy.mockClear();

    // Open multiple facets quickly
    const sexFacetTrigger = screen.getByTestId("facettrigger-sex");
    const statusFacetTrigger = screen.getByTestId("facettrigger-status");

    fireEvent.click(sexFacetTrigger);
    jest.advanceTimersByTime(1000); // Less than BUFFER_TIMEOUT

    fireEvent.click(statusFacetTrigger);
    jest.advanceTimersByTime(1000); // Still less than BUFFER_TIMEOUT

    // Should not have saved yet
    expect(fetchSpy).not.toHaveBeenCalled();

    // Complete the buffer timeout
    jest.advanceTimersByTime(1500); // Total: 3500ms > 3000ms BUFFER_TIMEOUT

    // Now it should have saved (only once)
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});

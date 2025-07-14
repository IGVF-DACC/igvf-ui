import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import type { SearchResults } from "../../../globals.d";
import TriBooleanTerms from "../custom-facets/tri-boolean-terms";

const searchResults: SearchResults = {
  "@context": "/terms/",
  "@graph": [],
  "@id": "/search/?type=InstitutionalCertificate&status!=deleted",
  "@type": ["Search"],
  clear_filters: "/search/?type=InstitutionalCertificate",
  columns: {
    "@id": {
      title: "ID",
    },
  },
  facets: [
    {
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
    },
  ],
  filters: [
    {
      field: "type",
      term: "InstitutionalCertificate",
      remove: "/search/?status%21=deleted",
    },
  ],
  notification: "Success",
  title: "Search",
  total: 11,
};

describe("Test TriBooleanTerms component", () => {
  let searchResultsCopy: SearchResults;

  beforeEach(() => {
    // Clone the searchResults object to avoid modifying the original object.
    searchResultsCopy = JSON.parse(JSON.stringify(searchResults));
  });

  test("Renders TriBooleanTerms component", () => {
    const updateQuery = jest.fn();

    render(
      <TriBooleanTerms
        searchResults={searchResultsCopy}
        facet={searchResults.facets[0]}
        updateQuery={updateQuery}
      />
    );

    // Expect three elements with role="radio" to be rendered with the correct contents.
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(3);
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("true");
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("6");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("false");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("5");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("any");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("11");
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).toBeChecked();

    // Check the "true" radio button and expect the updateQuery function to be called with the
    // correct query string. Wrap the click in an act() call to avoid a warning about updates
    // occurring outside of act().
    act(() => {
      radioButtons[0].click();
    });
    expect(updateQuery).toHaveBeenCalledWith(
      "type=InstitutionalCertificate&status!=deleted&controlled_access=true"
    );

    // Check the "false" radio button and expect the updateQuery function to be called with the
    // correct query string.
    act(() => {
      radioButtons[1].click();
    });
    expect(updateQuery).toHaveBeenCalledWith(
      "type=InstitutionalCertificate&status!=deleted&controlled_access=false"
    );
  });

  test("Renders TriBooleanTerms component with controlled_access=false", () => {
    // Add a filter for controlled_access=false to the searchResults object.
    searchResultsCopy["@id"] =
      "/search/?type=InstitutionalCertificate&status!=deleted&controlled_access=false";
    searchResultsCopy.filters.push({
      field: "controlled_access",
      term: "false",
      remove: "/search/?status%21=deleted",
    });

    const updateQuery = jest.fn();

    render(
      <TriBooleanTerms
        searchResults={searchResultsCopy}
        facet={searchResults.facets[0]}
        updateQuery={updateQuery}
      />
    );

    // Expect three elements with role="radio" to be rendered with the correct contents.
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(3);
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("true");
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("6");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("false");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("5");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("any");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("11");
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).toBeChecked();
    expect(radioButtons[2]).not.toBeChecked();

    // Check the "true" radio button and expect the updateQuery function to be called with the
    // correct query string.
    act(() => {
      radioButtons[0].click();
    });
    expect(updateQuery).toHaveBeenCalledWith(
      "type=InstitutionalCertificate&status!=deleted&controlled_access=true"
    );

    // Check the "either" radio button and expect the updateQuery function to be called with the
    // correct query string.
    act(() => {
      radioButtons[2].click();
    });
    expect(updateQuery).toHaveBeenCalledWith(
      "type=InstitutionalCertificate&status!=deleted"
    );
  });

  test("Renders TriBooleanTerms component with controlled_access=true", () => {
    // Add a filter for controlled_access=true to the searchResults object.
    searchResultsCopy["@id"] =
      "/search/?type=InstitutionalCertificate&status!=deleted&controlled_access=true";
    searchResultsCopy.filters.push({
      field: "controlled_access",
      term: "true",
      remove: "/search/?status%21=deleted",
    });

    const updateQuery = jest.fn();

    render(
      <TriBooleanTerms
        searchResults={searchResultsCopy}
        facet={searchResults.facets[0]}
        updateQuery={updateQuery}
      />
    );

    // Expect three elements with role="radio" to be rendered with the correct contents.
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(3);
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("true");
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("6");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("false");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("5");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("any");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("11");
    expect(radioButtons[0]).toBeChecked();
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).not.toBeChecked();

    // Check the "false" radio button and expect the updateQuery function to be called with the
    // correct query string.
    act(() => {
      radioButtons[1].click();
    });
    expect(updateQuery).toHaveBeenCalledWith(
      "type=InstitutionalCertificate&status!=deleted&controlled_access=false"
    );

    // Check the "either" radio button and expect the updateQuery function to be called with the
    // correct query string.
    act(() => {
      radioButtons[2].click();
    });
    expect(updateQuery).toHaveBeenCalledWith(
      "type=InstitutionalCertificate&status!=deleted"
    );
  });

  test("Renders TriBooleanTerms component with mix of controlled_access filters", () => {
    // Add filters for controlled_access=true and controlled_access=false to the searchResults object.
    searchResultsCopy["@id"] =
      "/search/?type=InstitutionalCertificate&status!=deleted&controlled_access=true&controlled_access=false";
    searchResultsCopy.filters.push(
      {
        field: "controlled_access",
        term: "true",
        remove: "/search/?status%21=deleted",
      },
      {
        field: "controlled_access",
        term: "false",
        remove: "/search/?status%21=deleted",
      }
    );
    searchResultsCopy.facets[0].terms[0].doc_count = 1;
    searchResultsCopy.total = 6;

    const facet = {
      field: "controlled_access",
      title: "Controlled Access",
      terms: [
        {
          key: 1,
          key_as_string: "true",
          doc_count: 1,
        },
        {
          key: 0,
          key_as_string: "false",
          doc_count: 5,
        },
      ],
      type: "terms",
      total: 6,
    };

    const updateQuery = jest.fn();

    render(
      <TriBooleanTerms
        searchResults={searchResultsCopy}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    // Expect three elements with role="radio" to be rendered with the correct contents.
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(3);
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("true");
    expect(radioButtons[0].nextElementSibling).toHaveTextContent("1");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("false");
    expect(radioButtons[1].nextElementSibling).toHaveTextContent("5");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("any");
    expect(radioButtons[2].nextElementSibling).toHaveTextContent("6");
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).toBeChecked();

    // Check the "true" radio button and expect the updateQuery function to be called with the
    // correct query string.
    act(() => {
      radioButtons[0].click();
    });
    expect(updateQuery).toHaveBeenCalledWith(
      "type=InstitutionalCertificate&status!=deleted&controlled_access=true"
    );

    // Check the "false" radio button and expect the updateQuery function to be called with the
    // correct query string.
    act(() => {
      radioButtons[1].click();
    });
    expect(updateQuery).toHaveBeenCalledWith(
      "type=InstitutionalCertificate&status!=deleted&controlled_access=false"
    );
  });
});

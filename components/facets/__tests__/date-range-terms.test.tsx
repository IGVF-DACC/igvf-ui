import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateRangeTerms from "../custom-facets/date-range-terms";
import { SearchResults } from "../../../globals";

// Mock the react-list library needed by the react-date-range package.
jest.mock("react-list", () => {
  const React = require("react");

  const MockReactList = React.forwardRef((props: any, ref) => {
    React.useImperativeHandle(ref, () => ({
      getVisibleRange: () => [0, 0], // stub return value as needed
      scrollTo: () => {}, // stubbed no-op
    }));

    return <div>{props.children}</div>;
  });

  MockReactList.displayName = "MockReactList";
  return MockReactList;
});

describe("Test DateRangeTerms component", () => {
  it("renders a date-range facet with no query-string release dates", async () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/measurement-sets/IGVFDS6222STRR/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          accession: "IGVFDS6222STRR",
          aliases: ["igvf:starr-seq-example"],
          award: {
            component: "networks",
            "@id": "/awards/1U01HG012103-01/",
            title:
              "Deciphering the Genomics of Gene Network Regulation of T Cell and Fibroblast States in Autoimmune Inflammation",
            contact_pi: {
              "@id": "/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/",
              title: "Christina Leslie",
            },
          },
          data_use_limitation_summaries: ["no certificate"],
          file_set_type: "experimental data",
          status: "released",
          summary: "untreated STARR-seq",
          uuid: "f64b07a2-6f85-478a-9b39-1703811e40a1",
        },
      ],
      "@id": "/search/?type=MeasurementSet",
      "@type": ["Search"],
      clear_filters: "/search/?type=MeasurementSet",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
        alternate_accessions: {
          title: "Alternate Accessions",
        },
      },
      facets: [
        {
          field: "release_timestamp",
          title: "Release Date",
          terms: [
            {
              key: 1709728496000,
              key_as_string: "2024-03-06T12:34:56.000Z",
              doc_count: 22,
            },
            {
              key: 1720269355000,
              key_as_string: "2024-07-06T12:35:55.000Z",
              doc_count: 4,
            },
            {
              key: 1728477296000,
              key_as_string: "2024-10-09T12:34:56.000Z",
              doc_count: 4,
            },
            {
              key: 1738845296000,
              key_as_string: "2025-02-06T12:34:56.000Z",
              doc_count: 2,
            },
            {
              key: 1717677355000,
              key_as_string: "2024-06-06T12:35:55.000Z",
              doc_count: 1,
            },
          ],
          total: 33,
          type: "terms",
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
      title: "Search",
      total: 1,
    };

    const facet = searchResults.facets[0];

    const updateQuery = jest.fn();
    render(
      <DateRangeTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    // Check that it rendered a button containing the earliest and latest dates from the facet data.
    const button = screen.getByTestId("date-range-trigger-release_timestamp");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("March 6, 2024");
    expect(button).toHaveTextContent("February 6, 2025");

    // Click the button and make sure the modal opens.
    await userEvent.click(button);
    const modal = screen.getByTestId("date-range-modal");
    expect(modal).toBeInTheDocument();

    // Click the "Apply" button and make sure the updateQuery function is called with the correct arguments.
    const applyButton = screen.getByText("Apply");
    await userEvent.click(applyButton);
    expect(updateQuery).toHaveBeenCalledWith(
      "type=MeasurementSet&release_timestamp=gte:2024-03-06&release_timestamp=lte:2025-02-06"
    );
  });

  it("renders a date-range facet with query-string release dates", async () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/measurement-sets/IGVFDS6222STRR/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          accession: "IGVFDS6222STRR",
          aliases: ["igvf:starr-seq-example"],
          award: {
            component: "networks",
            "@id": "/awards/1U01HG012103-01/",
            title:
              "Deciphering the Genomics of Gene Network Regulation of T Cell and Fibroblast States in Autoimmune Inflammation",
            contact_pi: {
              "@id": "/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/",
              title: "Christina Leslie",
            },
          },
          data_use_limitation_summaries: ["no certificate"],
          file_set_type: "experimental data",
          status: "released",
          summary: "untreated STARR-seq",
          uuid: "f64b07a2-6f85-478a-9b39-1703811e40a1",
        },
      ],
      "@id":
        "/search/?type=MeasurementSet&release_timestamp=gte:2024-06-01&release_timestamp=lte:2024-06-30",
      "@type": ["Search"],
      clear_filters: "/search/?type=MeasurementSet",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
        alternate_accessions: {
          title: "Alternate Accessions",
        },
      },
      facets: [
        {
          field: "release_timestamp",
          title: "Release Date",
          terms: [
            {
              key: 1709728496000,
              key_as_string: "2024-03-06T12:34:56.000Z",
              doc_count: 22,
            },
            {
              key: 1720269355000,
              key_as_string: "2024-07-06T12:35:55.000Z",
              doc_count: 4,
            },
            {
              key: 1728477296000,
              key_as_string: "2024-10-09T12:34:56.000Z",
              doc_count: 4,
            },
            {
              key: 1738845296000,
              key_as_string: "2025-02-06T12:34:56.000Z",
              doc_count: 2,
            },
            {
              key: 1717677355000,
              key_as_string: "2024-06-06T12:35:55.000Z",
              doc_count: 1,
            },
          ],
          total: 33,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          term: "MeasurementSet",
          remove: "/search/",
        },
        {
          field: "release_timestamp",
          term: "gte:2024-06-01",
          remove:
            "/search/?type=MeasurementSet&release_timestamp=lte:2024-06-30",
        },
        {
          field: "release_timestamp",
          term: "lte:2024-06-30",
          remove:
            "/search/?type=MeasurementSet&release_timestamp=gte:2024-06-01",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    const facet = searchResults.facets[0];

    const updateQuery = jest.fn();
    render(
      <DateRangeTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    // Check that it rendered a button containing the earliest and latest dates from the facet data.
    const button = screen.getByTestId("date-range-trigger-release_timestamp");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("June 1, 2024");
    expect(button).toHaveTextContent("June 30, 2024");

    // Click the button and make sure the modal opens.
    await userEvent.click(button);
    const modal = screen.getByTestId("date-range-modal");
    expect(modal).toBeInTheDocument();

    // Click the "Clear" button and make sure the updateQuery function is called with the correct arguments.
    const applyButton = screen.getByText("Clear");
    await userEvent.click(applyButton);
    expect(updateQuery).toHaveBeenCalledWith("type=MeasurementSet");
  });

  it("renders a date-range facet, then brings up a modal that we cancel", async () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/measurement-sets/IGVFDS6222STRR/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          accession: "IGVFDS6222STRR",
          aliases: ["igvf:starr-seq-example"],
          award: {
            component: "networks",
            "@id": "/awards/1U01HG012103-01/",
            title:
              "Deciphering the Genomics of Gene Network Regulation of T Cell and Fibroblast States in Autoimmune Inflammation",
            contact_pi: {
              "@id": "/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/",
              title: "Christina Leslie",
            },
          },
          data_use_limitation_summaries: ["no certificate"],
          file_set_type: "experimental data",
          status: "released",
          summary: "untreated STARR-seq",
          uuid: "f64b07a2-6f85-478a-9b39-1703811e40a1",
        },
      ],
      "@id": "/search/?type=MeasurementSet",
      "@type": ["Search"],
      clear_filters: "/search/?type=MeasurementSet",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
        alternate_accessions: {
          title: "Alternate Accessions",
        },
      },
      facets: [
        {
          field: "release_timestamp",
          title: "Release Date",
          terms: [
            {
              key: 1709728496000,
              key_as_string: "2024-03-06T12:34:56.000Z",
              doc_count: 22,
            },
            {
              key: 1720269355000,
              key_as_string: "2024-07-06T12:35:55.000Z",
              doc_count: 4,
            },
            {
              key: 1728477296000,
              key_as_string: "2024-10-09T12:34:56.000Z",
              doc_count: 4,
            },
            {
              key: 1738845296000,
              key_as_string: "2025-02-06T12:34:56.000Z",
              doc_count: 2,
            },
            {
              key: 1717677355000,
              key_as_string: "2024-06-06T12:35:55.000Z",
              doc_count: 1,
            },
          ],
          total: 33,
          type: "terms",
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
      title: "Search",
      total: 1,
    };

    const facet = searchResults.facets[0];

    const updateQuery = jest.fn();
    render(
      <DateRangeTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    // Check that it rendered a button containing the earliest and latest dates from the facet data.
    const button = screen.getByTestId("date-range-trigger-release_timestamp");
    expect(button).toBeInTheDocument();

    // Click the button and make sure the modal opens.
    await userEvent.click(button);
    const modal = screen.getByTestId("date-range-modal");
    expect(modal).toBeInTheDocument();

    // Click the "Cancel" button and make sure the updateQuery function is not called.
    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);
    expect(modal).not.toBeInTheDocument();
    expect(updateQuery).not.toHaveBeenCalled();
  });

  it("renders a date-range facet with the current date if no dates are available", async () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/measurement-sets/IGVFDS6222STRR/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          accession: "IGVFDS6222STRR",
          aliases: ["igvf:starr-seq-example"],
          award: {
            component: "networks",
            "@id": "/awards/1U01HG012103-01/",
            title:
              "Deciphering the Genomics of Gene Network Regulation of T Cell and Fibroblast States in Autoimmune Inflammation",
            contact_pi: {
              "@id": "/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/",
              title: "Christina Leslie",
            },
          },
          data_use_limitation_summaries: ["no certificate"],
          file_set_type: "experimental data",
          status: "released",
          summary: "untreated STARR-seq",
          uuid: "f64b07a2-6f85-478a-9b39-1703811e40a1",
        },
      ],
      "@id": "/search/?type=MeasurementSet",
      "@type": ["Search"],
      clear_filters: "/search/?type=MeasurementSet",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
        alternate_accessions: {
          title: "Alternate Accessions",
        },
      },
      facets: [
        {
          field: "release_timestamp",
          title: "Release Date",
          terms: [],
          total: 0,
          type: "terms",
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
      title: "Search",
      total: 1,
    };

    const facet = searchResults.facets[0];

    const updateQuery = jest.fn();
    render(
      <DateRangeTerms
        searchResults={searchResults}
        facet={facet}
        updateQuery={updateQuery}
      />
    );

    // Check that it rendered a button containing the earliest and latest dates from the facet data.
    const button = screen.queryByTestId("date-range-trigger-release_timestamp");
    expect(button).not.toBeInTheDocument();
  });
});

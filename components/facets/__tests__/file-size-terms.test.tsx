import { act, fireEvent, render, screen } from "@testing-library/react";
import { jest } from "@jest/globals";
import FileSizeTerms from "../custom-facets/file-size-terms";
import type { SearchResults } from "../../../globals";

type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;

class ResizeObserverMock {
  callback: ResizeObserverCallback;
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  // Custom method you can call in your test
  trigger(entries: ResizeObserverEntry[]) {
    this.callback(entries);
  }
}

// Mock the ResizeObserver class globally
function resizeObserverMock(resizeObserverInstance: ResizeObserverMock) {
  resizeObserverInstance.trigger([
    {
      target: document.createElement("div"),
      contentRect: {
        width: 500,
        height: 300,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      },
    } as unknown as ResizeObserverEntry,
  ]);
}

describe("Test FileSizeTerms component", () => {
  let resizeObserverInstance: ResizeObserverMock;

  beforeAll(() => {
    // Override the global ResizeObserver
    global.ResizeObserver = jest.fn(
      (...args: ConstructorParameters<typeof ResizeObserverMock>) => {
        resizeObserverInstance = new ResizeObserverMock(...args);
        return resizeObserverInstance;
      }
    ) as unknown as typeof ResizeObserver;
  });

  it("renders a file-size terms facet with limits in the query string", () => {
    jest.useFakeTimers();

    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/sequence-files/IGVFFI1165AJSO/",
          "@type": ["SequenceFile", "File", "Item"],
          accession: "IGVFFI1165AJSO",
          content_type: "Nanopore reads",
          file_format: "pod5",
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          status: "released",
          summary: "Nanopore reads from sequencing run 1",
          upload_status: "validated",
          uuid: "fffcd64e-af02-4675-8953-7352459ee06a",
        },
      ],
      "@id": "/search/?type=File&file_size=gte:5000&file_size=lte:10000000",
      "@type": ["Search"],
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facets: [
        {
          field: "file_size",
          title: "File Size",
          terms: {
            count: 69,
            min: 5000,
            max: 10000000,
            avg: 5002500,
            sum: 5272516747,
          },
          total: 1,
          type: "stats",
          appended: false,
        },
      ],
      filters: [
        {
          field: "file_size",
          term: "gte:5000",
          remove: "/search/?type=File&file_size=lte%3A10000000",
        },
        {
          field: "file_size",
          term: "lte:10000000",
          remove: "/search/?type=File&file_size=gte%3A5000",
        },
        {
          field: "type",
          term: "File",
          remove: "/search/?file_size=gte%3A5000&file_size=lte%3A1000000",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    // Mock the updateQuery function so that it receives the URL
    const updateQuery = jest.fn();

    render(
      <FileSizeTerms
        searchResults={searchResults}
        facet={searchResults.facets[0]}
        updateQuery={updateQuery}
      />
    );

    act(resizeObserverMock.bind(null, resizeObserverInstance));

    // Check the basic output of the component.
    const legend = screen.getByTestId("file-size-terms-legend");
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveTextContent("5.0 KB–10 MB");
    const range = screen.getByTestId("file-size-terms-range");
    expect(range).toBeInTheDocument();

    // Check the range input elements comprising the range component.
    const sliders = range.querySelectorAll("input[type='range']");
    expect(sliders[0]).toBeInTheDocument();
    expect(sliders[1]).toBeInTheDocument();

    // Set the minimum and maximum sliders and make sure this applies the new range after a delay.
    // fireEvent.change(sliders[0], { target: { value: "75" } });
    fireEvent.input(sliders[0], { target: { value: "75" } });

    jest.advanceTimersByTime(1000);
    expect((sliders[0] as HTMLInputElement).value).toBe("75");
    expect(updateQuery).toHaveBeenCalledWith("type=File&file_size=gte:5293");
    fireEvent.input(sliders[1], { target: { value: "100" } });
    jest.advanceTimersByTime(1000);
    expect((sliders[1] as HTMLInputElement).value).toBe("5037");
    expect(updateQuery).toHaveBeenCalledWith(
      "type=File&file_size=gte:5293&file_size=lte:229985"
    );

    // Click the reset button and check it calls updateQuery with the correct URL.
    const resetButton = screen.getByTestId("reset-range-file_size");
    expect(resetButton).toBeInTheDocument();
    fireEvent.click(resetButton);
    expect(updateQuery).toHaveBeenCalledWith("type=File");
  });

  it("renders a file-size terms facet with no limits in the query string", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/sequence-files/IGVFFI1165AJSO/",
          "@type": ["SequenceFile", "File", "Item"],
          accession: "IGVFFI1165AJSO",
          content_type: "Nanopore reads",
          file_format: "pod5",
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          status: "released",
          summary: "Nanopore reads from sequencing run 1",
          upload_status: "validated",
          uuid: "fffcd64e-af02-4675-8953-7352459ee06a",
        },
      ],
      "@id": "/search/?type=File",
      "@type": ["Search"],
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facets: [
        {
          field: "file_size",
          title: "File Size",
          terms: {
            count: 69,
            min: 5000,
            max: 10000000,
            avg: 5002500,
            sum: 5272516747,
          },
          total: 1,
          type: "stats",
          appended: false,
        },
      ],
      filters: [
        {
          field: "type",
          term: "File",
          remove: "/search/?file_size=gte%3A5000&file_size=lte%3A1000000",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    // Mock the updateQuery function so that it receives the URL
    const updateQuery = jest.fn();

    render(
      <FileSizeTerms
        searchResults={searchResults}
        facet={searchResults.facets[0]}
        updateQuery={updateQuery}
      />
    );

    act(resizeObserverMock.bind(null, resizeObserverInstance));

    // Check the basic output of the component.
    const legend = screen.getByTestId("file-size-terms-legend");
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveTextContent("5.0 KB–10 MB");
    const range = screen.getByTestId("file-size-terms-range");
    expect(range).toBeInTheDocument();

    // Check the range input elements comprising the range component.
    const sliders = range.querySelectorAll("input[type='range']");
    expect(sliders[0]).toBeInTheDocument();
    expect(sliders[1]).toBeInTheDocument();
  });

  it("renders a file-size terms facet with query-string limits outside the facet range", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/sequence-files/IGVFFI1165AJSO/",
          "@type": ["SequenceFile", "File", "Item"],
          accession: "IGVFFI1165AJSO",
          content_type: "Nanopore reads",
          file_format: "pod5",
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          status: "released",
          summary: "Nanopore reads from sequencing run 1",
          upload_status: "validated",
          uuid: "fffcd64e-af02-4675-8953-7352459ee06a",
        },
      ],
      "@id": "/search/?type=File&file_size=gte:50&file_size=lte:20000000",
      "@type": ["Search"],
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facets: [
        {
          field: "file_size",
          title: "File Size",
          terms: {
            count: 69,
            min: 5000,
            max: 10000000,
            avg: 5002500,
            sum: 5272516747,
          },
          total: 1,
          type: "stats",
          appended: false,
        },
      ],
      filters: [
        {
          field: "type",
          term: "File",
          remove: "/search/",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    // Mock the updateQuery function so that it receives the URL
    const updateQuery = jest.fn();

    render(
      <FileSizeTerms
        searchResults={searchResults}
        facet={searchResults.facets[0]}
        updateQuery={updateQuery}
      />
    );

    act(resizeObserverMock.bind(null, resizeObserverInstance));

    // Check the basic output of the component.
    const legend = screen.getByTestId("file-size-terms-legend");
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveTextContent("5.0 KB–10 MB");
    const range = screen.getByTestId("file-size-terms-range");
    expect(range).toBeInTheDocument();

    // Check the range input elements comprising the range component.
    const sliders = range.querySelectorAll("input[type='range']");
    expect(sliders[0]).toBeInTheDocument();
    expect(sliders[1]).toBeInTheDocument();
  });

  it("renders nothing and displays a message to console.error if the facet type isn't stats", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/sequence-files/IGVFFI1165AJSO/",
          "@type": ["SequenceFile", "File", "Item"],
          accession: "IGVFFI1165AJSO",
          content_type: "Nanopore reads",
          file_format: "pod5",
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          status: "released",
          summary: "Nanopore reads from sequencing run 1",
          upload_status: "validated",
          uuid: "fffcd64e-af02-4675-8953-7352459ee06a",
        },
      ],
      "@id": "/search/?type=File&file_size=gte:5000&file_size=lte:10000000",
      "@type": ["Search"],
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facets: [
        {
          field: "file_format_type",
          title: "File Format Type",
          terms: [
            {
              key: "bed3",
              doc_count: 2,
            },
          ],
          total: 2,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "type",
          term: "File",
          remove: "/search/?file_size=gte%3A5000&file_size=lte%3A1000000",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <FileSizeTerms
        searchResults={searchResults}
        facet={searchResults.facets[0]}
        updateQuery={jest.fn()}
      />
    );

    // Check that the component renders nothing and displays a console error.
    const legend = screen.queryByTestId("file-size-terms-legend");
    expect(legend).not.toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "FileSizeTerms: Expected a stats facet but got a terms facet for file_format_type."
    );
    consoleErrorSpy.mockRestore();
  });

  it("displays a message if the minimum and maximum stats are equal", () => {
    const searchResults: SearchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/sequence-files/IGVFFI1165AJSO/",
          "@type": ["SequenceFile", "File", "Item"],
          accession: "IGVFFI1165AJSO",
          content_type: "Nanopore reads",
          file_format: "pod5",
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          status: "released",
          summary: "Nanopore reads from sequencing run 1",
          upload_status: "validated",
          uuid: "fffcd64e-af02-4675-8953-7352459ee06a",
        },
      ],
      "@id": "/search/?type=File&file_size=gte:5000&file_size=lte:10000000",
      "@type": ["Search"],
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facets: [
        {
          field: "file_size",
          title: "File Size",
          terms: {
            count: 69,
            min: 5000,
            max: 5000,
            avg: 5000,
            sum: 5000,
          },
          total: 1,
          type: "stats",
          appended: false,
        },
      ],
      filters: [
        {
          field: "type",
          term: "File",
          remove: "/search/?file_size=gte%3A5000&file_size=lte%3A1000000",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    render(
      <FileSizeTerms
        searchResults={searchResults}
        facet={searchResults.facets[0]}
        updateQuery={jest.fn()}
      />
    );

    // Check that the component renders nothing and displays a console error.
    const legend = screen.queryByTestId("file-size-terms-legend");
    expect(legend).toHaveTextContent("No selectable range");
  });
});

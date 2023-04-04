import { render, screen, within } from "@testing-library/react";
import FacetTags from "../facet-tags";

describe("Test the <FacetTags> component", () => {
  it("renders the correct number of tags for the given search results", () => {
    const searchResults = {
      "@id":
        "/search?type=Publication&published_by=ENCODE&award.component=data+coordination",
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Publication",
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "published_by",
          title: "Published By",
          terms: [
            {
              key: "ENCODE",
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "lab.title",
          title: "Lab",
          terms: [
            {
              key: "J. Michael Cherry, Stanford",
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "award.component",
          title: "Award",
          terms: [
            {
              key: "data coordination",
              doc_count: 1,
            },
          ],
          total: 1,
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
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "published_by",
          term: "ENCODE",
          remove: "/search?type=Publication&award.component=data+coordination",
        },
        {
          field: "award.component",
          term: "data coordination",
          remove: "/search?type=Publication&published_by=ENCODE",
        },
        {
          field: "type",
          term: "Publication",
          remove:
            "/search?published_by=ENCODE&award.component=data+coordination",
        },
      ],
    };

    render(<FacetTags searchResults={searchResults} />);

    // Make sure the correct number of tags are rendered and they have the correct content.
    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(2);
    expect(tags[0]).toHaveTextContent(/^Published By/);
    expect(tags[0]).toHaveTextContent(/ENCODE$/);
    expect(tags[1]).toHaveTextContent(/^Award/);
    expect(tags[1]).toHaveTextContent(/data coordination$/);
  });

  it("renders no tags if only the 'type' filter exists", () => {
    const searchResults = {
      "@id": "/search?type=Publication",
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Publication",
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "published_by",
          title: "Published By",
          terms: [
            {
              key: "ENCODE",
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "lab.title",
          title: "Lab",
          terms: [
            {
              key: "J. Michael Cherry, Stanford",
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "award.component",
          title: "Award",
          terms: [
            {
              key: "data coordination",
              doc_count: 1,
            },
          ],
          total: 1,
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
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "type",
          term: "Publication",
          remove:
            "/search?published_by=ENCODE&award.component=data+coordination",
        },
      ],
    };

    render(<FacetTags searchResults={searchResults} />);

    // Make sure no tags get rendered.
    const tagSection = screen.queryByTestId("facettags");
    expect(tagSection).toBeNull();
  });

  it("renders the filter field instead of the facet title if that odd case occurs", () => {
    const searchResults = {
      "@id":
        "/search?type=Publication&published_by=ENCODE&award.component=data+coordination",
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Publication",
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "lab.title",
          title: "Lab",
          terms: [
            {
              key: "J. Michael Cherry, Stanford",
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
        {
          field: "award.component",
          title: "Award",
          terms: [
            {
              key: "data coordination",
              doc_count: 1,
            },
          ],
          total: 1,
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
              doc_count: 1,
            },
          ],
          total: 1,
          type: "terms",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "published_by",
          term: "ENCODE",
          remove: "/search?type=Publication&award.component=data+coordination",
        },
        {
          field: "award.component",
          term: "data coordination",
          remove: "/search?type=Publication&published_by=ENCODE",
        },
        {
          field: "type",
          term: "Publication",
          remove:
            "/search?published_by=ENCODE&award.component=data+coordination",
        },
      ],
    };

    render(<FacetTags searchResults={searchResults} />);

    // Make sure the correct number of tags are rendered and they have the correct content.
    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(2);
    expect(tags[0]).toHaveTextContent(/^published_by/);
    expect(tags[0]).toHaveTextContent(/ENCODE$/);
    expect(tags[1]).toHaveTextContent(/^Award/);
    expect(tags[1]).toHaveTextContent(/data coordination$/);
  });
});

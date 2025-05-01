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

  it("renders a positive wildcard tag", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO7811RAHU/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO7811RAHU",
          aliases: ["igvf:alias_human_donor2"],
          award: {
            "@id": "/awards/HG012012/",
            component: "data coordination",
          },
          collections: ["ENCODE"],
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          status: "released",
          uuid: "a1abeff6-8024-41d3-a713-5d22c86ffc57",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor&collections=*",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
        collections: {
          title: "Collections",
        },
      },
      facets: [
        {
          field: "type",
          terms: [
            {
              doc_count: 3,
              key: "Donor",
            },
            {
              doc_count: 3,
              key: "HumanDonor",
            },
            {
              doc_count: 3,
              key: "Item",
            },
          ],
          title: "Object Type",
          total: 3,
          type: "terms",
        },
        {
          field: "collections",
          terms: [
            {
              doc_count: 3,
              key: "ENCODE",
            },
          ],
          title: "Collections",
          total: 4,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "collections",
          remove: "/search/?type=HumanDonor",
          term: "*",
        },
        {
          field: "type",
          remove: "/search/?collections=%2A",
          term: "HumanDonor",
        },
      ],
      title: "Search",
      total: 3,
    };

    render(<FacetTags searchResults={searchResults} />);

    // Make sure the correct number of tags are rendered and they have the correct content.
    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(1);
    expect(tags[0]).toHaveTextContent(/^Collections/);
    expect(tags[0]).toHaveTextContent(/ANY$/);
  });

  it("renders a negative wildcard tag", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO7811RAHU/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO7811RAHU",
          aliases: ["igvf:alias_human_donor2"],
          award: {
            "@id": "/awards/HG012012/",
            component: "data coordination",
          },
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          status: "released",
          uuid: "a1abeff6-8024-41d3-a713-5d22c86ffc57",
          virtual: false,
        },
      ],
      "@id": "/search/?type=HumanDonor&collections!=*",
      "@type": ["Search"],
      clear_filters: "/search/?type=HumanDonor",
      columns: {
        "@id": {
          title: "ID",
        },
        accession: {
          title: "Accession",
        },
        collections: {
          title: "Collections",
        },
      },
      facets: [
        {
          field: "type",
          terms: [
            {
              doc_count: 3,
              key: "Donor",
            },
            {
              doc_count: 3,
              key: "HumanDonor",
            },
            {
              doc_count: 3,
              key: "Item",
            },
          ],
          title: "Object Type",
          total: 3,
          type: "terms",
        },
        {
          field: "collections",
          terms: [
            {
              doc_count: 3,
              key: "ENCODE",
            },
          ],
          title: "Collections",
          total: 4,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "collections!",
          remove: "/search/?type=HumanDonor",
          term: "*",
        },
        {
          field: "type",
          remove: "/search/?collections!=%2A",
          term: "HumanDonor",
        },
      ],
      title: "Search",
      total: 3,
    };

    render(<FacetTags searchResults={searchResults} />);

    // Make sure the correct number of tags are rendered and they have the correct content.
    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(1);
    expect(tags[0]).toHaveTextContent(/^Collections/);
    expect(tags[0]).toHaveTextContent(/NOT$/);
  });

  it("renders the taxa tag", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/genes/ENSG00000205755_PAR_Y/",
          "@type": ["Gene", "Item"],
          dbxrefs: ["HGNC:14281"],
          geneid: "ENSG00000205755_PAR_Y",
          status: "released",
          symbol: "CRLF2",
          title: "CRLF2 (Homo sapiens)",
          uuid: "265a645b-7ed3-496f-85f0-4a524dbe8b2d",
        },
      ],
      "@id": "/search/?type=Gene&taxa=Homo+sapiens",
      "@type": ["Search"],
      clear_filters: "/search/?type=Gene",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          appended: false,
          field: "taxa",
          open_on_load: false,
          terms: [
            {
              doc_count: 6,
              key: "Homo sapiens",
            },
            {
              doc_count: 2,
              key: "Mus musculus",
            },
          ],
          title: "Taxa",
          total: 8,
          type: "terms",
        },
      ],
      filters: [
        {
          field: "taxa",
          remove: "/search/?type=Gene",
          term: "Homo sapiens",
        },
        {
          field: "type",
          remove: "/search/?taxa=Homo+sapiens",
          term: "Gene",
        },
      ],
    };

    render(<FacetTags searchResults={searchResults} />);

    // Make sure the correct number of tags are rendered and they have the correct content.
    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(1);
    expect(tags[0]).toHaveTextContent(/^Taxa/);
    expect(tags[0]).toHaveTextContent(/Homo sapiens$/);
  });
});

describe("Test the file-size facet tags", () => {
  it("renders file-size facet tags for file-size ranges", () => {
    const searchResults = {
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
      "@id": "/search/?type=File&file_size=gte:5&file_size=lte:10",
      "@type": ["Search"],
      all: "/search/?type=File&file_size=gte:5&file_size=lte:10&limit=all",
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          field: "file_size",
          title: "File Size",
          terms: {
            count: 69,
            min: 43,
            max: 1453609183,
            avg: 76413286.1884058,
            sum: 5272516747,
          },
          total: 1,
          type: "stats",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "file_size",
          term: "gte:5000",
          remove: "/search/?type=File&file_size=lte%3A10",
        },
        {
          field: "file_size",
          term: "lte:10000000",
          remove: "/search/?type=File&file_size=gte%3A5",
        },
        {
          field: "type",
          term: "File",
          remove: "/search/?file_size=gte%3A5&file_size=lte%3A10",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    render(<FacetTags searchResults={searchResults} />);
    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(2);
    expect(tags[0]).toHaveTextContent(/^File Size/);
    expect(tags[0]).toHaveTextContent("≥ 5.0 KB");
    expect(tags[1]).toHaveTextContent(/^File Size/);
    expect(tags[1]).toHaveTextContent("≤ 10 MB");
  });

  it("renders file-size facet tags for file-size ranges using ge: and le:", () => {
    const searchResults = {
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
      "@id": "/search/?type=File&file_size=gt:5&file_size=lt:10",
      "@type": ["Search"],
      all: "/search/?type=File&file_size=gt:5&file_size=lt:10&limit=all",
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          field: "file_size",
          title: "File Size",
          terms: {
            count: 69,
            min: 43,
            max: 1453609183,
            avg: 76413286.1884058,
            sum: 5272516747,
          },
          total: 1,
          type: "stats",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "file_size",
          term: "gt:5000",
          remove: "/search/?type=File&file_size=lt%3A10",
        },
        {
          field: "file_size",
          term: "lt:10000000",
          remove: "/search/?type=File&file_size=gt%3A5",
        },
        {
          field: "type",
          term: "File",
          remove: "/search/?file_size=gt%3A5&file_size=lt%3A10",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    render(<FacetTags searchResults={searchResults} />);
    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(2);
    expect(tags[0]).toHaveTextContent(/^File Size/);
    expect(tags[0]).toHaveTextContent("> 5.0 KB");
    expect(tags[1]).toHaveTextContent(/^File Size/);
    expect(tags[1]).toHaveTextContent("< 10 MB");
  });

  it("renders a single number for file-size facet tags", () => {
    const searchResults = {
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
      "@id": "/search/?type=File&file_size=100",
      "@type": ["Search"],
      all: "/search/?type=File&file_size=100&limit=all",
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          field: "file_size",
          title: "File Size",
          terms: {
            count: 69,
            min: 43,
            max: 1453609183,
            avg: 76413286.1884058,
            sum: 5272516747,
          },
          total: 1,
          type: "stats",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "file_size",
          term: "100",
          remove: "/search/?type=File",
        },
        {
          field: "type",
          term: "File",
          remove: "/search/?file_size=100",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    render(<FacetTags searchResults={searchResults} />);

    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(1);
    expect(tags[0]).toHaveTextContent(/^File Size/);
    expect(tags[0]).toHaveTextContent("100");
  });

  it("renders an 'Exists' file-size facet tags", () => {
    const searchResults = {
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
      "@id": "/search/?type=File&file_size=*",
      "@type": ["Search"],
      all: "/search/?type=File&file_size=*&limit=all",
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          field: "file_size",
          title: "File Size",
          terms: {
            count: 69,
            min: 43,
            max: 1453609183,
            avg: 76413286.1884058,
            sum: 5272516747,
          },
          total: 1,
          type: "stats",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "file_size",
          term: "*",
          remove: "/search/?type=File",
        },
        {
          field: "type",
          term: "File",
          remove: "/search/?file_size=*",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    render(<FacetTags searchResults={searchResults} />);

    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(1);
    expect(tags[0]).toHaveTextContent(/^File Size/);
    expect(tags[0]).toHaveTextContent("Exists");
  });

  it("renders an 'None' file-size facet tags", () => {
    const searchResults = {
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
      "@id": "/search/?type=File&file_size!=*",
      "@type": ["Search"],
      all: "/search/?type=File&file_size!=*&limit=all",
      clear_filters: "/search/?type=File",
      columns: {
        "@id": {
          title: "ID",
        },
      },
      facet_groups: [],
      facets: [
        {
          field: "file_size",
          title: "File Size",
          terms: {
            count: 69,
            min: 43,
            max: 1453609183,
            avg: 76413286.1884058,
            sum: 5272516747,
          },
          total: 1,
          type: "stats",
          appended: false,
          open_on_load: false,
        },
      ],
      filters: [
        {
          field: "file_size!",
          term: "*",
          remove: "/search/?type=File",
        },
        {
          field: "type",
          term: "File",
          remove: "/search/?file_size!=*",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    render(<FacetTags searchResults={searchResults} />);

    const tagSection = screen.getByTestId("facettags");
    const tags = within(tagSection).getAllByRole("link");
    expect(tags.length).toBe(1);
    expect(tags[0]).toHaveTextContent(/^File Size/);
    expect(tags[0]).toHaveTextContent("None");
  });
});

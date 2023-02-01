import { render, screen } from "@testing-library/react";
import {
  Fallback,
  generateAccessoryDataPropertyMap,
  getAccessoryDataPaths,
  getItemListsByType,
  getSearchListItemRenderer,
} from "../list-renderer/index";
import Lab from "../list-renderer/lab";

describe("Test getSearchListItemRenderer()", () => {
  test("getItemRendererType returns matching renderer", () => {
    const item = { "@type": ["Lab", "Item"] };
    expect(getSearchListItemRenderer(item)).toBe(Lab);
  });

  test("getItemRendererType returns top available renderer", () => {
    const item = { "@type": ["DummyType", "Lab", "Item"] };
    expect(getSearchListItemRenderer(item)).toBe(Lab);
  });

  test("getItemRendererType returns Fallback renderer if no available specific renderer", () => {
    const item = { "@type": ["DummyType", "Item"] };
    expect(getSearchListItemRenderer(item)).toBe(Fallback);
  });
});

describe("Test accessory data-path functions", () => {
  test("getAccessoryDataPaths gets the correct list of paths to retrieve", () => {
    const searchResults = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/users/860c4750-8d3c-40f5-8f2c-90c5e5d19e88/",
          "@type": ["User", "Item"],
          lab: "/labs/j-michael-cherry/",
          title: "J. Michael Cherry",
          uuid: "860c4750-8d3c-40f5-8f2c-90c5e5d19e88",
        },
        {
          "@id": "/technical-samples/IGVFSM632ETH/",
          "@type": ["TechnicalSample", "Sample", "Item"],
          accession: "IGVFSM632ETH",
          status: "archived",
          technical_sample_term: "/sample-terms/NTR_0000637/",
          uuid: "f12ab44c-bba8-46cc-9f3d-6a192eb09e7e",
        },
        {
          "@id": "/genes/ENSG00000163930/",
          "@type": ["Gene", "Item"],
          dbxrefs: ["UniProtKB:F8W6N3"],
          geneid: "ENSG00000163930",
          status: "released",
          symbol: "BAP1",
          synonyms: ["UCHL2", "HUCEP-13", "KIAA0272", "hucep-6"],
          title: "BAP1 (Homo sapiens)",
          uuid: "fff95719-346c-471f-8b72-8a05c0102b1b",
        },
        {
          "@id": "/somethings/IGVFSM000THG/",
          "@type": ["Something", "Item"],
          accession: "IGVFSM000THG",
        },
        {
          "@id": "/labs/j-michael-cherry/",
          "@type": ["Lab", "Item"],
          title: "J. Michael Cherry Lab",
          uuid: "a79ffa29-4bdf-4283-9494-1017e5d13f8b",
        },
        {
          "@id": "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
          "@type": ["User", "Item"],
          lab: "/labs/j-michael-cherry/",
          title: "Inceptos Nullam",
          uuid: "3787a0ac-f13a-40fc-a524-69628b04cd59",
        },
      ],
    };

    const expectedItemListsByType = {
      User: [
        {
          "@id": "/users/860c4750-8d3c-40f5-8f2c-90c5e5d19e88/",
          "@type": ["User", "Item"],
          lab: "/labs/j-michael-cherry/",
          title: "J. Michael Cherry",
          uuid: "860c4750-8d3c-40f5-8f2c-90c5e5d19e88",
        },
        {
          "@id": "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
          "@type": ["User", "Item"],
          lab: "/labs/j-michael-cherry/",
          title: "Inceptos Nullam",
          uuid: "3787a0ac-f13a-40fc-a524-69628b04cd59",
        },
      ],
      TechnicalSample: [
        {
          "@id": "/technical-samples/IGVFSM632ETH/",
          "@type": ["TechnicalSample", "Sample", "Item"],
          accession: "IGVFSM632ETH",
          status: "archived",
          technical_sample_term: "/sample-terms/NTR_0000637/",
          uuid: "f12ab44c-bba8-46cc-9f3d-6a192eb09e7e",
        },
      ],
      Gene: [
        {
          "@id": "/genes/ENSG00000163930/",
          "@type": ["Gene", "Item"],
          dbxrefs: ["UniProtKB:F8W6N3"],
          geneid: "ENSG00000163930",
          status: "released",
          symbol: "BAP1",
          synonyms: ["UCHL2", "HUCEP-13", "KIAA0272", "hucep-6"],
          title: "BAP1 (Homo sapiens)",
          uuid: "fff95719-346c-471f-8b72-8a05c0102b1b",
        },
      ],
      Lab: [
        {
          "@id": "/labs/j-michael-cherry/",
          "@type": ["Lab", "Item"],
          title: "J. Michael Cherry Lab",
          uuid: "a79ffa29-4bdf-4283-9494-1017e5d13f8b",
        },
      ],
    };

    // Convert the search-result data into groups of search-result items by type. Make sure the
    const itemListsByType = getItemListsByType(searchResults);
    expect(itemListsByType).toEqual(expectedItemListsByType);

    // Test that getAccessoryDataPaths gets all the paths of the objects to retrieve for the search
    // results, and deduplicates them.
    const expectedAccessoryDataPaths = [
      "/labs/j-michael-cherry/",
      "/sample-terms/NTR_0000637/",
    ];
    const accessoryDataPaths = getAccessoryDataPaths(itemListsByType);
    expect(accessoryDataPaths).toEqual(expectedAccessoryDataPaths);
  });
});

describe("Test item-type utility functions", () => {
  const homogeneousSearchResults = {
    "@context": "/terms/",
    "@graph": [
      {
        "@id": "/differentiated-tissues/IGVFSM000BBB/",
        "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
        accession: "IGVFSM000BBB",
        uuid: "a79ffa29-4bdf-4283-9494-1017e5d13f8b",
      },
      {
        "@id": "/differentiated-tissues/IGVFSM002BBB/",
        "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
        accession: "IGVFSM002BBB",
        uuid: "7c058e39-e36b-4afa-bb2a-5e6c4ed07197",
      },
      {
        "@id": "/differentiated-tissues/IGVFSM003BBB/",
        "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
        accession: "IGVFSM003BBB",
        uuid: "4d93cbfc-0300-11ed-b939-0242ac120002",
      },
    ],
    "@id": "/search?type=DifferentiatedTissue",
    "@type": ["Search"],
    notification: "Success",
    title: "Search",
    total: 3,
  };

  const heterogeneousSearchResults = {
    "@context": "/terms/",
    "@graph": [
      {
        "@id": "/differentiated-cells/IGVFSM000CCC/",
        "@type": ["DifferentiatedCell", "Biosample", "Sample", "Item"],
        accession: "IGVFSM000CCC",
        uuid: "f1d10666-ebb2-4152-9d49-f98b6de7c9e5",
      },
      {
        "@id": "/differentiated-tissues/IGVFSM000BBB/",
        "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
        accession: "IGVFSM000BBB",
        uuid: "a79ffa29-4bdf-4283-9494-1017e5d13f8b",
      },
      {
        "@id": "/differentiated-tissues/IGVFSM002BBB/",
        "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
        accession: "IGVFSM002BBB",
        uuid: "7c058e39-e36b-4afa-bb2a-5e6c4ed07197",
      },
      {
        "@id": "/differentiated-cells/IGVFSM003CCC/",
        "@type": ["DifferentiatedCell", "Biosample", "Sample", "Item"],
        accession: "IGVFSM003CCC",
        uuid: "d360c844-02ff-11ed-b939-0242ac120002",
      },
      {
        "@id": "/differentiated-tissues/IGVFSM003BBB/",
        "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
        accession: "IGVFSM003BBB",
        uuid: "4d93cbfc-0300-11ed-b939-0242ac120002",
      },
    ],
    "@id": "/search?type=DifferentiatedCell&type=DifferentiatedTissue",
    "@type": ["Search"],
    notification: "Success",
    title: "Search",
    total: 5,
  };

  it("should return an object with a single key for homogeneous search results", () => {
    const itemListsByType = getItemListsByType(homogeneousSearchResults);

    expect(Object.keys(itemListsByType)).toHaveLength(1);
    expect(itemListsByType).toHaveProperty("DifferentiatedTissue");
    expect(itemListsByType.DifferentiatedTissue).toHaveLength(3);
    expect(itemListsByType.DifferentiatedTissue[0].accession).toBe(
      "IGVFSM000BBB"
    );
    expect(itemListsByType.DifferentiatedTissue[1].accession).toBe(
      "IGVFSM002BBB"
    );
    expect(itemListsByType.DifferentiatedTissue[2].accession).toBe(
      "IGVFSM003BBB"
    );
  });

  it("should return an object with multiple keys for heterogenous search results", () => {
    const itemListsByType = getItemListsByType(heterogeneousSearchResults);

    expect(Object.keys(itemListsByType)).toHaveLength(2);
    expect(itemListsByType).toHaveProperty("DifferentiatedCell");
    expect(itemListsByType.DifferentiatedCell).toHaveLength(2);
    expect(itemListsByType.DifferentiatedCell[0].accession).toBe(
      "IGVFSM000CCC"
    );
    expect(itemListsByType.DifferentiatedCell[1].accession).toBe(
      "IGVFSM003CCC"
    );

    expect(itemListsByType).toHaveProperty("DifferentiatedTissue");
    expect(itemListsByType.DifferentiatedTissue).toHaveLength(3);
    expect(itemListsByType.DifferentiatedTissue[0].accession).toBe(
      "IGVFSM000BBB"
    );
    expect(itemListsByType.DifferentiatedTissue[1].accession).toBe(
      "IGVFSM002BBB"
    );
    expect(itemListsByType.DifferentiatedTissue[2].accession).toBe(
      "IGVFSM003BBB"
    );
  });
});

describe("Test Fallback component", () => {
  it("should render the item's accession", () => {
    const item = {
      "@id": "/differentiated-tissues/IGVFSM000BBB/",
      "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
      accession: "IGVFSM000BBB",
      description: "Differentiated tissue description",
      name: "Differentiated tissue name",
      title: "Differentiated tissue title",
    };
    render(<Fallback item={item} />);
    expect(screen.getByText("IGVFSM000BBB")).toBeInTheDocument();
  });

  it("should render the item's title", () => {
    const item = {
      "@id": "/differentiated-tissues/IGVFSM000BBB/",
      "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
      description: "Differentiated tissue description",
      name: "Differentiated tissue name",
      title: "Differentiated tissue title",
    };
    render(<Fallback item={item} />);
    expect(screen.getByText("Differentiated tissue title")).toBeInTheDocument();
  });

  it("should render the item's name", () => {
    const item = {
      "@id": "/differentiated-tissues/IGVFSM000BBB/",
      "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
      description: "Differentiated tissue description",
      name: "Differentiated tissue name",
    };
    render(<Fallback item={item} />);
    expect(screen.getByText("Differentiated tissue name")).toBeInTheDocument();
  });

  it("should render the item's description", () => {
    const item = {
      "@id": "/differentiated-tissues/IGVFSM000BBB/",
      "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
      description: "Differentiated tissue description",
    };
    render(<Fallback item={item} />);
    expect(
      screen.getByText("Differentiated tissue description")
    ).toBeInTheDocument();
  });

  it("should render the item's path", () => {
    const item = {
      "@id": "/differentiated-tissues/IGVFSM000BBB/",
      "@type": ["DifferentiatedTissue", "Biosample", "Sample", "Item"],
    };
    render(<Fallback item={item} />);

    // Want to check the second one because the first one is the unique identifier.
    const paths = screen.getAllByText("/differentiated-tissues/IGVFSM000BBB/");
    expect(paths[1]).toBeInTheDocument();
  });
});

describe("Test search-result utility functions", () => {
  test("generateAccessoryDataPropertyMap()", () => {
    const propertyObjects = [
      {
        "@id": "/terms/ENCODE:0009897/",
        term_id: "ENCODE:0009897",
      },
      {
        "@id": "/terms/ENCODE:0009898/",
        term_id: "ENCODE:0009898",
      },
    ];

    const expected = {
      "/terms/ENCODE:0009897/": {
        "@id": "/terms/ENCODE:0009897/",
        term_id: "ENCODE:0009897",
      },
      "/terms/ENCODE:0009898/": {
        "@id": "/terms/ENCODE:0009898/",
        term_id: "ENCODE:0009898",
      },
    };

    expect(generateAccessoryDataPropertyMap(propertyObjects)).toEqual(expected);
  });
});

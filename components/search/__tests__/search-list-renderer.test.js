import { render, screen } from "@testing-library/react";
import {
  Fallback,
  generateAccessoryDataPropertyMap,
  getAccessoryData,
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
          "@id": "/analysis-sets/IGVFDS9588HSLV/",
          "@type": ["AnalysisSet", "FileSet", "Item"],
          accession: "IGVFDS9588HSLV",
          input_file_sets: [
            {
              aliases: ["igvf:basic_analysis_set"],
              accession: "IGVFDS9352GHMN",
              "@id": "/analysis-sets/IGVFDS9352GHMN/",
            },
          ],
          status: "released",
          uuid: "dd171b83-cbd9-4d06-4aa1-b77ab49569cd",
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
      AnalysisSet: [
        {
          "@id": "/analysis-sets/IGVFDS9588HSLV/",
          "@type": ["AnalysisSet", "FileSet", "Item"],
          accession: "IGVFDS9588HSLV",
          input_file_sets: [
            {
              aliases: ["igvf:basic_analysis_set"],
              accession: "IGVFDS9352GHMN",
              "@id": "/analysis-sets/IGVFDS9352GHMN/",
            },
          ],
          status: "released",
          uuid: "dd171b83-cbd9-4d06-4aa1-b77ab49569cd",
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
    const expectedAccessoryDataPaths = ["/labs/j-michael-cherry/"];
    const accessoryDataPaths = getAccessoryDataPaths(itemListsByType);
    console.log("ITEM LISTS %o", accessoryDataPaths);
    expect(accessoryDataPaths).toEqual(expectedAccessoryDataPaths);
  });
});

describe("Test item-type utility functions", () => {
  const homogeneousSearchResults = {
    "@context": "/terms/",
    "@graph": [
      {
        "@id": "/primary-cells/IGVFSM0000EEEE/",
        "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0000EEEE",
        uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
      },
      {
        "@id": "/primary-cells/IGVFSM0001EEEE/",
        "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0001EEEE",
        uuid: "5673c93a-c748-11ec-9d64-0242ac120002",
      },
      {
        "@id": "/primary-cells/IGVFSM0002EEEE/",
        "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0002EEEE",
        uuid: "62732db8-11c3-4549-824c-6192f8dbce15",
      },
    ],
    "@id": "/search?type=PrimaryCell",
    "@type": ["Search"],
    notification: "Success",
    title: "Search",
    total: 3,
  };

  const heterogeneousSearchResults = {
    "@context": "/terms/",
    "@graph": [
      {
        "@id": "/primary-cells/IGVFSM0000EEEE/",
        "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0000EEEE",
        uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
      },
      {
        "@id": "/primary-cells/IGVFSM0001EEEE/",
        "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0001EEEE",
        uuid: "5673c93a-c748-11ec-9d64-0242ac120002",
      },
      {
        "@id": "/primary-cells/IGVFSM0002EEEE/",
        "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0002EEEE",
        uuid: "62732db8-11c3-4549-824c-6192f8dbce15",
      },
      {
        "@id": "/tissues/IGVFSM0000DDDD/",
        "@type": ["Tissue", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0000DDDD",
        uuid: "f1e4d059-a970-4250-bc2b-ba4572945e22",
      },
      {
        "@id": "/tissues/IGVFSM0001DDDD/",
        "@type": ["Tissue", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0001DDDD",
        uuid: "984a5f8e-c751-11ec-9d64-0242ac120002",
      },
    ],
    "@id": "/search?type=PrimaryCell&type=Tissue",
    "@type": ["Search"],
    notification: "Success",
    title: "Search",
    total: 5,
  };

  it("should return an object with a single key for homogeneous search results", () => {
    const itemListsByType = getItemListsByType(homogeneousSearchResults);

    expect(Object.keys(itemListsByType)).toHaveLength(1);
    expect(itemListsByType).toHaveProperty("PrimaryCell");
    expect(itemListsByType.PrimaryCell).toHaveLength(3);
    expect(itemListsByType.PrimaryCell[0].accession).toBe("IGVFSM0000EEEE");
    expect(itemListsByType.PrimaryCell[1].accession).toBe("IGVFSM0001EEEE");
    expect(itemListsByType.PrimaryCell[2].accession).toBe("IGVFSM0002EEEE");
  });

  it("should return an object with multiple keys for heterogenous search results", () => {
    const itemListsByType = getItemListsByType(heterogeneousSearchResults);

    expect(Object.keys(itemListsByType)).toHaveLength(2);
    expect(itemListsByType).toHaveProperty("Tissue");
    expect(itemListsByType.Tissue).toHaveLength(2);
    expect(itemListsByType.Tissue[0].accession).toBe("IGVFSM0000DDDD");
    expect(itemListsByType.Tissue[1].accession).toBe("IGVFSM0001DDDD");

    expect(itemListsByType).toHaveProperty("PrimaryCell");
    expect(itemListsByType.PrimaryCell).toHaveLength(3);
    expect(itemListsByType.PrimaryCell[0].accession).toBe("IGVFSM0000EEEE");
    expect(itemListsByType.PrimaryCell[1].accession).toBe("IGVFSM0001EEEE");
    expect(itemListsByType.PrimaryCell[2].accession).toBe("IGVFSM0002EEEE");
  });
});

describe("Test Fallback component", () => {
  it("should render the item's accession", () => {
    const item = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      description: "PrimaryCell description",
      name: "PrimaryCell name",
      title: "PrimaryCell title",
    };
    render(<Fallback item={item} />);
    expect(screen.getByText("IGVFSM0000EEEE")).toBeInTheDocument();
  });

  it("should render the item's title", () => {
    const item = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      description: "PrimaryCell description",
      name: "PrimaryCell name",
      title: "PrimaryCell title",
    };
    render(<Fallback item={item} />);
    expect(screen.getByText("PrimaryCell title")).toBeInTheDocument();
  });

  it("should render the item's name", () => {
    const item = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      description: "PrimaryCell description",
      name: "PrimaryCell name",
    };
    render(<Fallback item={item} />);
    expect(screen.getByText("PrimaryCell name")).toBeInTheDocument();
  });

  it("should render the item's description", () => {
    const item = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      description: "PrimaryCell description",
    };
    render(<Fallback item={item} />);
    expect(screen.getByText("PrimaryCell description")).toBeInTheDocument();
  });

  it("should render the item's path", () => {
    const item = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
    };
    render(<Fallback item={item} />);

    // Want to check the second one because the first one is the unique identifier.
    const paths = screen.getAllByText("/primary-cells/IGVFSM0000EEEE/");
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

  test("getAccessoryData() with accessory data items", async () => {
    const accessoryDataObjects = [
      {
        "@id": "/users/7d37a9ba-4a13-4b7e-a34d-d3ac13f62442/",
        "@type": ["User", "Item"],
      },
      {
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
      },
    ];

    window.fetch = jest.fn().mockImplementation((id) => {
      const accessoryDataObject = accessoryDataObjects.find(
        (object) => object["@id"] === id
      );
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(accessoryDataObject),
      });
    });

    const expectedAccessoryData = {
      "/users/7d37a9ba-4a13-4b7e-a34d-d3ac13f62442/": {
        "@id": "/users/7d37a9ba-4a13-4b7e-a34d-d3ac13f62442/",
        "@type": ["User", "Item"],
      },
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
      },
    };

    const itemListsByType = {
      Award: [
        {
          "@id": "/awards/HG012009/",
          "@type": ["Award", "Item"],
        },
        {
          "@id": "/awards/HG012059/",
          "@type": ["Award", "Item"],
          contact_pi: "/users/7d37a9ba-4a13-4b7e-a34d-d3ac13f62442/",
        },
      ],
      User: [
        {
          "@id": "/users/860c4750-8d3c-40f5-8f2c-90c5e5d19e88/",
          "@type": ["User", "Item"],
          lab: "/labs/j-michael-cherry/",
          title: "J. Michael Cherry",
        },
      ],
    };

    const accessoryData = await getAccessoryData(itemListsByType);
    expect(accessoryData).toEqual(expectedAccessoryData);
  });

  test("getAccessoryData() with no accessory data items", async () => {
    const accessoryData = await getAccessoryData({});
    expect(accessoryData).toEqual(null);
  });
});

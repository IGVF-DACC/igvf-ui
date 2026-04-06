import {
  standardGroupingStage,
  buildStandardAdjacency,
} from "../standard-grouping";

describe("standardGroupingStage", () => {
  it("groups together file-set nodes that are connected by relationships defined by a property on the file-set objects", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      auxiliary_sets: [
        { "@id": "/file-set-2", "@type": ["AuxiliarySet", "FileSet", "Item"] },
        { "@id": "/file-set-3", "@type": ["AuxiliarySet", "FileSet", "Item"] },
      ],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
    };
    const fileSet3 = {
      "@id": "/file-set-3",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
    };
    const fileSet4 = {
      "@id": "/file-set-4",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
    };

    const targetFileSetNodes = [
      {
        id: "file-set-1",
        metadata: {
          fileSet: fileSet1,
        },
      },
      {
        id: "file-set-2",
        metadata: {
          fileSet: fileSet2,
        },
      },
      {
        id: "file-set-3",
        metadata: {
          fileSet: fileSet3,
        },
      },
    ];

    const node4 = {
      id: "file-set-4",
      metadata: {
        fileSet: fileSet4,
      },
    };

    const allFileSetNodes = [...targetFileSetNodes, node4];

    const nodesByFileSetPath = new Map([
      ["/file-set-1", [targetFileSetNodes[0]]],
      ["/file-set-2", [targetFileSetNodes[1]]],
      ["/file-set-3", [targetFileSetNodes[2]]],
      ["/file-set-4", [node4]],
    ]);

    const adjacency = buildStandardAdjacency(
      targetFileSetNodes as any,
      allFileSetNodes as any,
      nodesByFileSetPath as any,
      "auxiliary_sets"
    );

    const result = standardGroupingStage(
      allFileSetNodes as any,
      new Map(allFileSetNodes.map((node) => [node.id, node as any])),
      adjacency
    );

    expect(result.groups.size).toBe(1);
    const group = Array.from(result.groups.values())[0];
    expect(group).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "file-set-1" }),
        expect.objectContaining({ id: "file-set-2" }),
        expect.objectContaining({ id: "file-set-3" }),
      ])
    );
    expect(result.remainingNodes).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "file-set-4" })])
    );
  });
});

describe("buildStandardAdjacency", () => {
  it("builds the correct adjacency mapping for a simple graph of file sets with relationships defined by a property on the file-set objects", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      auxiliary_sets: [
        { "@id": "/file-set-2", "@type": ["AuxiliarySet", "FileSet", "Item"] },
        { "@id": "/file-set-3", "@type": ["AuxiliarySet", "FileSet", "Item"] },
      ],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
    };
    const fileSet3 = {
      "@id": "/file-set-3",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
    };
    const fileSet4 = {
      "@id": "/file-set-4",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
    };

    const targetFileSetNodes = [
      {
        id: "file-set-1",
        metadata: {
          fileSet: fileSet1,
        },
      },
      {
        id: "file-set-2",
        metadata: {
          fileSet: fileSet2,
        },
      },
      {
        id: "file-set-3",
        metadata: {
          fileSet: fileSet3,
        },
      },
    ];

    const node4 = {
      id: "file-set-4",
      metadata: {
        fileSet: fileSet4,
      },
    };

    const allFileSetNodes = [...targetFileSetNodes, node4];

    const nodesByFileSetPath = new Map([
      ["/file-set-1", [targetFileSetNodes[0]]],
      ["/file-set-2", [targetFileSetNodes[1]]],
      ["/file-set-3", [targetFileSetNodes[2]]],
      ["/file-set-4", [node4]],
    ]);

    const adjacency = buildStandardAdjacency(
      targetFileSetNodes as any,
      allFileSetNodes as any,
      nodesByFileSetPath as any,
      "auxiliary_sets"
    );

    expect(adjacency.get("file-set-1")).toEqual(
      new Set(["file-set-2", "file-set-3"])
    );
    expect(adjacency.get("file-set-2")).toEqual(new Set(["file-set-1"]));
    expect(adjacency.get("file-set-3")).toEqual(new Set(["file-set-1"]));
    expect(adjacency.get("file-set-4")).toEqual(new Set());
  });

  it("ignores related file sets that are not present in the graph map", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      auxiliary_sets: [{ "@id": "/file-set-missing", "@type": ["AuxiliarySet", "FileSet", "Item"] }],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
    };

    const targetFileSetNodes = [
      {
        id: "file-set-1",
        metadata: {
          fileSet: fileSet1,
        },
      },
    ];

    const allFileSetNodes = [
      ...targetFileSetNodes,
      {
        id: "file-set-2",
        metadata: {
          fileSet: fileSet2,
        },
      },
    ];

    const nodesByFileSetPath = new Map([["/file-set-1", [targetFileSetNodes[0]]], ["/file-set-2", [allFileSetNodes[1]]]]);

    expect(() =>
      buildStandardAdjacency(
        targetFileSetNodes as any,
        allFileSetNodes as any,
        nodesByFileSetPath as any,
        "auxiliary_sets"
      )
    ).not.toThrow();

    const adjacency = buildStandardAdjacency(
      targetFileSetNodes as any,
      allFileSetNodes as any,
      nodesByFileSetPath as any,
      "auxiliary_sets"
    );
    expect(adjacency.get("file-set-1")).toEqual(new Set());
    expect(adjacency.get("file-set-2")).toEqual(new Set());
  });
});

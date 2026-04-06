import { constructLibrarySetStage } from "../construct-library-set-grouping";

describe("constructLibrarySetGrouping", () => {
  it("groups together file-set nodes that are connected by construct library set relationships", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      construct_library_sets: [
        {
          "@id": "/file-set-2",
          "@type": ["ConstructLibrarySet", "FileSet", "Item"],
        },
        {
          "@id": "/file-set-3",
          "@type": ["ConstructLibrarySet", "FileSet", "Item"],
        },
      ],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
    };
    const fileSet3 = {
      "@id": "/file-set-3",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
    };
    const fileSet4 = {
      "@id": "/file-set-4",
      "@type": ["MeasurementSet", "FileSet", "Item"],
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

    const result = constructLibrarySetStage(
      allFileSetNodes as any,
      new Map(allFileSetNodes.map((node) => [node.id, node as any])),
      nodesByFileSetPath as any
    );

    expect(result.groups.size).toBe(1);
    const group = Array.from(result.groups.values())[0];
    expect(group).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "file-set-1",
        }),
        expect.objectContaining({
          id: "file-set-2",
        }),
        expect.objectContaining({
          id: "file-set-3",
        }),
      ])
    );
    expect(result.remainingNodes).toHaveLength(1);
    expect(result.remainingNodes[0]).toEqual(
      expect.objectContaining({
        id: "file-set-4",
      })
    );
  });

  it("returns all nodes as remaining if there are no construct library set relationships", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
    };
    const fileSet3 = {
      "@id": "/file-set-3",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
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

    const nodesByFileSetPath = new Map([
      ["/file-set-1", [targetFileSetNodes[0]]],
      ["/file-set-2", [targetFileSetNodes[1]]],
      ["/file-set-3", [targetFileSetNodes[2]]],
    ]);

    const result = constructLibrarySetStage(
      targetFileSetNodes as any,
      new Map(targetFileSetNodes.map((node) => [node.id, node as any])),
      nodesByFileSetPath as any
    );

    expect(result.groups.size).toBe(0);
    expect(result.remainingNodes).toHaveLength(3);
    expect(result.remainingNodes[0]).toEqual(
      expect.objectContaining({
        id: "file-set-1",
      })
    );
    expect(result.remainingNodes[1]).toEqual(
      expect.objectContaining({
        id: "file-set-2",
      })
    );
    expect(result.remainingNodes[2]).toEqual(
      expect.objectContaining({
        id: "file-set-3",
      })
    );
  });
});

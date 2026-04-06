import { auxiliarySetStage } from "../auxiliary-set-grouping";

describe("auxiliarySetStage", () => {
  it("groups together measurement sets with their auxiliary sets based on auxiliary set relationships", () => {
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

    const result = auxiliarySetStage(
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
      expect.objectContaining({ id: "file-set-4" })
    );
  });

  it("returns all nodes as remaining if there are no eligible nodes to group", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["FileSet", "Item"],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
      "@type": ["FileSet", "Item"],
    };
    const fileSet3 = {
      "@id": "/file-set-3",
      "@type": ["FileSet", "Item"],
    };
    const fileSet4 = {
      "@id": "/file-set-4",
      "@type": ["FileSet", "Item"],
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
      {
        id: "file-set-4",
        metadata: {
          fileSet: fileSet4,
        },
      },
    ];

    const result = auxiliarySetStage(
      targetFileSetNodes as any,
      new Map(targetFileSetNodes.map((node) => [node.id, node as any])),
      new Map(
        targetFileSetNodes.map((node) => [
          node.metadata.fileSet["@id"],
          [node] as any,
        ])
      )
    );

    expect(result.groups.size).toBe(0);
    expect(result.remainingNodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "file-set-1" }),
        expect.objectContaining({ id: "file-set-2" }),
        expect.objectContaining({ id: "file-set-3" }),
        expect.objectContaining({ id: "file-set-4" }),
      ])
    );
  });
});

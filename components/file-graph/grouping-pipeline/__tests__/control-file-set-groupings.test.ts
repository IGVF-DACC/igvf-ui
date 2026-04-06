import { controlFileSetStage } from "../control-file-set-groupings";

describe("controlFileSetStage", () => {
  it("groups together measurement set and construct library set file-set nodes that are connected by control file set relationships", () => {
    const measurementSet1 = {
      "@id": "/measurement-set-1",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      control_file_sets: [
        {
          "@id": "/construct-library-set-1",
          "@type": ["ConstructLibrarySet", "FileSet", "Item"],
        },
      ],
    };
    const constructLibrarySet1 = {
      "@id": "/construct-library-set-1",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
    };
    const measurementSet2 = {
      "@id": "/measurement-set-2",
      "@type": ["MeasurementSet", "FileSet", "Item"],
    };

    const targetFileSetNodes = [
      {
        id: "measurement-set-1",
        metadata: {
          fileSet: measurementSet1,
        },
      },
      {
        id: "construct-library-set-1",
        metadata: {
          fileSet: constructLibrarySet1,
        },
      },
      {
        id: "measurement-set-2",
        metadata: {
          fileSet: measurementSet2,
        },
      },
    ];

    const node4 = {
      id: "file-set-4",
      metadata: {
        fileSet: {
          "@id": "/file-set-4",
          "@type": ["AuxiliarySet", "FileSet", "Item"],
        },
      },
    };

    const allFileSetNodes = [...targetFileSetNodes, node4];

    const nodesByFileSetPath = new Map([
      ["/measurement-set-1", [targetFileSetNodes[0]]],
      ["/construct-library-set-1", [targetFileSetNodes[1]]],
      ["/measurement-set-2", [targetFileSetNodes[2]]],
      ["/file-set-4", [node4]],
    ]);

    const result = controlFileSetStage(
      allFileSetNodes as any,
      new Map(allFileSetNodes.map((node) => [node.id, node as any])),
      nodesByFileSetPath as any
    );

    expect(result.groups.size).toBe(1);
    const group = Array.from(result.groups.values())[0];
    expect(group).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "measurement-set-1",
        }),
        expect.objectContaining({
          id: "construct-library-set-1",
        }),
      ])
    );
    expect(result.remainingNodes).toHaveLength(2);
    expect(result.remainingNodes[0]).toEqual(
      expect.objectContaining({
        id: "measurement-set-2",
      })
    );
    expect(result.remainingNodes[1]).toEqual(
      expect.objectContaining({
        id: "file-set-4",
      })
    );
  });

  it("returns all nodes as remaining nodes if there are no eligible nodes to group", () => {
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
        fileSet: {
          "@id": "/file-set-4",
          "@type": ["AuxiliarySet", "FileSet", "Item"],
        },
      },
    };

    const allFileSetNodes = [...targetFileSetNodes, node4];

    const nodesByFileSetPath = new Map([
      ["/file-set-1", [targetFileSetNodes[0]]],
      ["/file-set-2", [targetFileSetNodes[1]]],
      ["/file-set-3", [targetFileSetNodes[2]]],
      ["/file-set-4", [node4]],
    ]);

    const result = controlFileSetStage(
      allFileSetNodes as any,
      new Map(allFileSetNodes.map((node) => [node.id, node as any])),
      nodesByFileSetPath as any
    );

    expect(result.groups.size).toBe(0);
    expect(result.remainingNodes).toEqual(
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
        expect.objectContaining({
          id: "file-set-4",
        }),
      ])
    );
  });
});

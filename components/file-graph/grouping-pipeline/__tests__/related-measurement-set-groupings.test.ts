import { relatedMeasurementSetStage } from "../related-measurement-set-grouping";

describe("relatedMeasurementSetStage", () => {
  it("groups together file-set nodes that are connected by related measurement set relationships", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      related_measurement_sets: [
        {
          measurement_sets: [
            {
              "@id": "/file-set-2",
              "@type": ["MeasurementSet", "FileSet", "Item"],
            },
            {
              "@id": "/file-set-3",
              "@type": ["MeasurementSet", "FileSet", "Item"],
            },
          ],
          series_type: "multiome",
        },
      ],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
      "@type": ["MeasurementSet", "FileSet", "Item"],
    };
    const fileSet3 = {
      "@id": "/file-set-3",
      "@type": ["MeasurementSet", "FileSet", "Item"],
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

    const result = relatedMeasurementSetStage(
      allFileSetNodes as any,
      new Map(allFileSetNodes.map((node) => [node.id, node as any])),
      nodesByFileSetPath as any
    );

    expect(result.groups.size).toBe(1);
    const group = Array.from(result.groups.values())[0];
    expect(group.map((node) => node.id).sort()).toEqual([
      "file-set-1",
      "file-set-2",
      "file-set-3",
    ]);
    expect(result.remainingNodes).toEqual([node4]);
  });

  it("does not group together file-set nodes that are not connected by related measurement set relationships", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["MeasurementSet", "FileSet", "Item"],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
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
    ];

    const allFileSetNodes = [...targetFileSetNodes];

    const nodesByFileSetPath = new Map([
      ["/file-set-1", [targetFileSetNodes[0]]],
      ["/file-set-2", [targetFileSetNodes[1]]],
    ]);

    const result = relatedMeasurementSetStage(
      allFileSetNodes as any,
      new Map(allFileSetNodes.map((node) => [node.id, node as any])),
      nodesByFileSetPath as any
    );

    expect(result.groups.size).toBe(0);
    expect(result.remainingNodes).toEqual(targetFileSetNodes);
  });

  it("handles the case where there are no measurement-set nodes", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["FileSet", "Item"],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
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
    ];

    const allFileSetNodes = [...targetFileSetNodes];

    const nodesByFileSetPath = new Map([
      ["/file-set-1", [targetFileSetNodes[0]]],
      ["/file-set-2", [targetFileSetNodes[1]]],
    ]);

    const result = relatedMeasurementSetStage(
      allFileSetNodes as any,
      new Map(allFileSetNodes.map((node) => [node.id, node as any])),
      nodesByFileSetPath as any
    );

    expect(result.groups.size).toBe(0);
    expect(result.remainingNodes).toEqual(targetFileSetNodes);
  });

  it("ignores related measurement sets not present in nodesByFileSetPath", () => {
    const fileSet1 = {
      "@id": "/file-set-1",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      related_measurement_sets: [
        {
          measurement_sets: [
            {
              "@id": "/file-set-missing",
              "@type": ["MeasurementSet", "FileSet", "Item"],
            },
          ],
          series_type: "multiome",
        },
      ],
    };
    const fileSet2 = {
      "@id": "/file-set-2",
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
    ];

    const nodesByFileSetPath = new Map([
      ["/file-set-1", [targetFileSetNodes[0]]],
      ["/file-set-2", [targetFileSetNodes[1]]],
    ]);

    expect(() =>
      relatedMeasurementSetStage(
        targetFileSetNodes as any,
        new Map(targetFileSetNodes.map((node) => [node.id, node as any])),
        nodesByFileSetPath as any
      )
    ).not.toThrow();

    const result = relatedMeasurementSetStage(
      targetFileSetNodes as any,
      new Map(targetFileSetNodes.map((node) => [node.id, node as any])),
      nodesByFileSetPath as any
    );

    expect(result.groups.size).toBe(0);
    expect(result.remainingNodes).toEqual(targetFileSetNodes);
  });
});

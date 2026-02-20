import { detectCycles } from "../detect-cycles";
import type { FileObject } from "../../../globals";

describe("Test the detectCycles function", () => {
  it("should detect a simple 3-node cycle", () => {
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["C"],
      },
      {
        "@id": "C",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["A", "B", "C", "A"]);
  });

  it("should detect a self-loop", () => {
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["A", "A"]);
  });

  it("should detect a 2-node cycle", () => {
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["A", "B", "A"]);
  });

  it("should return empty array when no cycles exist", () => {
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["C"],
      },
      {
        "@id": "C",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toEqual([]);
  });

  it("should return empty array for empty input", () => {
    const cycles = detectCycles([]);
    expect(cycles).toEqual([]);
  });

  it("should return empty array for single node with no derived_from", () => {
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toEqual([]);
  });

  it("should detect multiple separate cycles", () => {
    const fileObjects: FileObject[] = [
      // First cycle: A -> B -> A
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
      // Second cycle: C -> D -> E -> C
      {
        "@id": "C",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["D"],
      },
      {
        "@id": "D",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["E"],
      },
      {
        "@id": "E",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["C"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(2);

    // Sort cycles by first element for consistent testing
    cycles.sort((a, b) => a[0].localeCompare(b[0]));
    expect(cycles[0]).toEqual(["A", "B", "A"]);
    expect(cycles[1]).toEqual(["C", "D", "E", "C"]);
  });

  it("should deduplicate equivalent cycles (different rotations)", () => {
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["C"],
      },
      {
        "@id": "C",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    // Should only return one cycle, canonicalized
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["A", "B", "C", "A"]);
  });

  it("should handle complex graph with cycles and acyclic parts", () => {
    const fileObjects: FileObject[] = [
      // Acyclic part
      {
        "@id": "X",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["Y"],
      },
      {
        "@id": "Y",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
      },
      // Cyclic part
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B", "X"], // Connected to acyclic part
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["A", "B", "A"]);
  });

  it("should handle nodes with undefined derived_from", () => {
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        // derived_from is undefined
      },
    ] as FileObject[];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toEqual([]);
  });

  it("should detect longer cycles (5+ nodes)", () => {
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["C"],
      },
      {
        "@id": "C",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["D"],
      },
      {
        "@id": "D",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["E"],
      },
      {
        "@id": "E",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["A", "B", "C", "D", "E", "A"]);
  });

  it("should deduplicate reverse cycles", () => {
    // This creates a scenario where we might find the same cycle in different directions.
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    // Should be canonicalized to start with lexicographically smallest
    expect(cycles[0]).toEqual(["A", "B", "A"]);
  });

  it("should handle cycles with multiple derived_from references", () => {
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B", "C"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
      {
        "@id": "C",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: [],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["A", "B", "A"]);
  });

  it("should handle disconnected components", () => {
    const fileObjects: FileObject[] = [
      // Component 1: A -> B (no cycle)
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
      },
      // Component 2: C -> C (self-cycle)
      {
        "@id": "C",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["C"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["C", "C"]);
  });

  it("should handle cycles that share nodes", () => {
    // This tests a more complex graph where cycles intersect
    const fileObjects: FileObject[] = [
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["C"],
      },
      {
        "@id": "C",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A", "D"],
      },
      {
        "@id": "D",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["C"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(2);

    // Sort to ensure consistent ordering for the equivalency test.
    cycles.sort((a, b) => a.length - b.length || a[0].localeCompare(b[0]));
    expect(cycles[0]).toEqual(["C", "D", "C"]); // 2-node cycle
    expect(cycles[1]).toEqual(["A", "B", "C", "A"]); // 3-node cycle
  });

  it("should handle cycles with lexicographically later starting nodes", () => {
    // Test to ensure indexOfLexicographicallySmallest covers the branch where a smaller value is found
    const fileObjects: FileObject[] = [
      {
        "@id": "Z",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["Y"],
      },
      {
        "@id": "Y",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["Z"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    // Should be canonicalized to start with "A" (lexicographically smallest)
    expect(cycles[0]).toEqual(["A", "Z", "Y", "A"]);
  });

  it("should handle cycle canonicalization edge cases", () => {
    // Create a scenario that forces different signature comparisons in deduplicateCycles
    const fileObjects: FileObject[] = [
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    // Should canonicalize properly regardless of discovery order
    expect(cycles[0]).toEqual(["A", "B", "A"]);
  });

  it("should choose reverse signature when it's lexicographically smaller", () => {
    // Create a cycle where the reverse signature is lexicographically smaller
    // Forward: A->B->C, Reverse: C->B->A. Since C->B->A < A->B->C, reverse should be chosen
    const fileObjects: FileObject[] = [
      {
        "@id": "C",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["B"],
      },
      {
        "@id": "B",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["A"],
      },
      {
        "@id": "A",
        "@type": ["File", "Item"],
        content_type: "reads",
        file_format: "fastq",
        file_set: "/file-sets/test",
        derived_from: ["C"],
      },
    ];

    const cycles = detectCycles(fileObjects);
    expect(cycles).toHaveLength(1);
    // Should canonicalize to start with A but test both signature branches
    expect(cycles[0]).toEqual(["A", "C", "B", "A"]);
  });
});

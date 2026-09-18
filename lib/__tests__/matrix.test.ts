import {
  generateEmptyRowCells,
  generateMatrixColumnMap,
  getMatrixAxisGroups,
  getMatrixBuckets,
  isMatrixBucketWrapper,
  isMatrixResultsObject,
  type MatrixAxis,
  type MatrixBucket,
} from "../matrix";

describe("generateMatrixColumnMap()", () => {
  const buckets: MatrixBucket[] = [
    { key: "Zulu", doc_count: 1 },
    { key: "alpha", doc_count: 2 },
    { key: "Bravo", doc_count: 3 },
  ];

  it("sorts column labels case-insensitively and maps them to indexes", () => {
    expect(generateMatrixColumnMap(buckets)).toEqual({
      alpha: 0,
      Bravo: 1,
      Zulu: 2,
    });
  });

  it("excludes specified columns", () => {
    expect(generateMatrixColumnMap(buckets, ["Bravo"])).toEqual({
      alpha: 0,
      Zulu: 1,
    });
  });
});

describe("isMatrixBucketWrapper()", () => {
  it("returns true for an object containing a buckets array", () => {
    expect(isMatrixBucketWrapper({ buckets: [] })).toBe(true);
  });

  it.each([null, "invalid", {}, { buckets: null }])(
    "returns false for %p",
    (value) => {
      expect(isMatrixBucketWrapper(value)).toBe(false);
    }
  );
});

describe("isMatrixResultsObject()", () => {
  const axis = { doc_count: 1, group_by: "group_name" };

  it.each(["Omnimatrix", ["Matrix"]])(
    "accepts the supported @type form %p",
    (type) => {
      expect(
        isMatrixResultsObject({
          "@type": type,
          matrix: { x: axis, y: axis },
        })
      ).toBe(true);
    }
  );

  it.each([
    null,
    "invalid",
    {},
    { "@type": "Other" },
    { "@type": ["Other"] },
    { "@type": ["Matrix"] },
    { "@type": ["Matrix"], matrix: null },
    { "@type": ["Matrix"], matrix: "invalid" },
    { "@type": ["Matrix"], matrix: {} },
    { "@type": ["Matrix"], matrix: { x: axis } },
    { "@type": ["Matrix"], matrix: { x: null, y: axis } },
    { "@type": ["Matrix"], matrix: { x: axis, y: null } },
  ])("rejects an invalid matrix response %#", (value) => {
    expect(isMatrixResultsObject(value)).toBe(false);
  });

  it.each([
    null,
    "invalid",
    {},
    { group_by: "group_name" },
    { group_by: 1, doc_count: 1 },
    { group_by: "group_name", doc_count: "1" },
  ])("rejects an invalid matrix axis %#", (invalidAxis) => {
    expect(
      isMatrixResultsObject({
        "@type": ["Matrix"],
        matrix: { x: invalidAxis, y: axis },
      })
    ).toBe(false);
  });

  it("accepts an array group_by value", () => {
    expect(
      isMatrixResultsObject({
        "@type": ["Matrix"],
        matrix: {
          x: { doc_count: 1, group_by: ["group_name"] },
          y: axis,
        },
      })
    ).toBe(true);
  });
});

describe("getMatrixAxisGroups()", () => {
  it("returns a string group as an array", () => {
    expect(getMatrixAxisGroups({ group_by: "gene", doc_count: 1 })).toEqual([
      "gene",
    ]);
  });

  it("extracts strings and the first string from tuples", () => {
    expect(
      getMatrixAxisGroups({
        group_by: ["gene", ["assay", "no_assay"]],
        doc_count: 1,
      })
    ).toEqual(["gene", "assay"]);
  });

  it("filters malformed array entries and handles an invalid value", () => {
    expect(
      getMatrixAxisGroups({
        group_by: [[1], 2] as unknown as string[],
        doc_count: 1,
      })
    ).toEqual([]);
    expect(
      getMatrixAxisGroups({
        group_by: null,
        doc_count: 1,
      } as unknown as MatrixAxis)
    ).toEqual([]);
  });
});

describe("getMatrixBuckets()", () => {
  const buckets = [{ key: "gene", doc_count: 1 }];

  it("returns buckets from a valid wrapper", () => {
    expect(
      getMatrixBuckets(
        {
          group_by: "gene",
          doc_count: 1,
          gene: { buckets },
        },
        "gene"
      )
    ).toEqual(buckets);
  });

  it("returns an empty array for a missing wrapper or data", () => {
    expect(
      getMatrixBuckets({ group_by: "gene", doc_count: 1 }, "gene")
    ).toEqual([]);
    expect(
      getMatrixBuckets(null as unknown as MatrixAxis, "gene")
    ).toEqual([]);
  });
});

describe("generateEmptyRowCells()", () => {
  it("generates the requested number of empty cells", () => {
    expect(generateEmptyRowCells(2)).toEqual([
      { id: "empty-0", content: "" },
      { id: "empty-1", content: "" },
    ]);
  });

  it("returns an empty array for a zero length", () => {
    expect(generateEmptyRowCells(0)).toEqual([]);
  });
});

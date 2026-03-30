import {
  generateChromosomeSortRank,
  sortGeneLocations,
  type GeneLocation,
} from "../genes";

describe("sortGeneLocations", () => {
  it("should sort gene locations correctly", () => {
    const geneLocations: GeneLocation[] = [
      { assembly: "GRCh38", chromosome: "chr10", start: 300, end: 400 },
      { assembly: "GRCm39", chromosome: "chr14", start: 100, end: 200 },
      {
        assembly: "GRCh38",
        chromosome: "chr9_KI270718v1_random",
        start: 200,
        end: 300,
      },
      { assembly: "GRCh38", chromosome: "chrY", start: 60, end: 160 },
      { assembly: "GRCh38", chromosome: "chr10", start: 100, end: 200 },
      {
        assembly: "GRCm39",
        chromosome: "chrUn_KI270438v1",
        start: 200,
        end: 300,
      },
      { assembly: "GRCh38", chromosome: "chr10", start: 200, end: 300 },
      { assembly: "GRCh38", chromosome: "chrM", start: 70, end: 170 },
      { assembly: "GRCh38", chromosome: "chrX", start: 50, end: 150 },
    ];

    const sorted = sortGeneLocations(geneLocations);
    expect(sorted).toEqual([
      { assembly: "GRCh38", chromosome: "chr10", start: 100, end: 200 },
      { assembly: "GRCh38", chromosome: "chr10", start: 200, end: 300 },
      { assembly: "GRCh38", chromosome: "chr10", start: 300, end: 400 },
      { assembly: "GRCh38", chromosome: "chrX", start: 50, end: 150 },
      { assembly: "GRCh38", chromosome: "chrY", start: 60, end: 160 },
      { assembly: "GRCh38", chromosome: "chrM", start: 70, end: 170 },
      {
        assembly: "GRCh38",
        chromosome: "chr9_KI270718v1_random",
        start: 200,
        end: 300,
      },
      { assembly: "GRCm39", chromosome: "chr14", start: 100, end: 200 },
      {
        assembly: "GRCm39",
        chromosome: "chrUn_KI270438v1",
        start: 200,
        end: 300,
      },
    ]);
  });
});

describe("generateChromosomeSortRank", () => {
  it("should generate correct sort rank for numbered chromosomes", () => {
    expect(generateChromosomeSortRank("chr1")).toBe("A|0001|");
    expect(generateChromosomeSortRank("chr2")).toBe("A|0002|");
    expect(generateChromosomeSortRank("chr10")).toBe("A|0010|");
  });

  it("should generate correct sort rank for sex chromosomes", () => {
    expect(generateChromosomeSortRank("chrX")).toBe("B|1000|");
    expect(generateChromosomeSortRank("chrY")).toBe("B|1001|");
    expect(generateChromosomeSortRank("chrM")).toBe("B|1002|");
  });

  it("should generate correct sort rank for unlocalized contigs", () => {
    expect(generateChromosomeSortRank("chr1_KI270706v1_random")).toBe(
      "C|0001|KI270706v1"
    );
    expect(generateChromosomeSortRank("chr4_GL000008v2_random")).toBe(
      "C|0004|GL000008v2"
    );
  });

  it("should generate correct sort rank for unlocalized Y contigs", () => {
    expect(generateChromosomeSortRank("chrY_KI270706v1")).toBe(
      "D|0000|KI270706v1"
    );
  });

  it("should generate correct sort rank for unplaced contigs", () => {
    expect(generateChromosomeSortRank("chrUn_KI270302v1")).toBe(
      "E|0000|KI270302v1"
    );
  });

  it("should generate correct sort rank for other / unknown contigs", () => {
    expect(generateChromosomeSortRank("chrUnknown")).toBe("F|0000|chrUnknown");
  });
});

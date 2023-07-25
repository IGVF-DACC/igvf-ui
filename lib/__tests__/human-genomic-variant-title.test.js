import humanGenomicVariantTitle from "../human-genomic-variant-title";

describe("test the humanGenomicVariableTitle function", () => {
  it("Human Genomic Variant title is correct", () => {
    const itemWithRefSeqId = {
      "@id": "/human-genomic-variants/8138364d-f96b-42b9-a719-42199818c6fc/",
      "@type": ["HumanGenomicVariant", "Variant", "Item"],
      alt: "GC",
      ref: "TG",
      status: "in progress",
      assembly: "GRCh38",
      position: 100000000,
      refseq_id: "NC_000001.1",
      schema_version: "1",
      creation_timestamp: "2023-03-28T05:59:17.412294+00:00",
      selection_criteria:
        "The variant was selected by another lab due to its frequency in an understudied population",
      uuid: "8138364d-f96b-42b9-a719-42199818c6fc",
      summary: "8138364d-f96b-42b9-a719-42199818c6fc",
    };

    expect(humanGenomicVariantTitle(itemWithRefSeqId)).toBe(
      "NC_000001.1:100000000:TG:GC",
    );

    const itemWithReferenceSeq = {
      "@id": "/human-genomic-variants/8138364d-f96b-42b9-a719-42199818c6fc/",
      "@type": ["HumanGenomicVariant", "Variant", "Item"],
      alt: "GC",
      ref: "TG",
      status: "in progress",
      assembly: "GRCh38",
      position: 100000000,
      reference_sequence: "AAATCGGG",
      schema_version: "1",
      creation_timestamp: "2023-03-28T05:59:17.412294+00:00",
      selection_criteria:
        "The variant was selected by another lab due to its frequency in an understudied population",
      uuid: "8138364d-f96b-42b9-a719-42199818c6fc",
      summary: "8138364d-f96b-42b9-a719-42199818c6fc",
    };

    expect(humanGenomicVariantTitle(itemWithReferenceSeq)).toBe(
      "AAATCGGG:100000000:TG:GC",
    );
  });
});

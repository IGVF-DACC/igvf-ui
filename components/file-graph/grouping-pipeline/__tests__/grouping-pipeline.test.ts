import { type FileSetNode } from "../../types";
import { groupingPipelineRunner } from "../index";

describe("groupingPipelineRunner", () => {
  it("groups measurement-set nodes with their auxiliary-set nodes", () => {
    const auxiliarySets = [
      {
        "@id": "/auxiliary-sets/IGVFDS0000AUXI/",
        "@type": ["AuxiliarySet", "FileSet", "Item"],
        file_set_type: "cell sorting",
        summary:
          "cell sorting for CRISPR prime editing Variant-EFFECTS sorted on expression of PPIF integrating a guide (sgRNA) library targeting sequence variants in a genomic locus",
      },
      {
        "@id": "/auxiliary-sets/IGVFDS0001AUXI/",
        "@type": ["AuxiliarySet", "FileSet", "Item"],
        file_set_type: "gRNA sequencing",
        summary:
          "quantification DNA barcode sequencing for MPRA integrating a reporter library targeting accessible genome regions in many genomic loci",
      },
    ];

    const measurementSets = [
      {
        "@id": "/measurement-sets/IGVFDS0000MEAS/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          "@id": "/assay-terms/OBI_0000185/",
          "@type": ["AssayTerm", "OntologyTerm", "Item"],
          term_id: "OBI:0000185",
          term_name: "imaging assay",
        },
        auxiliary_sets: [auxiliarySets[0]],
        file_set_type: "experimental data",
        summary:
          "SGE integrating an editing template library targeting sequence variants in exon7A of PALB2",
      },
      {
        "@id": "/measurement-sets/IGVFDS0001MEAS/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          "@id": "/assay-terms/OBI_0003659/",
          "@type": ["AssayTerm", "OntologyTerm", "Item"],
          term_id: "OBI:0003659",
          term_name: "in vitro CRISPR screen assay",
        },
        file_set_type: "experimental data",
        summary:
          "SGE integrating an editing template library targeting sequence variants in exon7A of PALB2",
      },
      {
        "@id": "/measurement-sets/IGVFDS0002MEAS/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          "@id": "/assay-terms/OBI_0003659/",
          "@type": ["AssayTerm", "OntologyTerm", "Item"],
          term_id: "OBI:0003659",
          term_name: "in vitro CRISPR screen assay",
        },
        auxiliary_sets: [auxiliarySets[1]],
        file_set_type: "experimental data",
        summary: "Parse SPLiT-seq (barcode based, genetically multiplexed)",
      },
    ];

    const allFileSets = [...measurementSets, ...auxiliarySets];
    const fileSetNodes = allFileSets.map((fileSet) => ({
      id: fileSet["@id"],
      metadata: { fileSet },
    })) as unknown as FileSetNode[];

    const result = groupingPipelineRunner(fileSetNodes);

    // Expect two groups: one pairing IGVFDS0000MEAS with IGVFDS0000AUXI, one pairing
    // IGVFDS0002MEAS with IGVFDS0001AUXI. Group keys are hash-based, so check by node IDs.
    expect(result.groups.size).toBe(2);
    const allGroupedIds = Array.from(result.groups.values())
      .flat()
      .map((node) => node.id)
      .sort();
    expect(allGroupedIds).toEqual([
      "/auxiliary-sets/IGVFDS0000AUXI/",
      "/auxiliary-sets/IGVFDS0001AUXI/",
      "/measurement-sets/IGVFDS0000MEAS/",
      "/measurement-sets/IGVFDS0002MEAS/",
    ]);

    // IGVFDS0001MEAS has no auxiliary sets so it remains ungrouped.
    expect(result.remainingNodes.length).toBe(1);
    expect(result.remainingNodes[0]).toEqual(
      expect.objectContaining({ id: "/measurement-sets/IGVFDS0001MEAS/" })
    );
  });

  it("groups measurement-set nodes with related_measurement_sets nodes", () => {
    const relatedMeasurementSet = {
      measurement_sets: [
        {
          "@id": "/measurement-sets/IGVFDS0001MEAS/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          file_set_type: "experimental data",
          summary:
            "Related measurement set for SGE integrating an editing template library",
        },
      ],
      series_type: "multiome",
    };

    const measurementSet = {
      "@id": "/measurement-sets/IGVFDS0000MEAS/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      assay_term: {
        "@id": "/assay-terms/OBI_0000185/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_id: "OBI:0000185",
        term_name: "imaging assay",
      },
      related_measurement_sets: [relatedMeasurementSet],
      file_set_type: "experimental data",
      summary:
        "SGE integrating an editing template library targeting sequence variants in exon7A of PALB2",
    };

    const fileSetNodes = [
      measurementSet,
      ...relatedMeasurementSet.measurement_sets,
    ].map((fileSet) => ({
      id: fileSet["@id"],
      metadata: { fileSet },
    })) as unknown as FileSetNode[];

    const result = groupingPipelineRunner(fileSetNodes);

    // Expect one group pairing IGVFDS0000MEAS with IGVFDS0000RELM. Group keys are hash-based, so check by node IDs.
    expect(result.groups.size).toBe(1);
    const allGroupedIds = Array.from(result.groups.values())
      .flat()
      .map((node) => node.id)
      .sort();
    expect(allGroupedIds).toEqual([
      "/measurement-sets/IGVFDS0000MEAS/",
      "/measurement-sets/IGVFDS0001MEAS/",
    ]);

    // No remaining nodes since all nodes were grouped.
    expect(result.remainingNodes.length).toBe(0);
  });

  it("groups measurement-set and construct-library-set nodes with control_file_sets", () => {
    const constructLibrarySet = {
      "@id": "/construct-library-sets/IGVFDS0000CLIB/",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
      file_set_type: "construct library",
      summary:
        "Construct library set for SGE integrating an editing template library targeting sequence variants in exon7A of PALB2",
    };

    const measurementSet = {
      "@id": "/measurement-sets/IGVFDS0000MEAS/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      assay_term: {
        "@id": "/assay-terms/OBI_0000185/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_id: "OBI:0000185",
        term_name: "imaging assay",
      },
      control_file_sets: [constructLibrarySet],
      file_set_type: "experimental data",
      summary:
        "SGE integrating an editing template library targeting sequence variants in exon7A of PALB2",
    };

    const fileSetNodes = [measurementSet, constructLibrarySet].map(
      (fileSet) => ({
        id: fileSet["@id"],
        metadata: { fileSet },
      })
    ) as unknown as FileSetNode[];

    const result = groupingPipelineRunner(fileSetNodes);

    // Expect one group pairing IGVFDS0000MEAS and IGVFDS0000CLIB. Group keys are hash-based, so check by node IDs.
    expect(result.groups.size).toBe(1);
    const allGroupedIds = Array.from(result.groups.values())
      .flat()
      .map((node) => node.id)
      .sort();
    expect(allGroupedIds).toEqual([
      "/construct-library-sets/IGVFDS0000CLIB/",
      "/measurement-sets/IGVFDS0000MEAS/",
    ]);

    // No remaining nodes since all nodes were grouped.
    expect(result.remainingNodes.length).toBe(0);
  });

  it("groups a pseudobulk set with two construct library sets using their construct_library_set relationships", () => {
    const constructLibrarySet1 = {
      "@id": "/construct-library-sets/IGVFDS0000CLIB1/",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
      file_set_type: "construct library",
      summary:
        "Construct library set 1 for SGE integrating an editing template library targeting sequence variants in exon7A of PALB2",
    };

    const constructLibrarySet2 = {
      "@id": "/construct-library-sets/IGVFDS0000CLIB2/",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
      file_set_type: "construct library",
      summary:
        "Construct library set 2 for SGE integrating an editing template library targeting sequence variants in exon7A of PALB2",
    };

    const pseudobulkSet = {
      "@id": "/pseudobulk-sets/IGVFDS0000PBULK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      assay_term: {
        "@id": "/assay-terms/OBI_0000185/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_id: "OBI:0000185",
        term_name: "imaging assay",
      },
      construct_library_sets: [constructLibrarySet1, constructLibrarySet2],
      file_set_type: "experimental data",
      summary:
        "Pseudobulk set for SGE integrating an editing template library targeting sequence variants in exon7A of PALB2",
    };

    const fileSetNodes = [
      pseudobulkSet,
      constructLibrarySet1,
      constructLibrarySet2,
    ].map((fileSet) => ({
      id: fileSet["@id"],
      metadata: { fileSet },
    })) as unknown as FileSetNode[];

    const result = groupingPipelineRunner(fileSetNodes);

    // Expect one group pairing IGVFDS0000PBULK with IGVFDS0000CLIB1 and IGVFDS0000CLIB2. Group keys are hash-based, so check by node IDs.
    expect(result.groups.size).toBe(1);
    const allGroupedIds = Array.from(result.groups.values())
      .flat()
      .map((node) => node.id)
      .sort();
    expect(allGroupedIds).toEqual([
      "/construct-library-sets/IGVFDS0000CLIB1/",
      "/construct-library-sets/IGVFDS0000CLIB2/",
      "/pseudobulk-sets/IGVFDS0000PBULK/",
    ]);

    // No remaining nodes since all nodes were grouped.
    expect(result.remainingNodes.length).toBe(0);
  });

  it("does not attempt to group remaining nodes with nodes already consumed by earlier stages", () => {
    const auxiliarySet = {
      "@id": "/auxiliary-sets/IGVFDS0000AUXI/",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
      file_set_type: "cell sorting",
      summary: "auxiliary set",
    };

    const groupedMeasurementSet = {
      "@id": "/measurement-sets/IGVFDS0000MEAS/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      assay_term: {
        "@id": "/assay-terms/OBI_0000185/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_id: "OBI:0000185",
        term_name: "imaging assay",
      },
      auxiliary_sets: [auxiliarySet],
      file_set_type: "experimental data",
      summary: "measurement set grouped in auxiliary stage",
    };

    const remainingMeasurementSet = {
      "@id": "/measurement-sets/IGVFDS0001MEAS/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      assay_term: {
        "@id": "/assay-terms/OBI_0003659/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_id: "OBI:0003659",
        term_name: "in vitro CRISPR screen assay",
      },
      control_file_sets: [auxiliarySet],
      file_set_type: "experimental data",
      summary:
        "measurement set that references a file set already grouped in an earlier stage",
    };

    const fileSetNodes = [
      groupedMeasurementSet,
      auxiliarySet,
      remainingMeasurementSet,
    ].map((fileSet) => ({
      id: fileSet["@id"],
      metadata: { fileSet },
    })) as unknown as FileSetNode[];

    expect(() => groupingPipelineRunner(fileSetNodes)).not.toThrow();

    const result = groupingPipelineRunner(fileSetNodes);
    expect(result.groups.size).toBe(1);
    const groupedIds = Array.from(result.groups.values())
      .flat()
      .map((node) => node.id)
      .sort();
    expect(groupedIds).toEqual([
      "/auxiliary-sets/IGVFDS0000AUXI/",
      "/measurement-sets/IGVFDS0000MEAS/",
    ]);
    expect(result.remainingNodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "/measurement-sets/IGVFDS0001MEAS/" }),
      ])
    );
  });

  it("does not connect construct-library relationships to file sets consumed by earlier stages", () => {
    const constructLibrarySet = {
      "@id": "/construct-library-sets/IGVFDS0000CLIB/",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
      file_set_type: "construct library",
      summary: "construct library set",
    };

    const controlGroupedMeasurementSet = {
      "@id": "/measurement-sets/IGVFDS0000MEAS/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      assay_term: {
        "@id": "/assay-terms/OBI_0003659/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_id: "OBI:0003659",
        term_name: "in vitro CRISPR screen assay",
      },
      control_file_sets: [constructLibrarySet],
      file_set_type: "experimental data",
      summary: "grouped in control-file-set stage",
    };

    const remainingPseudobulkSet = {
      "@id": "/pseudobulk-sets/IGVFDS0000PBULK/",
      "@type": ["PseudobulkSet", "FileSet", "Item"],
      construct_library_sets: [constructLibrarySet],
      file_set_type: "experimental data",
      summary:
        "references construct library set that has already been grouped in an earlier stage",
    };

    const fileSetNodes = [
      controlGroupedMeasurementSet,
      constructLibrarySet,
      remainingPseudobulkSet,
    ].map((fileSet) => ({
      id: fileSet["@id"],
      metadata: { fileSet },
    })) as unknown as FileSetNode[];

    expect(() => groupingPipelineRunner(fileSetNodes)).not.toThrow();

    const result = groupingPipelineRunner(fileSetNodes);
    expect(result.groups.size).toBe(1);
    const groupedIds = Array.from(result.groups.values())
      .flat()
      .map((node) => node.id)
      .sort();
    expect(groupedIds).toEqual([
      "/construct-library-sets/IGVFDS0000CLIB/",
      "/pseudobulk-sets/IGVFDS0000PBULK/",
    ]);
    expect(result.remainingNodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "/measurement-sets/IGVFDS0000MEAS/" }),
      ])
    );
  });
});

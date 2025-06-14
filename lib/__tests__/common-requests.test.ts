import type { DatabaseObject } from "../../globals.d";
import {
  requestAnalysisSteps,
  requestAwards,
  requestBiomarkers,
  requestBiosamples,
  requestDatasetSummary,
  requestDocuments,
  requestDonors,
  requestFiles,
  requestFileSets,
  requestGenes,
  requestInstitutionalCertificates,
  requestLabs,
  requestOntologyTerms,
  requestPages,
  requestPhenotypicFeatures,
  requestPublications,
  requestQualityMetrics,
  requestSamples,
  requestSeqspecFiles,
  requestSoftware,
  requestSoftwareVersions,
  requestSources,
  requestTreatments,
  requestUsers,
  requestWorkflows,
} from "../common-requests";
import FetchRequest from "../fetch-request";

describe("Test all the common requests", () => {
  test("requestAnalysisSteps function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/analysis-steps/IGVFWF0000WORK-example-analysis-step/",
          "@type": ["AnalysisStep", "Item"],
          aliases: ["igvf-dacc:analysis_step_01"],
          input_content_types: ["reads"],
          name: "IGVFWF0000WORK-example-analysis-step",
          output_content_types: ["alignments", "transcriptome annotations"],
          status: "released",
          step_label: "example-analysis-step",
          title: "Example Analysis Step",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestAnalysisSteps(
      ["/analysis-steps/IGVFWF0000WORK-example-analysis-step/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=AnalysisStep&field=aliases&field=input_content_types&field=name&field=output_content_types&field=status&field=step_label&field=title&@id=/analysis-steps/IGVFWF0000WORK-example-analysis-step/&limit=1",
      expect.anything()
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestAward function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/awards/HG012047/",
          "@type": ["Award", "Item"],
          name: "HG012047",
          url: "https://reporter.nih.gov/search/8FynEpbEkUWfeBVqXB3Ebw/project-details/10474569",
        },
        {
          "@id": "/awards/HG012022/",
          "@type": ["Award", "Item"],
          name: "HG012022",
          url: "https://reporter.nih.gov/search/un-s4Qo4g0i7DNOYC2kBlw/project-details/10480924",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestAwards(
      ["/awards/HG012047/", "/awards/HG012022/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Award&field=name&field=url&@id=/awards/HG012047/&@id=/awards/HG012022/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestBiomarkers function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/biomarkers/e8aa7ffe-e075-46d2-8a09-9707bf0b190d/",
          "@type": ["Biomarker", "Item"],
          classification: "cell surface protein",
          name: "CD298",
          quantification: "positive",
          status: "in progress",
        },
        {
          "@id": "/biomarkers/d97ce0ce-0125-4639-8084-94d081bea6c3/",
          "@type": ["Biomarker", "Item"],
          classification: "marker gene",
          name: "GATA3",
          quantification: "positive",
          status: "in progress",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestBiomarkers(
      [
        "/biomarkers/e8aa7ffe-e075-46d2-8a09-9707bf0b190d/",
        "/biomarkers/d97ce0ce-0125-4639-8084-94d081bea6c3/",
      ],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Biomarker&field=aliases&field=classification&field=name&field=quantification&field=status&field=synonyms&@id=/biomarkers/e8aa7ffe-e075-46d2-8a09-9707bf0b190d/&@id=/biomarkers/d97ce0ce-0125-4639-8084-94d081bea6c3/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestBiosamples function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/in-vitro-systems/IGVFSM0405BZBU/",
          "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
          accession: "IGVFSM0405BZBU",
          sample_terms: [
            {
              term_name: "HCASMC-hTERT",
              "@id": "/sample-terms/NTR_0000760/",
            },
          ],
          status: "in progress",
          summary:
            "HCASMC-hTERT cell line, female, Homo sapiens grown in SMBM with serum",
        },
        {
          "@id": "/in-vitro-systems/IGVFSM1671CSBE/",
          "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
          accession: "IGVFSM1671CSBE",
          sample_terms: [
            {
              term_name: "mouse embryonic stem cell",
              "@id": "/sample-terms/EFO_0004038/",
            },
          ],
          status: "released",
          summary:
            "mouse embryonic stem differentiated cell specimen, male, Mus musculus WD44",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestBiosamples(
      [
        "/in-vitro-systems/IGVFSM0405BZBU/",
        "/in-vitro-systems/IGVFSM1671CSBE/",
      ],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=BioSample&field=accession&field=disease_terms&field=sample_terms&field=status&field=summary&@id=/in-vitro-systems/IGVFSM0405BZBU/&@id=/in-vitro-systems/IGVFSM1671CSBE/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestFiles function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/sequence-files/IGVFFI4067OVRO/",
          "@type": ["SequenceFile", "File", "Item"],
          accession: "IGVFFI4067OVRO",
          content_type: "reads",
          creation_timestamp: "2023-12-20T22:33:01.459341+00:00",
          file_format: "fastq",
          file_set: "/measurement-sets/IGVFDS2630GWQK/",
          file_size: 555649228,
          href: "/sequence-files/IGVFFI4067OVRO/@@download/IGVFFI4067OVRO.fastq.gz",
          illumina_read_type: "I1",
          lab: {
            title: "Jesse Engreitz, Stanford",
          },
          seqspecs: [],
          sequencing_platform: "/platform-terms/EFO_0008637/",
          sequencing_run: 1,
          status: "in progress",
          upload_status: "validated",
        },
        {
          "@id": "/sequence-files/IGVFFI1165AJSO/",
          "@type": ["SequenceFile", "File", "Item"],
          accession: "IGVFFI1165AJSO",
          content_type: "reads",
          creation_timestamp: "2023-12-05T19:58:18.462157+00:00",
          file_format: "fastq",
          file_set: "/measurement-sets/IGVFDS2192NCTH/",
          file_size: 3060311,
          href: "/sequence-files/IGVFFI1165AJSO/@@download/IGVFFI1165AJSO.fastq.gz",
          illumina_read_type: "I2",
          index: "CCTTCGCA:GTCA",
          lab: {
            title: "Jesse Engreitz, Stanford",
          },
          seqspecs: [],
          sequencing_platform: "/platform-terms/EFO_0008566/",
          sequencing_run: 1,
          status: "released",
          upload_status: "validated",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestFiles(
      ["/sequence-files/IGVFFI4067OVRO/", "/sequence-files/IGVFFI1165AJSO/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=File&field=@type&field=accession&field=aliases&field=content_type&field=controlled_access&field=creation_timestamp&field=derived_from&field=external_host_url&field=externally_hosted&field=file_format&field=file_size&field=file_set&field=filtered&field=flowcell_id&field=href&field=illumina_read_type&field=index&field=input_file_for&field=lab.@id&field=lab.title&field=lane&field=quality_metrics&field=read_names&field=reference_files&field=seqspecs&field=seqspec_document&field=sequencing_platform&field=sequencing_run&field=submitted_file_name&field=status&field=summary&field=workflow.@id&field=workflow.name&field=workflow.uniform_pipeline&field=upload_status&@id=/sequence-files/IGVFFI4067OVRO/&@id=/sequence-files/IGVFFI1165AJSO/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestLabs function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/labs/jesse-engreitz-stanford/",
          "@type": ["Lab", "Item"],
          title: "Jesse Engreitz, Stanford",
        },
        {
          "@id": "/labs/j-michael-cherry",
          "@type": ["Lab", "Item"],
          title: "J. Michael Cherry, Stanford",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestLabs(
      ["/labs/jesse-engreitz-stanford/", "/labs/j-michael-cherry"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Lab&field=title&@id=/labs/jesse-engreitz-stanford/&@id=/labs/j-michael-cherry&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestSeqspecFiles function with paths in seqspecs", async () => {
    const seqspecFiles = [
      {
        "@id": "/sequence-files/IGVFFI4353EABL/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI4353EABL",
        content_type: "reads",
        creation_timestamp: "2024-06-01T01:54:33.198114+00:00",
        file_format: "fastq",
        file_set: "/auxiliary-sets/IGVFDS0835JNKZ/",
        file_size: 24041524,
        href: "/sequence-files/IGVFFI4353EABL/@@download/IGVFFI4353EABL.fastq.gz",
        index: "AACGCATT:CCAG",
        lab: {
          title: "Jesse Engreitz, Stanford",
        },
        seqspecs: ["/configuration-files/IGVFFI6521QYYB/"],
        sequencing_platform: "/platform-terms/EFO_0008565/",
        sequencing_run: 1,
        status: "released",
        upload_status: "validated",
      },
      {
        "@id": "/sequence-files/IGVFFI2761AOAR/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI2761AOAR",
        content_type: "reads",
        creation_timestamp: "2024-06-01T01:24:43.745452+00:00",
        file_format: "fastq",
        file_set: "/auxiliary-sets/IGVFDS5389PFCH/",
        file_size: 5675294,
        href: "/sequence-files/IGVFFI2761AOAR/@@download/IGVFFI2761AOAR.fastq.gz",
        index: "GCACATCT:ACGT",
        lab: {
          title: "Jesse Engreitz, Stanford",
        },
        seqspecs: [],
        sequencing_platform: "/platform-terms/EFO_0008565/",
        sequencing_run: 1,
        status: "released",
        upload_status: "validated",
      },
    ];
    const mockResult = {
      "@graph": [
        {
          "@id": "/configuration-files/IGVFFI6521QYYB/",
          "@type": ["ConfigurationFile", "File", "Item"],
          accession: "IGVFFI6521QYYB",
          content_type: "seqspec",
          creation_timestamp: "2024-06-11T20:44:36.652871+00:00",
          file_format: "yaml",
          file_set: "/auxiliary-sets/IGVFDS0835JNKZ/",
          file_size: 914,
          href: "/configuration-files/IGVFFI6521QYYB/@@download/IGVFFI6521QYYB.yaml.gz",
          lab: {
            title: "Jesse Engreitz, Stanford",
          },
          status: "released",
          upload_status: "validated",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestSeqspecFiles(
      seqspecFiles as unknown as DatabaseObject[],
      request
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
  });

  test("requestSeqspecFiles function with no seqspecs", async () => {
    const seqspecFiles = [
      {
        "@id": "/sequence-files/IGVFFI4353EABL/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI4353EABL",
        content_type: "reads",
        creation_timestamp: "2024-06-01T01:54:33.198114+00:00",
        file_format: "fastq",
        file_set: "/auxiliary-sets/IGVFDS0835JNKZ/",
        file_size: 24041524,
        href: "/sequence-files/IGVFFI4353EABL/@@download/IGVFFI4353EABL.fastq.gz",
        index: "AACGCATT:CCAG",
        lab: {
          title: "Jesse Engreitz, Stanford",
        },
        seqspecs: [],
        sequencing_platform: "/platform-terms/EFO_0008565/",
        sequencing_run: 1,
        status: "released",
        upload_status: "validated",
      },
      {
        "@id": "/sequence-files/IGVFFI2761AOAR/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI2761AOAR",
        content_type: "reads",
        creation_timestamp: "2024-06-01T01:24:43.745452+00:00",
        file_format: "fastq",
        file_set: "/auxiliary-sets/IGVFDS5389PFCH/",
        file_size: 5675294,
        href: "/sequence-files/IGVFFI2761AOAR/@@download/IGVFFI2761AOAR.fastq.gz",
        index: "GCACATCT:ACGT",
        lab: {
          title: "Jesse Engreitz, Stanford",
        },
        seqspecs: [],
        sequencing_platform: "/platform-terms/EFO_0008565/",
        sequencing_run: 1,
        status: "released",
        upload_status: "validated",
      },
    ];
    const mockResult = {
      "@context": "/terms/",
      "@graph": [],
      "@id":
        "/search/?@id=/configuration-files/IGVFFI6521QYYB/&seqspecs!=*&field=accession&field=content_type&field=creation_timestamp&field=file_format&field=file_size&field=file_set&field=flowcell_id&field=href&field=illumina_read_type&field=index&field=lab.title&field=lane&field=seqspecs&field=sequencing_platform&field=sequencing_run&field=status&field=upload_status&limit=2",
      "@type": ["Search"],
      clear_filters: "/search/",
      notification: "Success",
      title: "Search",
      total: 0,
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestSeqspecFiles(
      seqspecFiles as unknown as DatabaseObject[],
      request
    );
    expect(result).toHaveLength(0);
  });

  test("requestSeqspecFiles function with objects in seqspecs", async () => {
    const seqspecFiles = [
      {
        "@id": "/sequence-files/IGVFFI4353EABL/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI4353EABL",
        content_type: "reads",
        creation_timestamp: "2024-06-01T01:54:33.198114+00:00",
        file_format: "fastq",
        file_set: "/auxiliary-sets/IGVFDS0835JNKZ/",
        file_size: 24041524,
        href: "/sequence-files/IGVFFI4353EABL/@@download/IGVFFI4353EABL.fastq.gz",
        index: "AACGCATT:CCAG",
        lab: {
          title: "Jesse Engreitz, Stanford",
        },
        seqspecs: [{ "@id": "/configuration-files/IGVFFI6521QYYB/" }],
        sequencing_platform: "/platform-terms/EFO_0008565/",
        sequencing_run: 1,
        status: "released",
        upload_status: "validated",
      },
      {
        "@id": "/sequence-files/IGVFFI2761AOAR/",
        "@type": ["SequenceFile", "File", "Item"],
        accession: "IGVFFI2761AOAR",
        content_type: "reads",
        creation_timestamp: "2024-06-01T01:24:43.745452+00:00",
        file_format: "fastq",
        file_set: "/auxiliary-sets/IGVFDS5389PFCH/",
        file_size: 5675294,
        href: "/sequence-files/IGVFFI2761AOAR/@@download/IGVFFI2761AOAR.fastq.gz",
        index: "GCACATCT:ACGT",
        lab: {
          title: "Jesse Engreitz, Stanford",
        },
        seqspecs: [],
        sequencing_platform: "/platform-terms/EFO_0008565/",
        sequencing_run: 1,
        status: "released",
        upload_status: "validated",
      },
    ];
    const mockResult = {
      "@context": "/terms/",
      "@graph": [
        {
          "@id": "/configuration-files/IGVFFI6521QYYB/",
          "@type": ["ConfigurationFile", "File", "Item"],
          accession: "IGVFFI6521QYYB",
          content_type: "seqspec",
          creation_timestamp: "2024-06-11T20:44:36.652871+00:00",
          file_format: "yaml",
          file_set: "/auxiliary-sets/IGVFDS0835JNKZ/",
          file_size: 914,
          href: "/configuration-files/IGVFFI6521QYYB/@@download/IGVFFI6521QYYB.yaml.gz",
          lab: {
            title: "Jesse Engreitz, Stanford",
          },
          status: "released",
          upload_status: "validated",
        },
      ],
      "@id":
        "/search/?@id=/configuration-files/IGVFFI6521QYYB/&seqspecs!=*&field=accession&field=content_type&field=creation_timestamp&field=file_format&field=file_size&field=file_set&field=flowcell_id&field=href&field=illumina_read_type&field=index&field=lab.title&field=lane&field=seqspecs&field=sequencing_platform&field=sequencing_run&field=status&field=upload_status&limit=2",
      "@type": ["Search"],
      clear_filters: "/search/",
      notification: "Success",
      title: "Search",
      total: 1,
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestSeqspecFiles(
      seqspecFiles as unknown as DatabaseObject[],
      request
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
  });

  test("requestFileSets function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/auxiliary-sets/IGVFDS0001AUXI/",
          "@type": ["AuxiliarySet", "FileSet", "Item"],
          accession: "IGVFDS0001AUXI",
          aliases: ["igvf:auxiliary_set_1"],
          lab: {
            title: "Ali Mortazavi, UCI",
          },
          samples: [
            {
              summary:
                "lung tissue, mixed sex, Mus musculus some name (10-20 weeks) treated with 10 μg/mL resorcinol for 30 minutes, 100 μg/kg new compound for 30 minutes",
              taxa: "Mus musculus",
              classifications: ["tissue"],
              aliases: ["igvf:treated_tissue"],
              "@type": ["Tissue", "Biosample", "Sample", "Item"],
              accession: "IGVFSM0001DDDD",
              "@id": "/tissues/IGVFSM0001DDDD/",
              treatments: [
                "/treatments/2d57c810-c729-11ec-9d64-0242ac120002/",
                "/treatments/4fbb0dc2-c72e-11ec-9d64-0242ac120002/",
              ],
              status: "released",
              sample_terms: [
                {
                  summary: "lung",
                  term_name: "lung",
                  "@type": ["SampleTerm", "OntologyTerm", "Item"],
                  "@id": "/sample-terms/UBERON_0002048/",
                  status: "released",
                },
              ],
            },
          ],
          status: "released",
          summary: "gRNA sequencing for STARR-seq",
        },
        {
          "@id": "/measurement-sets/IGVFDS4649TBFS/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          accession: "IGVFDS4649TBFS",
          aliases: ["igvf:parse_split_seq"],
          lab: {
            title: "Ali Mortazavi, UCI",
          },
          samples: [
            {
              summary:
                "virtual motor neuron cell (cellular sub pool: LW231B-2), female, Homo sapiens (40-45 years) associated with diabetes mellitus, motor neuron disease",
              taxa: "Homo sapiens",
              classifications: ["primary cell"],
              aliases: ["igvf:alias10"],
              "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
              accession: "IGVFSM0000EEEE",
              "@id": "/primary-cells/IGVFSM0000EEEE/",
              disease_terms: [
                {
                  term_name: "motor neuron disease",
                  "@id": "/phenotype-terms/DOID_231/",
                },
                {
                  term_name: "diabetes mellitus",
                  "@id": "/phenotype-terms/DOID_9351/",
                },
              ],
              status: "released",
              sample_terms: [
                {
                  summary: "motor neuron",
                  term_name: "motor neuron",
                  "@type": ["SampleTerm", "OntologyTerm", "Item"],
                  "@id": "/sample-terms/CL_0011001/",
                  status: "released",
                },
              ],
            },
          ],
          status: "released",
          summary: "single-cell RNA sequencing assay (Parse SPLiT-seq)",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestFileSets(
      ["/auxiliary-sets/IGVFDS0001AUXI/", "/measurement-sets/IGVFDS4649TBFS/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=FileSet&field=@type&field=accession&field=aliases&field=file_set_type&field=lab.title&field=samples&field=status&field=summary&@id=/auxiliary-sets/IGVFDS0001AUXI/&@id=/measurement-sets/IGVFDS4649TBFS/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestDocuments function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/documents/7988b40d-f7fc-4dc2-a7d4-95936e61be5c/",
          "@type": ["Document", "Item"],
          attachment: {
            download: "sgOpti-Blast.txt",
            md5sum: "28001d168a93a48ef8b54c5dd87ffdbd",
            href: "@@download/attachment/sgOpti-Blast.txt",
            type: "text/plain",
          },
          description: "Plasmid sequence example.",
          document_type: "plasmid sequence",
          uuid: "7988b40d-f7fc-4dc2-a7d4-95936e61be5c",
        },
        {
          "@id": "/documents/3508c752-4a9f-46e0-a5b6-099cd8a71428/",
          "@type": ["Document", "Item"],
          attachment: {
            download: "SEMpl_model_data.txt",
            md5sum: "7dc4c12dd0d0ee0bbe4c6e652449dc8d",
            href: "@@download/attachment/SEMpl_model_data.txt",
            type: "text/plain",
          },
          description: "Model source data example.",
          document_type: "model source data",
          uuid: "3508c752-4a9f-46e0-a5b6-099cd8a71428",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestDocuments(
      [
        "/documents/7988b40d-f7fc-4dc2-a7d4-95936e61be5c/",
        "/documents/3508c752-4a9f-46e0-a5b6-099cd8a71428/",
      ],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Document&field=attachment&field=description&field=document_type&field=standardized_file_format&field=uuid&@id=/documents/7988b40d-f7fc-4dc2-a7d4-95936e61be5c/&@id=/documents/3508c752-4a9f-46e0-a5b6-099cd8a71428/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestDonors function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO3718JLGW/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO3718JLGW",
          aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
        },
        {
          "@id": "/rodent-donors/IGVFDO4122GLOB/",
          "@type": ["RodentDonor", "Donor", "Item"],
          accession: "IGVFDO4122GLOB",
          aliases: [
            "igvf:alias_rodent_donor_1",
            "igvf:rodent_donor_with_arterial_blood_pressure_trait",
          ],
          sex: "male",
          status: "released",
          taxa: "Mus musculus",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestDonors(
      ["/human-donors/IGVFDO3718JLGW/", "/rodent-donors/IGVFDO4122GLOB/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Donor&field=accession&field=aliases&field=sex&field=status&field=taxa&@id=/human-donors/IGVFDO3718JLGW/&@id=/rodent-donors/IGVFDO4122GLOB/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestGenes function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/genes/ENSG00000163930/",
          "@type": ["Gene", "Item"],
          geneid: "ENSG00000163930",
        },
        {
          "@id": "/genes/ENSG00000207705/",
          "@type": ["Gene", "Item"],
          geneid: "ENSG00000207705",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestGenes(
      ["/genes/ENSG00000163930/", "/genes/ENSG00000207705/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Gene&field=geneid&field=symbol&@id=/genes/ENSG00000163930/&@id=/genes/ENSG00000207705/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestInstitutionalCertificates function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id":
            "/institutional-certificates/ed7bb4fd-b1d5-442b-a4ab-4de1291d07b5/",
          "@type": ["InstitutionalCertificate", "Item"],
          certificate_identifier: "IP100-00",
          status: "released",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestInstitutionalCertificates(
      ["/institutional-certificates/ed7bb4fd-b1d5-442b-a4ab-4de1291d07b5/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=InstitutionalCertificate&field=certificate_identifier&field=controlled_access&field=data_use_limitation_summary&field=lab&field=status&@id=/institutional-certificates/ed7bb4fd-b1d5-442b-a4ab-4de1291d07b5/&limit=1",
      expect.anything()
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
  });

  test("requestOntologyTerms function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/phenotype-terms/NCIT_C92648/",
          "@type": ["PhenotypeTerm", "OntologyTerm", "Item"],
          term_id: "NCIT:C92648",
          term_name: "Body Weight Measurement",
        },
        {
          "@id": "/sample-terms/UBERON_0005439/",
          "@type": ["SampleTerm", "OntologyTerm", "Item"],
          term_id: "UBERON:0005439",
          term_name: "definitive endoderm",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestOntologyTerms(
      ["/phenotype-terms/NCIT_C92648/", "/sample-terms/UBERON_0005439/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=OntologyTerm&field=term_id&field=term_name&@id=/phenotype-terms/NCIT_C92648/&@id=/sample-terms/UBERON_0005439/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestPhenotypicFeatures function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/phenotypic-features/ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa/",
          "@type": ["PhenotypicFeature", "Item"],
          feature: {
            term_name: "Body Weight Measurement",
            term_id: "NCIT:C92648",
            "@id": "/phenotype-terms/NCIT_C92648/",
          },
          observation_date: "2022-11-15",
          quantity: 58,
          quantity_units: "kilogram",
          status: "released",
        },
        {
          "@id": "/phenotypic-features/847d7bdc-8fb3-11ed-a1eb-0242ac120002/",
          "@type": ["PhenotypicFeature", "Item"],
          feature: {
            term_name: "Body Weight Measurement",
            term_id: "NCIT:C92648",
            "@id": "/phenotype-terms/NCIT_C92648/",
          },
          observation_date: "2022-01-04",
          quantity: 237,
          quantity_units: "gram",
          status: "released",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestPhenotypicFeatures(
      [
        "/phenotypic-features/ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa/",
        "/phenotypic-features/847d7bdc-8fb3-11ed-a1eb-0242ac120002/",
      ],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=PhenotypicFeature&field=feature.@id&field=feature.term_id&field=feature.term_name&field=observation_date&field=quantity&field=quantity_units&field=status&@id=/phenotypic-features/ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa/&@id=/phenotypic-features/847d7bdc-8fb3-11ed-a1eb-0242ac120002/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestSamples function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/tissues/IGVFSM0003DDDD/",
          "@type": ["Tissue", "Biosample", "Sample", "Item"],
          accession: "IGVFSM0003DDDD",
          sample_terms: [
            {
              term_name: "lung",
              "@id": "/sample-terms/UBERON_0002048/",
            },
          ],
          status: "released",
          summary: "lung tissue, female, Mus musculus some name (10-20 months)",
        },
        {
          "@id": "/technical-samples/IGVFSM3106NGJL/",
          "@type": ["TechnicalSample", "Sample", "Item"],
          accession: "IGVFSM3106NGJL",
          sample_terms: [
            {
              term_name: "cell",
              "@id": "/sample-terms/CL_0000000/",
            },
          ],
          status: "released",
          summary: "organic cell",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestSamples(
      ["/tissues/IGVFSM0003DDDD/", "/technical-samples/IGVFSM3106NGJL/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Sample&field=accession&field=construct_library_sets&field=disease_terms&field=protocols&field=sample_terms&field=status&field=summary&@id=/tissues/IGVFSM0003DDDD/&@id=/technical-samples/IGVFSM3106NGJL/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestSoftware function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/software/bowtie2/",
          "@type": ["Software", "Item"],
          aliases: ["igvf:bowtie2"],
          description:
            "Bowtie 2 is an ultrafast and memory-efficient tool aligning sequencing reads to long reference sequences.",
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          name: "bowtie2",
          source_url: "https://bowtie-bio.sourceforge.net/bowtie2/index.shtml",
          status: "released",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestSoftware(["/software/bowtie2/"], request);
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Software&field=aliases&field=description&field=lab&field=name&field=source_url&field=status&field=title&@id=/software/bowtie2/&limit=1",
      expect.anything()
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
  });

  test("requestSoftwareVersions function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/software-versions/bowtie2-v2.4.4/",
          "@type": ["SoftwareVersion", "Item"],
          downloaded_url:
            "https://sourceforge.net/projects/bowtie-bio/files/bowtie2/2.4.4/",
          name: "bowtie2-v2.4.4",
          status: "released",
          version: "v2.4.4",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestSoftwareVersions(
      ["/software-versions/bowtie2-v2.4.4/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=SoftwareVersion&field=downloaded_url&field=name&field=status&field=version&@id=/software-versions/bowtie2-v2.4.4/&limit=1",
      expect.anything()
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
  });

  test("requestTreatments function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/treatments/d7562e66-c218-46e8-b0e2-ea6d89978b32/",
          "@type": ["Treatment", "Item"],
          purpose: "differentiation",
          status: "released",
          summary: "Depletion of new protein",
          treatment_term_name: "new protein",
          treatment_type: "protein",
        },
        {
          "@id": "/treatments/bd2cb34e-c72c-11ec-9d64-0242ac120002/",
          "@type": ["Treatment", "Item"],
          purpose: "differentiation",
          status: "released",
          summary: "Treatment of 0.5 mg/kg new protein",
          treatment_term_name: "new protein",
          treatment_type: "protein",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestTreatments(
      [
        "/treatments/d7562e66-c218-46e8-b0e2-ea6d89978b32/",
        "/treatments/bd2cb34e-c72c-11ec-9d64-0242ac120002/",
      ],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Treatment&field=purpose&field=status&field=summary&field=treatment_term_name&field=treatment_type&@id=/treatments/d7562e66-c218-46e8-b0e2-ea6d89978b32/&@id=/treatments/bd2cb34e-c72c-11ec-9d64-0242ac120002/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestUsers function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/",
          "@type": ["User", "Item"],
          title: "Christina Leslie",
        },
        {
          "@id": "/users/fa43a796-163c-488a-aa8e-5472a458232c/",
          "@type": ["User", "Item"],
          title: "Jason Ernst",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestUsers(
      [
        "/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/",
        "/users/fa43a796-163c-488a-aa8e-5472a458232c/",
      ],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=User&field=title&@id=/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/&@id=/users/fa43a796-163c-488a-aa8e-5472a458232c/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestSources function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/sources/aviva/",
          "@type": ["Source", "Item"],
          name: "aviva",
          url: "http://www.avivasysbio.com",
        },
        {
          "@id": "/sources/sigma/",
          "@type": ["Source", "Item"],
          name: "sigma",
          url: "http://www.sigmaaldrich.com",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestSources(
      ["/sources/aviva/", "/sources/sigma/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Source&field=name&field=url&field=lab.title&@id=/sources/aviva/&@id=/sources/sigma/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestPages function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/help/donors/human-donors/",
          "@type": ["Page", "Item"],
          name: "human-donors",
          status: "released",
          title: "Human Donors",
        },
        {
          "@id": "/help/ontologies/phenotypes/",
          "@type": ["Page", "Item"],
          name: "phenotypes",
          status: "released",
          title: "Phenotypes",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestPages(
      ["/help/donors/human-donors/", "/help/ontologies/phenotypes/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Page&field=name&field=title&field=status&@id=/help/donors/human-donors/&@id=/help/ontologies/phenotypes/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestDatasetSummary function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/measurement-sets/IGVFDS6082UZFE/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          assay_term: {
            term_name: "single-cell ATAC-seq",
          },
          creation_timestamp: "2024-07-29T18:12:21.398753+00:00",
          lab: {
            title: "Danwei Huangfu, MSKCC",
          },
          preferred_assay_title: "10x multiome",
          release_timestamp: "2024-03-06T12:34:56Z",
          status: "released",
        },
        {
          "@id": "/measurement-sets/IGVFDS7183YILI/",
          "@type": ["MeasurementSet", "FileSet", "Item"],
          assay_term: {
            term_name: "single-cell RNA sequencing assay",
          },
          creation_timestamp: "2024-07-29T18:12:21.571347+00:00",
          lab: {
            title: "Danwei Huangfu, MSKCC",
          },
          preferred_assay_title: "10x multiome",
          release_timestamp: "2024-03-06T12:34:56Z",
          status: "released",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestDatasetSummary(request);
    expect(result["@graph"]).toEqual(mockResult["@graph"]);
  });

  test("requestWorkflows function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/workflows/IGVFWF0000WORK/",
          "@type": ["Workflow", "Item"],
          accession: "IGVFWF0000WORK",
          aliases: ["igvf:perturb_seq_workflow"],
          lab: {
            "@id": "/labs/j-michael-cherry/",
            title: "J. Michael Cherry, Stanford",
          },
          name: "Perturb-seq Pipeline",
          source_url: "https://github.com/perturbseq_pipeline",
          status: "released",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestWorkflows(
      ["/workflows/IGVFWF0000WORK/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Workflow&field=accession&field=aliases&field=lab&field=name&field=source_url&field=status&@id=/workflows/IGVFWF0000WORK/&limit=1",
      expect.anything()
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
  });

  test("requestPublications function", async () => {
    const mockResult = {
      "@graph": [
        {
          "@id": "/publications/936b0798-3d6b-4b2f-a357-2bd59faae506/",
          "@type": ["Publication", "Item"],
          authors:
            "ENCODE Project Consortium, Bernstein BE, Birney E, Dunham I, Green ED, Gunter C, Snyder M.",
          date_published: "2012-09-06",
          issue: "7414",
          journal: "Nature",
          page: "57-74",
          publication_identifiers: ["PMID:22955616", "PMCID:PMC3439153"],
          title:
            "An integrated encyclopedia of DNA elements in the human genome",
          volume: "489",
        },
        {
          "@id": "/publications/244ec9fc-ddda-4f38-b72d-3430929111e4/",
          "@type": ["Publication", "Item"],
          authors: "Alireza Karbalayghareh, Merve Sahin, Christina S. Leslie",
          date_published: "2021-04-02",
          publication_identifiers: ["doi:10.1101/2021.03.31.437978"],
          title:
            "Chromatin interaction aware gene regulatory modeling with graph attention networks",
        },
      ],
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestPublications(
      [
        "/publications/936b0798-3d6b-4b2f-a357-2bd59faae506/",
        "/publications/244ec9fc-ddda-4f38-b72d-3430929111e4/",
      ],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/search-quick/?type=Publication&field=aliases&field=authors&field=date_published&field=issue&field=journal&field=page&field=publication_identifiers&field=title&field=volume&@id=/publications/936b0798-3d6b-4b2f-a357-2bd59faae506/&@id=/publications/244ec9fc-ddda-4f38-b72d-3430929111e4/&limit=2",
      expect.anything()
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockResult["@graph"][0]);
    expect(result[1]).toEqual(mockResult["@graph"][1]);
  });

  test("requestQualityMetrics function", async () => {
    const mockResult = [
      {
        "@id": "/mpra-quality-metrics/a0696f31-1422-4946-ddea-21da73f7d04a/",
        "@type": ["MpraQualityMetric", "QualityMetric", "Item"],
        award: {
          component: "data coordination",
          "@id": "/awards/HG012012/",
        },
        lab: {
          "@id": "/labs/j-michael-cherry/",
          title: "J. Michael Cherry, Stanford",
        },
        quality_metric_of: ["/tabular-files/IGVFFI0001PKBD/"],
        status: "in progress",
        summary: "Quality metric of /tabular-files/IGVFFI0001PKBD/",
        uuid: "a0696f31-1422-4946-ddea-21da73f7d04a",
      },
    ];

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
    );

    const request = new FetchRequest();
    const result = await requestQualityMetrics(
      ["/mpra-quality-metrics/a0696f31-1422-4946-ddea-21da73f7d04a/"],
      request
    );
    expect(mockFunction).toHaveBeenCalledWith(
      "/mpra-quality-metrics/a0696f31-1422-4946-ddea-21da73f7d04a/",
      expect.anything()
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockResult);
  });
});

import {
  collectDataUseLimitationSummariesFromSamples,
  composeDataUseLimitationSummary,
  decomposeDataUseLimitationSummary,
} from "../data-use-limitation";
import type { SampleObject } from "../../globals";

describe("Test collectDataUseLimitationSummariesFromSamples", () => {
  it("should return an empty array when no samples are provided", () => {
    const samples: SampleObject[] = [];
    const result = collectDataUseLimitationSummariesFromSamples(samples);
    expect(result).toEqual([]);
  });

  it("should return an empty array when no institutional certificates are present", () => {
    const samples: SampleObject[] = [
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0000SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0000SAMP",
        institutional_certificates: [],
        release_timestamp: "2013-07-19T14:05:32.451982+00:00",
        status: "released",
        uuid: "f8aa2bdd-e30a-4f22-893c-49c21f86824c",
        virtual: false,
      },
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0001SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0001SAMP",
        institutional_certificates: [],
        release_timestamp: "2007-11-03T06:22:48.190374+00:00",
        status: "released",
        uuid: "42245db0-2e20-491d-a263-900db67dd152",
        virtual: false,
      },
    ];
    const result = collectDataUseLimitationSummariesFromSamples(samples);
    expect(result).toEqual([]);
  });

  it("should return a single summary when one sample with one certificate is provided", () => {
    const samples: SampleObject[] = [
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0000SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0000SAMP",
        institutional_certificates: [],
        release_timestamp: "2013-07-19T14:05:32.451982+00:00",
        status: "released",
        uuid: "4fce0ecd-b14c-4dab-b4b2-a5c8bea74d0f",
        virtual: false,
      },
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0001SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0001SAMP",
        institutional_certificates: [
          {
            "@context": "/terms/",
            "@id":
              "/institutional-certificates/886db871-e71a-44d7-916a-c9ae94d2687c/",
            "@type": ["InstitutionalCertificate", "Item"],
            certificate_identifier: "IP001-00",
            controlled_access: true,
            data_use_limitation: "DS",
            data_use_limitation_summary: "DS",
            status: "released",
            summary: "IP001-00 (controlled)",
            urls: ["https://drive.google.com/file/"],
            uuid: "886db871-e71a-44d7-916a-c9ae94d2687c",
          },
        ],
        release_timestamp: "2011-03-15T22:11:06.087000+00:00",
        status: "released",
        uuid: "cf77059d-ea0c-4e4d-b708-cb04877cc95d",
        virtual: false,
      },
    ];
    const result = collectDataUseLimitationSummariesFromSamples(samples);
    expect(result).toEqual(["DS"]);
  });

  it("should return multiple summaries when multiple samples with multiple certificates are provided", () => {
    const samples: SampleObject[] = [
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0000SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0000SAMP",
        institutional_certificates: [
          {
            "@context": "/terms/",
            "@id":
              "/institutional-certificates/e22cb17c-dc95-46b2-baf5-fed3b5c58d97/",
            "@type": ["InstitutionalCertificate", "Item"],
            certificate_identifier: "IP010-00",
            controlled_access: false,
            creation_timestamp: "2025-04-23T22:59:07.827390+00:00",
            data_use_limitation_summary: "No limitations",
            status: "in progress",
            summary: "IP010-00 (unrestricted)",
            urls: ["https://drive.google.com/file/"],
            uuid: "e22cb17c-dc95-46b2-baf5-fed3b5c58d97",
          },
        ],
        release_timestamp: "2013-07-19T14:05:32.451982+00:00",
        status: "released",
        uuid: "4fce0ecd-b14c-4dab-b4b2-a5c8bea74d0f",
        virtual: false,
      },
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0001SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0001SAMP",
        institutional_certificates: [
          {
            "@context": "/terms/",
            "@id":
              "/institutional-certificates/6109eee6-f342-4877-9cb5-a2e7e7b8bf64/",
            "@type": ["InstitutionalCertificate", "Item"],
            certificate_identifier: "IP001-00",
            controlled_access: true,
            data_use_limitation: "DS",
            data_use_limitation_summary: "DS",
            status: "released",
            summary: "IP001-00 (controlled)",
            urls: ["https://drive.google.com/file/"],
            uuid: "6109eee6-f342-4877-9cb5-a2e7e7b8bf64",
          },
          {
            "@context": "/terms/",
            "@id":
              "/institutional-certificates/607fae75-c1d8-4fed-b54d-e8dd2d30d902/",
            "@type": ["InstitutionalCertificate", "Item"],
            certificate_identifier: "IP002-00",
            controlled_access: true,
            data_use_limitation: "HMB",
            data_use_limitation_modifiers: ["GSO", "COL"],
            data_use_limitation_summary: "HMB-GSO,COL",
            status: "released",
            summary: "IP002-00 (controlled)",
            urls: ["https://drive.google.com/file/"],
            uuid: "607fae75-c1d8-4fed-b54d-e8dd2d30d902",
          },
        ],
        release_timestamp: "2011-03-15T22:11:06.087000+00:00",
        status: "released",
        uuid: "cf77059d-ea0c-4e4d-b708-cb04877cc95d",
        virtual: false,
      },
    ];

    const result = collectDataUseLimitationSummariesFromSamples(samples);
    expect(result).toEqual(["No limitations", "DS", "HMB-GSO,COL"]);
  });

  it("should return unique summaries when multiple samples with the same certificate are provided", () => {
    const samples: SampleObject[] = [
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0000SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0000SAMP",
        institutional_certificates: [
          {
            "@context": "/terms/",
            "@id":
              "/institutional-certificates/886db871-e71a-44d7-916a-c9ae94d2687c/",
            "@type": ["InstitutionalCertificate", "Item"],
            certificate_identifier: "IP001-00",
            controlled_access: true,
            data_use_limitation: "DS",
            data_use_limitation_summary: "DS",
            status: "released",
            summary: "IP001-00 (controlled)",
            urls: ["https://drive.google.com/file/"],
            uuid: "886db871-e71a-44d7-916a-c9ae94d2687c",
          },
        ],
        release_timestamp: "2013-07-19T14:05:32.451982+00:00",
        status: "released",
        uuid: "4fce0ecd-b14c-4dab-b4b2-a5c8bea74d0f",
        virtual: false,
      },
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0001SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0001SAMP",
        institutional_certificates: [
          {
            "@context": "/terms/",
            "@id":
              "/institutional-certificates/886db871-e71a-44d7-916a-c9ae94d2687c/",
            "@type": ["InstitutionalCertificate", "Item"],
            certificate_identifier: "IP001-00",
            controlled_access: true,
            data_use_limitation: "DS",
            data_use_limitation_summary: "DS",
            status: "released",
            summary: "IP001-00 (controlled)",
            urls: ["https://drive.google.com/file/"],
            uuid: "886db871-e71a-44d7-916a-c9ae94d2687c",
          },
          {
            "@context": "/terms/",
            "@id":
              "/institutional-certificates/607fae75-c1d8-4fed-b54d-e8dd2d30d902/",
            "@type": ["InstitutionalCertificate", "Item"],
            certificate_identifier: "IP002-00",
            controlled_access: true,
            data_use_limitation: "HMB",
            data_use_limitation_modifiers: ["GSO", "COL"],
            data_use_limitation_summary: "HMB-GSO,COL",
            status: "released",
            summary: "IP002-00 (controlled)",
            urls: ["https://drive.google.com/file/"],
            uuid: "607fae75-c1d8-4fed-b54d-e8dd2d30d902",
          },
        ],
        release_timestamp: "2011-03-15T22:11:06.087000+00:00",
        status: "released",
        uuid: "cf77059d-ea0c-4e4d-b708-cb04877cc95d",
        virtual: false,
      },
    ];
    const result = collectDataUseLimitationSummariesFromSamples(samples);
    expect(result).toEqual(["DS", "HMB-GSO,COL"]);
  });

  it("should return unique summaries even when no summaries in the IC objects exist", () => {
    const samples: SampleObject[] = [
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0000SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0000SAMP",
        release_timestamp: "2013-07-19T14:05:32.451982+00:00",
        status: "released",
        uuid: "4fce0ecd-b14c-4dab-b4b2-a5c8bea74d0f",
        virtual: false,
      },
      {
        "@context": "/terms/",
        "@id": "/in-vitro-systems/IGVFSM0001SAMP/",
        "@type": ["InVitroSystem", "Biosample", "Sample", "Item"],
        accession: "IGVFSM0001SAMP",
        institutional_certificates: [
          {
            "@context": "/terms/",
            "@id":
              "/institutional-certificates/886db871-e71a-44d7-916a-c9ae94d2687c/",
            "@type": ["InstitutionalCertificate", "Item"],
            certificate_identifier: "IP001-00",
            controlled_access: true,
            data_use_limitation: "DS",
            status: "released",
            summary: "IP001-00 (controlled)",
            urls: ["https://drive.google.com/file/"],
            uuid: "886db871-e71a-44d7-916a-c9ae94d2687c",
          },
          {
            "@context": "/terms/",
            "@id":
              "/institutional-certificates/607fae75-c1d8-4fed-b54d-e8dd2d30d902/",
            "@type": ["InstitutionalCertificate", "Item"],
            certificate_identifier: "IP002-00",
            controlled_access: true,
            data_use_limitation: "HMB",
            data_use_limitation_modifiers: ["GSO", "COL"],
            status: "released",
            summary: "IP002-00 (controlled)",
            urls: ["https://drive.google.com/file/"],
            uuid: "607fae75-c1d8-4fed-b54d-e8dd2d30d902",
          },
        ],
        release_timestamp: "2011-03-15T22:11:06.087000+00:00",
        status: "released",
        uuid: "cf77059d-ea0c-4e4d-b708-cb04877cc95d",
        virtual: false,
      },
    ];
    const result = collectDataUseLimitationSummariesFromSamples(samples);
    expect(result).toEqual(["DS", "HMB-GSO-COL"]);
  });
});

describe("Test composeDataUseLimitationSummary", () => {
  it("should return a summary with a limitation but no modifiers", () => {
    const summary = composeDataUseLimitationSummary("DS");
    expect(summary).toBe("DS");
  });

  it("should return a summary with a limitation and modifiers", () => {
    const summary = composeDataUseLimitationSummary("HMB", ["GSO", "COL"]);
    expect(summary).toBe("HMB-GSO-COL");
  });

  it("should return a summary with no limitation and no modifiers", () => {
    const summary = composeDataUseLimitationSummary();
    expect(summary).toBe("");
  });
});

describe("Test decomposeDataUseLimitationSummary", () => {
  it("should return a limitation but no modifier with a summary that has a limitation but no modifier", () => {
    const { limitation, modifiers } = decomposeDataUseLimitationSummary("DS");
    expect(limitation).toBe("DS");
    expect(modifiers).toEqual([]);
  });

  it("should return a limitation and a modifier with a summary that has a limitation and a modifier", () => {
    const { limitation, modifiers } =
      decomposeDataUseLimitationSummary("HMB-GSO-COL");
    expect(limitation).toBe("HMB");
    expect(modifiers).toEqual(["GSO", "COL"]);
  });

  it("should return an empty limitation and an empty modifier array with no summary", () => {
    const { limitation, modifiers } = decomposeDataUseLimitationSummary();
    expect(limitation).toBe("");
    expect(modifiers).toEqual([]);
  });
});

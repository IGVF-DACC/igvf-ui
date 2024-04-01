import { render, screen } from "@testing-library/react";
import profiles from "../../__mocks__/profile";
import SessionContext from "../../session-context";
import Award from "../list-renderer/award";
import AnalysisSet from "../list-renderer/analysis-set";
import AnalysisStep from "../list-renderer/analysis-step";
import AuxiliarySet from "../list-renderer/auxiliary-set";
import Biomarker from "../list-renderer/biomarker";
import Biosample from "../list-renderer/biosample";
import ConstructLibrarySet from "../list-renderer/construct-library-set";
import CuratedSet from "../list-renderer/curated-set";
import Document from "../list-renderer/document";
import File from "../list-renderer/file";
import Gene from "../list-renderer/gene";
import HumanDonor from "../list-renderer/human-donor";
import HumanGenomicVariant from "../list-renderer/human-genomic-variant";
import Lab from "../list-renderer/lab";
import MeasurementSet from "../list-renderer/measurement-set";
import ModelSet from "../list-renderer/model-set";
import MultiplexedSample from "../list-renderer/multiplexed-sample";
import OntologyTerm from "../list-renderer/ontology-term";
import OpenReadingFrame from "../list-renderer/open-reading-frame";
import Page from "../list-renderer/page";
import PhenotypicFeature from "../list-renderer/phenotypic-feature";
import PredictionSet from "../list-renderer/prediction-set";
import Publication from "../list-renderer/publication";
import RodentDonor from "../list-renderer/rodent-donor";
import Software from "../list-renderer/software";
import SoftwareVersion from "../list-renderer/software-version";
import Source from "../list-renderer/source";
import TechnicalSample from "../list-renderer/technical-sample";
import Treatment from "../list-renderer/treatment";
import User from "../list-renderer/user";
import Workflow from "../list-renderer/workflow";

/**
 * For objects in the profiles mock, the displayed item type is the human-readable title of the
 * object's `@type` property. For other objects, the `@type` property itself appears.
 */

describe("Test OntologyTerm component", () => {
  it("renders an ontology term with synonyms", () => {
    const item = {
      "@id": "/assay-terms/OBI_0002675/",
      "@type": ["AssayTerm", "OntologyTerm", "Item"],
      status: "released",
      synonyms: ["MPRA"],
      term_id: "OBI:0002675",
      term_name: "MPRA",
      uuid: "e6a5e43a-9e8c-fd28-967f-358e200536ab",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <OntologyTerm item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^AssayTerm/);
    expect(uniqueId).toHaveTextContent(/OBI:0002675$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("MPRA");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("MPRA");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders an ontology term with no synonyms", () => {
    const item = {
      "@id": "/assay-terms/OBI_0002675/",
      "@type": ["AssayTerm", "OntologyTerm", "Item"],
      status: "released",
      synonyms: [],
      term_id: "OBI:0002675",
      term_name: "MPRA",
      uuid: "e6a5e43a-9e8c-fd28-967f-358e200536ab",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <OntologyTerm item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^AssayTerm/);
    expect(uniqueId).toHaveTextContent(/OBI:0002675$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("MPRA");

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Award component", () => {
  it("renders an award with a component property", () => {
    const item = {
      "@id": "/awards/1U01HG012039-01/",
      "@type": ["Award", "Item"],
      component: "predictive modeling",
      name: "1U01HG012039-01",
      project: "IGVF",
      status: "current",
      title:
        "Linking Variants to Multi-scale Phenotypes via a Synthesis of Subnetwork Inference and Deep Learning",
      uuid: "fc8d4357-0c1d-4a67-923b-003879da0fda",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Award item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Grant/);
    expect(uniqueId).toHaveTextContent(/1U01HG012039-01$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      "Linking Variants to Multi-scale Phenotypes via a Synthesis of Subnetwork Inference and Deep Learning"
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("predictive modeling");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("current");
  });

  it("renders an award without a component property", () => {
    const item = {
      "@id": "/awards/1U01HG012039-01/",
      "@type": ["Award", "Item"],
      name: "1U01HG012039-01",
      project: "IGVF",
      status: "current",
      title:
        "Linking Variants to Multi-scale Phenotypes via a Synthesis of Subnetwork Inference and Deep Learning",
      uuid: "fc8d4357-0c1d-4a67-923b-003879da0fda",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Award item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Grant/);
    expect(uniqueId).toHaveTextContent(/1U01HG012039-01$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      "Linking Variants to Multi-scale Phenotypes via a Synthesis of Subnetwork Inference and Deep Learning"
    );

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("current");
  });

  it("renders an award with accessory data", () => {
    const item = {
      "@id": "/awards/1U01HG012039-01/",
      "@type": ["Award", "Item"],
      component: "predictive modeling",
      name: "1U01HG012039-01",
      project: "IGVF",
      status: "current",
      title:
        "Linking Variants to Multi-scale Phenotypes via a Synthesis of Subnetwork Inference and Deep Learning",
      uuid: "fc8d4357-0c1d-4a67-923b-003879da0fda",
      contact_pi: "/users/04e6e85d-3737-454e-8a3b-6f8cb2317f00/",
    };

    const accessoryData = {
      "/users/04e6e85d-3737-454e-8a3b-6f8cb2317f00/": {
        email: "lea@email_domain.com",
        first_name: "Lea",
        groups: ["verified"],
        title: "Lea Starita",
        lab: "/labs/lea-starita/",
        last_name: "Starita",
        status: "current",
        viewing_groups: ["IGVF"],
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Award item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Grant/);
    expect(uniqueId).toHaveTextContent(/1U01HG012039-01$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      "Linking Variants to Multi-scale Phenotypes via a Synthesis of Subnetwork Inference and Deep Learning"
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Lea Starit");
    expect(meta).toHaveTextContent("predictive modeling");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("current");

    const paths = Award.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      {
        type: "User",
        paths: ["/users/04e6e85d-3737-454e-8a3b-6f8cb2317f00/"],
        fields: ["title"],
      },
    ]);
  });
});

describe("Test the Biosample component", () => {
  it("renders a biosample-derived item", () => {
    const item = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      alternate_accessions: ["IGVFSM0000EEEF", "IGVFSM0000EEEG"],
      award: {
        component: "data coordination",
        name: "HG012012",
        "@id": "/awards/HG012012/",
      },
      sample_terms: [
        {
          term_name: "motor neuron",
          "@id": "/sample-terms/CL_0011001/",
        },
      ],
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      taxa: "Homo sapiens",
      uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
      summary: "biosample summary",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Biosample item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^PrimaryCell/);
    expect(uniqueId).toHaveTextContent(/IGVFSM0000EEEE$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("biosample summary");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test ConstructLibrarySet component", () => {
  it("renders a ConstructLibrarySet component with reporter library details", () => {
    const item = {
      "@id": "/construct-library-sets/IGVFDS3140KDHS/",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
      accession: "IGVFDS3140KDHS",
      alternate_accessions: ["IGVFDS3140KDHT"],
      aliases: ["igvf:basic_construct_library_1"],
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      loci: [
        {
          assembly: "GRCh38",
          chromosome: "chr1",
          end: 10,
          start: 1,
        },
        {
          assembly: "GRCh38",
          chromosome: "chr1",
          end: 23352,
          start: 3232,
        },
      ],
      reporter_library_details: {
        average_insert_size: 270,
      },
      scope: "genes",
      selection_criteria: ["accessible genome regions"],
      status: "released",
      summary: "Reporter library of accessible genome regions",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <ConstructLibrarySet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Construct Library Set IGVFDS3140KDHS/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      /^Reporter library of accessible genome regions$/
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a ConstructLibrarySet component with guide library details", () => {
    const item = {
      "@id": "/construct-libraries/IGVFDS0000CSLB/",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
      accession: "IGVFDS0000CSLB",
      aliases: ["igvf:basic_construct_library_2"],
      guide_library_details: {
        guide_type: "sgRNA",
      },
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      loci: [
        {
          assembly: "GRCh38",
          chromosome: "chr1",
          end: 10,
          start: 1,
        },
      ],
      scope: "genome-wide",
      selection_criteria: ["TF binding sites", "disease-associated variants"],
      status: "released",
      summary: "Guide library of TF binding sites",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <ConstructLibrarySet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Construct Library Set IGVFDS0000CSLB/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Guide library of TF binding sites$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a ConstructLibrarySet component with expression vector library details", () => {
    const item = {
      "@id": "/construct-libraries/IGVFDS7866HNNG/",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
      accession: "IGVFDS7866HNNG",
      aliases: ["igvf:basic_construct_library_0"],
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      scope: "loci",
      loci: [
        {
          assembly: "GRCh38",
          chromosome: "chr1",
          end: 10,
          start: 1,
        },
        {
          assembly: "GRCh38",
          chromosome: "chr1",
          end: 23352,
          start: 3232,
        },
        {
          assembly: "GRCh38",
          chromosome: "chr1",
          end: 3252,
          start: 23,
        },
      ],
      selection_criteria: [
        "transcription start sites",
        "accessible genome regions",
        "candidate cis-regulatory elements",
      ],
      status: "released",
      summary: "Expression Vector library of transcription start sites",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <ConstructLibrarySet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Construct Library Set IGVFDS7866HNNG/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      /^Expression Vector library of transcription start sites$/
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a ConstructLibrarySet component with no loci", () => {
    const item = {
      "@id": "/construct-library-sets/IGVFDS8297XTDJ/",
      "@type": ["ConstructLibrarySet", "FileSet", "Item"],
      accession: "IGVFDS8297XTDJ",
      aliases: ["igvf:basic_construct_library_set_1"],
      file_set_type: "expression vector library",
      genes: [
        {
          symbol: "CD1D",
        },
      ],
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      scope: "genes",
      selection_criteria: ["accessible genome regions"],
      status: "released",
      summary: "Expression vector library of CD1D (accessible genome regions)",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <ConstructLibrarySet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Construct Library Set IGVFDS8297XTDJ/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      /^Expression vector library of CD1D \(accessible genome regions\)$/
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Document component", () => {
  it("renders a document item", () => {
    const item = {
      "@id": "/documents/c7870a38-4286-42fc-9551-22436306e22a/",
      "@type": ["Document", "Item"],
      aliases: ["j-michael-cherry:characterization_immunofluorescence_insert"],
      attachment: {
        download: "mouse_H3K4me3_07-473_validation_Hardison.pdf",
        md5sum: "a7c2c98ff7d0f198fdbc6f0ccbfcb411",
        href: "@@download/attachment/mouse_H3K4me3_07-473_validation_Hardison.pdf",
        type: "application/pdf",
      },
      award: "/awards/1UM1HG011996-01/",
      description: "Characterization of a sample using immunofluorescence.",
      document_type: "characterization",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      status: "in progress",
      submitted_by: "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
      uuid: "c7870a38-4286-42fc-9551-22436306e22a",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Document item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Document/);
    expect(uniqueId).toHaveTextContent(
      /mouse_H3K4me3_07-473_validation_Hardison.pdf$/
    );

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      /^Characterization of a sample using immunofluorescence.$/
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent("characterization");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("in progress");
  });
});

describe("Test Gene component", () => {
  it("renders a gene item with synonyms", () => {
    const item = {
      "@id": "/genes/ENSG00000163930/",
      "@type": ["Gene", "Item"],
      dbxrefs: ["UniProtKB:F8W6N3"],
      geneid: "ENSG00000163930",
      status: "released",
      symbol: "BAP1",
      synonyms: ["UCHL2", "HUCEP-13", "KIAA0272", "hucep-6"],
      title: "BAP1 (Homo sapiens)",
      uuid: "fff95719-346c-471f-8b72-8a05c0102b1b",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Gene item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Gene/);
    expect(uniqueId).toHaveTextContent(/ENSG00000163930$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^BAP1 \(Homo sapiens\)$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("BAP1");
    expect(meta).toHaveTextContent("UCHL2, HUCEP-13, KIAA0272, hucep-6");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a gene item without synonyms", () => {
    const item = {
      "@id": "/genes/ENSG00000163930/",
      "@type": ["Gene", "Item"],
      dbxrefs: ["UniProtKB:F8W6N3"],
      geneid: "ENSG00000163930",
      status: "released",
      symbol: "BAP1",
      title: "BAP1 (Homo sapiens)",
      uuid: "fff95719-346c-471f-8b72-8a05c0102b1b",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Gene item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Gene/);
    expect(uniqueId).toHaveTextContent(/ENSG00000163930$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^BAP1 \(Homo sapiens\)$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("BAP1");
    expect(meta).not.toHaveTextContent("UCHL2");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the HumanDonor component", () => {
  it("renders a human donor item", () => {
    const item = {
      "@id": "/human-donors/IGVFDO856PXB/",
      "@type": ["HumanDonor", "Donor", "Item"],
      accession: "IGVFDO856PXB",
      alternate_accessions: ["IGVFDO856PXC"],
      aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
      award: "/awards/1U01HG012079-01/",
      ethnicities: ["African American"],
      lab: { "@id": "/labs/chongyuan-luo/", title: "Chongyuan Luo" },
      sex: "female",
      status: "released",
      taxa: "Homo sapiens",
      uuid: "ee99221f-a11a-4f8b-baf3-9919db92f2f9",
      collections: ["ENCODE"],
      phenotypic_features: [
        "/phenotypic-features/123/",
        "/phenotypic-features/456/",
        "/phenotypic-features/111/",
      ],
    };
    const accessoryData = {
      "/phenotypic-features/123/": {
        lab: "/labs/j-michael-cherry/",
        award: "/awards/HG012012/",
        notes: "Phenotypic feature of body weight",
        status: "released",
        feature: {
          "@id": "/phenotype-terms/NCIT_C92648/",
          term_id: "NCIT:C92648",
          term_name: "Body Weight Measurement",
        },
        quantity: 58,
        quantity_units: "kilogram",
        schema_version: "1",
        observation_date: "2022-11-15",
        creation_timestamp: "2023-03-13T23:26:17.586384+00:00",
        "@id": "/phenotypic-features/123/",
        "@type": ["PhenotypicFeature", "Item"],
        uuid: "123",
        summary: "123",
        "@context": "/terms/",
      },
      "/phenotypic-features/456/": {
        lab: "/labs/j-michael-cherry/",
        award: "/awards/HG012012/",
        status: "released",
        feature: {
          "@id": "/phenotype-terms/NCIT_C92648/",
          term_id: "NCIT:C92648",
          term_name: "Some other phenotype",
        },
        schema_version: "1",
        observation_date: "2022-11-15",
        creation_timestamp: "2023-03-13T23:26:17.586384+00:00",
        "@id": "/phenotypic-features/123/",
        "@type": ["PhenotypicFeature", "Item"],
        uuid: "123",
        summary: "123",
        "@context": "/terms/",
      },
      "/phenotypic-features/111/": {
        lab: "/labs/j-michael-cherry/",
        award: "/awards/HG012012/",
        status: "released",
        feature: {
          "@id": "/phenotype-terms/NCIT_C92648/",
          term_id: "NCIT:C92648",
          term_name: "Weight",
        },
        quantity: 1,
        quantity_units: "gram",
        schema_version: "1",
        observation_date: "2022-11-15",
        creation_timestamp: "2023-03-13T23:26:17.586384+00:00",
        "@id": "/phenotypic-features/123/",
        "@type": ["PhenotypicFeature", "Item"],
        uuid: "123",
        summary: "123",
        "@context": "/terms/",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <HumanDonor item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Human Donor/);
    expect(uniqueId).toHaveTextContent(/IGVFDO856PXB$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^African American female$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Chongyuan Luo");
    expect(meta).toHaveTextContent("Body Weight Measurement");
    expect(meta).toHaveTextContent("58 kilograms");
    expect(meta).toHaveTextContent("Some other phenotype");
    expect(meta).toHaveTextContent("1 gram");
    expect(meta).toHaveTextContent("ENCODE");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");

    const paths = HumanDonor.getAccessoryDataPaths([item]);
    expect(paths.sort()).toEqual([
      {
        type: "PhenotypicFeature",
        paths: [
          "/phenotypic-features/123/",
          "/phenotypic-features/456/",
          "/phenotypic-features/111/",
        ],
        fields: ["quantity", "quantity_units", "feature"],
      },
    ]);
  });

  it("renders a human donor item without accessory data", () => {
    const item = {
      "@id": "/human-donors/IGVFDO856PXB/",
      "@type": ["HumanDonor", "Donor", "Item"],
      accession: "IGVFDO856PXB",
      aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
      award: "/awards/1U01HG012079-01/",
      ethnicities: ["African American"],
      lab: { "@id": "/labs/chongyuan-luo/", title: "Chongyuan Luo" },
      sex: "female",
      status: "released",
      taxa: "Homo sapiens",
      uuid: "ee99221f-a11a-4f8b-baf3-9919db92f2f9",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <HumanDonor item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Human Donor/);
    expect(uniqueId).toHaveTextContent(/IGVFDO856PXB$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^African American female$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Chongyuan Luo");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a human donor item without ethnicities nor sex", () => {
    const item = {
      "@id": "/human-donors/IGVFDO856PXB/",
      "@type": ["HumanDonor", "Donor", "Item"],
      accession: "IGVFDO856PXB",
      alternate_accessions: ["IGVFDO856PXC"],
      aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
      award: "/awards/1U01HG012079-01/",
      lab: "/labs/chongyuan-luo/",
      status: "released",
      taxa: "Homo sapiens",
      uuid: "ee99221f-a11a-4f8b-baf3-9919db92f2f9",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <HumanDonor item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Human Donor/);
    expect(uniqueId).toHaveTextContent(/IGVFDO856PXB$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^\/human-donors\/IGVFDO856PXB\/$/);

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the Lab component", () => {
  it("renders a lab item", () => {
    const item = {
      "@id": "/labs/hyejung-won/",
      "@type": ["Lab", "Item"],
      awards: [
        {
          name: "1UM1HG012003-01",
        },
      ],
      institute_label: "UNC",
      name: "hyejung-won",
      pi: "/users/7e51864b-2e2b-40cf-9abc-5cc2dc98f35d/",
      status: "current",
      title: "Hyejung Won, UNC",
      uuid: "fe27c988-4664-4245-a1ca-bab9e1c62a00",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Lab item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Lab/);
    expect(uniqueId).toHaveTextContent(/hyejung-won$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Hyejung Won, UNC$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("1UM1HG012003-01");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("current");
  });

  it("renders a lab item without the optional award", () => {
    const item = {
      "@id": "/labs/hyejung-won/",
      "@type": ["Lab", "Item"],
      institute_label: "UNC",
      name: "hyejung-won",
      pi: "/users/7e51864b-2e2b-40cf-9abc-5cc2dc98f35d/",
      status: "current",
      title: "Hyejung Won, UNC",
      uuid: "fe27c988-4664-4245-a1ca-bab9e1c62a00",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Lab item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Lab/);
    expect(uniqueId).toHaveTextContent(/hyejung-won$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Hyejung Won, UNC$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("current");
  });
});

describe("Test OpenReadingFrame component", () => {
  it("renders a orf item with protein_id", () => {
    const item = {
      "@id": "/open-reading-frames/CCSBORF1234/",
      "@type": ["OpenReadingFrame", "Item"],
      dbxrefs: ["hORFeome:8945"],
      gene: ["/genes/ENSG00000163930/"],
      status: "released",
      orf_id: "CCSBORF1234",
      protein_id: "ENSP00000001146.2",
      uuid: "d300d307-8fd2-4f4c-98fc-6406256b09e0",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <OpenReadingFrame item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Open Reading Frame/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^CCSBORF1234/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("ENSP00000001146.2");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders an OpenReadingFrame item without protein_id", () => {
    const item = {
      "@id": "/open-reading-frames/CCSBORF1234/",
      "@type": ["OpenReadingFrame", "Item"],
      dbxrefs: ["hORFeome:8945"],
      gene: ["/genes/ENSG00000163930/"],
      status: "released",
      orf_id: "CCSBORF1234",
      uuid: "d300d307-8fd2-4f4c-98fc-6406256b09e0",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <OpenReadingFrame item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Open Reading Frame/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^CCSBORF1234/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the Page component", () => {
  it("renders a page item", () => {
    const item = {
      "@id": "/help/donors/human-donors/",
      "@type": ["Page", "Item"],
      lab: "/labs/j-michael-cherry/",
      name: "human-donors",
      parent: "/help/donors/",
      status: "released",
      title: "Human Donors",
      uuid: "d91b048e-2d8a-4562-893d-93f0e68397c0",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Page item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Page/);
    expect(uniqueId).toHaveTextContent(/\/help\/donors\/human-donors\/$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Human Donors$/);

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the RodentDonor component", () => {
  it("renders a RodentDonor item", () => {
    const item = {
      "@id": "/rodent-donors/IGVFDO524ORO/",
      "@type": ["RodentDonor", "Donor", "Item"],
      accession: "IGVFDO524ORO",
      alternate_accessions: ["IGVFDO524ORP"],
      aliases: [
        "j-michael-cherry:alias_rodent_donor_1",
        "j-michael-cherry:rodent_donor_with_arterial_blood_pressure_trait",
      ],
      award: {
        component: "data coordination",
        name: "HG012012",
        "@id": "/awards/HG012012/",
      },
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      sex: "male",
      status: "released",
      strain: "some name",
      taxa: "Mus musculus",
      uuid: "c37934b0-4269-4470-be53-9eac7b196447",
      collections: ["ENCODE"],
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <RodentDonor item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^RodentDonor/);
    expect(uniqueId).toHaveTextContent(/IGVFDO524ORO$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^some name male$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent("ENCODE");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a RodentDonor item with accessory data", () => {
    const item = {
      "@id": "/rodent-donors/IGVFDO524ORO/",
      "@type": ["RodentDonor", "Donor", "Item"],
      accession: "IGVFDO524ORO",
      alternate_accessions: ["IGVFDO524ORP"],
      aliases: [
        "j-michael-cherry:alias_rodent_donor_1",
        "j-michael-cherry:rodent_donor_with_arterial_blood_pressure_trait",
      ],
      award: {
        component: "data coordination",
        name: "HG012012",
        "@id": "/awards/HG012012/",
      },
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      sex: "male",
      status: "released",
      strain: "some name",
      taxa: "Mus musculus",
      uuid: "c37934b0-4269-4470-be53-9eac7b196447",
      collections: ["ENCODE"],
      phenotypic_features: [
        "/phenotypic-features/abc123/",
        "/phenotypic-features/123abc",
        "/phenotypic-features/999",
      ],
    };

    const accessoryData = {
      "/phenotypic-features/abc123/": {
        feature: {
          term_name: "a special feature",
          term_id: "HELLO:12345",
        },
      },
      "/phenotypic-features/123abc": {
        feature: {
          term_name: "another quant feature",
          term_id: "BYE:4567",
        },
        quantity: 20,
        quantity_units: "kilogram",
      },
      "/phenotypic-features/999": {
        feature: {
          term_name: "one thing",
          term_id: "ONE:111",
        },
        quantity: 1,
        quantity_units: "gram",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <RodentDonor item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^RodentDonor/);
    expect(uniqueId).toHaveTextContent(/IGVFDO524ORO$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^some name male$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent("ENCODE");
    expect(meta).toHaveTextContent("a special feature");
    expect(meta).toHaveTextContent("20 kilograms");
    expect(meta).toHaveTextContent("1 gram");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");

    const paths = RodentDonor.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      {
        type: "PhenotypicFeature",
        paths: [
          "/phenotypic-features/abc123/",
          "/phenotypic-features/123abc",
          "/phenotypic-features/999",
        ],
        fields: ["quantity", "quantity_units", "feature"],
      },
    ]);
  });

  it("rodent donor without collection", () => {
    const item = {
      "@id": "/rodent-donors/IGVFDO524OROXYZ/",
      "@type": ["RodentDonor", "Donor", "Item"],
      accession: "IGVFDO524OROXYZ",
      aliases: [
        "j-michael-cherry:alias_rodent_donor_1",
        "j-michael-cherry:rodent_donor_with_arterial_blood_pressure_trait",
      ],
      award: {
        component: "data coordination",
        name: "HG012012",
        "@id": "/awards/HG012012/",
      },
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      sex: "male",
      status: "released",
      strain: "some name",
      taxa: "Mus musculus",
      uuid: "c37934b0-4269-4470-be53-9eac7b196447",
    };
    render(
      <SessionContext.Provider value={{ profiles }}>
        <RodentDonor item={item} />
      </SessionContext.Provider>
    );
    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).not.toHaveTextContent("ENCODE");
  });
});

describe("Test the TechnicalSample component", () => {
  it("renders a TechnicalSample item with accessory data", () => {
    const item = {
      "@id": "/technical-samples/IGVFSM515BSZ/",
      "@type": ["TechnicalSample", "Sample", "Item"],
      accession: "IGVFSM515BSZ",
      alternate_accessions: ["IGVFSM515BSA"],
      award: "/awards/HG012012/",
      date_obtained: "2022-04-09",
      description: "The technical sample was archived due to poor quality.",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      status: "archived",
      sample_terms: [
        {
          term_name: "technical sample",
          "@id": "/sample-terms/NTR_0000637/",
        },
      ],
      uuid: "f12ab44c-bba8-46cc-9f3d-6a192eb09e7e",
      summary: "Technical Sample Summary",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <TechnicalSample item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^TechnicalSample/);
    expect(uniqueId).toHaveTextContent(/IGVFSM515BSZ$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("Technical Sample Summary");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("archived");
  });
});

describe("Test User component", () => {
  it("renders a User item with accessory data", () => {
    const item = {
      "@id": "/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/",
      "@type": ["User", "Item"],
      lab: "/labs/christina-leslie/",
      title: "Christina Leslie",
      uuid: "fa9feeb4-28ba-4356-8c24-50f4e6562029",
    };
    const accessoryData = {
      "/labs/christina-leslie/": {
        "@id": "/labs/christina-leslie/",
        "@type": ["Lab", "Item"],
        title: "Christina Leslie, MSKCC",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <User item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^User/);
    expect(uniqueId).toHaveTextContent(/fa9feeb4-28ba-4356-8c24-50f4e6562029$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Christina Leslie$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Christina Leslie, MSKCC");

    const paths = User.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      {
        type: "Lab",
        paths: ["/labs/christina-leslie/"],
        fields: ["title"],
      },
    ]);
  });

  it("renders a User item without accessory data", () => {
    const item = {
      "@id": "/users/fa9feeb4-28ba-4356-8c24-50f4e6562029/",
      "@type": ["User", "Item"],
      lab: "/labs/christina-leslie/",
      title: "Christina Leslie",
      uuid: "fa9feeb4-28ba-4356-8c24-50f4e6562029",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <User item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^User/);
    expect(uniqueId).toHaveTextContent(/fa9feeb4-28ba-4356-8c24-50f4e6562029$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Christina Leslie$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();
  });
});

describe("Test File component", () => {
  it("renders a File item with a summary", () => {
    const item = {
      "@id": "/reference-file/IGVFFI0000SQBR/",
      "@type": ["ReferenceFile", "File", "Item"],
      accession: "IGVFFI0000SQBR",
      alternate_accessions: ["IGVFFI0000SQBS"],
      file_format: "txt",
      content_type: "sequence barcodes",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      summary: "IGVFFI0000SQBR",
      uuid: "fa9feeb4-28ba-4356-8c24-50f4e6562029",
      status: "released",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <File item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Reference File/);
    expect(uniqueId).toHaveTextContent(/IGVFFI0000SQBR$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^txt - sequence barcodes$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent("IGVFFI0000SQBS");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a File item without summary", () => {
    const item = {
      "@id": "/reference-file/IGVFFI0000SQBR/",
      "@type": ["ReferenceFile", "File", "Item"],
      accession: "IGVFFI0000SQBR",
      alternate_accessions: ["IGVFFI0000SQBS"],
      file_format: "txt",
      content_type: "sequence barcodes",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      uuid: "fa9feeb4-28ba-4356-8c24-50f4e6562029",
      status: "released",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <File item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Reference File/);
    expect(uniqueId).toHaveTextContent(/IGVFFI0000SQBR$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^txt - sequence barcodes$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).not.toHaveTextContent("IGVFFI0000SQBR");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");

    const supplement = screen.queryByTestId("search-list-item-supplement");
    expect(supplement).toBeNull();
  });
});

it("renders a File item with accessory data", () => {
  const item = {
    "@id": "/sequence-file/IGVFFI0000SEQU/",
    "@type": ["SequenceFile", "File", "Item"],
    accession: "IGVFFI0000SEQU",
    alternate_accessions: ["IGVFFI0000SEQV"],
    file_format: "fastq",
    content_type: "reads",
    lab: {
      title: "J. Michael Cherry, Stanford",
    },
    summary: "IGVFFI0000SEQU",
    uuid: "1aaaa72d-92da-4c7a-93af-388f56d559ac",
    status: "released",
    file_set: "/analysis-sets/IGVFDS1099XPXL/",
    dbxrefs: ["SRA:SRR12345"],
    illumina_read_type: "R1",
    sequencing_run: 1,
  };
  const accessoryData = {
    "/analysis-sets/IGVFDS1099XPXL/": {
      "@id": "/analysis-sets/IGVFDS1099XPXL/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      summary: "IGVFDS1099XPXL",
      lab: "/labs/lea-starita/",
      award: "/awards/HG012012/",
      uuid: "e3a11f9a-6da6-40e4-8334-3a6c98e39935",
    },
  };

  render(
    <SessionContext.Provider value={{ profiles }}>
      <File item={item} accessoryData={accessoryData} />
    </SessionContext.Provider>
  );

  const uniqueId = screen.getByTestId("search-list-item-unique-id");
  expect(uniqueId).toHaveTextContent(/^Sequence File/);
  expect(uniqueId).toHaveTextContent(/IGVFFI0000SEQU$/);

  const title = screen.getByTestId("search-list-item-title");
  expect(title).toHaveTextContent(/^fastq - reads - R1$/);

  const meta = screen.getByTestId("search-list-item-meta");
  expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
  expect(meta).toHaveTextContent("IGVFFI0000SEQV");
  expect(meta).toHaveTextContent("SRA:SRR12345");

  const status = screen.getByTestId("search-list-item-quality");
  expect(status).toHaveTextContent("released");

  const supplement = screen.queryByTestId("search-list-item-supplement");
  expect(supplement).toHaveTextContent("IGVFDS1099XPXL");

  const paths = File.getAccessoryDataPaths([item]);
  expect(paths).toEqual([
    {
      type: "File",
      paths: ["/analysis-sets/IGVFDS1099XPXL/"],
      fields: ["@id", "summary"],
    },
  ]);
});

it("renders a seqspec configuration File item with accessory data", () => {
  const item = {
    "@id": "/configuration-file/IGVFFI1234CONF/",
    "@type": ["ConfigurationFile", "File", "Item"],
    accession: "IGVFFI1234CONF",
    alternate_accessions: ["IGVFFI4321FNOC"],
    file_format: "yaml",
    content_type: "seqspec",
    lab: {
      title: "J. Michael Cherry, Stanford",
    },
    summary: "IGVFFI1234CONF",
    uuid: "ef55ccbc-fb2e-4c12-81b4-fa466c94bd38",
    status: "released",
    file_set: "/measurement-sets/IGVFDS6408BFHD/",
    seqspec_of: [
      "/sequence-files/IGVFFI0000SEQU/",
      "/sequence-files/IGVFDS8812ASDF/",
    ],
  };
  const accessoryData = {
    "/measurement-sets/IGVFDS6408BFHD/": {
      "@id": "/measurement-sets/IGVFDS6408BFHD/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      summary: "STARR-seq",
      lab: "/labs/lea-starita/",
      award: "/awards/HG012012/",
      uuid: "1c87db3a-86a3-41d5-a4ea-96dd9341667d",
    },
    "/sequence-files/IGVFFI0000SEQU/": {
      "@id": "/sequence-file/IGVFFI0000SEQU/",
      "@type": ["SequenceFile", "File", "Item"],
      accession: "IGVFFI0000SEQU",
      alternate_accessions: ["IGVFFI0000SEQV"],
      file_format: "fastq",
      content_type: "reads",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      summary: "IGVFFI0000SEQU",
      uuid: "fcc11bf7-82ed-4074-a501-acc9c44ceb11",
      status: "released",
      file_set: "/analysis-sets/IGVFDS6408BFHD/",
      dbxrefs: ["SRA:SRR12345"],
      illumina_read_type: "R1",
      sequencing_run: 1,
      seqspec: "/configuration-file/IGVFFI1234CONF/",
    },
    "/sequence-files/IGVFDS8812ASDF/": {
      "@id": "/sequence-file/IGVFDS8812ASDF/",
      "@type": ["SequenceFile", "File", "Item"],
      accession: "IGVFDS8812ASDF",
      alternate_accessions: ["IGVFDS8812ASDQ"],
      file_format: "fastq",
      content_type: "reads",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      summary: "IGVFFI0000SEQU",
      uuid: "7bf24dce-f512-49d7-8688-dbcd927679d7",
      status: "released",
      file_set: "/analysis-sets/IGVFDS6408BFHD/",
      dbxrefs: ["SRA:SRR12346"],
      illumina_read_type: "R2",
      sequencing_run: 1,
      seqspec: "/configuration-file/IGVFFI1234CONF/",
    },
  };

  render(
    <SessionContext.Provider value={{ profiles }}>
      <File item={item} accessoryData={accessoryData} />
    </SessionContext.Provider>
  );

  const uniqueId = screen.getByTestId("search-list-item-unique-id");
  expect(uniqueId).toHaveTextContent(/^ConfigurationFile/);
  expect(uniqueId).toHaveTextContent(/IGVFFI1234CONF$/);

  const title = screen.getByTestId("search-list-item-title");
  expect(title).toHaveTextContent(/^yaml - seqspec$/);

  const meta = screen.getByTestId("search-list-item-meta");
  expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

  const status = screen.getByTestId("search-list-item-quality");
  expect(status).toHaveTextContent("released");

  const supplement = screen.queryByTestId("search-list-item-supplement");
  expect(supplement).toHaveTextContent("STARR-seq");
  expect(supplement).toHaveTextContent("IGVFFI0000SEQU, IGVFDS8812ASDF");

  const paths = File.getAccessoryDataPaths([item]);
  expect(paths).toEqual([
    {
      type: "File",
      paths: ["/measurement-sets/IGVFDS6408BFHD/"],
      fields: ["@id", "summary"],
    },
    {
      type: "File",
      paths: [
        "/sequence-files/IGVFFI0000SEQU/",
        "/sequence-files/IGVFDS8812ASDF/",
      ],
      fields: ["accession"],
    },
  ]);
});

describe("Test the AnalysisSet component", () => {
  it("renders an AnalysisSet item", () => {
    const item = {
      "@id": "/analysis-sets/IGVFDS0390NOLS/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS3099XPLN",
      alternate_accessions: ["IGVFDS3099XPLO"],
      aliases: ["igvf:basic_analysis_set"],
      award: "/awards/HG012012/",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      summary: "IGVFDS3099XPLN",
      input_file_sets: [
        {
          aliases: ["igvf:basic_analysis_set"],
          accession: "IGVFDS3099XPLN",
          "@id": "/analysis-sets/IGVFDS3099XPLN/",
        },
        {
          aliases: ["igvf:basic_analysis_set_2"],
          accession: "IGVFDS0390NOLS",
          "@id": "/analysis-sets/IGVFDS0390NOLS/",
        },
      ],
      uuid: "609869e7-cbd9-4d06-9569-d3fdb4604ccd",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Analysis Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS3099XPLN$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Analysis$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent("IGVFDS3099XPLN");

    const supplement = screen.queryByTestId(
      "search-list-item-supplement-content"
    );
    expect(supplement).toHaveTextContent("IGVFDS3099XPLN, IGVFDS0390NOLS");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders an AnalysisSet item without accessory data and summary", () => {
    const item = {
      "@id": "/analysis-sets/IGVFDS0390NOLS/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS0390NOLS",
      aliases: ["igvf:basic_analysis_set_2"],
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      uuid: "609869e7-cbd9-4d06-9569-d3fdb4604ccd",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Analysis Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS0390NOLS$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Analysis$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent(/^J. Michael Cherry, Stanford$/);

    const supplement = screen.queryByTestId("search-list-item-supplement");
    expect(supplement).toBeNull();

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the CuratedSet component", () => {
  it("renders a CuratedSet item", () => {
    const item = {
      "@id": "/curated-sets/IGVFDS0000AAAA/",
      "@type": ["CuratedSet", "FileSet", "Item"],
      accession: "IGVFDS0000AAAA",
      alternate_accessions: ["IGVFDS0000AAAB"],
      aliases: ["igvf-dacc:GRCh38.p14_assembly"],
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/tim-reddy/",
        title: "Tim Reddy, Duke",
      },
      status: "released",
      taxa: "Homo sapiens",
      summary: "IGVFDS0000AAAA",
      uuid: "40f1e08c-5d6d-4d19-8f69-3fd91420c09f",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <CuratedSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^CuratedSet/);
    expect(uniqueId).toHaveTextContent(/IGVFDS0000AAAA$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Curated set$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Tim Reddy, Duke");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a CuratedSet item without summary", () => {
    const item = {
      "@id": "/curated-sets/IGVFDS0000AAAA/",
      "@type": ["CuratedSet", "FileSet", "Item"],
      accession: "IGVFDS0000AAAA",
      aliases: ["igvf-dacc:GRCh38.p14_assembly"],
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/tim-reddy/",
        title: "Tim Reddy, Duke",
      },
      status: "released",
      taxa: "Homo sapiens",
      uuid: "40f1e08c-5d6d-4d19-8f69-3fd91420c09f",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <CuratedSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^CuratedSet/);
    expect(uniqueId).toHaveTextContent(/IGVFDS0000AAAA$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Curated set$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Tim Reddy, Duke");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the MeasurementSet component", () => {
  it("renders a MeasurementSet item with one sample", () => {
    const item = {
      "@id": "/measurement-sets/IGVFDS6408BFHD/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      accession: "IGVFDS6408BFHD",
      alternate_accessions: ["IGVFDS6408BFHE"],
      aliases: ["igvf:basic_measurement_set"],
      award: "/awards/HG012012/",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      samples: [
        {
          "@id": "/primary-cells/IGVFSM0000EEEE/",
          accession: "IGVFSM0000EEEE",
          aliases: ["igvf:alias10"],
          donors: [
            {
              "@id": "/human-donors/IGVFDO6569ZRDK/",
              accession: "IGVFDO6569ZRDK",
              aliases: ["igvf:alias_human_donor2"],
              summary: "IGVFDO6569ZRDK",
              taxa: "Homo sapiens",
            },
          ],
          sample_terms: ["/sample-terms/CL_0011001/"],
          summary: "motor neuron primary cell, Homo sapiens (40-45 years)",
          taxa: "Homo sapiens",
        },
      ],
      status: "released",
      summary: "imaging assay (yN2H)",
      uuid: "67380d9f-06da-f9fe-9569-d31ce0607eae",
      assay_term: {
        term_name: "STARR-seq",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <MeasurementSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Measurement Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS6408BFHD$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^imaging assay \(yN2H\)$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a MeasurementSet item with more than one sample", () => {
    const item = {
      "@id": "/measurement-sets/IGVFDS6408BFHD/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      accession: "IGVFDS6408BFHD",
      alternate_accessions: ["IGVFDS6408BFHE"],
      aliases: ["igvf:basic_measurement_set"],
      award: "/awards/HG012012/",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      samples: [
        {
          "@id": "/tissues/IGVFSM0001DDDD/",
          accession: "IGVFSM0001DDDD",
          aliases: ["igvf:treated_tissue"],
          donors: [
            {
              "@id": "/rodent-donors/IGVFDO1668BXAE/",
              accession: "IGVFDO1668BXAE",
              aliases: [
                "igvf:alias_rodent_donor_1",
                "igvf:rodent_donor_with_arterial_blood_pressure_trait",
              ],
              summary: "IGVFDO1668BXAE",
              taxa: "Mus musculus",
            },
          ],
          sample_terms: ["/sample-terms/UBERON_0002048/"],
          summary: "lung tissue, Mus musculus (10-20 weeks)",
          taxa: "Mus musculus",
        },
        {
          "@id": "/tissues/IGVFSM0003DDDD/",
          accession: "IGVFSM0003DDDD",
          aliases: ["igvf:tissue_part_of_tissue"],
          donors: [
            {
              "@id": "/rodent-donors/IGVFDO5425ETYH/",
              accession: "IGVFDO5425ETYH",
              aliases: ["igvf:alias_rodent_donor_2"],
              summary: "IGVFDO5425ETYH",
              taxa: "Mus musculus",
            },
          ],
          sample_terms: ["/sample-terms/UBERON_0002048/"],
          summary: "lung tissue, Mus musculus (10-20 months)",
          taxa: "Mus musculus",
        },
      ],
      status: "released",
      summary: "imaging assay (yN2H)",
      uuid: "67380d9f-06da-f9fe-9569-d31ce0607eae",
      assay_term: {
        term_name: "STARR-seq",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <MeasurementSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Measurement Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS6408BFHD$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^imaging assay \(yN2H\)$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a MeasurementSet item without samples", () => {
    const item = {
      "@id": "/measurement-sets/IGVFDS6408BFHD/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      accession: "IGVFDS6408BFHD",
      alternate_accessions: ["IGVFDS6408BFHE"],
      aliases: ["igvf:basic_measurement_set"],
      award: "/awards/HG012012/",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      summary: "imaging assay (yN2H)",
      uuid: "67380d9f-06da-f9fe-9569-d31ce0607eae",
      assay_term: {
        term_name: "STARR-seq",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <MeasurementSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Measurement Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS6408BFHD$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^imaging assay \(yN2H\)$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the Software component", () => {
  it("renders a Software item", () => {
    const item = {
      "@id": "/software/bowtie2/",
      "@type": ["Software", "Item"],
      name: "bowtie2",
      title: "Bowtie2",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Software item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Software/);
    expect(uniqueId).toHaveTextContent(/bowtie2$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Bowtie2$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the SoftwareVersion component", () => {
  it("renders a SoftwareVersion item", () => {
    const item = {
      "@id": "/software-versions/bowtie2-v2.4.4/",
      "@type": ["SoftwareVersion", "Item"],
      software: {
        title: "Bowtie2",
      },
      version: "2.4.4",
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      uuid: "67380d9f-06da-f9fe-9569-d31ce0607eae",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <SoftwareVersion item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Software/);
    expect(uniqueId).toHaveTextContent(/Bowtie2 2.4.4$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Bowtie2 2.4.4$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the Source component", () => {
  it("renders a Source item", () => {
    const item = {
      name: "aviva",
      title: "Aviva",
      status: "released",
      description: "Aviva Systems Biology",
      "@id": "/sources/aviva/",
      "@type": ["Source", "Item"],
      uuid: "fa701215-07e6-4ffe-a8f4-20356d66f3e0",
      summary: "aviva",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Source item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Source/);
    expect(uniqueId).toHaveTextContent(/Aviva$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Aviva$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Aviva Systems Biology");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the Publication component", () => {
  it("renders a Publication item", () => {
    const item = {
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      page: "57-74",
      award: "/awards/HG012012/",
      issue: "7414",
      title: "An integrated encyclopedia of DNA elements in the human genome",
      status: "released",
      volume: "489",
      authors:
        "ENCODE Project Consortium, Bernstein BE, Birney E, Dunham I, Green ED, Gunter C, Snyder M.",
      journal: "Nature",
      publication_identifiers: ["PMID:22955616", "PMCID:PMC3439153"],
      date_published: "2012-09-06",
      "@id": "/publications/936b0798-3d6b-4b2f-a357-2bd59faae506/",
      "@type": ["Publication", "Item"],
      uuid: "936b0798-3d6b-4b2f-a357-2bd59faae506",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Publication item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Publication/);
    expect(uniqueId).toHaveTextContent(/PMID:22955616$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      /^An integrated encyclopedia of DNA elements in the human genome$/
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent(
      "ENCODE Project Consortium, Bernstein BE, Birney E, Dunham I, Green ED, Gunter C, Snyder M."
    );
    expect(meta).toHaveTextContent("Nature. 2012-09-06;489(7414):57-74.");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a Publication item without data for meta area", () => {
    const item = {
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      page: "57-74",
      award: "/awards/HG012012/",
      issue: "7414",
      title: "An integrated encyclopedia of DNA elements in the human genome",
      status: "released",
      volume: "489",
      publication_identifiers: ["PMID:22955616", "PMCID:PMC3439153"],
      "@id": "/publications/936b0798-3d6b-4b2f-a357-2bd59faae506/",
      "@type": ["Publication", "Item"],
      uuid: "936b0798-3d6b-4b2f-a357-2bd59faae506",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Publication item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Publication/);
    expect(uniqueId).toHaveTextContent(/PMID:22955616$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      /^An integrated encyclopedia of DNA elements in the human genome$/
    );

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).not.toHaveTextContent("ENCODE Project Consortium");
    expect(meta).not.toHaveTextContent("Nature.");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a Publication item with publication date", () => {
    const item = {
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      award: "/awards/HG012012/",
      title: "An integrated encyclopedia of DNA elements in the human genome",
      status: "released",
      publication_identifiers: ["PMID:22955616", "PMCID:PMC3439153"],
      "@id": "/publications/936b0798-3d6b-4b2f-a357-2bd59faae506/",
      "@type": ["Publication", "Item"],
      uuid: "936b0798-3d6b-4b2f-a357-2bd59faae506",
      date_published: "2012-09-06",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Publication item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Publication/);
    expect(uniqueId).toHaveTextContent(/PMID:22955616$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      /^An integrated encyclopedia of DNA elements in the human genome$/
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("2012-09-06;");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a Publication item with journal", () => {
    const item = {
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      award: "/awards/HG012012/",
      title: "An integrated encyclopedia of DNA elements in the human genome",
      status: "released",
      publication_identifiers: ["PMID:22955616", "PMCID:PMC3439153"],
      "@id": "/publications/936b0798-3d6b-4b2f-a357-2bd59faae506/",
      "@type": ["Publication", "Item"],
      uuid: "936b0798-3d6b-4b2f-a357-2bd59faae506",
      journal: "Nature",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Publication item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Publication/);
    expect(uniqueId).toHaveTextContent(/PMID:22955616$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      /^An integrated encyclopedia of DNA elements in the human genome$/
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Nature.");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the Biomarker component", () => {
  it("renders a Biomarker item", () => {
    const item = {
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      gene: "/genes/ENSG00000163930/",
      name: "BAP1",
      award: "/awards/HG012012/",
      classification: "marker gene",
      quantification: "positive",
      "@id": "/biomarkers/bdfaa822-cdbe-405c-920c-67da068c43b6/",
      "@type": ["Biomarker", "Item"],
      uuid: "bdfaa822-cdbe-405c-920c-67da068c43b6",
      summary: "bdfaa822-cdbe-405c-920c-67da068c43b6",
      name_quantification: "BAP1-positive",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Biomarker item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Biomarker/);
    expect(uniqueId).toHaveTextContent(/BAP1-positive$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^marker gene BAP1 positive$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
  });
});

describe("Test the Treatment component", () => {
  it("renders a Treatment item with duration data", () => {
    const item = {
      "@id": "/treatments/4fbb0dc2-c72e-11ec-9d64-0242ac120002/",
      "@type": ["Treatment", "Item"],
      amount: 10,
      amount_units: "μg/mL",
      duration: 30,
      duration_units: "minute",
      purpose: "antagonist",
      status: "released",
      treatment_term_id: "CHEBI:27810",
      treatment_term_name: "resorcinol",
      treatment_type: "chemical",
      summary: "Treatment of 10 μg/mL resorcinol for 30 minutes",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      uuid: "4fbb0dc2-c72e-11ec-9d64-0242ac120002",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Treatment item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Treatment/);
    expect(uniqueId).toHaveTextContent(/CHEBI:27810$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title.textContent).toBe(
      "Treatment of 10 μg/mL resorcinol for 30 minutes"
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("chemical");
    expect(meta).toHaveTextContent("antagonist");
  });

  it("renders a Treatment item without duration data", () => {
    const item = {
      "@id": "/treatments/4fbb0dc2-c72e-11ec-9d64-0242ac120002/",
      "@type": ["Treatment", "Item"],
      amount: 10,
      amount_units: "μg/mL",
      purpose: "control",
      status: "released",
      treatment_term_id: "CHEBI:27810",
      treatment_term_name: "resorcinol",
      treatment_type: "protein",
      summary: "Treatment of 10 μg/mL resorcinol",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      uuid: "4fbb0dc2-c72e-11ec-9d64-0242ac120002",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Treatment item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Treatment/);
    expect(uniqueId).toHaveTextContent(/CHEBI:27810$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title.textContent).toBe("Treatment of 10 μg/mL resorcinol");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("protein");
    expect(meta).toHaveTextContent("control");
  });

  it("renders a depletion Treatment item", () => {
    const item = {
      "@id": "/treatments/1c7fafe2-ea6a-4fc1-91cb-e63796f26963/",
      "@type": ["Treatment", "Item"],
      purpose: "differentiation",
      status: "released",
      treatment_term_id: "CHEBI:8062",
      treatment_term_name: "Caffeic acid",
      treatment_type: "chemical",
      duration: 1,
      duration_units: "hour",
      summary: "Depletion of Caffeic acid for 1 hour",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      uuid: "1c7fafe2-ea6a-4fc1-91cb-e63796f26963",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Treatment item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Treatment/);
    expect(uniqueId).toHaveTextContent(/CHEBI:8062$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title.textContent).toBe("Depletion of Caffeic acid for 1 hour");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("chemical");
    expect(meta).toHaveTextContent("differentiation");
  });
});

describe("Test the Human Genomic Variant component", () => {
  it("renders a Human Genomic Variant", () => {
    const item = {
      "@id": "/human-genomic-variants/8138364d-f96b-42b9-a719-42199818c6fc/",
      "@type": ["HumanGenomicVariant", "Variant", "Item"],
      alt: "GC",
      ref: "TG",
      status: "in progress",
      assembly: "GRCh38",
      position: 100000000,
      refseq_id: "NC_000001.1",
      chromosome: "chr1",
      schema_version: "1",
      creation_timestamp: "2023-03-28T05:59:17.412294+00:00",
      selection_criteria:
        "The variant was selected by another lab due to its frequency in an understudied population",
      uuid: "8138364d-f96b-42b9-a719-42199818c6fc",
      summary: "8138364d-f96b-42b9-a719-42199818c6fc",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <HumanGenomicVariant item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^HumanGenomicVariant/);
    expect(uniqueId).toHaveTextContent(/8138364d-f96b-42b9-a719-42199818c6fc$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title.textContent).toBe("chr1:100000000:TG:GC");
  });
});

describe("Test PhenotypicFeature component", () => {
  it("renders an PhenotypicFeature with observation_date and quantity", () => {
    const item = {
      status: "released",
      feature: {
        term_id: "NCIT:C92648",
        term_name: "Body Weight Measurement",
        "@id": "/phenotype-terms/NCIT_C92648/",
      },
      quantity: 58,
      quantity_units: "kilogram",
      observation_date: "2022-11-15",
      "@id": "/phenotypic-features/ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa/",
      "@type": ["PhenotypicFeature", "Item"],
      uuid: "ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa",
      "@context": "/terms/",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <PhenotypicFeature item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Phenotypic Feature/);
    expect(uniqueId).toHaveTextContent(/ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("Body Weight Measurement - 58 kilogram");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("2022-11-15");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders PhenotypicFeature with no observation_date and quantity", () => {
    const item = {
      status: "released",
      feature: {
        term_id: "NCIT:C92648",
        term_name: "Body Weight Measurement",
        "@id": "/phenotype-terms/NCIT_C92648/",
      },
      "@id": "/phenotypic-features/ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa/",
      "@type": ["PhenotypicFeature", "Item"],
      uuid: "ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa",
      "@context": "/terms/",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <PhenotypicFeature item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Phenotypic Feature/);
    expect(uniqueId).toHaveTextContent(/ae1b4a0b-78e6-af0a-8e6d-c0c9b45905fa$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("Body Weight Measurement");

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the ModelSet component", () => {
  it("renders a model-set item without a summary", () => {
    const item = {
      "@id": "/models/IGVFDS1234MODL/",
      "@type": ["ModelSet", "FileSet", "Item"],
      accession: "IGVFDS1234MODL",
      alternate_accessions: ["IGVFDS1234MODM"],
      aliases: ["igvf:xpresso"],
      award: { "@id": "/awards/HG012012/", component: "data coordination" },
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      model_name: "Xpresso",
      prediction_objects: ["genes", "coding variants"],
      status: "released",
      uuid: "609869e7-cbd9-4d06-9569-d3fdb4604ccd",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <ModelSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/ModelSet/);
    expect(uniqueId).toHaveTextContent(/IGVFDS1234MODL$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/Xpresso/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).not.toHaveTextContent("IGVFDS1234MODL");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a model-set item with a summary", () => {
    const item = {
      "@id": "/models/IGVFDS1234MODL/",
      "@type": ["ModelSet", "FileSet", "Item"],
      accession: "IGVFDS1234MODL",
      alternate_accessions: ["IGVFDS1234MODM"],
      aliases: ["igvf:xpresso"],
      award: { "@id": "/awards/HG012012/", component: "data coordination" },
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      model_name: "Xpresso",
      prediction_objects: ["genes", "coding variants"],
      summary: "IGVFDS1234MODL",
      status: "released",
      uuid: "609869e7-cbd9-4d06-9569-d3fdb4604ccd",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <ModelSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/ModelSet/);
    expect(uniqueId).toHaveTextContent(/IGVFDS1234MODL$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/Xpresso/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent("IGVFDS1234MODL");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test AuxiliarySet component", () => {
  it("renders a auxiliary set item", () => {
    const item = {
      "@id": "/auxiliary-sets/IGVFDS0001AUXI/",
      "@type": ["AuxiliarySet", "FileSet", "Item"],
      accession: "IGVFDS0001AUXI",
      aliases: ["igvf:auxiliary_set_1"],
      award: {
        "@id": "/awards/1UM1HG012077-01/",
        component: "mapping",
      },
      description: "An auxiliary set with a sample.",
      file_set_type: "gRNA sequencing",
      lab: {
        "@id": "/labs/ali-mortazavi/",
        title: "Ali Mortazavi, UCI",
      },
      samples: [
        {
          "@id": "/tissues/IGVFSM0001DDDD/",
          accession: "IGVFSM0001DDDD",
          aliases: ["igvf:treated_tissue"],
          donors: [
            {
              "@id": "/rodent-donors/IGVFDO6583PZIO/",
              accession: "IGVFDO6583PZIO",
              aliases: ["igvf:alias_rodent_donor_2"],
              summary: "IGVFDO6583PZIO",
              taxa: "Mus musculus",
            },
          ],
          sample_terms: ["/sample-terms/UBERON_0002048/"],
          summary: "lung tissue, Mus musculus (10-20 weeks)",
          taxa: "Mus musculus",
        },
      ],
      status: "released",
      summary: "gRNA sequencing",
      uuid: "f0c5cba2-ed42-4dae-91dc-4bfd55a11c5b",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AuxiliarySet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Auxiliary Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS0001AUXI$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Ali Mortazavi, UCI");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test MultiplexedSample component", () => {
  it("renders a multiplexed sample item", () => {
    const item = {
      "@id": "/multiplexed-samples/IGVFSM0000MPXD/",
      "@type": ["MultiplexedSample", "Sample", "Item"],
      accession: "IGVFSM0000MPXD",
      award: {
        "@id": "/awards/HG012012/",
        component: "data coordination",
      },
      donors: ["/human-donors/IGVFDO1022ZKSX/"],
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      sample_terms: [
        {
          "@id": "/sample-terms/CL_0011001/",
          term_name: "motor neuron",
        },
      ],
      status: "released",
      summary: "IGVFSM0000MPXD",
      uuid: "c0c56f08-e0b2-44cd-ace6-3f9fcc41366c",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <MultiplexedSample item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Multiplexed Sample/);
    expect(uniqueId).toHaveTextContent(/IGVFSM0000MPXD$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/IGVFSM0000MPXD/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Workflow component", () => {
  it("renders a workflow item", () => {
    const item = {
      "@id": "/workflows/IGVFWF3254CAGQ/",
      "@type": ["Workflow", "Item"],
      accession: "IGVFWF3254CAGQ",
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      name: "Workflow Name",
      summary: "IGVFWF0000WORK",
      uuid: "b750168a-0804-4f7e-acaf-c19fc8abc6d2",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Workflow item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Workflow/);
    expect(uniqueId).toHaveTextContent(/IGVFWF3254CAGQ$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("Workflow Name");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Prediction Set component", () => {
  it("renders a prediction set item", () => {
    const item = {
      "@id": "/prediction-sets/IGVFDS8323PSET/",
      "@type": ["PredictionSet", "FileSet", "Item"],
      accession: "IGVFDS8323PSET",
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      file_set_type: "functional effect",
      summary: "IGVFDS8323PSET",
      scope: "genes",
      samples: [
        {
          "@id": "/tissues/IGVFSM0001DDDD/",
          accession: "IGVFSM0001DDDD",
          aliases: ["igvf:treated_tissue"],
          donors: [
            {
              "@id": "/rodent-donors/IGVFDO6583PZIO/",
              accession: "IGVFDO6583PZIO",
              aliases: ["igvf:alias_rodent_donor_2"],
              summary: "IGVFDO6583PZIO",
              taxa: "Mus musculus",
            },
          ],
          sample_terms: ["/sample-terms/UBERON_0002048/"],
          summary: "lung tissue, Mus musculus (10-20 weeks)",
          taxa: "Mus musculus",
        },
      ],
      uuid: "a053168a-82aa-4f7e-10e3-c19fa3cd13f6",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <PredictionSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Prediction Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS8323PSET/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("functional effect prediction");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent("genes");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Analysis Step component", () => {
  it("renders an analysis step item", () => {
    const item = {
      "@id":
        "/analysis-steps/IGVFWF3254CAGQ-example-signal-generation-analysis-step/",
      "@type": ["AnalysisStep", "Item"],
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      name: "IGVFWF3254CAGQ-example-signal-generation-analysis-step",
      title: "Test UI Analysis Step",
      parents: [
        {
          title: "Example Analysis Step",
          "@id": "/analysis-steps/IGVFWF3254CAGQ-example-analysis-step/",
        },
      ],
      analysis_step_types: ["signal generation", "alignment"],
      input_content_types: ["alignments"],
      output_content_types: ["signal of unique reads"],
      step_label: "example-signal-generation-analysis-step",
      summary: "face8e04-9037-0e10-10e3-49999ee02dba",
      workflow: {
        accession: "IGVFWF3254CAGQ",
        "@id": "/workflows/IGVFWF3254CAGQ/",
      },
      uuid: "face8e04-9037-0e10-10e3-49999ee02dba",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisStep item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Analysis Step/);
    expect(uniqueId).toHaveTextContent(/face8e04-9037-0e10-10e3-49999ee02dba/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("Test UI Analysis Step");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

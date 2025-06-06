import { render, screen } from "@testing-library/react";
import { UC } from "../../../lib/constants";
import profiles from "../../__mocks__/profile";
import SessionContext from "../../session-context";
import Award from "../list-renderer/award";
import AnalysisSet from "../list-renderer/analysis-set";
import AnalysisStep from "../list-renderer/analysis-step";
import AnalysisStepVersion from "../list-renderer/analysis-step-version";
import AuxiliarySet from "../list-renderer/auxiliary-set";
import Biomarker from "../list-renderer/biomarker";
import Biosample from "../list-renderer/biosample";
import ConstructLibrarySet from "../list-renderer/construct-library-set";
import CuratedSet from "../list-renderer/curated-set";
import Document from "../list-renderer/document";
import File from "../list-renderer/file";
import Gene from "../list-renderer/gene";
import HumanDonor from "../list-renderer/human-donor";
import ImageItem from "../list-renderer/image";
import IndexFile from "../list-renderer/index-file";
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

    const meta = screen.getByTestId("search-list-item-supplement");
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

    const meta = screen.queryByTestId("search-list-item-supplement");
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

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("UCHL2, HUCEP-13, KIAA0272, hucep-6");

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

    const supplement = screen.queryByTestId("search-list-item-supplement");
    expect(supplement).toBeNull();

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
        {
          "@id": "/phenotypic-features/123/",
          feature: {
            "@id": "/phenotype-terms/NCIT_C92648/",
            term_id: "NCIT:C92648",
            term_name: "Body Weight Measurement",
          },
          observation_date: "2022-11-15",
          quantity: 58,
          quantity_units: "kilogram",
        },
      ],
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

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("Body Weight Measurement");
    expect(supplement).toHaveTextContent("ENCODE");

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

  it("renders a human donor item with only phenotypicFeatures", () => {
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
      phenotypic_features: [
        {
          "@id": "/phenotypic-features/123/",
          feature: {
            "@id": "/phenotype-terms/NCIT_C92648/",
            term_id: "NCIT:C92648",
            term_name: "Body Weight Measurement",
          },
          observation_date: "2022-11-15",
          quantity: 58,
          quantity_units: "kilogram",
        },
      ],
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

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("Body Weight Measurement");

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
      genes: [
        {
          symbol: "CXXC1",
          geneid: "ENSG00000163930",
          "@id": "/genes/ENSG00000163930/",
        },
      ],
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
      genes: [
        {
          symbol: "CXXC1",
          geneid: "ENSG00000163930",
          "@id": "/genes/ENSG00000163930/",
        },
      ],
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

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("CXXC1");

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

  it("renders a RodentDonor item with a phenotypic feature", () => {
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
        {
          feature: {
            "@id": "/phenotypic-features/abc123/",
            term_name: "a special feature",
            term_id: "HELLO:12345",
          },
        },
      ],
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
      file_set: {
        summary: "SUPERSTARR",
        file_set_type: "experimental data",
        accession: "IGVFDS0000MSET",
        "@id": "/measurement-sets/IGVFDS0000MSET/",
        "@type": ["MeasuremetSet", "FileSet", "Item"],
      },
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

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("Alternate Accession");
    expect(supplement).toHaveTextContent("IGVFFI0000SQBS");

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
      file_set: {
        summary: "SUPERSTARR",
        file_set_type: "experimental data",
        accession: "IGVFDS0000MSET",
        "@id": "/measurement-sets/IGVFDS0000MSET/",
        "@type": ["MeasuremetSet", "FileSet", "Item"],
      },
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

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).not.toHaveTextContent("IGVFFI0000SQBR");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
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
      file_set: {
        summary: "SUPERSTARR",
        file_set_type: "experimental data",
        accession: "IGVFDS0000MSET",
        "@id": "/measurement-sets/IGVFDS0000MSET/",
        "@type": ["MeasuremetSet", "FileSet", "Item"],
      },
      seqspec_of: [
        "/sequence-files/IGVFFI0000SEQU/",
        "/sequence-files/IGVFDS8812ASDF/",
      ],
    };
    const accessoryData = {
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
        file_set: {
          "@id": "/analysis-sets/IGVFDS6408BFHD/",
          "@type": ["MeasuremetSet", "FileSet", "Item"],
        },
        dbxrefs: ["SRA:SRR12345"],
        illumina_read_type: "R1",
        sequencing_run: 1,
        seqspecs: ["/configuration-file/IGVFFI1234CONF/"],
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
        file_set: {
          "@id": "/analysis-sets/IGVFDS6408BFHD/",
          "@type": ["MeasuremetSet", "FileSet", "Item"],
        },
        dbxrefs: ["SRA:SRR12346"],
        illumina_read_type: "R2",
        sequencing_run: 1,
        seqspecs: ["/configuration-file/IGVFFI1234CONF/"],
      },
      "/configuration-file/IGVFFI1234CONF/": {
        "@id": "/configuration-file/IGVFFI1234CONF/",
        "@type": ["ConfigurationFile", "File", "Item"],
        externally_hosted: true,
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
    expect(supplement).toHaveTextContent("SUPERSTARR");
    expect(supplement).toHaveTextContent("IGVFFI0000SEQU, IGVFDS8812ASDF");

    const paths = File.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      {
        type: "File",
        paths: ["/configuration-file/IGVFFI1234CONF/"],
        fields: ["externally_hosted"],
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

  it("renders a file with a non-embedded file_set", () => {
    const item = {
      "@id": "/reference-file/IGVFFI0000SQBR/",
      "@type": ["ReferenceFile", "File", "Item"],
      accession: "IGVFFI0000SQBR",
      alternate_accessions: ["IGVFFI0000SQBS"],
      file_format: "txt",
      file_set: "/measurement-sets/IGVFDS0000MSET/",
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

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).not.toHaveTextContent("File Set");
  });

  it("renders a seqspec configuration File item without accessory data", () => {
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
      file_set: {
        summary: "SUPERSTARR",
        file_set_type: "experimental data",
        accession: "IGVFDS0000MSET",
        "@id": "/measurement-sets/IGVFDS0000MSET/",
        "@type": ["MeasuremetSet", "FileSet", "Item"],
      },
    };

    const paths = File.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      {
        fields: ["externally_hosted"],
        paths: ["/configuration-file/IGVFFI1234CONF/"],
        type: "File",
      },
    ]);
  });
});

describe("Test the AnalysisSet component", () => {
  it("renders an AnalysisSet item with alternate accession", () => {
    const item = {
      "@id": "/analysis-sets/IGVFDS0390NOLS/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS3099XPLN",
      alternate_accessions: ["IGVFDS3099XPLO"],
      aliases: ["igvf:basic_analysis_set"],
      award: "/awards/HG012012/",
      file_set_type: "primary analysis",
      files: [],
      lab: {
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      summary: "primary analysis of data",
      uuid: "609869e7-cbd9-4d06-9569-d3fdb4604ccd",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^primary Analysis Set IGVFDS3099XPLN$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^primary analysis of data$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("Alternate Accessions");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders an AnalysisSet item with sample_summary", () => {
    const item = {
      "@id": "/analysis-sets/IGVFDS0390NOLS/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS0390NOLS",
      aliases: ["igvf:basic_analysis_set_2"],
      award: "/awards/HG012012/",
      sample_summary:
        "Homo sapiens lung tissue, transfected with a reporter library",
      file_set_type: "primary analysis",
      files: [],
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      summary: "primary analysis of data",
      uuid: "609869e7-cbd9-4d06-9569-d3fdb4604ccd",
    };

    const accessoryData = {
      "/analysis-sets/IGVFDS0390NOLS/": {
        "@id": "/analysis-sets/IGVFDS9006PQTA/",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        workflows: [
          {
            "@id": "/workflows/IGVFWF0000WORK/",
            accession: "IGVFWF0000WORK",
            name: "Perturb-seq Pipeline",
            uniform_pipeline: true,
          },
        ],
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisSet item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^primary Analysis Set IGVFDS0390NOLS$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^primary analysis of data$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent(/^J. Michael Cherry, Stanford/);

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("Samples");

    const supplementContent = screen.getAllByTestId(
      "search-list-item-supplement-content"
    )[0];
    expect(supplementContent).toHaveTextContent(
      "Homo sapiens lung tissue, transfected with a reporter library"
    );

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders an AnalysisSet item with files", () => {
    const item = {
      "@id": "/analysis-sets/IGVFDS0390NOLS/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS0390NOLS",
      aliases: ["igvf:basic_analysis_set_2"],
      award: "/awards/HG012012/",
      files: [{ content_type: "alignments" }, { content_type: "fragments" }],
      file_set_type: "primary analysis",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      summary: "primary analysis of data",
      uuid: "609869e7-cbd9-4d06-9569-d3fdb4604ccd",
    };

    const accessoryData = {
      "/analysis-sets/IGVFDS0390NOLS/": {
        "@id": "/analysis-sets/IGVFDS9006PQTA/",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        workflows: [
          {
            "@id": "/workflows/IGVFWF0000WORK/",
            accession: "IGVFWF0000WORK",
            name: "Perturb-seq Pipeline",
            uniform_pipeline: true,
          },
        ],
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisSet item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^primary Analysis Set IGVFDS0390NOLS$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^primary analysis of data$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent(/^J. Michael Cherry, Stanford/);

    expect(screen.getByTestId("search-list-item-supplement")).toHaveTextContent(
      "Files"
    );

    const supplementContent = screen.getAllByTestId(
      "search-list-item-supplement-content"
    )[0];
    expect(supplementContent).toHaveTextContent("alignments, fragments");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders an AnalysisSet item with workflows", () => {
    const item = {
      "@id": "/analysis-sets/IGVFDS0390NOLS/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS0390NOLS",
      aliases: ["igvf:basic_analysis_set_2"],
      award: "/awards/HG012012/",
      workflows: [
        {
          uniform_pipeline: true,
        },
      ],
      file_set_type: "primary analysis",
      files: [],
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      summary: "primary analysis of data",
      uuid: "609869e7-cbd9-4d06-9569-d3fdb4604ccd",
    };

    const accessoryData = {
      "/analysis-sets/IGVFDS0390NOLS/": {
        "@id": "/analysis-sets/IGVFDS9006PQTA/",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        workflows: [
          {
            "@id": "/workflows/IGVFWF0000WORK/",
            accession: "IGVFWF0000WORK",
            name: "Perturb-seq Pipeline",
            uniform_pipeline: true,
          },
        ],
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisSet item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^primary Analysis Set IGVFDS0390NOLS$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^primary analysis of data$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent(/^J. Michael Cherry, Stanford/);

    const qualityItem = screen.getByTestId("search-list-item-quality");
    expect(qualityItem).toHaveTextContent("released");
    expect(qualityItem).toHaveTextContent("uniformly processed");
  });
});

describe("Test the CuratedSet component", () => {
  it("renders a CuratedSet item with a description", () => {
    const item = {
      "@id": "/curated-sets/IGVFDS0000AAAA/",
      "@type": ["CuratedSet", "FileSet", "Item"],
      accession: "IGVFDS0000AAAA",
      alternate_accessions: ["IGVFDS0000AAAB"],
      aliases: ["igvf-dacc:GRCh38.p14_assembly"],
      award: "/awards/HG012012/",
      description: "A curated set for Cherry lab guide RNAs.",
      file_set_type: "external data for catalog",
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
    expect(title).toHaveTextContent(
      /^A curated set for Cherry lab guide RNAs.$/
    );

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
      description: "A curated set for Cherry lab guide RNAs.",
      file_set_type: "external data for catalog",
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
    expect(title).toHaveTextContent(
      /^A curated set for Cherry lab guide RNAs.$/
    );

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Tim Reddy, Duke");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a CuratedSet item without a description", () => {
    const item = {
      "@id": "/curated-sets/IGVFDS0000AAAA/",
      "@type": ["CuratedSet", "FileSet", "Item"],
      accession: "IGVFDS0000AAAA",
      alternate_accessions: ["IGVFDS0000AAAB"],
      aliases: ["igvf-dacc:GRCh38.p14_assembly"],
      award: "/awards/HG012012/",
      file_set_type: "external data for catalog",
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
    expect(title).toHaveTextContent(/^external data for catalog$/);

    const meta = screen.getByTestId("search-list-item-meta");
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

    const paths = MeasurementSet.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      {
        type: "MeasurementSet",
        paths: ["/measurement-sets/IGVFDS6408BFHD/"],
        fields: ["externally_hosted"],
      },
    ]);
  });

  it("renders a MeasurementSet item with more than one sample", () => {
    const item = {
      "@id": "/measurement-sets/IGVFDS6408BFHD/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      accession: "IGVFDS6408BFHD",
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
        <MeasurementSet
          item={item}
          accessoryData={{
            "/measurement-sets/IGVFDS6408BFHD/": {
              "@id": "/measurement-sets/IGVFDS6408BFHD/",
              "@type": ["MeasurementSet", "FileSet", "Item"],
              externally_hosted: true,
            },
          }}
        />
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
    expect(uniqueId).toHaveTextContent(/^Software Version/);

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
    expect(uniqueId).toHaveTextContent(/^Source aviva/);

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

    const supplement = screen.queryByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent(
      "ENCODE Project Consortium, Bernstein BE, Birney E, Dunham I, Green ED, Gunter C, Snyder M. (2012, September 6). An integrated encyclopedia of DNA elements in the human genome. Nature. 489(7414), 57-74."
    );

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });

  it("renders a Publication item with no supplement", () => {
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

    const meta = screen.queryByTestId("search-list-item-supplement");
    expect(meta).toBeNull();

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
    expect(title).toHaveTextContent(
      `Body Weight Measurement ${UC.mdash} 58 kilogram`
    );

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    // Expect a date in search-list-item-supplement
    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("November 15, 2022");

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
        <ModelSet
          item={item}
          accessoryData={{
            "/models/IGVFDS1234MODL/": {
              "@id": "/models/IGVFDS1234MODL/",
              "@type": ["ModelSet", "FileSet", "Item"],
              externally_hosted: true,
            },
          }}
        />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/ModelSet/);
    expect(uniqueId).toHaveTextContent(/IGVFDS1234MODL$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/Xpresso/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");

    const paths = ModelSet.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      {
        type: "ModelSet",
        paths: ["/models/IGVFDS1234MODL/"],
        fields: ["externally_hosted"],
      },
    ]);
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

describe("Test Prediction Set component with files but no alternate_accessions", () => {
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
      files: [{ content_type: "alignments" }, { content_type: "fragments" }],
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

    const supplementContent = screen.getByTestId(
      "search-list-item-supplement-content"
    );
    expect(supplementContent).toHaveTextContent("alignments, fragments");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Prediction Set component with no files (zero length) but with alternate_accession", () => {
  it("renders a prediction set item", () => {
    const item = {
      "@id": "/prediction-sets/IGVFDS8323PSEU/",
      "@type": ["PredictionSet", "FileSet", "Item"],
      accession: "IGVFDS8323PSEU",
      alternate_accessions: ["IGVFDS3099XPLP"],
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      files: [],
      status: "released",
      file_set_type: "functional effect",
      summary: "IGVFDS8323PSEU",
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
      uuid: "a076232c2-d4db-4a51-ad73-4c53c824937f",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <PredictionSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Prediction Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS8323PSEU/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("functional effect prediction");

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("Alternate Accessions");

    const alternateAccessionContent = screen.getByTestId(
      "search-list-item-supplement-content"
    );
    expect(alternateAccessionContent).toHaveTextContent("IGVFDS3099XPLP");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent("genes");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Prediction Set component with no files at all but with alternate_accession", () => {
  it("renders a prediction set item", () => {
    const item = {
      "@id": "/prediction-sets/IGVFDS8323PSEU/",
      "@type": ["PredictionSet", "FileSet", "Item"],
      accession: "IGVFDS8323PSEU",
      alternate_accessions: ["IGVFDS3099XPLP"],
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      status: "released",
      file_set_type: "functional effect",
      summary: "IGVFDS8323PSEU",
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
      uuid: "a076232c2-d4db-4a51-ad73-4c53c824937f",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <PredictionSet item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Prediction Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS8323PSEU/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("functional effect prediction");

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("Alternate Accessions");

    const alternateAccessionContent = screen.getByTestId(
      "search-list-item-supplement-content"
    );
    expect(alternateAccessionContent).toHaveTextContent("IGVFDS3099XPLP");

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

describe("Test Analysis Step Version component with software_version", () => {
  it("renders an analysis step version item", () => {
    const item = {
      "@id": "/analysis-step-versions/fbd5e8fb-4206-4b43-92d6-922cdfe1338b/",
      "@type": ["AnalysisStepVersion", "Item"],
      analysis_step: {
        "@id": "/analysis-steps/IGVFWF0000WORK-example-analysis-step/",
        title: "IGVFWF0000WORK Example Analysis Step",
      },
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      summary: "fbd5e8fb-4206-4b43-92d6-922cdfe1338b",
      software_versions: [
        {
          "@id": "/software-versions/cellranger-v6.0.1/",
          name: "cellranger-v6.0.1",
          status: "released",
        },
      ],
      uuid: "fbd5e8fb-4206-4b43-92d6-922cdfe1338b",
      status: "released",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisStepVersion item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(
      /AnalysisStepVersion fbd5e8fb-4206-4b43-92d6-922cdfe1338b/
    );

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      "IGVFWF0000WORK Example Analysis Step Version"
    );

    const supplemental = screen.getByTestId(
      "search-list-item-supplement-content"
    );
    expect(supplemental).toHaveTextContent("cellranger-v6.0.1");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Analysis Step Version component without software_version", () => {
  it("renders an analysis step version item", () => {
    const item = {
      "@id": "/analysis-step-versions/86329dd8-cadf-4714-86d4-6cd9cab4d95b/",
      "@type": ["AnalysisStepVersion", "Item"],
      analysis_step: {
        "@id": "/analysis-steps/IGVFWF0000WORK-example-analysis-step/",
        title: "IGVFWF0000WORK Example Analysis Step",
      },
      award: "/awards/HG012012/",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
      summary: "86329dd8-cadf-4714-86d4-6cd9cab4d95b",
      uuid: "86329dd8-cadf-4714-86d4-6cd9cab4d95b",
      status: "released",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisStepVersion item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(
      /AnalysisStepVersion 86329dd8-cadf-4714-86d4-6cd9cab4d95b/
    );

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      "IGVFWF0000WORK Example Analysis Step Version"
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Image component", () => {
  it("renders an image item", () => {
    const item = {
      "@id": "/images/8a91ae78-731a-4a92-ae7c-273214be408a/",
      "@type": ["Image", "Item"],
      aliases: ["j-michael-cherry:aliases01"],
    };

    const accessoryData = {
      "/images/8a91ae78-731a-4a92-ae7c-273214be408a/": {
        "@id": "/images/498ce836-3050-47b6-b4cf-b0ac911a7d38/",
        "@type": ["Image", "Item"],
        attachment: {
          href: "@@download/attachment/h3k4me3_millipore_07-473_lot_DAM1651667_WB.png",
          type: "image/png",
          width: 960,
          height: 720,
          md5sum: "fa78cd0cd7d94a627d4e86b55d95d6f5",
          download: "h3k4me3_millipore_07-473_lot_DAM1651667_WB.png",
        },
        download_url:
          "/images/498ce836-3050-47b6-b4cf-b0ac911a7d38/@@download/attachment/h3k4me3_millipore_07-473_lot_DAM1651667_WB.png",
        status: "released",
        summary: "H3K4me3 Millipore",
        uuid: "498ce836-3050-47b6-b4cf-b0ac911a7d38",
      },
    };

    render(
      <SessionContext.Provider
        value={{ profiles, dataProviderUrl: "http://localhost:8000" }}
      >
        <ImageItem item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Image/);
    expect(uniqueId).toHaveTextContent(/498ce836-3050-47b6-b4cf-b0ac911a7d38/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      "h3k4me3_millipore_07-473_lot_DAM1651667_WB.png"
    );

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("image/png");
    expect(meta).toHaveTextContent("960 × 720");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent("released");

    const paths = ImageItem.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      {
        type: "Image",
        paths: ["/images/8a91ae78-731a-4a92-ae7c-273214be408a/"],
        fields: ["attachment", "download_url", "status", "summary", "uuid"],
      },
    ]);
  });

  it("renders an image item with no accessory data", () => {
    const item = {
      "@id": "/images/8a91ae78-731a-4a92-ae7c-273214be408a/",
      "@type": ["Image", "Item"],
      aliases: ["j-michael-cherry:aliases01"],
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <ImageItem item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Image/);
    expect(uniqueId).toHaveTextContent(
      /\/images\/8a91ae78-731a-4a92-ae7c-273214be408a\//
    );

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(
      "/images/8a91ae78-731a-4a92-ae7c-273214be408a/"
    );

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.queryByTestId("search-list-item-quality");
    expect(status).toBeNull();
  });

  it("renders an image with no dataProviderUrl in the session", () => {
    const item = {
      "@id": "/images/8a91ae78-731a-4a92-ae7c-273214be408a/",
      "@type": ["Image", "Item"],
      aliases: ["j-michael-cherry:aliases01"],
    };

    const accessoryData = {
      "/images/8a91ae78-731a-4a92-ae7c-273214be408a/": {
        "@id": "/images/498ce836-3050-47b6-b4cf-b0ac911a7d38/",
        "@type": ["Image", "Item"],
        attachment: {
          href: "@@download/attachment/h3k4me3_millipore_07-473_lot_DAM1651667_WB.png",
          type: "image/png",
          width: 960,
          height: 720,
          md5sum: "fa78cd0cd7d94a627d4e86b55d95d6f5",
          download: "h3k4me3_millipore_07-473_lot_DAM1651667_WB.png",
        },
        download_url:
          "/images/498ce836-3050-47b6-b4cf-b0ac911a7d38/@@download/attachment/h3k4me3_millipore_07-473_lot_DAM1651667_WB.png",
        status: "released",
        uuid: "498ce836-3050-47b6-b4cf-b0ac911a7d38",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles: {} }}>
        <ImageItem item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/Image/);
    expect(uniqueId).toHaveTextContent(/498ce836-3050-47b6-b4cf-b0ac911a7d38/);

    const supplement = screen.queryByTestId("search-list-item-supplement");
    expect(supplement).toBeNull();
  });
});

describe("Test IndexFile component", () => {
  it("renders an index file item with no supplement data", () => {
    const item = {
      "@id": "/index-files/IGVFFI0002BAIN/",
      "@type": ["IndexFile", "File", "Item"],
      accession: "IGVFFI0002BAIN",
      aliases: ["j-michael-cherry:aliases01"],
      summary: "index of IGVFFI0002ALTB",
      file_set: "/analysis-sets/IGVFDS7216VESH/",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <IndexFile item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^IndexFile IGVFFI0002BAIN$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^index of IGVFFI0002ALTB$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-quality");
    expect(status).toHaveTextContent(/^$/);
  });

  it("renders an index file item with file-set supplement data", () => {
    const item = {
      "@id": "/index-files/IGVFFI0002BAIN/",
      "@type": ["IndexFile", "File", "Item"],
      accession: "IGVFFI0002BAIN",
      aliases: ["j-michael-cherry:aliases01"],
      file_set: {
        "@id": "/analysis-sets/IGVFDS9563CORS/",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        accession: "IGVFDS9563CORS",
        file_set_type: "principal analysis",
        samples: [
          {
            "@id": "/tissues/IGVFSM0000DDDD/",
            accession: "IGVFSM0000DDDD",
            classifications: ["tissue"],
            sample_terms: [
              {
                term_name: "lung",
                "@id": "/sample-terms/UBERON_0002048/",
              },
            ],
            summary:
              "lung tissue, female, Homo sapiens (25-30 months) transfected with a reporter library",
            taxa: "Homo sapiens",
          },
        ],
        summary:
          "SUPERSTARR targeting Mir683-2: barcode to sample mapping, coding_variants, diseases_genes, documentation (readme), elements reference and 15 more",
      },
      summary: "index of IGVFFI0002ALTB",
      lab: {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <IndexFile item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^IndexFile IGVFFI0002BAIN$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^index of IGVFFI0002ALTB$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent(
      "AnalysisSeSUPERSTARR targeting Mir683-2: barcode to sample mapping, coding_variants, diseases_genes, documentation (readme), elements reference and 15 more"
    );
  });
});

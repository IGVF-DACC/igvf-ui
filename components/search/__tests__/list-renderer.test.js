import { render, screen } from "@testing-library/react";
import profiles from "../../__mocks__/profile";
import SessionContext from "../../session-context";
import Award from "../list-renderer/award";
import AnalysisSet from "../list-renderer/analysis-set";
import Biosample from "../list-renderer/biosample";
import CuratedSet from "../list-renderer/curated-set";
import Document from "../list-renderer/document";
import File from "../list-renderer/file";
import MeasurementSet from "../list-renderer/measurement-set";
import Gene from "../list-renderer/gene";
import HumanDonor from "../list-renderer/human-donor";
import Lab from "../list-renderer/lab";
import OntologyTerm from "../list-renderer/ontology-term";
import Page from "../list-renderer/page";
import RodentDonor from "../list-renderer/rodent-donor";
import Software from "../list-renderer/software";
import SoftwareVersion from "../list-renderer/software-version";
import TechnicalSample from "../list-renderer/technical-sample";
import User from "../list-renderer/user";
import Biomarker from "../list-renderer/biomarker";
import Source from "../list-renderer/source";


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

    const status = screen.getByTestId("search-list-item-status");
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

    const status = screen.getByTestId("search-list-item-status");
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

    const status = screen.getByTestId("search-list-item-status");
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

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("current");
  });
});

describe("Test the Biosample component", () => {
  it("renders a biosample-derived item with accessory data", () => {
    const item = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      biosample_term: "/sample-terms/CL_0011001/",
      lab: "/labs/j-michael-cherry/",
      status: "released",
      taxa: "Homo sapiens",
      uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
    };
    const accessoryData = {
      "/sample-terms/CL_0011001/": {
        "@id": "/sample-terms/CL_0011001/",
        term_name: "motor neuron",
      },
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Biosample item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^PrimaryCell/);
    expect(uniqueId).toHaveTextContent(/IGVFSM0000EEEE$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("Homo sapiens motor neuron");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");

    const paths = Biosample.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      "/sample-terms/CL_0011001/",
      "/labs/j-michael-cherry/",
    ]);
  });

  it("renders a biosample-derived item without accessory data", () => {
    const item = {
      "@id": "/primary-cells/IGVFSM0000EEEE/",
      "@type": ["PrimaryCell", "Biosample", "Sample", "Item"],
      accession: "IGVFSM0000EEEE",
      biosample_term: "/sample-terms/CL_0011001/",
      lab: "/labs/j-michael-cherry/",
      status: "released",
      taxa: "Homo sapiens",
      uuid: "578c72a2-4f84-2c8f-96b0-ec8715e18185",
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
    expect(title).toHaveTextContent(/^Homo sapiens$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test Document component", () => {
  it("renders a document item with accessory data", () => {
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
      lab: "/labs/j-michael-cherry/",
      status: "in progress",
      submitted_by: "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
      uuid: "c7870a38-4286-42fc-9551-22436306e22a",
    };
    const accessoryData = {
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        title: "J. Michael Cherry, Stanford",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Document item={item} accessoryData={accessoryData} />
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

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("in progress");

    const paths = Document.getAccessoryDataPaths([item]);
    expect(paths).toEqual(["/labs/j-michael-cherry/"]);
  });

  it("renders a document item without accessory data", () => {
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
      lab: "/labs/j-michael-cherry/",
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
    expect(meta).not.toHaveTextContent("J. Michael Cherry, Stanford");
    expect(meta).toHaveTextContent("characterization");

    const status = screen.getByTestId("search-list-item-status");
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

    const status = screen.getByTestId("search-list-item-status");
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

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the HumanDonor component", () => {
  it("renders a human donor item with accessory data", () => {
    const item = {
      "@id": "/human-donors/IGVFDO856PXB/",
      "@type": ["HumanDonor", "Donor", "Item"],
      accession: "IGVFDO856PXB",
      aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
      award: "/awards/1U01HG012079-01/",
      ethnicity: ["African American"],
      lab: "/labs/chongyuan-luo/",
      sex: "female",
      status: "released",
      taxa: "Homo sapiens",
      uuid: "ee99221f-a11a-4f8b-baf3-9919db92f2f9",
    };
    const accessoryData = {
      "/labs/chongyuan-luo/": {
        "@id": "/labs/chongyuan-luo/",
        "@type": ["Lab", "Item"],
        title: "Chongyuan Luo",
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

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");

    const paths = HumanDonor.getAccessoryDataPaths([item]);
    expect(paths).toEqual(["/labs/chongyuan-luo/"]);
  });

  it("renders a human donor item without accessory data", () => {
    const item = {
      "@id": "/human-donors/IGVFDO856PXB/",
      "@type": ["HumanDonor", "Donor", "Item"],
      accession: "IGVFDO856PXB",
      aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
      award: "/awards/1U01HG012079-01/",
      ethnicity: ["African American"],
      lab: "/labs/chongyuan-luo/",
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

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });

  it("renders a human donor item without accessory data nor ethnicities nor sex", () => {
    const item = {
      "@id": "/human-donors/IGVFDO856PXB/",
      "@type": ["HumanDonor", "Donor", "Item"],
      accession: "IGVFDO856PXB",
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

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the Lab component", () => {
  it("renders a lab item with accessory data", () => {
    const item = {
      "@id": "/labs/hyejung-won/",
      "@type": ["Lab", "Item"],
      awards: ["/awards/1UM1HG012003-01/"],
      institute_label: "UNC",
      name: "hyejung-won",
      pi: "/users/7e51864b-2e2b-40cf-9abc-5cc2dc98f35d/",
      status: "current",
      title: "Hyejung Won, UNC",
      uuid: "fe27c988-4664-4245-a1ca-bab9e1c62a00",
    };
    const accessoryData = {
      "/awards/1UM1HG012003-01/": {
        "@id": "/awards/1UM1HG012003-01/",
        "@type": ["Award", "Item"],
        name: "1UM1HG012003-01",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Lab item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Lab/);
    expect(uniqueId).toHaveTextContent(/hyejung-won$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Hyejung Won, UNC$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("1UM1HG012003-01");

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("current");

    const paths = Lab.getAccessoryDataPaths([item]);
    expect(paths).toEqual(["/awards/1UM1HG012003-01/"]);
  });

  it("renders a lab item without accessory data", () => {
    const item = {
      "@id": "/labs/hyejung-won/",
      "@type": ["Lab", "Item"],
      awards: ["/awards/1UM1HG012003-01/"],
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

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("current");
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

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the RodentDonor component", () => {
  it("renders a RodentDonor item with accessory data", () => {
    const item = {
      "@id": "/rodent-donors/IGVFDO524ORO/",
      "@type": ["RodentDonor", "Donor", "Item"],
      accession: "IGVFDO524ORO",
      aliases: [
        "j-michael-cherry:alias_rodent_donor_1",
        "j-michael-cherry:rodent_donor_with_arterial_blood_pressure_trait",
      ],
      award: "/awards/HG012012/",
      lab: "/labs/j-michael-cherry/",
      sex: "male",
      status: "released",
      strain: "some name",
      taxa: "Mus musculus",
      uuid: "c37934b0-4269-4470-be53-9eac7b196447",
    };
    const accessoryData = {
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
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

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");

    const paths = RodentDonor.getAccessoryDataPaths([item]);
    expect(paths).toEqual(["/labs/j-michael-cherry/"]);
  });

  it("renders a Rodent Donor item without accessory data", () => {
    const item = {
      "@id": "/rodent-donors/IGVFDO524ORO/",
      "@type": ["RodentDonor", "Donor", "Item"],
      accession: "IGVFDO524ORO",
      aliases: [
        "j-michael-cherry:alias_rodent_donor_1",
        "j-michael-cherry:rodent_donor_with_arterial_blood_pressure_trait",
      ],
      award: "/awards/HG012012/",
      lab: "/labs/j-michael-cherry/",
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

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^RodentDonor/);
    expect(uniqueId).toHaveTextContent(/IGVFDO524ORO$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^some name male$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the TechnicalSample component", () => {
  it("renders a TechnicalSample item with accessory data", () => {
    const item = {
      "@id": "/technical-samples/IGVFSM515BSZ/",
      "@type": ["TechnicalSample", "Sample", "Item"],
      accession: "IGVFSM515BSZ",
      award: "/awards/HG012012/",
      date_obtained: "2022-04-09",
      description: "The technical sample was archived due to poor quality.",
      lab: "/labs/j-michael-cherry/",
      status: "archived",
      technical_sample_term: "/sample-terms/NTR_0000637/",
      uuid: "f12ab44c-bba8-46cc-9f3d-6a192eb09e7e",
    };
    const accessoryData = {
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
      "/sample-terms/NTR_0000637/": {
        "@id": "/sample-terms/NTR_0000637/",
        "@type": ["SampleTerm", "Item"],
        term_id: "NTR:0000637",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <TechnicalSample item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^TechnicalSample/);
    expect(uniqueId).toHaveTextContent(/IGVFSM515BSZ$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^NTR:0000637$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("archived");

    const paths = TechnicalSample.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      "/sample-terms/NTR_0000637/",
      "/labs/j-michael-cherry/",
    ]);
  });

  it("renders a TechnicalSample item without accessory data", () => {
    const item = {
      "@id": "/technical-samples/IGVFSM515BSZ/",
      "@type": ["TechnicalSample", "Sample", "Item"],
      accession: "IGVFSM515BSZ",
      award: "/awards/HG012012/",
      date_obtained: "2022-04-09",
      description: "The technical sample was archived due to poor quality.",
      lab: "/labs/j-michael-cherry/",
      status: "archived",
      technical_sample_term: "/sample-terms/NTR_0000637/",
      uuid: "f12ab44c-bba8-46cc-9f3d-6a192eb09e7e",
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
    expect(title).toHaveTextContent(/^\/technical-samples\/IGVFSM515BSZ\/$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
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
    expect(paths).toEqual(["/labs/christina-leslie/"]);
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
  it("renders a File item with accessory data", () => {
    const item = {
      "@id": "/reference-data/IGVFFI0000SQBR/",
      "@type": ["ReferenceData", "File", "Item"],
      accession: "IGVFFI0000SQBR",
      file_format: "txt",
      content_type: "sequence barcodes",
      lab: "/labs/christina-leslie/",
      summary: "IGVFFI0000SQBR",
      uuid: "fa9feeb4-28ba-4356-8c24-50f4e6562029",
      status: "released",
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
        <File item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Reference data/);
    expect(uniqueId).toHaveTextContent(/IGVFFI0000SQBR$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^txt - sequence barcodes$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Christina Leslie, MSKCC");
    expect(meta).toHaveTextContent("IGVFFI0000SQBR");

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");

    const paths = File.getAccessoryDataPaths([item]);
    expect(paths).toEqual(["/labs/christina-leslie/"]);
  });

  it("renders a File item without accessory data and summary", () => {
    const item = {
      "@id": "/reference-data/IGVFFI0000SQBR/",
      "@type": ["ReferenceData", "File", "Item"],
      accession: "IGVFFI0000SQBR",
      file_format: "txt",
      content_type: "sequence barcodes",
      lab: "/labs/christina-leslie/",
      uuid: "fa9feeb4-28ba-4356-8c24-50f4e6562029",
      status: "released",
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <File item={item} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Reference data/);
    expect(uniqueId).toHaveTextContent(/IGVFFI0000SQBR$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^txt - sequence barcodes$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the AnalysisSet component", () => {
  it("renders an AnalysisSet item with accessory data", () => {
    const item = {
      "@id": "/analysis-sets/IGVFDS0390NOLS/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS3099XPLN",
      aliases: ["igvf:basic_analysis_set"],
      award: "/awards/HG012012/",
      lab: "/labs/j-michael-cherry/",
      status: "released",
      summary: "IGVFDS3099XPLN",
      input_file_sets: ["/analysis-sets/IGVFDS3099XPLN/"],
      uuid: "609869e7-cbd9-4d06-9569-d3fdb4604ccd",
    };

    const accessoryData = {
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
      "/analysis-sets/IGVFDS3099XPLN/": {
        "@id": "/analysis-sets/IGVFDS3099XPLN/",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        accession: "IGVFDS3099XPLN",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <AnalysisSet item={item} accessoryData={accessoryData} />
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
    expect(supplement).toHaveTextContent("IGVFDS3099XPLN");

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");

    const paths = AnalysisSet.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      "/analysis-sets/IGVFDS3099XPLN/",
      "/labs/j-michael-cherry/",
    ]);
  });

  it("renders an AnalysisSet item without accessory data and summary", () => {
    const item = {
      "@id": "/analysis-sets/IGVFDS0390NOLS/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS3099XPLN",
      aliases: ["igvf:basic_analysis_set"],
      award: "/awards/HG012012/",
      lab: "/labs/j-michael-cherry/",
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
    expect(uniqueId).toHaveTextContent(/IGVFDS3099XPLN$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Analysis$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const supplement = screen.queryByTestId("search-list-item-supplement");
    expect(supplement).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the CuratedSet component", () => {
  it("renders a CuratedSet item with accessory data", () => {
    const item = {
      "@id": "/curated-sets/IGVFDS0000AAAA/",
      "@type": ["CuratedSet", "FileSet", "Item"],
      accession: "IGVFDS0000AAAA",
      aliases: ["igvf-dacc:GRCh38.p14_assembly"],
      award: "/awards/HG012012/",
      lab: "/labs/j-michael-cherry/",
      status: "released",
      taxa: "Homo sapiens",
      summary: "IGVFDS0000AAAA",
      uuid: "40f1e08c-5d6d-4d19-8f69-3fd91420c09f",
    };
    const accessoryData = {
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <CuratedSet item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^CuratedSet/);
    expect(uniqueId).toHaveTextContent(/IGVFDS0000AAAA$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Curated set$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");

    const paths = CuratedSet.getAccessoryDataPaths([item]);
    expect(paths).toEqual(["/labs/j-michael-cherry/"]);
  });

  it("renders a CuratedSet item without accessory data and summary", () => {
    const item = {
      "@id": "/curated-sets/IGVFDS0000AAAA/",
      "@type": ["CuratedSet", "FileSet", "Item"],
      accession: "IGVFDS0000AAAA",
      aliases: ["igvf-dacc:GRCh38.p14_assembly"],
      award: "/awards/HG012012/",
      lab: "/labs/j-michael-cherry/",
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
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the MeasurementSet component", () => {
  it("renders a MeasurementSet item with accessory data", () => {
    const item = {
      "@id": "/measurement-sets/IGVFDS6408BFHD/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      accession: "IGVFDS6408BFHD",
      aliases: ["igvf:basic_measurement_set"],
      award: "/awards/HG012012/",
      lab: "/labs/j-michael-cherry/",
      status: "released",
      summary: "IGVFDS6408BFHD",
      uuid: "67380d9f-06da-f9fe-9569-d31ce0607eae",
      assay_term: "/assay-terms/OBI_0002041/",
    };
    const accessoryData = {
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
      "/assay-terms/OBI_0002041/": {
        "@id": "/assay-terms/OBI_0002041/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_name: "STARR-seq",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <MeasurementSet item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Measurement Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS6408BFHD$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^STARR-seq$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");

    const paths = MeasurementSet.getAccessoryDataPaths([item]);
    expect(paths).toEqual([
      "/assay-terms/OBI_0002041/",
      "/labs/j-michael-cherry/",
    ]);
  });

  it("renders a MeasurementSet item without accessory data and summary", () => {
    const item = {
      "@id": "/measurement-sets/IGVFDS6408BFHD/",
      "@type": ["MeasurementSet", "FileSet", "Item"],
      accession: "IGVFDS6408BFHD",
      aliases: ["igvf:basic_measurement_set"],
      award: "/awards/HG012012/",
      lab: "/labs/j-michael-cherry/",
      status: "released",
      uuid: "67380d9f-06da-f9fe-9569-d31ce0607eae",
      assay_term: "/assay-terms/OBI_0002041/",
    };

    const accessoryData = {
      "/assay-terms/OBI_0002041/": {
        "@id": "/assay-terms/OBI_0002041/",
        "@type": ["AssayTerm", "OntologyTerm", "Item"],
        term_name: "STARR-seq",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <MeasurementSet item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Measurement Set/);
    expect(uniqueId).toHaveTextContent(/IGVFDS6408BFHD$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^STARR-seq$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
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

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the SoftwareVersion component", () => {
  it("renders a SoftwareVersion item with accessory data", () => {
    const item = {
      "@id": "/software-versions/bowtie2-v2.4.4/",
      "@type": ["SoftwareVersion", "Item"],
      software: {
        title: "Bowtie2",
      },
      version: "2.4.4",
      lab: "/labs/j-michael-cherry/",
      status: "released",
      uuid: "67380d9f-06da-f9fe-9569-d31ce0607eae",
    };
    const accessoryData = {
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <SoftwareVersion item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Software/);
    expect(uniqueId).toHaveTextContent(/Bowtie2 2.4.4$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^Bowtie2 2.4.4$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");

    const paths = SoftwareVersion.getAccessoryDataPaths([item]);
    expect(paths).toEqual(["/labs/j-michael-cherry/"]);
  });

  it("renders a SoftwareVersion item without accessory data", () => {
    const item = {
      "@id": "/software-versions/bowtie2-v2.4.4/",
      "@type": ["SoftwareVersion", "Item"],
      software: {
        title: "Bowtie2",
      },
      version: "2.4.4",
      lab: "/labs/j-michael-cherry/",
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

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });

  it("renders a Source item without accessory data", () => {
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

    const status = screen.getByTestId("search-list-item-status");
    expect(status).toHaveTextContent("released");
  });
});

describe("Test the Biomarker component", () => {
  it("renders a Biomarker item with accessory data", () => {
    const item = {
      lab: "/labs/j-michael-cherry/",
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
    const accessoryData = {
      "/labs/j-michael-cherry/": {
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
    };

    render(
      <SessionContext.Provider value={{ profiles }}>
        <Biomarker item={item} accessoryData={accessoryData} />
      </SessionContext.Provider>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent(/^Biomarker/);
    expect(uniqueId).toHaveTextContent(/bdfaa822-cdbe-405c-920c-67da068c43b6$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^BAP1 positive$/);

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("J. Michael Cherry, Stanford");

    const paths = Biomarker.getAccessoryDataPaths([item]);
    expect(paths).toEqual(["/labs/j-michael-cherry/"]);
  });

  it("renders a Biomarker item without accessory data", () => {
    const item = {
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
    expect(uniqueId).toHaveTextContent(/bdfaa822-cdbe-405c-920c-67da068c43b6$/);

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent(/^BAP1 positive$/);

    const meta = screen.queryByTestId("search-list-item-meta");
    expect(meta).toBeNull();
  });
});

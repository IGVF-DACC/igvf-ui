import { render, screen } from "@testing-library/react";
import profiles from "../__mocks__/profile";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import Breadcrumbs from "../breadcrumbs";
import SessionContext from "../session-context";
import GlobalContext from "../global-context";

describe("Test the Breadcrumbs React component", () => {
  it("should render item breadcrumbs", async () => {
    const profilesTitles = {
      Lab: "Lab",
      "@type": ["JSONSchemas"],
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(profilesTitles),
      })
    );

    // Build breadcrumbs for a lab item.
    const labItemData = {
      name: "j-michael-cherry",
      "@id": "/labs/j-michael-cherry/",
      "@type": ["Lab", "Item"],
      uuid: "cfb789b8-46f3-4d59-a2b3-adc39e7df93a",
      title: "J. Michael Cherry, Stanford",
    };
    const breadcrumbs = await buildBreadcrumbs(labItemData, "title");
    const context = {
      breadcrumbs,
    };
    render(
      <GlobalContext.Provider value={context}>
        <Breadcrumbs />
      </GlobalContext.Provider>
    );

    const breadcrumbElement = screen.getByLabelText("breadcrumbs");
    expect(breadcrumbElement).toBeInTheDocument();

    const homeBreadcrumb = screen.getByTestId("/");
    expect(homeBreadcrumb).toBeInTheDocument();
    expect(homeBreadcrumb).toHaveTextContent("Home");

    const labsBreadcrumb = screen.getByTestId("/search?type=Lab");
    expect(labsBreadcrumb).toBeInTheDocument();
    expect(labsBreadcrumb).toHaveTextContent("Lab");

    const labBreadcrumb = screen.getByTestId("/labs/j-michael-cherry/");
    expect(labBreadcrumb).toBeInTheDocument();
    expect(labBreadcrumb).toHaveTextContent("J. Michael Cherry, Stanford");
  });

  it("should render search breadcrumbs with title replacement", async () => {
    // Build breadcrumbs for a lab search.
    const searchData = {
      "@graph": [
        {
          "@id": "/human-donors/IGVFDO748LVM/",
          "@type": ["HumanDonor", "Donor", "Item"],
          accession: "IGVFDO748LVM",
          aliases: ["chongyuan-luo:AA F donor of fibroblasts"],
          award: "/awards/1U01HG012079-01/",
          ethnicity: ["African American"],
          lab: "/labs/chongyuan-luo/",
          sex: "female",
          status: "released",
          taxa: "Homo sapiens",
          uuid: "ee99221f-a11a-4f8b-baf3-9919db92f2f9",
        },
      ],
      "@id": "/search?type=HumanDonor",
      "@type": ["Search"],
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/search",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    const breadcrumbs = await buildBreadcrumbs(searchData);
    const context = {
      breadcrumbs,
    };
    render(
      <GlobalContext.Provider value={context}>
        <SessionContext.Provider value={{ profiles }}>
          <Breadcrumbs />
        </SessionContext.Provider>
      </GlobalContext.Provider>
    );

    const breadcrumbElement = screen.getByLabelText("breadcrumbs");
    expect(breadcrumbElement).toBeInTheDocument();

    const homeBreadcrumb = screen.getByTestId("/");
    expect(homeBreadcrumb).toBeInTheDocument();
    expect(homeBreadcrumb).toHaveTextContent("Home");

    const labsBreadcrumb = screen.getByTestId("/search?type=HumanDonor");
    expect(labsBreadcrumb).toBeInTheDocument();
    expect(labsBreadcrumb).toHaveTextContent("Human Donor");
  });

  it("should render search breadcrumbs without title replacement", async () => {
    // Build breadcrumbs for a lab search.
    const searchData = {
      "@graph": [
        {
          "@id": "/rodent-donors/IGVFDO931YJL/",
          "@type": ["RodentDonor", "Donor", "Item"],
          accession: "IGVFDO931YJL",
          aliases: [
            "igvf:alias_rodent_donor_1",
            "igvf:rodent_donor_with_arterial_blood_pressure_trait",
          ],
          award: "/awards/HG012012/",
          lab: "/labs/j-michael-cherry/",
          sex: "male",
          status: "released",
          strain: "some name",
          taxa: "Mus musculus",
          uuid: "c37934b0-4269-4470-be53-9eac7b196447",
        },
      ],
      "@id": "/search?type=RodentDonor",
      "@type": ["Search"],
      filters: [
        {
          field: "type",
          term: "RodentDonor",
          remove: "/search",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    const breadcrumbs = await buildBreadcrumbs(searchData);
    const context = {
      breadcrumbs,
    };
    render(
      <GlobalContext.Provider value={context}>
        <SessionContext.Provider value={{ profiles }}>
          <Breadcrumbs />
        </SessionContext.Provider>
      </GlobalContext.Provider>
    );

    const breadcrumbElement = screen.getByLabelText("breadcrumbs");
    expect(breadcrumbElement).toBeInTheDocument();

    const homeBreadcrumb = screen.getByTestId("/");
    expect(homeBreadcrumb).toBeInTheDocument();
    expect(homeBreadcrumb).toHaveTextContent("Home");

    const labsBreadcrumb = screen.getByTestId("/search?type=RodentDonor");
    expect(labsBreadcrumb).toBeInTheDocument();
    expect(labsBreadcrumb).toHaveTextContent("RodentDonor");
  });

  it("should render search breadcrumbs without profiles loaded", async () => {
    // Build breadcrumbs for a lab search.
    const searchData = {
      "@graph": [
        {
          "@id": "/assay-terms/OBI_0002675/",
          "@type": ["AssayTerm", "OntologyTerm", "Item"],
          status: "released",
          synonyms: ["MPRA"],
          term_id: "OBI:0002675",
          term_name: "MPRA",
          uuid: "e6a5e43a-9e8c-fd28-967f-358e200536ab",
        },
      ],
      "@id": "/search?type=AssayTerm",
      "@type": ["Search"],
      filters: [
        {
          field: "type",
          term: "AssayTerm",
          remove: "/search",
        },
      ],
      notification: "Success",
      title: "Search",
      total: 1,
    };

    const breadcrumbs = await buildBreadcrumbs(searchData);
    const context = {
      breadcrumbs,
    };
    render(
      <GlobalContext.Provider value={context}>
        <Breadcrumbs />
      </GlobalContext.Provider>
    );

    const breadcrumbElement = screen.getByLabelText("breadcrumbs");
    expect(breadcrumbElement).toBeInTheDocument();

    const homeBreadcrumb = screen.getByTestId("/");
    expect(homeBreadcrumb).toBeInTheDocument();
    expect(homeBreadcrumb).toHaveTextContent("Home");

    const labsBreadcrumb = screen.getByTestId("/search?type=AssayTerm");
    expect(labsBreadcrumb).toBeInTheDocument();
    expect(labsBreadcrumb).toHaveTextContent("AssayTerm");
  });
});

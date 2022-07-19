import { render, screen } from "@testing-library/react";
import buildBreadcrumbs from "../../libs/breadcrumbs";
import Breadcrumbs from "../breadcrumbs";
import GlobalContext from "../global-context";

describe("Test the Breadcrumbs React component", () => {
  it("should render collection breadcrumbs", async () => {
    const labCollectionData = {
      "@graph": [],
      title: "Labs",
      description: "Listing of labs",
      "@id": "/labs/",
      "@type": ["LabCollection", "Collection"],
    };
    const breadcrumbs = await buildBreadcrumbs(labCollectionData, "title");
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

    const labsBreadcrumb = screen.getByTestId("/labs/");
    expect(labsBreadcrumb).toBeInTheDocument();
    expect(labsBreadcrumb).toHaveTextContent("Labs");
  });

  it("should render item breadcrumbs", async () => {
    // Mock fetch to return a lab-collection object.
    const labCollectionData = {
      title: "Labs",
      "@id": "/labs/",
      "@type": ["LabCollection", "Collection"],
    };
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(labCollectionData),
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

    const labsBreadcrumb = screen.getByTestId("/labs/");
    expect(labsBreadcrumb).toBeInTheDocument();
    expect(labsBreadcrumb).toHaveTextContent("Labs");

    const labBreadcrumb = screen.getByTestId("/labs/j-michael-cherry/");
    expect(labBreadcrumb).toBeInTheDocument();
    expect(labBreadcrumb).toHaveTextContent("J. Michael Cherry, Stanford");
  });
});

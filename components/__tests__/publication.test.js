import { render, screen } from "@testing-library/react";
import { PublicationCitation } from "../publication";

describe("Test publication citation component", () => {
  it("displays a citation with all possible elements", () => {
    const publication = {
      "@context": "/terms/",
      "@id": "/publications/jest-testing-the-publication-module",
      "@type": ["Publication", "Item"],
      authors: "Smith J, Doe J",
      date_published: "2021-01-01",
      title: "A test publication",
      journal: "Journal of Testing",
      volume: "1",
      issue: "1",
      page: "1-10",
      creation_timestamp: "2021-01-01T00:00:00Z",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
    };

    render(
      <div data-testid="pub-test">
        <PublicationCitation publication={publication} />
      </div>
    );

    const citation = screen.getByTestId("pub-test");
    expect(citation).toHaveTextContent(
      "Smith J, Doe J (2021, January 1). A test publication. Journal of Testing. 1(1), 1-10."
    );
  });

  it("displays a citation with only required elements", () => {
    const publication = {
      "@context": "/terms/",
      "@id": "/publications/jest-testing-the-publication-module",
      "@type": ["Publication", "Item"],
      date_published: "2021-01-01",
      title: "A test publication",
      journal: "Journal of Testing",
      creation_timestamp: "2021-01-01T00:00:00Z",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
    };

    render(
      <div data-testid="pub-test">
        <PublicationCitation publication={publication} />
      </div>
    );

    const citation = screen.getByTestId("pub-test");
    expect(citation).toHaveTextContent("A test publication.");
  });

  it("displays a citation with a missing journal", () => {
    const publication = {
      "@context": "/terms/",
      "@id": "/publications/jest-testing-the-publication-module",
      "@type": ["Publication", "Item"],
      authors: "Smith J, Doe J",
      date_published: "2021-01-01",
      title: "A test publication",
      volume: "1",
      issue: "1",
      page: "1-10",
      creation_timestamp: "2021-01-01T00:00:00Z",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
    };

    render(
      <div data-testid="pub-test">
        <PublicationCitation publication={publication} />
      </div>
    );

    const citation = screen.getByTestId("pub-test");
    expect(citation).toHaveTextContent(
      "Smith J, Doe J (2021, January 1). A test publication. 1(1), 1-10."
    );
  });

  it("displays nothing if the publication is not visible", () => {
    const publication = {
      "@context": "/terms/",
      "@id": "/publications/jest-testing-the-publication-module",
      "@type": ["Publication", "Item"],
      authors: "Smith J, Doe J",
      title: "A test publication",
      volume: "1",
      issue: "1",
      page: "1-10",
      creation_timestamp: "2021-01-01T00:00:00Z",
      status: "draft",
      uuid: "00000000-0000-0000-0000-000000000000",
    };

    render(<PublicationCitation publication={publication} />);

    const citation = screen.queryByTestId("pub-test");
    expect(citation).toBeNull();
  });
});

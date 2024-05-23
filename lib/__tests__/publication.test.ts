import { checkPublicationCitationVisible } from "../publication";
import type { Publication } from "../publication";

describe("Test checkPublicationCitationVisible", () => {
  it("should return true if journal is defined", () => {
    const publication: Publication = {
      "@context": "/terms/",
      "@id": "/publications/jest-testing-the-publication-module",
      "@type": ["Publication", "Item"],
      title: "Jest testing the publication module",
      journal: "Journal of Jest",
      creation_timestamp: "2021-01-01T00:00:00Z",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
    };

    expect(checkPublicationCitationVisible(publication)).toBe(true);
  });

  it("should return true if date_published is defined", () => {
    const publication: Publication = {
      "@context": "/terms/",
      "@id": "/publications/jest-testing-the-publication-module",
      "@type": ["Publication", "Item"],
      title: "Jest testing the publication module",
      date_published: "2021-01-01",
      creation_timestamp: "2021-01-01T00:00:00Z",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
    };
    expect(checkPublicationCitationVisible(publication)).toBe(true);
  });

  it("should return false if neither journal nor date_published is defined", () => {
    const publication: Publication = {
      "@context": "/terms/",
      "@id": "/publications/jest-testing-the-publication-module",
      "@type": ["Publication", "Item"],
      title: "Jest testing the publication module",
      creation_timestamp: "2021-01-01T00:00:00Z",
      status: "released",
      uuid: "00000000-0000-0000-0000-000000000000",
    };
    expect(checkPublicationCitationVisible(publication)).toBe(false);
  });
});

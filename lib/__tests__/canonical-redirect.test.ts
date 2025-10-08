import { createCanonicalUrlRedirect } from "../canonical-redirect";

describe("createCanonicalUrlRedirect", () => {
  it("returns redirect object when @id differs from resolvedUrl", () => {
    const serverObject = {
      "@id": "/alignment-files/IGVFFI123456/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI123456",
    };
    const resolvedUrl = "/IGVFFI123456/";

    const result = createCanonicalUrlRedirect(serverObject, resolvedUrl, {});

    expect(result).toEqual({
      redirect: {
        destination: "/alignment-files/IGVFFI123456/",
        permanent: false,
      },
    });
  });

  it("returns null when @id matches resolvedUrl", () => {
    const serverObject = {
      "@id": "/alignment-files/IGVFFI123456/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI123456",
    };
    const resolvedUrl = "/alignment-files/IGVFFI123456/";

    const result = createCanonicalUrlRedirect(serverObject, resolvedUrl, {});

    expect(result).toBeNull();
  });

  it("returns null when object has no @id property", () => {
    const serverObject = {
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI123456",
    };
    const resolvedUrl = "/alignment-files/IGVFFI123456/";

    const result = createCanonicalUrlRedirect(
      serverObject as any,
      resolvedUrl,
      {} as any
    );

    expect(result).toBeNull();
  });

  it("handles objects with @id set to null or undefined", () => {
    const serverObjectWithNull = {
      "@id": null,
      "@type": ["AlignmentFile", "File", "Item"],
    };
    const serverObjectWithUndefined = {
      "@id": undefined,
      "@type": ["AlignmentFile", "File", "Item"],
    };
    const resolvedUrl = "/alignment-files/IGVFFI123456/";

    expect(
      createCanonicalUrlRedirect(serverObjectWithNull, resolvedUrl, {} as any)
    ).toBeNull();
    expect(
      createCanonicalUrlRedirect(
        serverObjectWithUndefined,
        resolvedUrl,
        {} as any
      )
    ).toBeNull();
  });

  it("works with different object types", () => {
    const serverObject = {
      "@id": "/analysis-sets/IGVFDS0000AAAA/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS0000AAAA",
    };
    const resolvedUrl = "/IGVFDS0000AAAA/";

    const result = createCanonicalUrlRedirect(serverObject, resolvedUrl, {});

    expect(result).toEqual({
      redirect: {
        destination: "/analysis-sets/IGVFDS0000AAAA/",
        permanent: false,
      },
    });
  });

  it("preserves query parameters from Next.js query object", () => {
    const serverObject = {
      "@id": "/alignment-files/IGVFFI123456/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI123456",
    };
    const resolvedUrl = "/IGVFFI123456/";
    const query = {
      id: "IGVFFI123456", // This should be filtered out (dynamic route param)
      format: "json",
      debug: "true",
    };

    const result = createCanonicalUrlRedirect(serverObject, resolvedUrl, query);

    expect(result).toEqual({
      redirect: {
        destination: "/alignment-files/IGVFFI123456/?format=json&debug=true",
        permanent: false,
      },
    });
  });

  it("handles array query parameters", () => {
    const serverObject = {
      "@id": "/alignment-files/IGVFFI123456/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI123456",
    };
    const resolvedUrl = "/IGVFFI123456/";
    const query = {
      id: "IGVFFI123456", // This should be filtered out
      tags: ["tag1", "tag2"],
      format: "json",
    };

    const result = createCanonicalUrlRedirect(serverObject, resolvedUrl, query);

    expect(result).toEqual({
      redirect: {
        destination:
          "/alignment-files/IGVFFI123456/?tags=tag1&tags=tag2&format=json",
        permanent: false,
      },
    });
  });

  it("filters out dynamic route parameters", () => {
    const serverObject = {
      "@id": "/analysis-sets/IGVFDS0000AAAA/",
      "@type": ["AnalysisSet", "FileSet", "Item"],
      accession: "IGVFDS0000AAAA",
    };
    const resolvedUrl = "/IGVFDS0000AAAA/";
    const query = {
      path: ["IGVFDS0000AAAA"], // This should be filtered out (dynamic route param)
      id: "IGVFDS0000AAAA", // This should be filtered out (dynamic route param)
      format: "json",
    };

    const result = createCanonicalUrlRedirect(serverObject, resolvedUrl, query);

    expect(result).toEqual({
      redirect: {
        destination: "/analysis-sets/IGVFDS0000AAAA/?format=json",
        permanent: false,
      },
    });
  });

  it("handles empty query object", () => {
    const serverObject = {
      "@id": "/alignment-files/IGVFFI123456/",
      "@type": ["AlignmentFile", "File", "Item"],
      accession: "IGVFFI123456",
    };
    const resolvedUrl = "/IGVFFI123456/";
    const query = {};

    const result = createCanonicalUrlRedirect(serverObject, resolvedUrl, query);

    expect(result).toEqual({
      redirect: {
        destination: "/alignment-files/IGVFFI123456/",
        permanent: false,
      },
    });
  });
});

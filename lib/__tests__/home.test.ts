import {
  collectFileSetMonths,
  composeFileSetQueryElements,
  composeMonthRangeQueryElement,
  convertFileSetsToReleaseData,
  convertFileSetsToLabData,
  FileSetMonths,
  filterFileSetsByMonth,
  formatMonth,
  generateEveryMonthBetween,
  generateFileSetMonthList,
  generateNumberArray,
  isReleasedFileSet,
  isNonReleasedFileSet,
} from "../home";
import type { DatabaseObject } from "../../globals.d";

describe("Test formatMonth function", () => {
  it("returns the given month if it is 'All'", () => {
    expect(formatMonth("All", "MMMM yyyy")).toBe("All");
  });

  it("returns the given month in MMMM yyyy format", () => {
    expect(formatMonth("2020-01", "MMMM yyyy")).toBe("January 2020");
    expect(formatMonth("2023-12", "MMM yyyy")).toBe("Dec 2023");
  });
});

describe("Test generateNumberArray function", () => {
  it("returns an array of numbers from 0 to the given number", () => {
    expect(generateNumberArray(5, 6)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(generateNumberArray(10, 6)).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it("returns an array of numbers from 0 to 5 if the given number is less than 5", () => {
    expect(generateNumberArray(3, 4)).toEqual([0, 1, 2, 3]);
    expect(generateNumberArray(1, 4)).toEqual([0, 1]);
  });
});

describe("Test generateEveryMonthBetween function", () => {
  it("returns an array of all the months between the given months", () => {
    expect(generateEveryMonthBetween("2022-01", "2022-03")).toEqual([
      "2022-01",
      "2022-02",
      "2022-03",
    ]);

    expect(generateEveryMonthBetween("2022-01", "2022-01")).toEqual([
      "2022-01",
    ]);

    expect(generateEveryMonthBetween("2022-11", "2023-01")).toEqual([
      "2022-11",
      "2022-12",
      "2023-01",
    ]);
  });
});

describe("Test collectFileSetMonths function", () => {
  it("returns an array of unique YYYY-MM values for the given file sets", () => {
    const fileSets: DatabaseObject[] = [
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3380CCRQ/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "released",
        creation_timestamp: "2023-06-07T11:07:43.000000+00:00",
        release_timestamp: "2023-06-07T11:07:43.000000+00:00",
        uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS9298GEKM/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "released",
        creation_timestamp: "2023-09-19T05:22:02.000000+00:00",
        release_timestamp: "2023-09-19T05:22:02.000000+00:00",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS9298NOTS/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "released",
        creation_timestamp: "2023-09-19T05:22:02.000000+00:00",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS0000GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "in progress",
        creation_timestamp: "2022-07-05T16:59:01.000000+00:00",
        files: [
          { "@id": "/configuration-files/IGVFDS0001CCRQ/" },
          { "@id": "/configuration-files/IGVFDS0002CCRQ/" },
        ],
        submitted_files_timestamp: "2023-07-05T16:59:01.000000+00:00",
        uuid: "fcff4286-f31e-4530-8f10-a5843f08c43c",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS0000GTTC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "in progress",
        creation_timestamp: "2022-07-05T16:59:01.000000+00:00",
        files: [
          { "@id": "/configuration-files/IGVFDS0001CCRQ/" },
          { "@id": "/configuration-files/IGVFDS0002CCRQ/" },
        ],
        uuid: "fcff4286-f31e-4530-8f10-a5843f08c43c",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS0001GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "in progress",
        creation_timestamp: "2023-06-27T11:18:05.000000+00:00",
        uuid: "c4dc18d1-488f-42b4-87c1-a96140d4355b",
      },
    ];

    expect(collectFileSetMonths(fileSets)).toEqual({
      "/measurement-sets/IGVFDS0000GTPC/": "2023-07",
      "/measurement-sets/IGVFDS0001GTPC/": "2023-06",
      "/measurement-sets/IGVFDS3380CCRQ/": "2023-06",
      "/measurement-sets/IGVFDS9298GEKM/": "2023-09",
    });
  });
});

describe("Test generateFileSetMonthList", () => {
  it("take a FileSetMonths object and return a list of months", () => {
    const fileSetMonths: FileSetMonths = {
      "/measurement-sets/IGVFDS3380CCRQ/": "2023-06",
      "/measurement-sets/IGVFDS9298GEKM/": "2023-09",
      "/measurement-sets/IGVFDS3135GTPC/": "2022-07",
    };

    expect(generateFileSetMonthList(fileSetMonths)).toEqual([
      "2023-09",
      "2023-06",
      "2022-07",
    ]);
  });
});

describe("Test filterFileSetsByMonth function", () => {
  it("returns all the given file sets if the given month is 'All'", () => {
    const fileSets = [
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3380CCRQ/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-06-07T11:07:43.000000+00:00",
        status: "released",
        uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS9298GEKM/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-09-19T05:22:02.000000+00:00",
        status: "released",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3135GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2022-07-05T16:59:01.000000+00:00",
        status: "released",
        uuid: "fcff4286-f31e-4530-8f10-a5843f08c43c",
      },
    ];
    const fileSetMonths = {
      "/measurement-sets/IGVFDS3380CCRQ/": "2023-06",
      "/measurement-sets/IGVFDS9298GEKM/": "2023-09",
      "/measurement-sets/IGVFDS3135GTPC/": "2022-07",
    };
    expect(filterFileSetsByMonth(fileSets, fileSetMonths, "All")).toEqual(
      fileSets
    );
  });

  it("returns the file sets created in the given month", () => {
    const fileSets = [
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3380CCRQ/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-06-07T11:07:43.000000+00:00",
        status: "released",
        uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS9298GEKM/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-09-19T05:22:02.000000+00:00",
        status: "released",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3135GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2022-07-05T16:59:01.000000+00:00",
        status: "released",
        uuid: "fcff4286-f31e-4530-8f10-a5843f08c43c",
      },
    ];
    const fileSetMonths = {
      "/measurement-sets/IGVFDS3380CCRQ/": "2023-06",
      "/measurement-sets/IGVFDS9298GEKM/": "2023-09",
      "/measurement-sets/IGVFDS3135GTPC/": "2022-07",
    };

    expect(filterFileSetsByMonth(fileSets, fileSetMonths, "2023-09")).toEqual([
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS9298GEKM/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-09-19T05:22:02.000000+00:00",
        status: "released",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
    ]);
  });
});

describe("Test composeMonthRangeQueryElement functions", () => {
  it("returns the month-range query element for the given month", () => {
    expect(composeMonthRangeQueryElement("2023-06")).toEqual(
      "[2023-06-01%20TO%202023-06-30]"
    );
  });

  it("returns an empty string if the given month is 'All'", () => {
    expect(composeMonthRangeQueryElement("All")).toEqual("");
  });
});

describe("Test composeFileSetQueryElements()", () => {
  it("returns the query-string elements for all conditions", () => {
    let queryElements = composeFileSetQueryElements("released", "All");
    expect(queryElements).toEqual(
      "&status=released&status=archived&status=revoked"
    );

    queryElements = composeFileSetQueryElements("released", "2023-06");
    expect(queryElements).toEqual(
      "&status=released&status=archived&status=revoked&advancedQuery=release_timestamp:[2023-06-01%20TO%202023-06-30]"
    );

    queryElements = composeFileSetQueryElements("withFiles", "All");
    expect(queryElements).toEqual("&status=in+progress&files=*");

    queryElements = composeFileSetQueryElements("withFiles", "2024-02");
    expect(queryElements).toEqual(
      "&status=in+progress&files=*&advancedQuery=submitted_files_timestamp:[2024-02-01%20TO%202024-02-29]"
    );

    queryElements = composeFileSetQueryElements("initiated", "All");
    expect(queryElements).toEqual("&status=in+progress&files!=*");

    queryElements = composeFileSetQueryElements("initiated", "2022-01");
    expect(queryElements).toEqual(
      "&status=in+progress&files!=*&advancedQuery=creation_timestamp:[2022-01-01%20TO%202022-01-31]"
    );
  });
});

describe("Test convertFileSetsToLabData function", () => {
  it("returns the given file sets converted to Nivo data", () => {
    const fileSets = [
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3380CCRQ/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          term_name:
            "muscular dystrophy-dystroglycanopathy (congenital with brain and eye anomalies), type A14",
        },
        creation_timestamp: "2023-06-07T11:07:43.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        preferred_assay_title: "10x multiome",
        status: "released",
        uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS9298GEKM/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          term_name: "imaging assay",
        },
        creation_timestamp: "2023-09-19T05:22:02.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        status: "in progress",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3135GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          term_name: "MPRA",
        },
        creation_timestamp: "2022-07-05T16:59:01.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        files: ["file1", "file2"],
        preferred_assay_title: "yN2H",
        status: "in progress",
        uuid: "fcff4286-f31e-4530-8f10-a5843f08c43c",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS0077DACQ/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        assay_term: {
          term_name: "snM3C-seq",
        },
        creation_timestamp: "2022-07-05T16:59:01.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        preferred_assay_title: "snMCT-seq",
        status: "in progress",
        uuid: "ccadf134-1e17-47db-84c1-72c67de06d84",
      },
    ];

    const nivoData = convertFileSetsToLabData(fileSets, "All", true);
    expect(nivoData).toEqual({
      fileSetData: [
        {
          title: "J. Michael Cherry, Stanford|prf^yN2H",
          selectedMonth: "All",
          shouldIncludeLinks: true,
          initiated: 0,
          released: 0,
          withFiles: 1,
        },
        {
          title: "J. Michael Cherry, Stanford|prf^snMCT-seq",
          selectedMonth: "All",
          shouldIncludeLinks: true,
          released: 0,
          initiated: 1,
          withFiles: 0,
        },
        {
          title: "J. Michael Cherry, Stanford|prf^10x multiome",
          selectedMonth: "All",
          shouldIncludeLinks: true,
          released: 1,
          initiated: 0,
          withFiles: 0,
        },
        {
          title: "J. Michael Cherry, Stanford|atn^imaging assay",
          selectedMonth: "All",
          shouldIncludeLinks: true,
          released: 0,
          initiated: 1,
          withFiles: 0,
        },
      ],
      counts: {
        released: 1,
        initiated: 2,
        withFiles: 1,
      },
      maxCount: 1,
    });
  });
});

describe("Test convertFileSetsToReleaseData function", () => {
  it("returns the given file sets converted to Nivo data", () => {
    const fileSets: DatabaseObject[] = [
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3380CCRQ/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-01-07T11:07:43.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        release_timestamp: "2023-02-07T11:07:43.000000+00:00",
        status: "released",
        summary: "MPRA (lentiMPRA) followed by bulk RNA-seq",
        uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS9298GEKM/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-01-19T05:22:02.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        release_timestamp: "2023-05-19T05:22:02.000000+00:00",
        status: "released",
        summary: "single-cell RNA sequencing assay (Parse Split-seq)",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3135GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2022-12-05T16:59:01.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        release_timestamp: "2023-02-05T16:59:01.000000+00:00",
        status: "released",
        summary: "localizing STARR-seq (SUPERSTARR)",
        uuid: "fcff4286-f31e-4530-8f10-a5843f08c43c",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3135GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2022-12-05T16:59:01.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        files: ["file1", "file2"],
        release_timestamp: "2022-12-05T16:59:01.000000+00:00",
        status: "released",
        summary: "localizing STARR-seq (SUPERSTARR)",
        uuid: "fcff4286-f31e-4530-8f10-a5843f08c43c",
      },
    ];

    const releaseData = convertFileSetsToReleaseData(fileSets);
    expect(releaseData.slice(0, 6)).toEqual([
      { x: "Dec 2022", y: 1 },
      { x: "Jan 2023", y: 1 },
      { x: "Feb 2023", y: 3 },
      { x: "Mar 2023", y: 3 },
      { x: "Apr 2023", y: 3 },
      { x: "May 2023", y: 4 },
    ]);
  });
});

describe("Test functions to check the status of file sets", () => {
  const fileSetReleased: DatabaseObject = {
    "@context": "/terms/",
    "@id": "/measurement-sets/IGVFDS3380CCRQ/",
    "@type": ["MeasurementSet", "FileSet", "Item"],
    creation_timestamp: "2023-01-07T11:07:43.000000+00:00",
    lab: {
      title: "J. Michael Cherry, Stanford",
    },
    release_timestamp: "2023-02-07T11:07:43.000000+00:00",
    status: "released",
    summary: "MPRA (lentiMPRA) followed by bulk RNA-seq",
    uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
  };
  const fileSetArchived: DatabaseObject = {
    "@context": "/terms/",
    "@id": "/measurement-sets/IGVFDS3380CCRQ/",
    "@type": ["MeasurementSet", "FileSet", "Item"],
    creation_timestamp: "2023-01-07T11:07:43.000000+00:00",
    lab: {
      title: "J. Michael Cherry, Stanford",
    },
    release_timestamp: "2023-02-07T11:07:43.000000+00:00",
    status: "archived",
    summary: "MPRA (lentiMPRA) followed by bulk RNA-seq",
    uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
  };
  const fileSetRevoked: DatabaseObject = {
    "@context": "/terms/",
    "@id": "/measurement-sets/IGVFDS3380CCRQ/",
    "@type": ["MeasurementSet", "FileSet", "Item"],
    creation_timestamp: "2023-01-07T11:07:43.000000+00:00",
    lab: {
      title: "J. Michael Cherry, Stanford",
    },
    release_timestamp: "2023-02-07T11:07:43.000000+00:00",
    status: "revoked",
    summary: "MPRA (lentiMPRA) followed by bulk RNA-seq",
    uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
  };
  const fileSetInProgress: DatabaseObject = {
    "@context": "/terms/",
    "@id": "/measurement-sets/IGVFDS3380CCRQ/",
    "@type": ["MeasurementSet", "FileSet", "Item"],
    creation_timestamp: "2023-01-07T11:07:43.000000+00:00",
    lab: {
      title: "J. Michael Cherry, Stanford",
    },
    release_timestamp: "2023-02-07T11:07:43.000000+00:00",
    status: "in progress",
    summary: "MPRA (lentiMPRA) followed by bulk RNA-seq",
    uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
  };
  const fileSetDeleted: DatabaseObject = {
    "@context": "/terms/",
    "@id": "/measurement-sets/IGVFDS3380CCRQ/",
    "@type": ["MeasurementSet", "FileSet", "Item"],
    creation_timestamp: "2023-01-07T11:07:43.000000+00:00",
    lab: {
      title: "J. Michael Cherry, Stanford",
    },
    release_timestamp: "2023-02-07T11:07:43.000000+00:00",
    status: "deleted",
    summary: "MPRA (lentiMPRA) followed by bulk RNA-seq",
    uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
  };

  test("isReleasedFilesSet returns true if the given file set is released", () => {
    expect(isReleasedFileSet(fileSetReleased)).toBe(true);
    expect(isReleasedFileSet(fileSetArchived)).toBe(true);
    expect(isReleasedFileSet(fileSetRevoked)).toBe(true);
    expect(isReleasedFileSet(fileSetInProgress)).toBe(false);
    expect(isReleasedFileSet(fileSetDeleted)).toBe(false);
  });

  test("isNonReleasedFileSet returns true if the given file set is not released", () => {
    expect(isNonReleasedFileSet(fileSetReleased)).toBe(false);
    expect(isNonReleasedFileSet(fileSetArchived)).toBe(false);
    expect(isNonReleasedFileSet(fileSetRevoked)).toBe(false);
    expect(isNonReleasedFileSet(fileSetInProgress)).toBe(true);
    expect(isNonReleasedFileSet(fileSetDeleted)).toBe(false);
  });
});

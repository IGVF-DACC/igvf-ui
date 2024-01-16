import {
  collectFileSetMonths,
  convertFileSetsToReleaseData,
  convertFileSetsToStatusData,
  filterFileSetsByMonth,
  formatMonth,
  generateEveryMonthBetween,
  generateNumberArray,
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
    const fileSets = [
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3380CCRQ/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "released",
        creation_timestamp: "2023-06-07T11:07:43.000000+00:00",
        uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS9298GEKM/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "released",
        creation_timestamp: "2023-09-19T05:22:02.000000+00:00",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3135GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "released",
        creation_timestamp: "2022-07-05T16:59:01.000000+00:00",
        uuid: "fcff4286-f31e-4530-8f10-a5843f08c43c",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3135GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        status: "released",
        creation_timestamp: "2023-06-27T11:18:05.000000+00:00",
        uuid: "c4dc18d1-488f-42b4-87c1-a96140d4355b",
      },
    ];
    expect(collectFileSetMonths(fileSets)).toEqual([
      "2022-07",
      "2023-06",
      "2023-09",
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
    expect(filterFileSetsByMonth(fileSets, "All")).toEqual(fileSets);
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
        "@id": "/measurement-sets",
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

    expect(filterFileSetsByMonth(fileSets, "2023-09")).toEqual([
      {
        "@context": "/terms/",
        "@id": "/measurement-sets",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-09-19T05:22:02.000000+00:00",
        status: "released",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
    ]);
  });
});

describe("Test convertFileSetsToStatusData function", () => {
  it("returns the given file sets converted to Nivo data", () => {
    const fileSets = [
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3380CCRQ/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-06-07T11:07:43.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        status: "released",
        summary: "MPRA (lentiMPRA) followed by bulk RNA-seq",
        uuid: "f3c038f8-3b58-4d1b-8468-f845340dd7e3",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS9298GEKM/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2023-09-19T05:22:02.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        status: "in progress",
        summary: "single-cell RNA sequencing assay (Parse Split-seq)",
        uuid: "f1f04a03-009f-434f-a31b-3f12c6ead3aa",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS3135GTPC/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2022-07-05T16:59:01.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        files: ["file1", "file2"],
        status: "in progress",
        summary: "localizing STARR-seq (SUPERSTARR)",
        uuid: "fcff4286-f31e-4530-8f10-a5843f08c43c",
      },
      {
        "@context": "/terms/",
        "@id": "/measurement-sets/IGVFDS0077DACQ/",
        "@type": ["MeasurementSet", "FileSet", "Item"],
        creation_timestamp: "2022-07-05T16:59:01.000000+00:00",
        lab: {
          title: "J. Michael Cherry, Stanford",
        },
        status: "in progress",
        summary: "localizing STARR-seq (SUPERSTARR)",
        uuid: "ccadf134-1e17-47db-84c1-72c67de06d84",
      },
    ];

    const nivoData = convertFileSetsToStatusData(fileSets);
    expect(nivoData).toEqual({
      fileSetData: [
        {
          summary:
            "J. Michael Cherry, Stanford|single-cell RNA sequencing assay (Parse Split-seq)",
          released: 0,
          initiated: 1,
          withFiles: 0,
        },
        {
          summary:
            "J. Michael Cherry, Stanford|localizing STARR-seq (SUPERSTARR)",
          released: 0,
          initiated: 1,
          withFiles: 1,
        },
        {
          summary:
            "J. Michael Cherry, Stanford|MPRA (lentiMPRA) followed by bulk RNA-seq",
          released: 1,
          initiated: 0,
          withFiles: 0,
        },
      ],
      maxCount: 2,
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
    expect(releaseData).toEqual([
      { x: "Dec 2022", y: 1 },
      { x: "Jan 2023", y: 1 },
      { x: "Feb 2023", y: 3 },
      { x: "Mar 2023", y: 3 },
      { x: "Apr 2023", y: 3 },
      { x: "May 2023", y: 4 },
    ]);
  });
});

import {
  convertLabDataToChartData,
  getAllFileSetTypes,
  getFileSetTypeConfig,
  isGroupByValueAnArrayOfStrings,
  requestSummary,
  type GroupByValue,
} from "../home";
import { type LabData } from "../home";

describe("Test convertLabDataToChartData function", () => {
  it("returns the given file sets converted to Nivo data", () => {
    const labData: LabData = {
      group_by: ["lab.title", "preferred_assay_title"],
      label: "Preferred assay title",
      doc_count: 27,
      "lab.title": {
        buckets: [
          {
            key: "J. Michael Cherry, Stanford",
            doc_count: 14,
            preferred_assay_title: {
              buckets: [
                {
                  key: "10x multiome",
                  doc_count: 2,
                  status: {
                    buckets: [
                      {
                        key: "released",
                        doc_count: 2,
                      },
                    ],
                  },
                },
                {
                  key: "10x multiome with MULTI-seq",
                  doc_count: 1,
                  status: {
                    buckets: [
                      {
                        key: "released",
                        doc_count: 1,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const labChartData = convertLabDataToChartData(labData);
    expect(labChartData).toEqual({
      chartData: [
        { title: "J. Michael Cherry, Stanford|10x multiome", value: 2 },
        {
          title: "J. Michael Cherry, Stanford|10x multiome with MULTI-seq",
          value: 1,
        },
      ],
      maxCount: 27,
    });
  });

  it("returns the given file sets converted to Nivo data when only one group exists", () => {
    const labData: LabData = {
      group_by: ["lab.title", ["assay_titles", "no_assay_titles"]],
      label: "Assay titles",
      doc_count: 5,
      "lab.title": {
        buckets: [
          {
            key: "J. Michael Cherry, Stanford",
            doc_count: 5,
            assay_titles: {
              buckets: [
                {
                  key: "no_assay_titles",
                  doc_count: 3,
                  status: {
                    buckets: [
                      {
                        key: "released",
                        doc_count: 3,
                      },
                    ],
                  },
                },
                {
                  key: "SUPERSTARR",
                  doc_count: 1,
                  status: {
                    buckets: [
                      {
                        key: "released",
                        doc_count: 1,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const labChartData = convertLabDataToChartData(labData);
    expect(labChartData).toEqual({
      chartData: [
        { title: "J. Michael Cherry, Stanford|unspecified assay", value: 3 },
        {
          title: "J. Michael Cherry, Stanford|SUPERSTARR",
          value: 1,
        },
      ],
      maxCount: 5,
    });
  });
});

describe("Test getFileSetTypeConfig function", () => {
  test("returns the configuration for the given file-set type", () => {
    expect(getFileSetTypeConfig("raw")).toEqual({
      dataQuery: "config=PreferredAssayTitleSummary&status=released",
      typeQuery: "MeasurementSet",
      title: "Raw Datasets",
      termProp: "preferred_assay_title",
      foreground: "fore-fileset-type-measurement",
      background: "back-fileset-type-measurement",
    });

    expect(getFileSetTypeConfig("processed")).toEqual({
      dataQuery: "config=AssayTitlesSummary&status=released",
      typeQuery: "AnalysisSet",
      title: "Processed Datasets",
      termProp: "assay_titles",
      foreground: "fore-fileset-type-analysis",
      background: "back-fileset-type-analysis",
    });

    expect(getFileSetTypeConfig("predictions")).toEqual({
      dataQuery: "config=FileSetTypeSummary&status=released",
      typeQuery: "PredictionSet",
      title: "Predictions Datasets",
      termProp: "file_set_type",
      foreground: "fore-fileset-type-prediction",
      background: "back-fileset-type-prediction",
    });

    // Bypass type checking for test purposes.
    const invalidValue = "invalid" as any;
    expect(getFileSetTypeConfig(invalidValue)).toEqual({
      dataQuery: "",
      typeQuery: "",
      title: "No Data Available",
      termProp: "",
      foreground: "",
      background: "",
    });
  });
});

describe("Test getAllFileSetTypes function", () => {
  it("returns all file-set types", () => {
    expect(getAllFileSetTypes()).toEqual(["processed", "predictions", "raw"]);
  });
});

describe("Test the isGroupByValueAnArrayOfStrings() type guard", () => {
  it("returns true for valid data", () => {
    const validArray: GroupByValue = ["lab.title", "preferred_assay_title"];
    expect(isGroupByValueAnArrayOfStrings(validArray)).toBe(true);
  });

  it("returns false for invalid data", () => {
    const invalidInputs: GroupByValue[] = [
      // @ts-expect-error: Deliberately violating the GroupByValue type for testing
      ["lab.title", 42],
      // @ts-expect-error: Deliberately violating the GroupByValue type for testing
      ["lab.title", "preferred_assay_title", 42],
    ];

    invalidInputs.forEach((input) => {
      const inputValue = input as any;
      expect(isGroupByValueAnArrayOfStrings(inputValue)).toBe(false);
    });
  });
});

describe("Test the requestSummary() function", () => {
  it("returns the summary data", async () => {
    const summaryData = {
      group_by: ["lab.title", "preferred_assay_title"],
      label: "Preferred assay title",
      doc_count: 27,
      "lab.title": {
        buckets: [
          {
            key: "J. Michael Cherry, Stanford",
            doc_count: 14,
            preferred_assay_title: {
              buckets: [
                {
                  key: "10x multiome",
                  doc_count: 2,
                  status: {
                    buckets: [
                      {
                        key: "released",
                        doc_count: 2,
                      },
                    ],
                  },
                },
                {
                  key: "10x multiome with MULTI-seq",
                  doc_count: 1,
                  status: {
                    buckets: [
                      {
                        key: "released",
                        doc_count: 1,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const mockFunction = jest.fn();
    window.fetch = mockFunction.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(summaryData),
      })
    );

    const response = await requestSummary("raw");
    expect(response).toEqual(summaryData);
  });
});

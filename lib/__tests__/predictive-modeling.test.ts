import type { PredictionSetObject } from "../file-sets";
import {
  filterSoftwareByText,
  getFileSetTypeDescriptions,
  groupSoftwareByFileSetType,
  type FileSetTypeSections,
} from "../predictive-modeling";
import type {
  Profiles,
  SoftwareObject,
  SoftwareVersionObject,
} from "../../globals";

function software(
  id: string,
  title: string,
  description: string
): SoftwareObject {
  return {
    "@id": id,
    "@type": ["Software"],
    status: "released",
    name: title.toLowerCase(),
    title,
    description,
    source_url: `https://example.com/${title}`,
  };
}

function softwareVersion(
  id: string,
  softwarePath: string
): SoftwareVersionObject {
  return {
    "@id": id,
    "@type": ["SoftwareVersion"],
    status: "released",
    aliases: [],
    name: id,
    software: softwarePath,
    version: "1.0",
  };
}

function predictionSet(
  id: string,
  fileSetType: string,
  softwareVersionPaths: string[]
): PredictionSetObject {
  return {
    "@id": id,
    "@type": ["PredictionSet"],
    status: "released",
    file_set_type: fileSetType,
    software_versions: softwareVersionPaths,
  } as PredictionSetObject;
}

describe("filterSoftwareByText", () => {
  it("filters software by title or description without changing section counts", () => {
    const alpha = software("/software/alpha/", "Alpha", "First tool");
    const beta = software("/software/beta/", "Beta", "Genome predictor");
    const sections: FileSetTypeSections[] = [
      {
        fileSetType: "models",
        software: [alpha, beta],
        unfilteredSoftwareCount: 2,
      },
    ];

    expect(filterSoftwareByText(sections, "alpha")).toEqual([
      { ...sections[0], software: [alpha] },
    ]);
    expect(filterSoftwareByText(sections, "predictor")).toEqual([
      { ...sections[0], software: [beta] },
    ]);
    expect(filterSoftwareByText(sections, "missing")).toEqual([
      { ...sections[0], software: [] },
    ]);
  });
});

describe("groupSoftwareByFileSetType", () => {
  it("groups, deduplicates, and sorts referenced software", () => {
    const alpha = software("/software/alpha/", "alpha", "Alpha tool");
    const zulu = software("/software/zulu/", "Zulu", "Zulu tool");
    const versions = [
      softwareVersion("/software-versions/alpha/", alpha["@id"]),
      softwareVersion("/software-versions/zulu/", zulu["@id"]),
      softwareVersion(
        "/software-versions/missing-software/",
        "/software/missing/"
      ),
    ];
    const predictionSets = [
      predictionSet("/prediction-sets/2/", "zeta type", [versions[1]["@id"]]),
      predictionSet("/prediction-sets/1/", "Alpha type", [
        versions[1]["@id"],
        versions[0]["@id"],
        versions[0]["@id"],
        versions[2]["@id"],
        "/software-versions/missing-version/",
      ]),
      predictionSet("/prediction-sets/3/", "empty type", [
        "/software-versions/missing-version/",
      ]),
    ];

    expect(
      groupSoftwareByFileSetType(predictionSets, versions, [zulu, alpha])
    ).toEqual([
      {
        fileSetType: "Alpha type",
        software: [alpha, zulu],
        unfilteredSoftwareCount: 2,
      },
      {
        fileSetType: "zeta type",
        software: [zulu],
        unfilteredSoftwareCount: 1,
      },
    ]);
  });
});

describe("getFileSetTypeDescriptions", () => {
  it("returns the file-set-type enum descriptions", () => {
    const descriptions = { model: "A model prediction set" };
    const profiles = {
      PredictionSet: {
        title: "Prediction set",
        type: "object",
        properties: {
          file_set_type: { type: "string", enum_descriptions: descriptions },
        },
      },
    } as unknown as Profiles;

    expect(getFileSetTypeDescriptions(profiles)).toBe(descriptions);
  });

  it.each([
    {},
    { PredictionSet: { title: "Invalid schema" } },
    {
      PredictionSet: {
        title: "Prediction set",
        type: "object",
        properties: {},
      },
    },
    {
      PredictionSet: {
        title: "Prediction set",
        type: "object",
        properties: { file_set_type: { type: "string" } },
      },
    },
  ])(
    "returns an empty object when descriptions are unavailable",
    (profiles) => {
      expect(
        getFileSetTypeDescriptions(profiles as unknown as Profiles)
      ).toEqual({});
    }
  );
});

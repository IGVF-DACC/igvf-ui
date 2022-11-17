// libs
import getProfiles from "../profiles";

describe("Test getProfiles functionality", () => {
  it("retrieves the schema profiles object", () => {
    const mockData = {
      title: "Human Donor",
      $id: "/profiles/human_donor.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      description: "Derived schema submitting human donors.",
      type: "object",
      properties: {
        taxa: {
          title: "Taxa",
          type: "string",
          enum: ["Homo sapiens"],
        },
      },
    };

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    getProfiles({ _csfrt_: "mocktoken" }).then((data) => {
      expect(data).toEqual(mockData);
    });
  });
});

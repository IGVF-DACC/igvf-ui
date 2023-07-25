import getCollectionTitles from "../collection-titles";

describe("Test the getCollectionTitles function", () => {
  it("returns the collection-titles object", async () => {
    const expectedCollectionTitles = {
      awards: "Awards (Grants)",
      Award: "Awards (Grants)",
      award: "Awards (Grants)",
      biomarkers: "Biomarkers",
      Biomarker: "Biomarkers",
      biomarker: "Biomarkers",
      "human-donors": "Human Donors",
      HumanDonor: "Human Donors",
      human_donor: "Human Donors",
      "rodent-donors": "Rodent Donors",
      RodentDonor: "Rodent Donors",
      rodent_donor: "Rodent Donors",
    };

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(expectedCollectionTitles),
      }),
    );

    const collectionTitles = await getCollectionTitles("SESSIONCSFRTOKEN");
    expect(collectionTitles).toEqual(expectedCollectionTitles);
  });
});

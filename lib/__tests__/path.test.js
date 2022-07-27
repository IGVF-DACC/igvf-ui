import { getCollectionPathFromItemPath } from "../paths";

describe("Path utilities", () => {
  it("converts an item path to the corresponding collection path", () => {
    const collectionPath = getCollectionPathFromItemPath(
      "/labs/76038707-e9c3-4314-944a-5ddf2fc23efc/"
    );
    expect(collectionPath).toBe("/labs/");
  });
});

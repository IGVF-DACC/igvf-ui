import { pathToType } from "../general"

describe("Test the pathToType utility function", () => {
  it("should return the type that the given path indicates; or the empty string", () => {
    expect(
      pathToType("/cell-lines/467c72a2-4f84-2c8f-96b0-ec8715e18185/")
    ).toBe("cell-lines")
    expect(pathToType("/labs/j-michael-cherry/")).toBe("labs")
    expect(pathToType("j-michael-cherry/")).toBe("")
  })
})

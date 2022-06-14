import Curie from "../curie"

describe("Test the abstract CURIE base class works OK", () => {
  it("creates a valid abstract Curie object and has expected getter results", () => {
    const validCurie = new Curie("EFO:0002067")
    expect(validCurie.isValid).toBe(true)
    expect(validCurie.curie).toBe("EFO:0002067")
    expect(validCurie.url).toBe("")
  })

  it("creates an invalid abstract Curie object and has expected getter results", () => {
    const validCurie = new Curie("EFO")
    expect(validCurie.isValid).toBe(false)
    expect(validCurie.curie).toBe("EFO")
    expect(validCurie.url).toBe("")
  })
})

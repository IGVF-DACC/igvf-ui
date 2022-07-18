import { render, screen } from "@testing-library/react"
import { OntologyTerm, OntologyTermId } from "../ontology"

describe("Test OntologyTerm class", () => {
  it("properly detects valid and invalid ontology terms", () => {
    const validTerm = new OntologyTerm("EFO:0000001")
    expect(validTerm.isValid).toBe(true)

    const invalidTerm = new OntologyTerm("EFO:")
    expect(invalidTerm.isValid).toBe(false)
  })

  it("properly generates a URL for known and unknown ontology terms", () => {
    const validTerm = new OntologyTerm("EFO:0000001")
    expect(validTerm.url).toBe("http://www.ebi.ac.uk/efo/EFO_0000001")

    const invalidTerm = new OntologyTerm("ABC:123")
    expect(invalidTerm.url).toBe("")
  })
})

describe("Test mapping ontology term IDs to links", () => {
  it("should map term IDs to corresponding links", () => {
    render(<OntologyTermId termId="EFO:0001" />)

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "http://www.ebi.ac.uk/efo/EFO_0001"
    )
    expect(screen.getByRole("link")).toHaveTextContent("EFO:0001")
  })

  it("should map unknown EFO IDs to regular text", () => {
    render(<OntologyTermId termId="ABC:0001" />)

    expect(() => screen.getByRole("link")).toThrow()
    expect(screen.getByText("ABC:0001")).toBeInTheDocument()
  })

  it("should map malformed term IDs to regular text", () => {
    render(<OntologyTermId termId="EFO:0001:XYZ" />)

    expect(() => screen.getByRole("link")).toThrow()
    expect(screen.getByText("EFO:0001:XYZ")).toBeInTheDocument()
  })
})

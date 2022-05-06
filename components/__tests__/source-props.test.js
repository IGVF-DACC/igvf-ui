import { render, screen } from "@testing-library/react"
import SourceProp from "../source-prop"

describe("Test the SourceProp component", () => {
  it("generates the proper link for a source object", () => {
    const sourceObject = {
      url: "http://www.abcam.com",
      name: "abcam",
      title: "Abcam",
      status: "released",
      description: "Abcam",
      "@id": "/sources/abcam/",
      "@type": ["Source", "Item"],
      uuid: "b40f24ee-8803-4937-9223-1df3a6bf3cd9",
      "@context": "/terms/",
    }
    render(<SourceProp source={sourceObject} />)
    expect(screen.getByText("Abcam")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "http://www.abcam.com"
    )
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank")
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noreferrer")
  })

  it("generates the proper link for a lab object", () => {
    const labObject = {
      pi: "/users/860c4750-8d3c-40f5-8f2c-90c5e5d19e88/",
      name: "j-michael-cherry",
      awards: ["/awards/HG012012/"],
      status: "current",
      institute_label: "Stanford",
      "@id": "/labs/j-michael-cherry/",
      "@type": ["Lab", "Item"],
      uuid: "cfb789b8-46f3-4d59-a2b3-adc39e7df93a",
      title: "J. Michael Cherry, Stanford",
      "@context": "/terms/",
    }
    render(<SourceProp source={labObject} />)
    expect(screen.getByText("J. Michael Cherry, Stanford")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/labs/j-michael-cherry"
    )
    expect(screen.getByRole("link")).not.toHaveAttribute("target", "_blank")
  })

  it("generates nothing for an object not a lab or source", () => {
    const otherObject = {
      "@id": "/users/j-michael-cherry/",
    }
    const { container } = render(<SourceProp source={otherObject} />)
    expect(container.firstChild).toBeNull()
  })
})

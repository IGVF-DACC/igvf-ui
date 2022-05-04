import { render, screen } from "@testing-library/react"
import Status from "../status"

describe("Test the status badges", () => {
  it("generates the correct status-badge Tailwind CSS classes for the current state", () => {
    const { container } = render(<Status status="current" />)
    expect(container.getElementsByClassName("bg-[#00a99d]").length).toBe(1)
  })

  it("generates the correct status-badge Tailwind CSS classes for the current state", () => {
    const { container } = render(<Status status="deleted" />)
    expect(container.getElementsByClassName("bg-[#ed1c24]").length).toBe(1)
  })
})

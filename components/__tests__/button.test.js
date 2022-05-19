import { render } from "@testing-library/react"
import Button from "../button"

describe("Button component", () => {
  const onClick = () => {
    // Don't need anything.
  }

  it("renders a primary button with the correct classes", () => {
    const { container } = render(<Button onClick={onClick}>Primary</Button>)
    expect(container.firstChild).toHaveClass("bg-button-primary")
    expect(container.firstChild).toHaveClass("border-button-primary")
    expect(container.firstChild).toHaveClass("text-button-primary")
  })

  it("renders a secondary button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="secondary">
        Secondary
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-secondary")
    expect(container.firstChild).toHaveClass("border-button-secondary")
    expect(container.firstChild).toHaveClass("text-button-secondary")
  })

  it("renders a success button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="success">
        Success
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-success")
    expect(container.firstChild).toHaveClass("border-button-success")
    expect(container.firstChild).toHaveClass("text-button-success")
  })

  it("renders a alert button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="alert">
        Alert
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-alert")
    expect(container.firstChild).toHaveClass("border-button-alert")
    expect(container.firstChild).toHaveClass("text-button-alert")
  })

  it("renders a warning button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="warning">
        Warning
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-warning")
    expect(container.firstChild).toHaveClass("border-button-warning")
    expect(container.firstChild).toHaveClass("text-button-warning")
  })

  it("renders an info button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="info">
        Info
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-info")
    expect(container.firstChild).toHaveClass("border-button-info")
    expect(container.firstChild).toHaveClass("text-button-info")
  })
})

describe("Button.Icon component", () => {
  const onClick = () => {
    // Don't need anything.
  }

  const Icon = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
      </svg>
    )
  }

  it("renders a primary button with the correct classes", () => {
    const { container } = render(
      <Button.Icon onClick={onClick} label="primary button">
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-button-primary")
    expect(container.firstChild).toHaveClass("border-button-primary")
  })

  it("renders a secondary button with the correct classes", () => {
    const { container } = render(
      <Button.Icon onClick={onClick} type="secondary" label="secondary button">
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-button-secondary")
    expect(container.firstChild).toHaveClass("border-button-secondary")
  })
})

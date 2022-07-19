import { fireEvent, render, screen } from "@testing-library/react"
import Button from "../button"

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "",
      push: jest.fn(),
    }
  },
}))

describe("Button component", () => {
  const onClick = () => {
    // Don't need anything.
  }

  it("renders a primary button with the correct classes", () => {
    const { container } = render(<Button onClick={onClick}>Primary</Button>)
    expect(container.firstChild).toHaveClass("bg-button-primary")
    expect(container.firstChild).toHaveClass("border-button-primary")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders a secondary button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="secondary">
        Secondary
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-secondary")
    expect(container.firstChild).toHaveClass("border-button-secondary")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders a tertiary button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="tertiary">
        Tertiary
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-tertiary")
    expect(container.firstChild).toHaveClass("border-button-tertiary")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders an error button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="error">
        Error
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-error")
    expect(container.firstChild).toHaveClass("border-button-error")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders a warning button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="warning">
        Warning
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-warning")
    expect(container.firstChild).toHaveClass("border-button-warning")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders a success button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="success">
        Success
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-success")
    expect(container.firstChild).toHaveClass("border-button-success")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders an info button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="info">
        Info
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-button-info")
    expect(container.firstChild).toHaveClass("border-button-info")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders a primary outline button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="primary-outline">
        Primary Outline
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-primary")
    expect(container.firstChild).toHaveClass("text-button-primary")
  })

  it("renders a secondary outline button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="secondary-outline">
        Secondary Outline
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-secondary")
    expect(container.firstChild).toHaveClass("text-button-secondary")
  })

  it("renders a tertiary outline button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="tertiary-outline">
        Tertiary Outline
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-tertiary")
    expect(container.firstChild).toHaveClass("text-button-tertiary")
  })

  it("renders an error outline button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="error-outline">
        Error Outline
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-error")
    expect(container.firstChild).toHaveClass("text-button-error")
  })

  it("renders a warning outline button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="warning-outline">
        Warning Outline
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-warning")
    expect(container.firstChild).toHaveClass("text-button-warning")
  })

  it("renders a success outline button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="success-outline">
        Success Outline
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-success")
    expect(container.firstChild).toHaveClass("text-button-success")
  })

  it("renders an info outline button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="info-outline">
        Info Outline
      </Button>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-info")
    expect(container.firstChild).toHaveClass("text-button-info")
  })
})

describe("Button.Link component", () => {
  const onClick = jest.fn()

  it("renders a primary link button with the correct classes", () => {
    const { container } = render(
      <Button.Link href="/path" navigationClick={onClick}>
        Primary
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-button-primary")
    expect(container.firstChild).toHaveClass("border-button-primary")
    expect(container.firstChild).toHaveClass("text-white")

    // Really only have to see this works for one Button.Link type.
    fireEvent.click(screen.getByText(/Primary/))
    expect(onClick).toHaveBeenCalled()
  })

  it("renders a secondary link button with the correct classes", () => {
    const { container } = render(
      <Button.Link href="/path" navigationClick={onClick} type="secondary">
        Secondary
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-button-secondary")
    expect(container.firstChild).toHaveClass("border-button-secondary")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders a tertiary link button with the correct classes", () => {
    const { container } = render(
      <Button.Link href="/path" navigationClick={onClick} type="tertiary">
        Tertiary
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-button-tertiary")
    expect(container.firstChild).toHaveClass("border-button-tertiary")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders an error link button with the correct classes", () => {
    const { container } = render(
      <Button.Link href="/path" navigationClick={onClick} type="error">
        Error
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-button-error")
    expect(container.firstChild).toHaveClass("border-button-error")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders a warning link button with the correct classes", () => {
    const { container } = render(
      <Button.Link href="/path" navigationClick={onClick} type="warning">
        Warning
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-button-warning")
    expect(container.firstChild).toHaveClass("border-button-warning")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders a success link button with the correct classes", () => {
    const { container } = render(
      <Button.Link href="/path" navigationClick={onClick} type="success">
        Success
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-button-success")
    expect(container.firstChild).toHaveClass("border-button-success")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders an info link button with the correct classes", () => {
    const { container } = render(
      <Button.Link href="/path" navigationClick={onClick} type="info">
        Info
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-button-info")
    expect(container.firstChild).toHaveClass("border-button-info")
    expect(container.firstChild).toHaveClass("text-white")
  })

  it("renders a primary outline link button with the correct classes", () => {
    const { container } = render(
      <Button.Link
        href="/path"
        navigationClick={onClick}
        type="primary-outline"
      >
        Primary Outline
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-primary")
    expect(container.firstChild).toHaveClass("text-button-primary")
  })

  it("renders a secondary outline link button with the correct classes", () => {
    const { container } = render(
      <Button.Link
        href="/path"
        navigationClick={onClick}
        type="secondary-outline"
      >
        Secondary Outline
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-secondary")
    expect(container.firstChild).toHaveClass("text-button-secondary")
  })

  it("renders a tertiary link button with the correct classes", () => {
    const { container } = render(
      <Button.Link
        href="/path"
        navigationClick={onClick}
        type="tertiary-outline"
      >
        Tertiary Outline
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-tertiary")
    expect(container.firstChild).toHaveClass("text-button-tertiary")
  })

  it("renders an error outline link button with the correct classes", () => {
    const { container } = render(
      <Button.Link href="/path" navigationClick={onClick} type="error-outline">
        Error Outline
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-error")
    expect(container.firstChild).toHaveClass("text-button-error")
  })

  it("renders a warning outline link button with the correct classes", () => {
    const { container } = render(
      <Button.Link
        href="/path"
        navigationClick={onClick}
        type="warning-outline"
      >
        Warning Outline
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-warning")
    expect(container.firstChild).toHaveClass("text-button-warning")
  })

  it("renders a success outline link button with the correct classes", () => {
    const { container } = render(
      <Button.Link
        href="/path"
        navigationClick={onClick}
        type="success-outline"
      >
        Success Outline
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-success")
    expect(container.firstChild).toHaveClass("text-button-success")
  })

  it("renders an info outline link button with the correct classes", () => {
    const { container } = render(
      <Button.Link href="/path" navigationClick={onClick} type="info-outline">
        Info Outline
      </Button.Link>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
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

  it("renders a primary icon button with the correct classes", () => {
    const { container } = render(
      <Button.Icon onClick={onClick} label="primary button">
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-button-primary")
    expect(container.firstChild).toHaveClass("border-button-primary")
    expect(container.firstChild).toHaveClass("fill-white")
  })

  it("renders a secondary icon button with the correct classes", () => {
    const { container } = render(
      <Button.Icon onClick={onClick} type="secondary" label="secondary button">
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-button-secondary")
    expect(container.firstChild).toHaveClass("border-button-secondary")
    expect(container.firstChild).toHaveClass("fill-white")
  })

  it("renders a tertiary icon button with the correct classes", () => {
    const { container } = render(
      <Button.Icon onClick={onClick} type="tertiary" label="tertiary button">
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-button-tertiary")
    expect(container.firstChild).toHaveClass("border-button-tertiary")
    expect(container.firstChild).toHaveClass("fill-white")
  })

  it("renders an error icon button with the correct classes", () => {
    const { container } = render(
      <Button.Icon onClick={onClick} type="error" label="error button">
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-button-error")
    expect(container.firstChild).toHaveClass("border-button-error")
    expect(container.firstChild).toHaveClass("fill-white")
  })

  it("renders a warning icon button with the correct classes", () => {
    const { container } = render(
      <Button.Icon onClick={onClick} type="warning" label="warning button">
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-button-warning")
    expect(container.firstChild).toHaveClass("border-button-warning")
    expect(container.firstChild).toHaveClass("fill-white")
  })

  it("renders a success icon button with the correct classes", () => {
    const { container } = render(
      <Button.Icon onClick={onClick} type="success" label="success button">
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-button-success")
    expect(container.firstChild).toHaveClass("border-button-success")
    expect(container.firstChild).toHaveClass("fill-white")
  })

  it("renders a info icon button with the correct classes", () => {
    const { container } = render(
      <Button.Icon onClick={onClick} type="info" label="info button">
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-button-info")
    expect(container.firstChild).toHaveClass("border-button-info")
    expect(container.firstChild).toHaveClass("fill-white")
  })

  it("renders a primary icon outline button with the correct classes", () => {
    const { container } = render(
      <Button.Icon
        onClick={onClick}
        type="primary-outline"
        label="primary outline button"
      >
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-primary")
    expect(container.firstChild).toHaveClass("fill-button-primary")
  })

  it("renders a secondary icon outline button with the correct classes", () => {
    const { container } = render(
      <Button.Icon
        onClick={onClick}
        type="secondary-outline"
        label="secondary outline button"
      >
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-secondary")
    expect(container.firstChild).toHaveClass("fill-button-secondary")
  })

  it("renders a tertiary icon outline button with the correct classes", () => {
    const { container } = render(
      <Button.Icon
        onClick={onClick}
        type="tertiary-outline"
        label="tertiary outline button"
      >
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-tertiary")
    expect(container.firstChild).toHaveClass("fill-button-tertiary")
  })

  it("renders an error icon outline button with the correct classes", () => {
    const { container } = render(
      <Button.Icon
        onClick={onClick}
        type="error-outline"
        label="error outline button"
      >
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-error")
    expect(container.firstChild).toHaveClass("fill-button-error")
  })

  it("renders a warning icon outline button with the correct classes", () => {
    const { container } = render(
      <Button.Icon
        onClick={onClick}
        type="warning-outline"
        label="warning outline button"
      >
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-warning")
    expect(container.firstChild).toHaveClass("fill-button-warning")
  })

  it("renders a success icon outline button with the correct classes", () => {
    const { container } = render(
      <Button.Icon
        onClick={onClick}
        type="success-outline"
        label="success outline button"
      >
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-success")
    expect(container.firstChild).toHaveClass("fill-button-success")
  })

  it("renders an info icon outline button with the correct classes", () => {
    const { container } = render(
      <Button.Icon
        onClick={onClick}
        type="info-outline"
        label="info outline button"
      >
        <Icon />
      </Button.Icon>
    )
    expect(container.firstChild).toHaveClass("bg-transparent")
    expect(container.firstChild).toHaveClass("border-button-info")
    expect(container.firstChild).toHaveClass("fill-button-info")
  })
})

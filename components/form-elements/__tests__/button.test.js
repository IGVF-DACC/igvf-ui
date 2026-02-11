import { render, screen } from "@testing-library/react";
import { AttachedButtons, Button, ButtonLink } from "../button";

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "",
      push: jest.fn(),
    };
  },
}));

describe("Button component", () => {
  const onClick = jest.fn();

  it("renders a primary button with the correct classes", () => {
    const { container } = render(<Button onClick={onClick}>Primary</Button>);
    expect(container.firstChild).toHaveClass("bg-button-primary");
    expect(container.firstChild).toHaveClass("border-button-primary");
    expect(container.firstChild).toHaveClass("text-button-primary");
  });

  it("renders a secondary button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="secondary">
        Secondary
      </Button>
    );
    expect(container.firstChild).toHaveClass("bg-button-secondary");
    expect(container.firstChild).toHaveClass("border-button-secondary");
    expect(container.firstChild).toHaveClass("text-button-secondary");
  });

  it("renders a warning button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="warning">
        Secondary
      </Button>
    );
    expect(container.firstChild).toHaveClass("bg-button-warning");
    expect(container.firstChild).toHaveClass("border-button-warning");
    expect(container.firstChild).toHaveClass("text-button-warning");
  });

  it("renders a selected button with the correct classes", () => {
    const { container } = render(
      <Button onClick={onClick} type="selected">
        Secondary
      </Button>
    );
    expect(container.firstChild).toHaveClass("bg-button-selected");
    expect(container.firstChild).toHaveClass("border-button-selected");
    expect(container.firstChild).toHaveClass("text-button-selected");
  });
});

describe("ButtonLink component", () => {
  it("renders a primary button with the correct classes", () => {
    const { container } = render(<ButtonLink href="#">Primary</ButtonLink>);
    expect(container.firstChild).toHaveClass("bg-button-primary");
    expect(container.firstChild).toHaveClass("border-button-primary");
    expect(container.firstChild).toHaveClass("text-button-primary");
  });

  it("renders a secondary button with the correct classes", () => {
    const { container } = render(
      <ButtonLink href="#" type="secondary" isInline>
        Secondary
      </ButtonLink>
    );
    expect(container.firstChild).toHaveClass("bg-button-secondary");
    expect(container.firstChild).toHaveClass("border-button-secondary");
    expect(container.firstChild).toHaveClass("text-button-secondary");
    expect(container.firstChild).toHaveClass("inline-flex");
  });

  it("renders a warning button with the correct classes", () => {
    const { container } = render(
      <ButtonLink href="#" type="warning">
        Secondary
      </ButtonLink>
    );
    expect(container.firstChild).toHaveClass("bg-button-warning");
    expect(container.firstChild).toHaveClass("border-button-warning");
    expect(container.firstChild).toHaveClass("text-button-warning");
  });

  it("renders a selected button with the correct classes", () => {
    const { container } = render(
      <ButtonLink href="#" type="selected">
        Secondary
      </ButtonLink>
    );
    expect(container.firstChild).toHaveClass("bg-button-selected");
    expect(container.firstChild).toHaveClass("border-button-selected");
    expect(container.firstChild).toHaveClass("text-button-selected");
  });

  it("renders a secondary button with the correct classes when disabled", () => {
    const { container } = render(
      <ButtonLink href="#" type="secondary" isDisabled>
        Secondary
      </ButtonLink>
    );
    expect(container.firstChild).toHaveClass("bg-button-secondary-disabled");
    expect(container.firstChild).toHaveClass(
      "border-button-secondary-disabled"
    );
    expect(container.firstChild).toHaveClass("text-button-secondary-disabled");
  });

  it("renders an `<a>` tag when `isExternal` is set to true", () => {
    const { container } = render(
      <ButtonLink href="https://zzz.com" isExternal>
        External
      </ButtonLink>
    );
    expect(container.firstChild.tagName).toBe("A");
  });

  it("renders an `<A>` tag normally when `prefetch` is set to false", () => {
    const { container } = render(
      <ButtonLink href="/" prefetch={false}>
        No prefetch
      </ButtonLink>
    );

    expect(container.firstChild.tagName).toBe("A");
  });

  it("renders an `<A>` tag normally when `prefetch` is set to true", () => {
    const { container } = render(
      <ButtonLink href="/" prefetch={true}>
        No prefetch
      </ButtonLink>
    );

    expect(container.firstChild.tagName).toBe("A");
  });

  it("renders an `<A>` tag normally when `prefetch` is set to null", () => {
    const { container } = render(
      <ButtonLink href="/" prefetch={null}>
        No prefetch
      </ButtonLink>
    );

    expect(container.firstChild.tagName).toBe("A");
  });
});

describe("Test the Tailwind CSS classes resulting from using the `hasIconOnly` flag", () => {
  function Circle() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="10" />
      </svg>
    );
  }

  it("renders an icon-only button with the correct classes", () => {
    const { container } = render(
      <Button onClick={jest.fn()} hasIconOnly>
        <Circle />
      </Button>
    );
    expect(container.firstChild).toHaveClass("px-2 rounded-sm");
  });

  it("renders an icon-only link button with the correct classes", () => {
    const { container } = render(
      <ButtonLink href="#" hasIconOnly>
        <Circle />
      </ButtonLink>
    );
    expect(container.firstChild).toHaveClass("px-2 rounded-sm");
  });
});

describe("Test AttachedButtons wrapper component", () => {
  it("attaches child buttons together", () => {
    const onClick = jest.fn();
    render(
      <AttachedButtons>
        <Button onClick={onClick}>Button 1</Button>
        <Button onClick={onClick}>Button 2</Button>
        <Button onClick={onClick}>Button 3</Button>
      </AttachedButtons>
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
    expect(buttons[0]).toHaveClass(
      "cursor-pointer flex items-center justify-center border font-semibold px-4 rounded-sm text-sm h-8 [&>svg]:h-4 [&>svg]:w-4 bg-button-primary border-button-primary text-button-primary fill-button-primary disabled:bg-button-primary-disabled disabled:border-button-primary-disabled disabled:text-button-primary-disabled disabled:fill-button-primary-disabled border-r-0 last:border-r !rounded-none first:!rounded-l-sm last:!rounded-r-sm"
    );
    expect(buttons[1]).toHaveClass(
      "cursor-pointer flex items-center justify-center border font-semibold px-4 rounded-sm text-sm h-8 [&>svg]:h-4 [&>svg]:w-4 bg-button-primary border-button-primary text-button-primary fill-button-primary disabled:bg-button-primary-disabled disabled:border-button-primary-disabled disabled:text-button-primary-disabled disabled:fill-button-primary-disabled border-r-0 last:border-r !rounded-none first:!rounded-l-sm last:!rounded-r-sm"
    );
    expect(buttons[2]).toHaveClass(
      "cursor-pointer flex items-center justify-center border font-semibold px-4 rounded-sm text-sm h-8 [&>svg]:h-4 [&>svg]:w-4 bg-button-primary border-button-primary text-button-primary fill-button-primary disabled:bg-button-primary-disabled disabled:border-button-primary-disabled disabled:text-button-primary-disabled disabled:fill-button-primary-disabled border-r-0 last:border-r !rounded-none first:!rounded-l-sm last:!rounded-r-sm"
    );
  });

  it("can handle an undefined value within it", () => {
    const onClick = jest.fn();
    const isSecondRendered = false;
    render(
      <AttachedButtons testid="attached-test">
        <Button onClick={onClick}>Button 1</Button>
        {isSecondRendered && <Button onClick={onClick}>Button 2</Button>}
        <Button onClick={onClick}>Button 3</Button>
      </AttachedButtons>
    );

    // Test that the attached button wrapper exists, but only two buttons exist within it.
    const attachedButtons = screen.getByTestId("attached-test");
    expect(attachedButtons).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toHaveTextContent("Button 1");
    expect(buttons[1]).toHaveTextContent("Button 3");
  });
});

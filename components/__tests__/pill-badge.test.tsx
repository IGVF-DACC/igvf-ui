import { render, screen } from "@testing-library/react";
import { PillBadge } from "../pill-badge";

function Icon() {
  return <svg data-testid="icon" />;
}

describe("Test PillBadge component", () => {
  it("renders a badge with text", () => {
    render(<PillBadge testid="test-1">Hello</PillBadge>);
    const badge = screen.getByTestId("test-1");
    expect(badge).toHaveTextContent("Hello");
  });

  it("renders a badge with an icon on the left", () => {
    render(
      <PillBadge iconPosition="left" testid="test-2">
        <Icon />
        Hello
      </PillBadge>
    );
    const badge = screen.getByTestId("test-2");
    expect(badge).toHaveTextContent("Hello");
    expect(badge).toHaveClass("pl-0.5 pr-1.5");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders a badge with an icon on the right", () => {
    render(
      <PillBadge iconPosition="right">
        <Icon />
        Hello
      </PillBadge>
    );

    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Hello");
    expect(badge).toHaveClass("pl-1.5 pr-0.5");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

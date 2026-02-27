import { render, screen } from "@testing-library/react";
import { Separator } from "../separator";

describe("Separator", () => {
  it("renders a separator with default styles", () => {
    render(<Separator />);
    const separator = screen.getByRole("separator");
    expect(separator).toBeInTheDocument();
  });

  it("applies additional class names", () => {
    render(<Separator className="test-class" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveClass("test-class");
  });
});

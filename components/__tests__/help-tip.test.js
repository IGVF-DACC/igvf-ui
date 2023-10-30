import { render, screen } from "@testing-library/react";
import HelpTip from "../help-tip";

describe("Test the HelpTip component", () => {
  it("renders the help tip", () => {
    render(<HelpTip>Test help tip</HelpTip>);

    expect(screen.getByText("Test help tip")).toBeInTheDocument();
  });

  it("applies additional Tailwind CSS classes", () => {
    render(<HelpTip className="test-class">Test help tip</HelpTip>);

    expect(screen.getByText("Test help tip")).toHaveClass("test-class");
  });
});

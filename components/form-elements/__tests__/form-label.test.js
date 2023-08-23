import { render, screen } from "@testing-library/react";
import FormLabel from "../form-label";

describe("Test the FormLabel component", () => {
  it("renders a non-required form label", () => {
    render(<FormLabel>Label Test</FormLabel>);

    const label = screen.getByText("Label Test");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass(
      "flex items-center font-semibold text-data-label"
    );
    expect(screen.queryByTestId("icon-splat")).not.toBeInTheDocument();
  });

  it("renders a required form label", () => {
    render(<FormLabel isRequired>Label Test</FormLabel>);

    const label = screen.getByText("Label Test");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass(
      "flex items-center font-semibold text-data-label"
    );
    expect(screen.queryByTestId("icon-splat")).toBeInTheDocument();
  });

  it("renders a form label with custom Tailwind CSS classes", () => {
    render(<FormLabel className="my-8">Label Test</FormLabel>);

    const label = screen.getByText("Label Test");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass(
      "my-8 flex items-center font-semibold text-data-label"
    );
  });

  it("renders a label for another form element", () => {
    render(
      <div>
        <FormLabel htmlFor="select-element">Label Test</FormLabel>
        <input type="text" id="select-element" />
      </div>
    );

    const label = screen.getByText("Label Test");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "select-element");
  });
});

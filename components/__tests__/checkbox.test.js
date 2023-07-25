import { fireEvent, render, screen } from "@testing-library/react";
import Checkbox from "../checkbox";

describe("Test the <Checkbox> component", () => {
  it("renders the elements of a checkbox with no custom Tailwind CSS classes", () => {
    const onChange = jest.fn();

    render(
      <Checkbox checked={false} name="checkbox-test" onChange={onChange}>
        Label for testing
      </Checkbox>,
    );
    const label = screen.getByLabelText("Label for testing");
    expect(label).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "checkbox-test");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders the elements of a checkbox with custom Tailwind CSS classes", () => {
    const onChange = jest.fn();

    render(
      <Checkbox
        checked={false}
        name="checkbox-test"
        onChange={onChange}
        className="my-5"
      >
        Label for testing
      </Checkbox>,
    );

    const label = screen.getByTestId("checkbox-label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("my-5");
  });
});

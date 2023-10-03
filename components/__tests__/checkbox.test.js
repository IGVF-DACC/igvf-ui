import { fireEvent, render, screen } from "@testing-library/react";
import Checkbox from "../checkbox";

describe("Test the <Checkbox> component", () => {
  it("renders the elements of a checkbox with no custom Tailwind CSS classes", () => {
    const onClick = jest.fn();

    render(
      <Checkbox
        id="checkbox-text"
        checked={false}
        name="checkbox-test"
        onClick={onClick}
      >
        Label for testing
      </Checkbox>
    );
    const label = screen.getByLabelText("Label for testing");
    expect(label).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "checkbox-test");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders the elements of a checkbox with custom Tailwind CSS classes", () => {
    const onClick = jest.fn();

    render(
      <Checkbox
        id="checkbox-text"
        checked={false}
        name="checkbox-test"
        onClick={onClick}
        className="my-5"
      >
        Label for testing
      </Checkbox>
    );

    const label = screen.getByTestId("checkbox-label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("my-5");
  });
});

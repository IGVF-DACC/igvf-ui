import { render, screen } from "@testing-library/react";
import RadioButton from "../radio-button";

describe("RadioButton component", () => {
  it("renders a radio button that detects clicks", () => {
    const onChange = jest.fn();
    render(
      <RadioButton checked={false} name="radio" onChange={onChange}>
        Radio
      </RadioButton>
    );

    const label = screen.getByTestId("radio-button-label");
    const input = screen.getByLabelText("Radio");
    expect(input.checked).toBe(false);

    label.click();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders a radio button that is checked", () => {
    const onChange = jest.fn();
    render(
      <RadioButton checked={true} name="radio" onChange={onChange}>
        Radio
      </RadioButton>
    );
    const input = screen.getByLabelText("Radio");
    expect(input.checked).toBe(true);
  });

  it("renders a button with custom Tailwind CSS classes", () => {
    const onChange = jest.fn();
    render(
      <RadioButton
        checked={false}
        name="radio"
        onChange={onChange}
        className="custom-class"
      >
        Radio
      </RadioButton>
    );
    const label = screen.getByTestId("radio-button-label");
    expect(label).toHaveClass("custom-class");
  });
});

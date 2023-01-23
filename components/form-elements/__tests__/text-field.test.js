import { fireEvent, render, screen } from "@testing-library/react";
import TextField from "../text-field";

describe("Test the <TextField> component", () => {
  it("renders a text field and reacts to typing in it", () => {
    const onChange = jest.fn();
    render(
      <TextField label="Test" name="test" value="test" onChange={onChange} />
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders a text field with no label and reacts to typing in it", () => {
    const onChange = jest.fn();
    render(
      <TextField
        name="test"
        value="test"
        onChange={onChange}
        isSpellCheckDisabled
      />
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders a disabled text field", () => {
    const onChange = jest.fn();

    render(
      <TextField
        label="Test"
        name="test"
        value="test"
        onChange={onChange}
        isDisabled
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });
});

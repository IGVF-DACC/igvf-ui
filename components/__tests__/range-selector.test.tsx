import { fireEvent, render, screen } from "@testing-library/react";
import { RangeSelector } from "../range-selector";

describe("Test RangeSelector", () => {
  it("should render the range selector with default values", () => {
    const onChange = jest.fn();

    render(
      <RangeSelector
        id="test-range-selector"
        minValue={0}
        maxValue={100}
        onChange={onChange}
      />
    );

    // Make sure two inputs with type="range" are rendered.
    const inputs = screen.getAllByRole("slider");
    expect(inputs).toHaveLength(2);

    // Change the value of the first input and make sure onChange is called with the
    // correct values.
    const minInput = inputs[0];
    const maxInput = inputs[1];
    fireEvent.input(minInput, { target: { value: 10 } });
    expect(onChange).toHaveBeenCalledWith(10, 100);
    fireEvent.input(maxInput, { target: { value: 90 } });
    expect(onChange).toHaveBeenCalledWith(0, 90);
  });
});

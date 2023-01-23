import { fireEvent, render, screen } from "@testing-library/react";
import Select from "../select";

describe("Test the Select component", () => {
  it("renders a basic <select> element", () => {
    const onChange = jest.fn();
    render(
      <Select
        label="Test Select"
        name="select-element"
        value="1"
        onChange={onChange}
      >
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );

    // The <select> element should get rendered with the default Tailwind CSS classes.
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select).toHaveClass(
      "block w-full appearance-none rounded border border-form-element bg-form-element py-0 pl-1 pr-5 font-medium text-form-element disabled:border-form-element-disabled disabled:text-form-element-disabled text-sm form-element-height-md leading-[180%]"
    );

    // Selecting an option should call the onChange handler.
    fireEvent.change(select, { target: { value: "2" } });
    expect(onChange).toHaveBeenCalledTimes(1);

    // Make sure the label exists.
    const label = screen.getByText("Test Select");
    expect(label).toBeInTheDocument();
  });

  it("renders a <select> element with onBlur and onFocus event handlers", () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    render(
      <Select
        name="select-element"
        value="1"
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      >
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );

    // The <select> element should get rendered.
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // Focusing the <select> element should call the onFocus handler.
    fireEvent.focus(select);
    expect(onFocus).toHaveBeenCalledTimes(1);

    // Blurring the <select> element should call the onBlur handler.
    fireEvent.blur(select);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("renders a <select> element with custom Tailwind CSS classes on the wrapper div", () => {
    const onChange = jest.fn();
    render(
      <Select
        name="select-element"
        value="1"
        onChange={onChange}
        className="my-8"
      >
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );

    // The <select> element should get rendered.
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // The wrapper div should get rendered with the custom Tailwind CSS classes.
    const wrapper = screen.getByTestId("form-select");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("my-8");
  });

  it("renders a disabled <select> element", () => {
    const onChange = jest.fn();
    render(
      <Select name="select-element" value="1" onChange={onChange} isDisabled>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );

    // The <select> element should get rendered.
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // The <select> element should be disabled.
    expect(select).toBeDisabled();
  });
});

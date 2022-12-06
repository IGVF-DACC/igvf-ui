import { fireEvent, render, screen } from "@testing-library/react";
import { FormLabel, Select, TextField } from "../form";

describe("Test the FormLabel component", () => {
  it("renders a non-required form label", () => {
    render(<FormLabel>Label Test</FormLabel>);

    // The label should get rendered with the default Tailwind CSS classes.
    const label = screen.getByText("Label Test");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass(
      "flex items-center font-semibold text-data-label"
    );
    expect(screen.queryByTestId("icon-splat")).not.toBeInTheDocument();
  });

  it("renders a required form label", () => {
    render(<FormLabel isRequired>Label Test</FormLabel>);

    // The label should get rendered with the default Tailwind CSS classes.
    const label = screen.getByText("Label Test");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass(
      "flex items-center font-semibold text-data-label"
    );
    expect(screen.queryByTestId("icon-splat")).toBeInTheDocument();
  });

  it("renders a form label with custom Tailwind CSS classes", () => {
    render(<FormLabel className="my-8">Label Test</FormLabel>);

    // The label should get rendered with the default and custom Tailwind CSS classes.
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

    // The label should get rendered with the given `for` attribute.
    const label = screen.getByText("Label Test");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "select-element");
  });
});

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
      "block w-full appearance-none rounded border border-data-border bg-white py-2 px-1 pr-8 text-sm leading-tight dark:bg-black"
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
});

describe("Test the TextField component", () => {
  it("renders a basic text <input> element", () => {
    const onChange = jest.fn();
    render(
      <TextField
        label="Test Text Field"
        name="text-field"
        value="Test Value"
        onChange={onChange}
      />
    );

    // The text <input> element should get rendered with the default Tailwind CSS classes.
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass(
      "block w-full rounded border border-data-border bg-data-background p-2 text-sm"
    );

    // Changing the value of the text <input> element should call the onChange handler.
    fireEvent.change(input, { target: { value: "New Value" } });
    expect(onChange).toHaveBeenCalledTimes(1);

    // Make sure the label exists.
    const label = screen.getByText("Test Text Field");
    expect(label).toBeInTheDocument();
  });

  it("renders a text <input> element with onBlur and onFocus event handlers", () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    render(
      <TextField
        name="text-field"
        value="Test Value"
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    );

    // The text <input> element should get rendered.
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    // Focusing the text <input> element should call the onFocus handler.
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);

    // Blurring the text <input> element should call the onBlur handler.
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("renders a required text <input> element with custom Tailwind CSS classes", () => {
    const onChange = jest.fn();
    render(
      <TextField
        label="Test Text Field"
        name="text-field"
        value="Test Value"
        onChange={onChange}
        className="my-8"
        isRequired
      />
    );

    // The text <input> element wrapper should get rendered with the custom Tailwind CSS classes.
    const wrapper = screen.getByTestId("form-text-field");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("my-8");

    // The text <input> label should have the required indicator.
    const label = screen.getByText("Test Text Field");
    expect(label).toBeInTheDocument();
    expect(screen.queryByTestId("icon-splat")).toBeInTheDocument();
  });

  it("renders a text <input> element with spellcheck disabled and placeholder text", () => {
    const onChange = jest.fn();
    render(
      <TextField
        name="text-field"
        value="Test Value"
        onChange={onChange}
        isSpellCheckDisabled
        placeholder="Test Placeholder"
      />
    );

    // The text <input> element should contain the placeholder text.
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Test Placeholder");
    expect(input).toHaveAttribute("spellcheck", "false");
  });
});

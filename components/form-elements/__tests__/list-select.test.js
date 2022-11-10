import { fireEvent, render, screen } from "@testing-library/react";
import ListSelect from "../list-select";

describe("Test ListSelect", () => {
  it("builds a single-mode selection list with no selections and passes callback a single clicked id", () => {
    const onChange = jest.fn((option) => option);
    render(
      <ListSelect label="Test" value="" onChange={onChange}>
        <ListSelect.Option id="1" label="Option 1">
          One
        </ListSelect.Option>
        <ListSelect.Option id="2" label="Option 2">
          Two
        </ListSelect.Option>
        <ListSelect.Option id="3" label="Option 3">
          Three
        </ListSelect.Option>
      </ListSelect>
    );

    // Get all option elements starting with the "Option" label
    const options = screen.queryAllByLabelText(/^Test Option \d list item$/, {
      exact: false,
    });
    expect(options).toHaveLength(3);

    fireEvent.click(options[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("builds a single-mode selection list with one selections and passes callback an empty clicked id", () => {
    const onChange = jest.fn((option) => option);
    render(
      <ListSelect
        label="Test"
        value="2"
        onChange={onChange}
        className="bg-white"
      >
        <ListSelect.Option id="1" label="Option 1">
          One
        </ListSelect.Option>
        <ListSelect.Option id="2" label="Option 2">
          Two
        </ListSelect.Option>
        <ListSelect.Option id="3" label="Option 3">
          Three
        </ListSelect.Option>
      </ListSelect>
    );

    // Get all option elements starting with the "Option" label
    const options = screen.queryAllByLabelText(/^Test Option/);
    expect(options).toHaveLength(3);

    fireEvent.click(options[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("builds a single-mode selection list with no label", () => {
    const onChange = jest.fn((option) => option);
    render(
      <ListSelect value="" onChange={onChange}>
        <ListSelect.Option id="1" label="Option 1">
          One
        </ListSelect.Option>
        <ListSelect.Option id="2" label="Option 2">
          Two
        </ListSelect.Option>
        <ListSelect.Option id="3" label="Option 3">
          Three
        </ListSelect.Option>
      </ListSelect>
    );

    const options = screen.queryAllByLabelText(/^Option \d list item$/);
    expect(options).toHaveLength(3);
  });

  it("builds a multiple selection list with no selections and passes callback a array of clicked ids", () => {
    const onChange = jest.fn((option) => option);
    render(
      <ListSelect label="Test" value={[]} onChange={onChange} isMultiple>
        <ListSelect.Option id="1" label="Option 1">
          One
        </ListSelect.Option>
        <ListSelect.Option id="2" label="Option 2">
          Two
        </ListSelect.Option>
        <ListSelect.Option id="3" label="Option 3">
          Three
        </ListSelect.Option>
      </ListSelect>
    );

    const options = screen.queryAllByLabelText(/^Test Option/);
    expect(options).toHaveLength(3);

    fireEvent.click(options[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(["1"]);
  });

  it("builds a multiple selection list with selections and passes callback a combined array of selections", () => {
    const onChange = jest.fn((option) => option);
    render(
      <ListSelect label="Test" value={[1, 2]} onChange={onChange} isMultiple>
        <ListSelect.Option id={1} label="Option 1">
          One
        </ListSelect.Option>
        <ListSelect.Option id={2} label="Option 2">
          Two
        </ListSelect.Option>
        <ListSelect.Option id={3} label="Option 3">
          Three
        </ListSelect.Option>
        Non-React component child
      </ListSelect>
    );

    const options = screen.queryAllByLabelText(/^Test Option/);
    expect(options).toHaveLength(3);

    // Clicking on an already-selected option should remove it from the list.
    fireEvent.click(options[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([1]);
  });
});

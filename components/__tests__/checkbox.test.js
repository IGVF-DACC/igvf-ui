import { act, fireEvent, render, screen } from "@testing-library/react";
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

  it("renders a disabled checkbox", () => {
    const onClick = jest.fn();

    render(
      <Checkbox
        id="checkbox-text"
        checked={false}
        name="checkbox-test"
        onClick={onClick}
        isDisabled
      >
        Label for testing
      </Checkbox>
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });
});

describe("Test the long-click functionality of the <Checkbox> component", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("calls the onLongClick callback when the checkbox is long-pressed", () => {
    const onClick = jest.fn();
    const onLongClick = jest.fn();

    render(
      <Checkbox
        id="checkbox-test"
        checked={false}
        name="checkbox-test"
        onClick={onClick}
        onLongClick={onLongClick}
      >
        Label
      </Checkbox>
    );

    const label = screen.getByTestId("checkbox-label");
    const checkbox = screen.getByRole("checkbox");

    fireEvent.pointerDown(label);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    fireEvent.pointerUp(label);

    fireEvent.click(checkbox);

    expect(onLongClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("suppresses the normal click immediately after a long press", () => {
    const onClick = jest.fn();
    const onLongClick = jest.fn();

    render(
      <Checkbox
        id="checkbox-test"
        checked={false}
        name="checkbox-test"
        onClick={onClick}
        onLongClick={onLongClick}
      >
        Label
      </Checkbox>
    );

    const label = screen.getByTestId("checkbox-label");
    const checkbox = screen.getByRole("checkbox");

    fireEvent.pointerDown(label);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    fireEvent.pointerUp(label);

    fireEvent.change(checkbox);

    expect(onLongClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("early-returns from onChange when suppression is still active", () => {
    const onClick = jest.fn();
    const onLongClick = jest.fn();

    render(
      <Checkbox
        id="checkbox-test"
        checked={false}
        name="checkbox-test"
        onClick={onClick}
        onLongClick={onLongClick}
      >
        Label
      </Checkbox>
    );

    const label = screen.getByTestId("checkbox-label");
    const checkbox = screen.getByRole("checkbox");

    fireEvent.pointerDown(label);
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // If suppression is active, onChange should return early and not invoke onClick.
    fireEvent.change(checkbox);

    expect(onLongClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("clears suppression on keydown so a later change can call onClick", () => {
    const onClick = jest.fn();
    const onLongClick = jest.fn();

    render(
      <Checkbox
        id="checkbox-test"
        checked={false}
        name="checkbox-test"
        onClick={onClick}
        onLongClick={onLongClick}
      >
        Label
      </Checkbox>
    );

    const label = screen.getByTestId("checkbox-label");
    const checkbox = screen.getByRole("checkbox");

    fireEvent.pointerDown(label);
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Keydown capture should clear any stale suppression state.
    fireEvent.keyDown(checkbox, { key: " " });
    fireEvent.click(checkbox);

    expect(onLongClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("clears suppression on input pointer-down before processing change", () => {
    const onClick = jest.fn();
    const onLongClick = jest.fn();

    render(
      <Checkbox
        id="checkbox-test"
        checked={false}
        name="checkbox-test"
        onClick={onClick}
        onLongClick={onLongClick}
      >
        Label
      </Checkbox>
    );

    const label = screen.getByTestId("checkbox-label");
    const checkbox = screen.getByRole("checkbox");

    fireEvent.pointerDown(label);
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Pointer-down on the input should clear suppression for the new interaction.
    fireEvent.pointerDown(checkbox);
    fireEvent.click(checkbox);

    expect(onLongClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

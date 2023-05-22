import { render, screen } from "@testing-library/react";
import PropTypes from "prop-types";
import useDebounceTimer from "../debounce-timer";

function TestComponent({ callback }) {
  const restartDebounceTimer = useDebounceTimer(500);
  return <button onClick={() => restartDebounceTimer(callback)} />;
}

TestComponent.propTypes = {
  callback: PropTypes.func.isRequired,
};

describe("Test useDebounceTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should start a timer when called", () => {
    const callback = jest.fn();

    render(<TestComponent callback={callback} />);

    const button = screen.getByRole("button");
    button.click();
    expect(callback).not.toHaveBeenCalled();

    // Wait for the timer to expire
    jest.runAllTimers();
    expect(callback).toHaveBeenCalled();
  });
});

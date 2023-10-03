import { fireEvent, render, screen } from "@testing-library/react";
import useLongClick from "../long-click";

describe("Test the useLongClick custom React hook", () => {
  it("detects regular clicks and calls the onClick callback", () => {
    const onClick = jest.fn();
    const onLongClick = jest.fn();

    function TestComponent() {
      useLongClick("test", onClick, onLongClick);

      return <button id="test">Test</button>;
    }

    render(<TestComponent />);

    const button = screen.getByRole("button");
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongClick).toHaveBeenCalledTimes(0);
  });

  it("detects long clicks and calls the onLongClick callback", async () => {
    const onClick = jest.fn();
    const onLongClick = jest.fn();

    function TestComponent() {
      useLongClick("test", onClick, onLongClick);

      return <button id="test">Test</button>;
    }

    render(<TestComponent />);

    const button = screen.getByRole("button");
    fireEvent.mouseDown(button);
    await new Promise((resolve) => setTimeout(resolve, 500));
    fireEvent.mouseUp(button);

    expect(onClick).toHaveBeenCalledTimes(0);
    expect(onLongClick).toHaveBeenCalledTimes(1);
  });

  it("detects and ignores regular click events", () => {
    const onClick = jest.fn();
    const onLongClick = jest.fn();

    function TestComponent() {
      useLongClick("test", onClick, onLongClick);

      return <button id="test">Test</button>;
    }

    render(<TestComponent />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongClick).toHaveBeenCalledTimes(0);
  });
});

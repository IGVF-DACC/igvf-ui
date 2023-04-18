import { fireEvent, render, screen } from "@testing-library/react";
import { useLocalStorage, useSessionStorage } from "../browser-storage";

function LocalComponent() {
  const [value, setValue] = useLocalStorage("test-key", "test-value");

  return (
    <div>
      <p>{value}</p>
      <button onClick={() => setValue("test-value2")}>Set value</button>
    </div>
  );
}

function SessionComponent() {
  const [value, setValue] = useSessionStorage("test-key", "test-value");

  return (
    <div>
      <p>{value}</p>
      <button onClick={() => setValue("test-value2")}>Set value</button>
    </div>
  );
}

describe("Test the localStorage and sessionStorage custom hook", () => {
  test("the localStorage custom hook", () => {
    render(<LocalComponent />);
    expect(screen.getByText("test-value")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Set value"));
    expect(screen.getByText("test-value2")).toBeInTheDocument();
  });

  test("the localStorage custom hook when a value has already been set", () => {
    render(<LocalComponent />);
    expect(screen.getByText("test-value2")).toBeInTheDocument();
  });

  test("the sessionStorage custom hook", () => {
    render(<SessionComponent />);
    expect(screen.getByText("test-value")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Set value"));
    expect(screen.getByText("test-value2")).toBeInTheDocument();
  });

  test("the sessionStorage custom hook when a value has already been set", () => {
    render(<SessionComponent />);
    expect(screen.getByText("test-value2")).toBeInTheDocument();
  });
});

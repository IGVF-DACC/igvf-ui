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

/**
 * These node versions of the component simulate running these hooks on the server. I haven't
 * figured out how to run both jsdom and node environments in the same test, so this works around
 * that by deleting and then restoring the `window` object.
 */
function LocalNodeComponent() {
  const { window } = global;
  delete global.window;
  const [value, setValue] = useLocalStorage("test-key", "test-value");
  global.window = window;

  return (
    <div>
      <p>{value}</p>
      <button onClick={() => setValue("test-value2")}>Set value</button>
    </div>
  );
}

function SessionNodeComponent() {
  const { window } = global;
  delete global.window;
  const [value, setValue] = useSessionStorage("test-key", "test-value");
  global.window = window;

  return (
    <div>
      <p>{value}</p>
      <button onClick={() => setValue("test-value2")}>Set value</button>
    </div>
  );
}

describe("Test the localStorage and sessionStorage custom hooks with no DOM", () => {
  test("the localStorage custom hook", () => {
    render(<LocalNodeComponent />);
    expect(screen.getByText("test-value")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Set value"));
    expect(screen.getByText("test-value2")).toBeInTheDocument();
  });

  test("the sessionStorage custom hook", () => {
    render(<SessionNodeComponent />);
    expect(screen.getByText("test-value")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Set value"));
    expect(screen.getByText("test-value2")).toBeInTheDocument();
  });
});

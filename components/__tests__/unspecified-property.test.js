import { render, screen } from "@testing-library/react";
import UnspecifiedProperty from "../unspecified-property";

describe("Test UnspecifiedProperty component", () => {
  it("renders strings and numbers", () => {
    render(<UnspecifiedProperty properties={["hello"]} />);
    expect(screen.getByText("hello")).toBeInTheDocument();

    render(<UnspecifiedProperty properties={["5"]} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders booleans", () => {
    render(<UnspecifiedProperty properties={["true"]} />);
    expect(screen.getByText("true")).toBeInTheDocument();

    render(<UnspecifiedProperty properties={["false"]} />);
    expect(screen.getByText("false")).toBeInTheDocument();
  });

  it("renders arrays of strings and numbers", () => {
    render(<UnspecifiedProperty properties={["hello", "5"]} />);
    expect(screen.getByText("hello, 5")).toBeInTheDocument();
  });

  it("renders an embedded object with an @id", () => {
    const properties = ["/example/path/"];
    render(<UnspecifiedProperty properties={properties} />);
    expect(screen.getByRole("link")).toHaveTextContent("/example/path/");
  });

  it("renders an array of embedded objects with @ids", () => {
    const properties = ["/example/path/", "/example/path2/"];
    render(<UnspecifiedProperty properties={properties} />);
    expect(
      screen.getByRole("link", { name: "/example/path/" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "/example/path2/" })
    ).toBeInTheDocument();
  });

  it("renders a URL as a link", () => {
    const properties = ["http://example.com"];
    render(<UnspecifiedProperty properties={properties} />);
    expect(screen.getByRole("link")).toHaveTextContent("http://example.com");
  });
});

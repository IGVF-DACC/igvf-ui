import { render, screen } from "@testing-library/react";
import UnspecifiedProperty from "../unspecified-property";

describe("Test UnspecifiedProperty component", () => {
  it("renders strings and numbers", () => {
    render(<UnspecifiedProperty property="hello" />);
    expect(screen.getByText("hello")).toBeInTheDocument();

    render(<UnspecifiedProperty property={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders booleans", () => {
    render(<UnspecifiedProperty property={true} />);
    expect(screen.getByText("true")).toBeInTheDocument();

    render(<UnspecifiedProperty property={false} />);
    expect(screen.getByText("false")).toBeInTheDocument();
  });

  it("renders arrays of strings and numbers", () => {
    render(<UnspecifiedProperty property={["hello", 5]} />);
    expect(screen.getByText("hello, 5")).toBeInTheDocument();
  });

  it("renders an embedded object with an @id", () => {
    const property = {
      "@id": "/example/path/",
      title: "Example",
    };
    render(<UnspecifiedProperty property={property} />);
    expect(screen.getByRole("link")).toHaveTextContent("/example/path/");
  });

  it("renders an array of embedded objects with @ids", () => {
    const property = [
      {
        "@id": "/example/path/",
        title: "Example",
      },
      {
        "@id": "/example/path2/",
        title: "Example 2",
      },
    ];
    render(<UnspecifiedProperty property={property} />);
    expect(
      screen.getByRole("link", { name: "/example/path/" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "/example/path2/" }),
    ).toBeInTheDocument();
  });

  it("renders an embedded object without an @id as JSON", () => {
    const property = {
      title: "Example",
    };
    render(<UnspecifiedProperty property={property} />);
    expect(screen.getByText('{"title":"Example"}')).toBeInTheDocument();
  });

  it("renders an array of embedded objects without @ids as JSON", () => {
    const property = [
      {
        title: "Example",
      },
      {
        title: "Example 2",
      },
    ];
    render(<UnspecifiedProperty property={property} />);
    expect(
      screen.getByText('[{"title":"Example"},{"title":"Example 2"}]'),
    ).toBeInTheDocument();
  });
});

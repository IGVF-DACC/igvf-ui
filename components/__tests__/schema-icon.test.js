import { render, screen } from "@testing-library/react";
import SchemaIcon from "../schema-icon";

describe("Test the SchemaIcon component", () => {
  it("should render a default icon for an unknown schema type", () => {
    render(<SchemaIcon type="Unknown" />);
    expect(screen.getByTestId("icon-splat")).toBeInTheDocument();
  });

  it("should render a default icon for an empty schema type", () => {
    render(<SchemaIcon type="" />);
    expect(screen.getByTestId("icon-splat")).toBeInTheDocument();
  });

  it("should render a default icon for a null schema type", () => {
    render(<SchemaIcon type={null} />);
    expect(screen.getByTestId("icon-splat")).toBeInTheDocument();
  });

  it("should render a default icon for defined schema type", () => {
    render(<SchemaIcon type="Award" />);
    expect(screen.getByTestId("icon-award")).toBeInTheDocument();
  });
});

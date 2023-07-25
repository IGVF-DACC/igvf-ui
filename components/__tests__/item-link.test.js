import { render, screen } from "@testing-library/react";
import ItemLink from "../item-link";

describe("Test ItemLink component", () => {
  it("properly generates a link with a label to an item's page", () => {
    const href = "/labs/j-michael-cherry/";
    const label = "J. Michael Cherry";

    // Test the link with a label.
    render(<ItemLink href={href} label={label} />);
    let link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link.href).toBe("http://localhost/labs/j-michael-cherry");

    link = screen.getByLabelText(label);
    expect(link).toBeInTheDocument();
  });

  it("properly generates a link without a label to the item's page", () => {
    const href = "/labs/j-michael-cherry/";

    // Test the link without a label.
    render(<ItemLink href={href} />);
    const linkWithoutLabel = screen.getByRole("link");
    expect(linkWithoutLabel).toBeInTheDocument();
    expect(linkWithoutLabel.href).toBe(
      "http://localhost/labs/j-michael-cherry",
    );

    const link = screen.queryByLabelText("J. Michael Cherry");
    expect(link).not.toBeInTheDocument();
  });
});

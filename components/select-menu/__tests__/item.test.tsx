import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Item } from "../item";
import { SelectMenu } from "../select-menu";

describe("Item", () => {
  it("renders the provided children", () => {
    render(
      <SelectMenu>
        <Item href="/test-link" target="_blank" rel="noreferrer">
          Test Item
        </Item>
      </SelectMenu>
    );
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("applies additional class names", () => {
    render(
      <SelectMenu>
        <Item href="/test-link" className="test-class">
          Test Item
        </Item>
      </SelectMenu>
    );
    expect(screen.getByText("Test Item")).toHaveClass("test-class");
  });

  it("calls onClick handler when rendered as a button", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <SelectMenu>
        <Item onClick={onClick}>Test Button Item</Item>
      </SelectMenu>
    );

    await user.click(screen.getByRole("menuitem"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

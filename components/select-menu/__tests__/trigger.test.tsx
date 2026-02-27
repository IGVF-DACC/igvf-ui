import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectMenu } from "../select-menu";
import { Trigger } from "../trigger";

describe("Trigger", () => {
  it("renders the provided children and an icon", () => {
    render(
      <SelectMenu>
        <Trigger>Menu</Trigger>
      </SelectMenu>
    );

    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByTestId("select-menu-trigger-icon")).toBeInTheDocument();
  });

  it("applies additional class names", () => {
    render(
      <SelectMenu>
        <Trigger className="test-class">Menu</Trigger>
      </SelectMenu>
    );
    expect(screen.getByRole("button")).toHaveClass("test-class");
  });

  it("calls onMouseEnter and onMouseLeave handlers", async () => {
    const user = userEvent.setup();
    const onMouseEnter = jest.fn();
    const onMouseLeave = jest.fn();

    render(
      <SelectMenu>
        <Trigger onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          Menu
        </Trigger>
      </SelectMenu>
    );

    const button = screen.getByRole("button");
    await user.hover(button);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);

    await user.unhover(button);
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });
});

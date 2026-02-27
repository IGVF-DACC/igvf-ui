import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectMenu } from "../select-menu";
import { Item } from "../item";
import { Trigger } from "../trigger";
import { Items } from "../items";

// Partially mock @headlessui/react, replacing only MenuItems. The real MenuItems passes the
// `anchor` prop to @floating-ui/react (bundled inside headlessui), which starts a
// requestAnimationFrame positioning loop that never settles in jsdom and hangs these tests.
jest.mock("@headlessui/react", () => ({
  ...jest.requireActual("@headlessui/react"),
  MenuItems: jest.requireActual("./mock-headlessui-menu-items").MenuItems,
}));

describe("Items", () => {
  it("renders the provided children", async () => {
    const user = userEvent.setup();
    render(
      <SelectMenu>
        <Trigger>View Items</Trigger>
        <Items>
          <Item href="/item-1">Item 1</Item>
          <Item href="/item-2">Item 2</Item>
        </Items>
      </SelectMenu>
    );

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("applies additional class names", async () => {
    const user = userEvent.setup();
    render(
      <SelectMenu>
        <Trigger>View Items</Trigger>
        <Items className="test-class" justify="right">
          <Item href="/item-1">Item 1</Item>
        </Items>
      </SelectMenu>
    );

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Item 1").parentElement).toHaveClass("test-class");
  });

  it("calls onMouseEnter and onMouseLeave handlers", async () => {
    const user = userEvent.setup();
    const onMouseEnter = jest.fn();
    const onMouseLeave = jest.fn();

    render(
      <SelectMenu>
        <Trigger>View Items</Trigger>
        <Items onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          <Item href="/item-1">Item 1</Item>
        </Items>
      </SelectMenu>
    );

    await user.click(screen.getByRole("button"));

    const itemsContainer = screen.getByText("Item 1").parentElement;
    if (!itemsContainer) {
      throw new Error("Items container not found");
    }

    await user.hover(itemsContainer);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);

    await user.unhover(itemsContainer);
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });
});

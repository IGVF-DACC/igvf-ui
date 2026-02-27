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

describe("SelectMenu", () => {
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

    // Click the trigger to open the menu and reveal the items.
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("applies additional class names to the wrapper", async () => {
    render(
      <SelectMenu className="test-class">
        <Trigger>View Items</Trigger>
        <Items>
          <Item href="/item-1">Item 1</Item>
        </Items>
      </SelectMenu>
    );

    // Make sure the SelectMenu wrapper has the additional class name
    expect(screen.getByRole("button").parentElement).toHaveClass("test-class");
  });

  it("receives the correct render props", async () => {
    const user = userEvent.setup();

    render(
      <SelectMenu>
        {({ open }) => (
          <>
            <Trigger>{open ? "Close Menu" : "Open Menu"}</Trigger>
            <Items>
              <Item href="/item-1">Item 1</Item>
            </Items>
          </>
        )}
      </SelectMenu>
    );

    // Initially, the trigger should show "Open Menu"
    expect(screen.getByRole("button")).toHaveTextContent("Open Menu");

    // Click the trigger to open the menu
    await user.click(screen.getByRole("button"));

    // Now the trigger should show "Close Menu"
    expect(screen.getByRole("button")).toHaveTextContent("Close Menu");

    // Click the trigger again to close the menu
    await user.click(screen.getByRole("button"));

    // The trigger should go back to showing "Open Menu"
    expect(screen.getByRole("button")).toHaveTextContent("Open Menu");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabGroup, TabList, TabPane, TabPanes, TabTitle } from "../tabs";

function BasicTabs({
  defaultId,
  selectedId,
  onChange,
}: {
  defaultId?: string;
  selectedId?: string;
  onChange?: (id: string) => void;
}) {
  return (
    <TabGroup
      defaultId={defaultId}
      selectedId={selectedId}
      onChange={onChange}
    >
      <TabList>
        <TabTitle id="first">First</TabTitle>
        <TabTitle id="second">Second</TabTitle>
      </TabList>
      <TabPanes>
        <TabPane>First panel</TabPane>
        <TabPane>Second panel</TabPane>
      </TabPanes>
    </TabGroup>
  );
}

describe("TabGroup", () => {
  it("keeps the controlled panel visible until selectedId changes", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<BasicTabs selectedId="first" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Second" }));

    expect(onChange).toHaveBeenCalledWith("second");
    expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("First panel");
  });

  it("updates a controlled panel when selectedId changes", () => {
    const { rerender } = render(<BasicTabs selectedId="first" />);

    rerender(<BasicTabs selectedId="second" />);

    expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
  });

  it("uses a valid defaultId for an uncontrolled group", () => {
    render(<BasicTabs defaultId="second" />);

    expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it.each([
    { description: "an invalid defaultId", defaultId: "missing" },
    { description: "an invalid selectedId", selectedId: "missing" },
  ])("falls back to the first tab for $description", ({
    defaultId,
    selectedId,
  }) => {
    render(<BasicTabs defaultId={defaultId} selectedId={selectedId} />);

    expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("uses the first tab by default and allows uncontrolled changes", async () => {
    const user = userEvent.setup();
    render(<BasicTabs />);

    await user.click(screen.getByRole("tab", { name: "Second" }));

    expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("preserves positions for tabs without IDs", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(
      <TabGroup onChange={onChange}>
        <TabList>
          <TabTitle>First</TabTitle>
          <TabTitle id="second">Second</TabTitle>
        </TabList>
        <TabPanes>
          <TabPane>First panel</TabPane>
          <TabPane>Second panel</TabPane>
        </TabPanes>
      </TabGroup>
    );

    await user.click(screen.getByRole("tab", { name: "Second" }));

    expect(onChange).toHaveBeenCalledWith("second");
  });
});

describe("Tab components", () => {
  it("supports render-prop titles and clones element children with the tab ID", () => {
    render(
      <TabGroup defaultId="rendered">
        <TabList className="custom-list">
          <TabTitle id="rendered" className="custom-tab">
            {({ selected, isDisabled }) => (
              <span data-selected={selected} data-disabled={isDisabled}>
                Rendered title
              </span>
            )}
          </TabTitle>
        </TabList>
        <TabPanes className="custom-panes">
          <TabPane className="custom-panel">Panel</TabPane>
        </TabPanes>
      </TabGroup>
    );

    const title = screen.getByText("Rendered title");
    expect(title).toHaveAttribute("id", "rendered");
    expect(title).toHaveAttribute("data-selected", "true");
    expect(title).toHaveAttribute("data-disabled", "false");
    expect(screen.getByRole("tablist")).toHaveClass("custom-list");
    expect(screen.getByRole("tabpanel")).toHaveClass("custom-panel");
    expect(screen.getByRole("tabpanel").parentElement).toHaveClass(
      "custom-panes"
    );
  });

  it("applies disabled styling and passes disabled state to render props", () => {
    render(
      <TabGroup>
        <TabList>
          <TabTitle id="enabled">Enabled</TabTitle>
          <TabTitle id="disabled" isDisabled>
            {({ isDisabled }) => (isDisabled ? "Disabled" : "Enabled")}
          </TabTitle>
        </TabList>
        <TabPanes>
          <TabPane>Enabled panel</TabPane>
          <TabPane>Disabled panel</TabPane>
        </TabPanes>
      </TabGroup>
    );

    const disabledTab = screen.getByRole("tab", { name: "Disabled" });
    expect(disabledTab).toBeDisabled();
    expect(disabledTab.firstElementChild).toHaveClass(
      "border-tab-disabled",
      "text-tab-title-disabled"
    );
  });

  it("handles an empty title and applies default list styling", () => {
    render(
      <TabGroup>
        <TabList>
          <TabTitle id="empty">{null}</TabTitle>
        </TabList>
        <TabPanes>
          <TabPane>Panel</TabPane>
        </TabPanes>
      </TabGroup>
    );

    expect(screen.getByRole("tablist")).toHaveClass(
      "flex",
      "items-stretch",
      "border-b",
      "border-tab-group"
    );
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import {
  DataArea,
  DataAreaTitle,
  DataAreaTitleLink,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueUrl,
  DataPanel,
} from "../data-area";
import { usePagePanels } from "../page-panels";
import Status from "../status";

describe("Test the DataArea component", () => {
  it("properly renders a data panel with default Tailwind CSS classes", () => {
    render(
      <>
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status="in progress" />
            </DataItemValue>
          </DataArea>
        </DataPanel>
        <DataAreaTitle>Treatments</DataAreaTitle>
      </>
    );

    const dataPanel = screen.getByTestId("datapanel");
    expect(dataPanel).toBeInTheDocument();

    const dataArea = screen.getByTestId("dataarea");
    expect(dataArea).toBeInTheDocument();

    const dataAreaTitle = screen.getByTestId("dataareatitle");
    expect(dataAreaTitle).toBeInTheDocument();

    const dataItemLabel = screen.getByTestId("dataitemlabel");
    expect(dataItemLabel).toBeInTheDocument();

    const title = screen.getByTestId("dataitemvalue");
    expect(title).toBeInTheDocument();
  });

  it("properly renders a data panel with custom Tailwind CSS classes", () => {
    render(
      <>
        <DataPanel className="text-xs">
          <DataArea>
            <DataItemLabel className="font-black">Status</DataItemLabel>
            <DataItemValueUrl>
              <a
                href="https://igvf.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://igvf.org/
              </a>
            </DataItemValueUrl>
          </DataArea>
        </DataPanel>
        <DataAreaTitle>
          Treatments
          <DataAreaTitleLink href="/profiles" label="Link to profiles page">
            Profiles
          </DataAreaTitleLink>
        </DataAreaTitle>
      </>
    );

    const dataPanel = screen.getByTestId("datapanel");
    expect(dataPanel).toBeInTheDocument();
    expect(dataPanel).toHaveClass("text-xs");

    const dataArea = screen.getByTestId("dataarea");
    expect(dataArea).toBeInTheDocument();

    const dataAreaTitle = screen.getByTestId("dataareatitle");
    expect(dataAreaTitle).toBeInTheDocument();

    const dataItemLabel = screen.getByTestId("dataitemlabel");
    expect(dataItemLabel).toBeInTheDocument();
    expect(dataItemLabel).toHaveClass("font-black");

    const title = screen.getByTestId("dataitemvalue");
    expect(title).toBeInTheDocument();
  });
});

describe("Test DataItemList", () => {
  it("renders a list of items that's not collapsible", () => {
    render(
      <DataItemList>
        {"Item 1"}
        {"Item 2"}
        {"Item 3"}
        {"Item 4"}
        {"Item 5"}
        {"Item 6"}
        {"Item 7"}
      </DataItemList>
    );

    const items = screen.getAllByText(/Item [0-9]/);
    expect(items.length).toBe(7);

    const listItems = screen.getAllByRole("listitem");
    listItems.forEach((item) => {
      expect(item).toHaveClass("border-data-list-item");
    });
  });

  it("renders a collapsible list that collapses when the control is clicked", () => {
    render(
      <DataItemList isCollapsible maxItemsBeforeCollapse={4}>
        {"Item 1"}
        {"Item 2"}
        {"Item 3"}
        {"Item 4"}
        {"Item 5"}
        {"Item 6"}
        {"Item 7"}
      </DataItemList>
    );

    let items = screen.getAllByText(/Item [0-9]/);
    expect(items.length).toBe(4);

    const button = screen.getByTestId("collapse-control-vertical");
    fireEvent.click(button);
    items = screen.getAllByText(/Item [0-9]/);
    expect(items.length).toBe(7);

    fireEvent.click(button);
    items = screen.getAllByText(/Item [0-9]/);
    expect(items.length).toBe(4);
  });

  it("renders a single-item list and doesn't contain a border class", () => {
    render(<DataItemList>{"Item 1"}</DataItemList>);

    const listItems = screen.getAllByRole("listitem");
    listItems.forEach((item) => {
      expect(item).not.toHaveClass("border-data-list-item");
    });
  });

  it("renders a list for URLs with the break-all class", () => {
    render(
      <DataItemList isUrlList>
        <a href="https://igvf.org/" target="_blank" rel="noopener noreferrer">
          https://igvf.org/
        </a>
        <a href="https://igvf.org/" target="_blank" rel="noopener noreferrer">
          https://igvf.org/
        </a>
        <a href="https://igvf.org/" target="_blank" rel="noopener noreferrer">
          https://igvf.org/
        </a>
      </DataItemList>
    );

    const listItems = screen.getAllByRole("listitem");
    listItems.forEach((item) => {
      expect(item).toHaveClass("break-all");
    });
  });
});

describe("Test the DataAreaTitle and collapser", () => {
  it("renders a title with a collapsible control", () => {
    function TitleWithCollapser() {
      const pagePanels = usePagePanels();

      return (
        <>
          <DataAreaTitle>
            <DataAreaTitle.Expander
              pagePanels={pagePanels}
              pagePanelId="test-panel"
              label="Test table"
            >
              Test Title
            </DataAreaTitle.Expander>
          </DataAreaTitle>
          {pagePanels.isExpanded("test-panel") && <div>Expanded</div>}
        </>
      );
    }

    render(<TitleWithCollapser />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.queryByText("Expanded")).not.toBeInTheDocument();

    // Click the button to expand the panel
    fireEvent.click(screen.getByText("Test Title"));
    expect(screen.getByText("Expanded")).toBeInTheDocument();
  });

  it("renders multiple tables with collapsible controls", () => {
    function TitleWithCollapser() {
      const pagePanels = usePagePanels();

      return (
        <>
          <DataAreaTitle>
            <DataAreaTitle.Expander
              pagePanels={pagePanels}
              pagePanelId="test-panel-1"
              label="Test table 1"
            >
              Test Title 1
            </DataAreaTitle.Expander>
          </DataAreaTitle>
          {pagePanels.isExpanded("test-panel-1") && <div>Expanded 1</div>}
          <DataAreaTitle>
            <DataAreaTitle.Expander
              pagePanels={pagePanels}
              pagePanelId="test-panel-2"
              label="Test table 2"
            >
              Test Title 2
            </DataAreaTitle.Expander>
          </DataAreaTitle>
          {pagePanels.isExpanded("test-panel-2") && <div>Expanded 2</div>}
        </>
      );
    }

    render(<TitleWithCollapser />);

    expect(screen.getByText("Test Title 1")).toBeInTheDocument();
    expect(screen.getByText("Test Title 2")).toBeInTheDocument();
    expect(screen.queryByText("Expanded 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Expanded 2")).not.toBeInTheDocument();

    // Click the button to expand the first panel
    fireEvent.click(screen.getByText("Test Title 1"));
    expect(screen.getByText("Expanded 1")).toBeInTheDocument();
    expect(screen.queryByText("Expanded 2")).not.toBeInTheDocument();

    // Click the button to expand the second panel
    fireEvent.click(screen.getByText("Test Title 2"));
    expect(screen.getByText("Expanded 1")).toBeInTheDocument();
    expect(screen.getByText("Expanded 2")).toBeInTheDocument();

    // Click the button to collapse the first panel with the option key down and make sure both
    // panels collapse. Delay a half second to allow the animations to finish.
    fireEvent.click(screen.getByText("Test Title 1"), { altKey: true });
    expect(screen.queryByText("Expanded 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Expanded 2")).not.toBeInTheDocument();
  });
});

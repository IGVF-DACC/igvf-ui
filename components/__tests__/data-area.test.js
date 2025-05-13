import { fireEvent, render, screen } from "@testing-library/react";
import {
  DataArea,
  DataAreaTitle,
  DataAreaTitleLink,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueBoolean,
  DataItemValueUrl,
  DataPanel,
} from "../data-area";
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
            <DataItemLabel isSmall>Status Small</DataItemLabel>
            <DataItemValue isSmall>
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

    const dataItemLabels = screen.getAllByTestId("dataitemlabel");
    expect(dataItemLabels[0]).toBeInTheDocument();
    expect(dataItemLabels[0]).toHaveClass("mt-4 @md:mt-0");

    const values = screen.getAllByTestId("dataitemvalue");
    expect(values[0]).toBeInTheDocument();
    expect(values[0]).toHaveClass(
      "font-medium text-data-value last:mb-0 mb-4 @md:mb-0 @md:min-w-0"
    );
    expect(values[1]).toBeInTheDocument();
    expect(values[1]).toHaveClass("mb-2 @sm:mb-0 @sm:min-w-0");

    // Check the CSS classes include "@md:grid @md:grid-cols-data-item @md:gap-4"
    expect(dataArea).toHaveClass("@md:grid @md:grid-cols-data-item @md:gap-4");
  });

  it("properly renders a data panel with custom Tailwind CSS classes", () => {
    render(
      <>
        <DataPanel className="text-xs" isPaddingSuppressed>
          <DataArea isSmall>
            <DataItemLabel className="font-black" isSmall>
              Status
            </DataItemLabel>
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
    expect(dataArea).toHaveClass(
      "@sm:grid @sm:grid-cols-data-item-small @sm:gap-2 text-sm"
    );

    const dataAreaTitle = screen.getByTestId("dataareatitle");
    expect(dataAreaTitle).toBeInTheDocument();
    expect(dataAreaTitle).toHaveClass("mb-1 mt-4 text-2xl font-light");

    const dataItemLabel = screen.getByTestId("dataitemlabel");
    expect(dataItemLabel).toBeInTheDocument();
    expect(dataItemLabel).toHaveClass("mt-2 @sm:mt-0");

    const value = screen.getByTestId("dataitemvalue");
    expect(value).toBeInTheDocument();
    expect(value).toHaveClass(
      "font-medium text-data-value last:mb-0 mb-4 @md:mb-0 @md:min-w-0 break-all"
    );
  });

  it("handles the `secDirTitle` prop for the DataAreaTitle component", () => {
    render(
      <DataAreaTitle secDirTitle="Treatments">
        <DataAreaTitleLink href="/profiles" label="Link to profiles page">
          Profiles
        </DataAreaTitleLink>
      </DataAreaTitle>
    );

    const dataAreaTitle = screen.getByTestId("dataareatitle");
    expect(dataAreaTitle).toBeInTheDocument();
    expect(dataAreaTitle).toHaveAttribute("data-sec-dir", "Treatments");
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

describe("Test the DataItemValueBoolean component", () => {
  it("renders the boolean value true", () => {
    render(<DataItemValueBoolean>{true}</DataItemValueBoolean>);
    expect(screen.getByText("True")).toBeInTheDocument();
  });

  it("renders the boolean value false", () => {
    render(<DataItemValueBoolean>{false}</DataItemValueBoolean>);
    expect(screen.getByText("False")).toBeInTheDocument();
  });

  it('renders nothing when the value is "undefined"', () => {
    render(<DataItemValueBoolean>{undefined}</DataItemValueBoolean>);
    expect(screen.queryByText("True")).not.toBeInTheDocument();
    expect(screen.queryByText("False")).not.toBeInTheDocument();
  });
});

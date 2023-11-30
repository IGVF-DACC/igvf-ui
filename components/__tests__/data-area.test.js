import { fireEvent, render, screen } from "@testing-library/react";
import {
  DataArea,
  DataAreaTitle,
  DataAreaTitleLink,
  DataItemLabel,
  DataItemValue,
  DataItemValueUrl,
  DataItemValueCollapseControl,
  DataItemValueControlLabel,
  DataPanel,
  useDataAreaCollapser,
} from "../data-area";
import SeparatedList from "../separated-list";
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

describe("Test the useDataAreaCollapser hook", () => {
  it("properly collapses and expands the data area", () => {
    const data = [
      "IGVFFS0001AAAA",
      "IGVFFS0002AAAA",
      "IGVFFS0003AAAA",
      "IGVFFS0004AAAA",
      "IGVFFS0005AAAA",
      "IGVFFS0006AAAA",
    ];

    function TestComponent() {
      const collapser = useDataAreaCollapser(data);
      return (
        <>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Status</DataItemLabel>
              <DataItemValue>
                <SeparatedList>
                  {collapser.displayedData.map((item) => (
                    <div key={item} data-testid={`displayed-item-${item}`}>
                      {item}
                    </div>
                  ))}
                </SeparatedList>
                <DataItemValueCollapseControl collapser={collapser}>
                  <DataItemValueControlLabel collapser={collapser} />
                </DataItemValueCollapseControl>
              </DataItemValue>
            </DataArea>
          </DataPanel>
        </>
      );
    }

    render(<TestComponent />);

    // Get the SVG within the button and check its data-testid attribute
    const button = screen.getByRole("button");
    expect(button.firstChild).toHaveAttribute(
      "data-testid",
      "data-item-value-expand-icon"
    );

    // Only the first 3 items should be displayed
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0001AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0002AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0003AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0004AAAA")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0005AAAA")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0006AAAA")
    ).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(button.firstChild).toHaveAttribute(
      "data-testid",
      "data-item-value-collapse-icon"
    );

    // All items should be displayed
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0001AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0002AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0003AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0004AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0005AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0006AAAA")
    ).toBeInTheDocument();
  });

  it("does not render the collapse button if there are no items to collapse", () => {
    const data = ["IGVFFS0001AAAA", "IGVFFS0002AAAA", "IGVFFS0003AAAA"];

    function TestComponent() {
      const collapser = useDataAreaCollapser(data);
      return (
        <>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Status</DataItemLabel>
              <DataItemValue>
                <SeparatedList>
                  {collapser.displayedData.map((item) => (
                    <div key={item} data-testid={`displayed-item-${item}`}>
                      {item}
                    </div>
                  ))}
                </SeparatedList>
                <DataItemValueCollapseControl collapser={collapser}>
                  <DataItemValueControlLabel collapser={collapser} />
                </DataItemValueCollapseControl>
              </DataItemValue>
            </DataArea>
          </DataPanel>
        </>
      );
    }

    render(<TestComponent />);

    const button = screen.queryByRole("button");
    expect(button).not.toBeInTheDocument();

    // All items should be displayed
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0001AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0002AAAA")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("displayed-item-IGVFFS0003AAAA")
    ).toBeInTheDocument();
  });

  it("renders nothing if you provide no data", () => {
    function TestComponent() {
      const collapser = useDataAreaCollapser();
      return (
        <>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Status</DataItemLabel>
              <DataItemValue>
                <SeparatedList>
                  {collapser.displayedData.map((item) => (
                    <div key={item} data-testid={`displayed-item-${item}`}>
                      {item}
                    </div>
                  ))}
                </SeparatedList>
                <DataItemValueCollapseControl collapser={collapser}>
                  <DataItemValueControlLabel collapser={collapser} />
                </DataItemValueCollapseControl>
              </DataItemValue>
            </DataArea>
          </DataPanel>
        </>
      );
    }

    render(<TestComponent />);

    const button = screen.queryByRole("button");
    expect(button).not.toBeInTheDocument();
  });
});

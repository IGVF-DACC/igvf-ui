import { render, screen } from "@testing-library/react";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
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

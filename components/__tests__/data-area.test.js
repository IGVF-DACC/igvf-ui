import { fireEvent, render, screen } from "@testing-library/react";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataItemValueExpandButton,
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

describe("Test the DataItemValueExpandButton component", () => {
  it("renders the collapsed button and calls the onClick handler", () => {
    const onClick = jest.fn();
    render(
      <DataItemValueExpandButton
        isExpandable={true}
        isExpanded={false}
        onClick={onClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.firstChild).toHaveAttribute(
      "data-testid",
      "data-item-value-expand-icon"
    );

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it("renders the expanded button and calls the onClick handler", () => {
    const onClick = jest.fn();
    render(
      <DataItemValueExpandButton
        isExpandable={true}
        isExpanded={true}
        onClick={onClick}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.firstChild).toHaveAttribute(
      "data-testid",
      "data-item-value-collapse-icon"
    );

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it("renders nothing if the item is not expandable", () => {
    render(
      <DataItemValueExpandButton
        isExpandable={false}
        isExpanded={true}
        onClick={jest.fn()}
      />
    );

    const button = screen.queryByRole("button");
    expect(button).not.toBeInTheDocument();
  });
});

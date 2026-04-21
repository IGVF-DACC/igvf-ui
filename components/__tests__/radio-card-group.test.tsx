import { render, screen, fireEvent } from "@testing-library/react";
import { Card, RadioCardGroup } from "../radio-card-group";

describe("<RadioCardGroup>", () => {
  it("renders a group of radio cards with a legend", () => {
    const setSelectedValue = jest.fn();
    render(
      <RadioCardGroup
        name="example"
        legend="Example Legend"
        selectedValue="option-1"
        setSelectedValue={setSelectedValue}
      >
        <RadioCardGroup.Card
          id="option-1"
          value="option-1"
          label="Option 1"
          description="Description for option 1"
        />
        <RadioCardGroup.Card
          id="option-2"
          value="option-2"
          label="Option 2"
          description="Description for option 2"
        />
        <RadioCardGroup.Card
          id="option-3"
          value="option-3"
          label="Option 3"
          description="Description for option 3"
        />
      </RadioCardGroup>
    );

    // Verify the legend is visible using the data-legend attribute.
    const legend = screen.getByTestId("data-legend");
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveTextContent(/^Example Legend$/);

    // Verify the cards are rendered with the correct labels and descriptions.
    const card1 = screen.getByRole("radio", { name: /^Option 1/ });
    expect(card1).toBeInTheDocument();
    expect(screen.getByText("Description for option 1")).toBeInTheDocument();

    const card2 = screen.getByRole("radio", { name: /^Option 2/ });
    expect(card2).toBeInTheDocument();
    expect(screen.getByText("Description for option 2")).toBeInTheDocument();

    const card3 = screen.getByRole("radio", { name: /^Option 3/ });
    expect(card3).toBeInTheDocument();
    expect(screen.getByText("Description for option 3")).toBeInTheDocument();

    // Verify that the first card is visually indicated as selected based on the selectedValue prop.
    expect(card1).toBeChecked();
    expect(card2).not.toBeChecked();
    expect(card3).not.toBeChecked();

    // Verify that clicking a card calls setSelectedValue with the correct value.
    fireEvent.click(card2);
    expect(setSelectedValue).toHaveBeenCalledWith("option-2");
  });

  it("renders a group of radio cards with a hidden legend", () => {
    const setSelectedValue = jest.fn();
    render(
      <RadioCardGroup
        name="example"
        legend="Example Legend"
        hideLegend
        selectedValue="option-1"
        setSelectedValue={setSelectedValue}
      >
        <RadioCardGroup.Card
          id="option-1"
          value="option-1"
          label="Option 1"
          description="Description for option 1"
        />
      </RadioCardGroup>
    );

    // Verify the legend is present but visually hidden using the data-legend attribute.
    const legend = screen.getByTestId("data-legend");
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveTextContent(/^Example Legend$/);
    expect(legend).toHaveClass("sr-only");
  });

  it("renders disabled cards when the `disabled` prop is set", () => {
    const setSelectedValue = jest.fn();
    render(
      <RadioCardGroup
        name="example"
        legend="Example Legend"
        selectedValue="option-1"
        setSelectedValue={setSelectedValue}
      >
        <RadioCardGroup.Card
          id="option-1"
          value="option-1"
          label="Option 1"
          description="Description for option 1"
          disabled
        />
      </RadioCardGroup>
    );

    const card1 = screen.getByRole("radio", { name: /^Option 1/ });
    expect(card1).toBeDisabled();
  });

  it("throws when `Card` is used outside of `RadioCardGroup`", () => {
    // Suppress console error output for this test since we expect an error to be thrown. Use
    // `<Card>` instead of `<RadioCardGroup.Card>` to ensure coverage of the `Card` component
    // declaration.
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(
        <Card
          id="option-1"
          value="option-1"
          label="Option 1"
          description="Description for option 1"
        />
      );
    }).toThrow("Card must be used within a RadioCardGroup");

    // Restore original console.error after the test.
    console.error = consoleError;
  });
});

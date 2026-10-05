import { act, fireEvent, render, screen } from "@testing-library/react";
import { Tooltip, TooltipPortalRoot, TooltipRef, useTooltip } from "../tooltip";

describe("Test tooltips", () => {
  it("should render a tooltip", async () => {
    jest.useFakeTimers();

    function TestComponent() {
      const tooltipAttr = useTooltip("test");

      return (
        <>
          <TooltipRef tooltipAttr={tooltipAttr}>
            <button>Tooltip Reference</button>
          </TooltipRef>
          <Tooltip tooltipAttr={tooltipAttr}>Tooltip content</Tooltip>
          <TooltipPortalRoot />
        </>
      );
    }

    render(<TestComponent />);

    const button = screen.getByText("Tooltip Reference");
    expect(button).toHaveAttribute("aria-describedby", "tooltip-test");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    // Hover over the button and make sure the tooltip appears after a delay.
    fireEvent.mouseEnter(button);
    const tooltip = await screen.findByTestId("tooltip-test");
    expect(tooltip).toHaveTextContent("Tooltip content");

    // Move the mouse away and make sure the tooltip disappears after a delay.
    fireEvent.mouseLeave(button);
    act(() => {
      jest.runAllTimers();
    });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("does not add aria-describedby for a custom child without the attribute", () => {
    function CustomButton({ children }) {
      return <button>{children}</button>;
    }

    function TestComponent() {
      const tooltipAttr = useTooltip("custom-child");

      return (
        <TooltipRef tooltipAttr={tooltipAttr}>
          <CustomButton>Custom child</CustomButton>
        </TooltipRef>
      );
    }

    render(<TestComponent />);

    const button = screen.getByRole("button", { name: "Custom child" });
    expect(button).not.toHaveAttribute("aria-describedby");
    expect(button.parentElement).not.toHaveAttribute("aria-describedby");
  });

  it("does not duplicate aria-describedby on the wrapper when a custom child has it", () => {
    function CustomButton(props) {
      return <button {...props} />;
    }

    function TestComponent() {
      const tooltipAttr = useTooltip("described-custom-child");

      return (
        <TooltipRef tooltipAttr={tooltipAttr}>
          <CustomButton aria-describedby={tooltipAttr.id}>
            Described custom child
          </CustomButton>
        </TooltipRef>
      );
    }

    render(<TestComponent />);

    const button = screen.getByRole("button", {
      name: "Described custom child",
    });
    expect(button).toHaveAttribute(
      "aria-describedby",
      "tooltip-described-custom-child"
    );
    expect(button.parentElement).not.toHaveAttribute("aria-describedby");
  });
});

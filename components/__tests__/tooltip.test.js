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
});

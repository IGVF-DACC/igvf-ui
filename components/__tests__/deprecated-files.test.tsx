import { render, screen } from "@testing-library/react";
import { DeprecatedFileFilterControl } from "../deprecated-files";

describe("Test DeprecatedFileFilterControl component", () => {
  it("renders the checkbox with the correct title", () => {
    const mockSetVisible = jest.fn();
    const deprecatedData = {
      visible: true,
      setVisible: mockSetVisible,
    };

    render(
      <DeprecatedFileFilterControl
        panelId="test-panel"
        deprecatedData={deprecatedData}
      />
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /^Include deprecated files$/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    // Make sure clicking the checkbox calls the setVisible function
    checkbox.click();
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });

  it("renders the control title when provided", () => {
    const mockSetVisible = jest.fn();
    const deprecatedData = {
      visible: true,
      setVisible: mockSetVisible,
      controlTitle: "Show deprecated files",
    };

    render(
      <DeprecatedFileFilterControl
        panelId="test-panel"
        deprecatedData={deprecatedData}
      />
    );

    const title = screen.getByText("Show deprecated files");
    expect(title).toBeInTheDocument();
  });
});

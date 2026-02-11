import { render, screen, fireEvent } from "@testing-library/react";
import { DoiControl } from "../doi";

describe("DoiControl tests", () => {
  it("renders nothing with no DOI", () => {
    render(<DoiControl />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders DOI and copy button", () => {
    const doi = "10.1234/example.doi";
    render(<DoiControl doi={doi} />);
    expect(screen.getByText(doi)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `https://doi.org/${doi}`);
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("copies DOI to clipboard and shows copied state", async () => {
    const doi = "10.1234/example.doi";

    render(<DoiControl doi={doi} />);

    // Verify the clipboard icon is shown initially.
    const clipboardIcon = screen.getByTestId("doi-clipboard");
    expect(clipboardIcon).toBeInTheDocument();

    // Click the copy button.
    fireEvent.click(clipboardIcon);

    // Verify clipboard.writeText was called with the DOI.
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(doi);

    // Verify the check icon appears after clicking.
    await screen.findByTestId("doi-check");
  });
});

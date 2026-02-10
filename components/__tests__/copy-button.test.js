import {
  CheckIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/20/solid";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CopyButton, useCopyAction } from "../copy-button";

describe("Test <CopyButton> component", () => {
  it("Renders a text-based copy button and reacts to a click", async () => {
    render(
      <CopyButton target="the copied text" label="Copy text">
        {(isCopied) => {
          if (isCopied) {
            return "Copied!";
          }
          return "Copy It";
        }}
      </CopyButton>
    );

    const copyButton = screen.getByRole("button");
    expect(copyButton).toHaveTextContent("Copy It");
    expect(copyButton).toHaveAttribute("aria-label", "Copy text");
    fireEvent.click(copyButton);
    await screen.findByText("Copied!");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "the copied text"
    );

    // Wait for the "Copied!" text to change back to "Copy It" after two seconds.
    await screen.findByText("Copy It", {}, { timeout: 2200 });
  });

  it("renders a text-based copy button with no label", () => {
    render(
      <CopyButton target="the copied text">
        {(isCopied) => (isCopied ? "Copied" : "Copy It")}
      </CopyButton>
    );

    const copyButton = screen.getByRole("button");
    expect(copyButton).toHaveTextContent("Copy It");
    expect(copyButton).not.toHaveAttribute("aria-label");
  });

  it("Renders an icon-based copy button and reacts to a click", async () => {
    render(
      <CopyButton.Icon target="the copied text" label="Copy text">
        {(isCopied) =>
          isCopied ? (
            <CheckIcon data-testid="check" />
          ) : (
            <ClipboardDocumentCheckIcon data-testid="clipboard" />
          )
        }
      </CopyButton.Icon>
    );

    const copyButton = screen.getByTestId("clipboard");
    fireEvent.click(copyButton);
    await screen.findByTestId("check");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "the copied text"
    );

    // Wait for the check icon to change back to a clipboard icon after two seconds.
    await screen.findByTestId("clipboard", {}, { timeout: 2200 });
  });
});

describe("Test useCopyAction hook", () => {
  it("sets the isCopied state after calling initiateCopy", async () => {
    function Component() {
      const { isCopied, initiateCopy } = useCopyAction("the copied text");
      return (
        <div>
          <button onClick={initiateCopy}>Copy</button>
          <span data-testid="isCopied">{isCopied.toString()}</span>
        </div>
      );
    }

    render(<Component />);

    // Click the copy button to make sure the isCopied state becomes true.
    const copyButton = screen.getByRole("button");
    const isCopied = screen.getByTestId("isCopied");
    expect(isCopied).toHaveTextContent("false");
    fireEvent.click(copyButton);
    await screen.findByText("true");

    // Test that the isCopied state becomes false after two seconds.
    await screen.findByText("false", {}, { timeout: 2200 });
  });

  it("logs an error and does not set isCopied when clipboard write fails", async () => {
    function Component() {
      const { isCopied, initiateCopy } = useCopyAction("the copied text");
      return (
        <div>
          <button onClick={initiateCopy}>Copy</button>
          <span data-testid="isCopied">{isCopied.toString()}</span>
        </div>
      );
    }

    // Mock the clipboard writeText method to reject with an error.
    const clipboardError = new Error("Clipboard write failed");
    navigator.clipboard.writeText.mockRejectedValueOnce(clipboardError);
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Component />);

    // Check the button before clicking to confirm the initial state of isCopied is false.
    const copyButton = screen.getByRole("button");
    const isCopied = screen.getByTestId("isCopied");
    expect(isCopied).toHaveTextContent("false");

    // Click the copy button to trigger the clipboard write error.
    fireEvent.click(copyButton);

    // Make sure the error is logged and that isCopied remains false.
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Clipboard write failed:",
        clipboardError
      );
    });
    expect(isCopied).toHaveTextContent("false");

    consoleErrorSpy.mockRestore();
  });
});

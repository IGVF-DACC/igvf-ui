import { fireEvent, render, screen } from "@testing-library/react";
import "../__mocks__/intersectionObserverMock";
import "../__mocks__/resize-observer-mock";
import Instruction from "../instruction";

describe("Test Instruction component", () => {
  it("renders Instruction component", () => {
    render(<Instruction title="Test">This opens a test modal</Instruction>);

    const instructionButton = screen.getByLabelText("Test");
    expect(instructionButton).toBeInTheDocument();

    // Click the instruction button to open the modal.
    fireEvent.click(instructionButton);
    let instructionDialog = screen.getByRole("dialog");
    expect(instructionDialog).toBeInTheDocument();
    expect(instructionDialog).toHaveTextContent("This opens a test modal");

    // Close the modal.
    const closeButton = screen.getByLabelText("Close instructions");
    fireEvent.click(closeButton);
    instructionDialog = screen.queryByRole("dialog");
    expect(instructionDialog).toBeNull();

    // Open the modal again and close it with the ESC key.
    fireEvent.click(instructionButton);
    instructionDialog = screen.getByRole("dialog");
    expect(instructionDialog).toBeInTheDocument();
    fireEvent.keyDown(instructionDialog, { key: "Escape", code: "Escape" });
    instructionDialog = screen.queryByRole("dialog");
    expect(instructionDialog).toBeNull();
  });
});

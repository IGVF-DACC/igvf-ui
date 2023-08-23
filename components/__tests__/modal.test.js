import { render, screen } from "@testing-library/react";
import "../__mocks__/intersectionObserverMock";
import Modal from "../modal";

describe("Test a basic modal", () => {
  it("displays a modal", () => {
    const onClose = jest.fn();

    render(
      <Modal isOpen={true} onClose={onClose}>
        <Modal.Header>Modal Header</Modal.Header>
        <Modal.Body>Modal Body</Modal.Body>
        <Modal.Footer>
          <button onClick={onClose}>Close</button>
        </Modal.Footer>
      </Modal>
    );

    // Open the modal and make sure it appears.
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Modal Header")).toBeInTheDocument();
    expect(screen.getByText("Modal Body")).toBeInTheDocument();
  });

  it("displays a modal and focuses on a specific button", () => {
    const onClose = jest.fn();

    render(
      <Modal isOpen={true} defaultElementId="default-button" onClose={onClose}>
        <Modal.Header>Modal Header</Modal.Header>
        <Modal.Body>Modal Body</Modal.Body>
        <Modal.Footer>
          <button onClick={onClose}>Close</button>
          <button id="default-button" onClick={onClose}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    );

    // Open the modal and make sure it appears.
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Modal Header")).toBeInTheDocument();
    expect(screen.getByText("Modal Body")).toBeInTheDocument();

    // Make sure the Cancel button is focused.
    expect(screen.getByText("Cancel")).toHaveFocus();
  });
});

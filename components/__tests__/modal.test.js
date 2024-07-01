import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";

import "../__mocks__/intersectionObserverMock";
import "../__mocks__/resize-observer-mock";
import Modal from "../modal";

describe("Test a basic modal", () => {
  it("displays a modal", async () => {
    const onClose = jest.fn();

    await act(async () => {
      render(
        <Modal isOpen={true} onClose={onClose}>
          <Modal.Header>Modal Header</Modal.Header>
          <Modal.Body>Modal Body</Modal.Body>
          <Modal.Footer>
            <button onClick={onClose}>Close</button>
          </Modal.Footer>
        </Modal>
      );
    });

    // Open the modal and make sure it appears.
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Modal Header")).toBeInTheDocument();
    expect(screen.getByText("Modal Body")).toBeInTheDocument();
  });

  it("displays a modal and focuses on a specific button", async () => {
    const onClose = jest.fn();

    await act(async () => {
      render(
        <Modal isOpen={true} onClose={onClose}>
          <Modal.Header onClose={onClose}>Modal Header</Modal.Header>
          <Modal.Body>Modal Body</Modal.Body>
          <Modal.Footer>
            <button onClick={onClose}>Close</button>
            <button data-autofocus>Cancel</button>
          </Modal.Footer>
        </Modal>
      );
    });

    // Open the modal and make sure it appears.
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Modal Header")).toBeInTheDocument();
    expect(screen.getByText("Modal Body")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toHaveFocus();
  });
});

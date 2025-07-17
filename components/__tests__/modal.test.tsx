import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import Modal from "../modal";
import { ModalManagerProvider } from "../modal-manager";

// Mock the ResizeObserver and IntersectionObserver
jest.mock("../__mocks__/resize-observer-mock");
jest.mock("../__mocks__/intersectionObserverMock");

describe("Test a basic modal", () => {
  it("displays a modal", async (): Promise<void> => {
    const onClose = jest.fn() as jest.MockedFunction<() => void>;

    await act(async () => {
      render(
        <ModalManagerProvider>
          <Modal isOpen={true} onClose={onClose}>
            <Modal.Header>Modal Header</Modal.Header>
            <Modal.Body>Modal Body</Modal.Body>
            <Modal.Footer>
              <button onClick={onClose}>Close</button>
            </Modal.Footer>
          </Modal>
        </ModalManagerProvider>
      );
    });

    // Open the modal and make sure it appears.
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Modal Header")).toBeInTheDocument();
    expect(screen.getByText("Modal Body")).toBeInTheDocument();
  });

  it("displays a modal and focuses on a specific button", async (): Promise<void> => {
    const onClose = jest.fn() as jest.MockedFunction<() => void>;

    await act(async () => {
      render(
        <ModalManagerProvider>
          <Modal isOpen={true} onClose={onClose}>
            <Modal.Header onClose={onClose}>Modal Header</Modal.Header>
            <Modal.Body>Modal Body</Modal.Body>
            <Modal.Footer>
              <button onClick={onClose}>Close</button>
              <button data-autofocus>Cancel</button>
            </Modal.Footer>
          </Modal>
        </ModalManagerProvider>
      );
    });

    // Open the modal and make sure it appears.
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Modal Header")).toBeInTheDocument();
    expect(screen.getByText("Modal Body")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toHaveFocus();
  });

  it("handles multiple modals open at the same time", async (): Promise<void> => {
    const onClose = jest.fn() as jest.MockedFunction<() => void>;

    await act(async () => {
      render(
        <ModalManagerProvider>
          <Modal isOpen={true} onClose={onClose} testid="modal-1">
            <Modal.Header>Modal 1 Header</Modal.Header>
            <Modal.Body>Modal 1 Body</Modal.Body>
            <Modal.Footer>
              <button onClick={onClose}>Close Modal 1</button>
            </Modal.Footer>
          </Modal>
          <Modal isOpen={true} onClose={onClose} testid="modal-2">
            <Modal.Header>Modal 2 Header</Modal.Header>
            <Modal.Body>Modal 2 Body</Modal.Body>
            <Modal.Footer>
              <button onClick={onClose}>Close Modal 2</button>
            </Modal.Footer>
          </Modal>
          <Modal isOpen={true} onClose={onClose} testid="modal-3">
            <Modal.Header>Modal 3 Header</Modal.Header>
            <Modal.Body>Modal 3 Body</Modal.Body>
            <Modal.Footer>
              <button onClick={onClose}>Close Modal 3</button>
            </Modal.Footer>
          </Modal>
          <Modal isOpen={true} onClose={onClose} testid="modal-4">
            <Modal.Header>Modal 4 Header</Modal.Header>
            <Modal.Body>Modal 4 Body</Modal.Body>
            <Modal.Footer>
              <button onClick={onClose}>Close Modal 4</button>
            </Modal.Footer>
          </Modal>
          <Modal isOpen={true} onClose={onClose} testid="modal-5">
            <Modal.Header>Modal 5 Header</Modal.Header>
            <Modal.Body>Modal 5 Body</Modal.Body>
            <Modal.Footer>
              <button onClick={onClose}>Close Modal 5</button>
            </Modal.Footer>
          </Modal>
          <Modal isOpen={true} onClose={onClose} testid="modal-6">
            <Modal.Header>Modal 6 Header</Modal.Header>
            <Modal.Body>Modal 6 Body</Modal.Body>
            <Modal.Footer>
              <button onClick={onClose}>Close Modal 6</button>
            </Modal.Footer>
          </Modal>
          <Modal isOpen={true} onClose={onClose} testid="modal-7">
            <Modal.Header>Modal 7 Header</Modal.Header>
            <Modal.Body>Modal 7 Body</Modal.Body>
            <Modal.Footer>
              <button onClick={onClose}>Close Modal 7</button>
            </Modal.Footer>
          </Modal>
        </ModalManagerProvider>
      );
    });

    // Check both modals are rendered
    expect(screen.getByText("Modal 1 Header")).toBeInTheDocument();
    expect(screen.getByText("Modal 1 Body")).toBeInTheDocument();
    expect(screen.getByText("Close Modal 1")).toBeInTheDocument();
    expect(screen.getByText("Modal 2 Header")).toBeInTheDocument();
    expect(screen.getByText("Modal 2 Body")).toBeInTheDocument();
    expect(screen.getByText("Close Modal 2")).toBeInTheDocument();
    expect(screen.getByText("Modal 3 Header")).toBeInTheDocument();
    expect(screen.getByText("Modal 3 Body")).toBeInTheDocument();
    expect(screen.getByText("Close Modal 3")).toBeInTheDocument();
    expect(screen.getByText("Modal 4 Header")).toBeInTheDocument();
    expect(screen.getByText("Modal 4 Body")).toBeInTheDocument();
    expect(screen.getByText("Close Modal 4")).toBeInTheDocument();
    expect(screen.getByText("Modal 5 Header")).toBeInTheDocument();
    expect(screen.getByText("Modal 5 Body")).toBeInTheDocument();
    expect(screen.getByText("Close Modal 5")).toBeInTheDocument();
    expect(screen.getByText("Modal 6 Header")).toBeInTheDocument();
    expect(screen.getByText("Modal 6 Body")).toBeInTheDocument();
    expect(screen.getByText("Close Modal 6")).toBeInTheDocument();
    expect(screen.getByText("Modal 7 Header")).toBeInTheDocument();
    expect(screen.getByText("Modal 7 Body")).toBeInTheDocument();
    expect(screen.getByText("Close Modal 7")).toBeInTheDocument();
  });
});

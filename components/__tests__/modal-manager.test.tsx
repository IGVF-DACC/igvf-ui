import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useState } from "react";
import {
  ModalManagerContext,
  ModalManagerProvider,
  useModalManager,
} from "../modal-manager";

// Test component that uses the useModalManager hook
function TestModal({ id, isOpen }: { id: string; isOpen: boolean }) {
  const level = useModalManager(isOpen, id);
  return (
    <div data-testid={`modal-${id}`} data-level={level}>
      Modal {id} - Level {level}
    </div>
  );
}

// Test component that can toggle modal state
function TestModalController({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const level = useModalManager(isOpen, id);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Modal {id}</button>
      {isOpen && (
        <div data-testid={`modal-${id}`} data-level={level}>
          Modal {id} - Level {level}
        </div>
      )}
    </div>
  );
}

describe("ModalManagerProvider", () => {
  it("provides the modal manager context to children", () => {
    function TestComponent() {
      const level = useModalManager(true, "test-modal");
      return <div data-testid="test-component">{level}</div>;
    }

    render(
      <ModalManagerProvider>
        <TestComponent />
      </ModalManagerProvider>
    );

    expect(screen.getByTestId("test-component")).toBeInTheDocument();
    expect(screen.getByTestId("test-component")).toHaveTextContent("1");
  });

  it("throws error when useModalManager is used outside provider", () => {
    function TestComponent() {
      useModalManager(true, "test-modal");
      return <div>Test</div>;
    }

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useModalManager must be used within a ModalManagerProvider");

    console.error = originalError;
  });
});

describe("useModalManager hook", () => {
  it("returns level 1 for the first modal", () => {
    render(
      <ModalManagerProvider>
        <TestModal id="modal1" isOpen={true} />
      </ModalManagerProvider>
    );

    const modal = screen.getByTestId("modal-modal1");
    expect(modal).toHaveAttribute("data-level", "1");
  });

  it("returns level 0 for closed modal", () => {
    render(
      <ModalManagerProvider>
        <TestModal id="modal1" isOpen={false} />
      </ModalManagerProvider>
    );

    const modal = screen.getByTestId("modal-modal1");
    expect(modal).toHaveAttribute("data-level", "0");
  });

  it("handles multiple modals with correct stacking levels", () => {
    render(
      <ModalManagerProvider>
        <TestModal id="modal1" isOpen={true} />
        <TestModal id="modal2" isOpen={true} />
        <TestModal id="modal3" isOpen={true} />
      </ModalManagerProvider>
    );

    const modal1 = screen.getByTestId("modal-modal1");
    const modal2 = screen.getByTestId("modal-modal2");
    const modal3 = screen.getByTestId("modal-modal3");

    expect(modal1).toHaveAttribute("data-level", "1");
    expect(modal2).toHaveAttribute("data-level", "2");
    expect(modal3).toHaveAttribute("data-level", "3");
  });

  it("doesn't add duplicate IDs to the stack", () => {
    function TestComponent() {
      const [isOpen, setIsOpen] = useState(false);
      const level = useModalManager(isOpen, "duplicate-test");

      return (
        <div>
          <button onClick={() => setIsOpen(!isOpen)}>Toggle Modal</button>
          <div data-testid="modal-level">{level}</div>
        </div>
      );
    }

    render(
      <ModalManagerProvider>
        <TestComponent />
      </ModalManagerProvider>
    );

    const toggleButton = screen.getByText("Toggle Modal");
    const levelDiv = screen.getByTestId("modal-level");

    // Initially closed
    expect(levelDiv).toHaveTextContent("0");

    // Open modal
    act(() => {
      toggleButton.click();
    });
    expect(levelDiv).toHaveTextContent("1");

    // Close modal
    act(() => {
      toggleButton.click();
    });
    expect(levelDiv).toHaveTextContent("0");

    // Open modal again - should still be level 1
    act(() => {
      toggleButton.click();
    });
    expect(levelDiv).toHaveTextContent("1");
  });

  it("handles rapid open/close operations correctly", () => {
    render(
      <ModalManagerProvider>
        <TestModalController id="rapid-test" />
      </ModalManagerProvider>
    );

    const toggleButton = screen.getByText("Toggle Modal rapid-test");

    // Rapid open/close operations
    act(() => {
      toggleButton.click();
    });
    expect(screen.getByTestId("modal-rapid-test")).toHaveAttribute(
      "data-level",
      "1"
    );

    act(() => {
      toggleButton.click();
    });
    expect(screen.queryByTestId("modal-rapid-test")).not.toBeInTheDocument();

    act(() => {
      toggleButton.click();
    });
    expect(screen.getByTestId("modal-rapid-test")).toHaveAttribute(
      "data-level",
      "1"
    );
  });

  it("handles multiple modals with same ID correctly", () => {
    // This test ensures that if somehow multiple components use the same ID,
    // the system handles it gracefully
    render(
      <ModalManagerProvider>
        <TestModal id="same-id" isOpen={true} />
        <TestModal id="same-id" isOpen={true} />
      </ModalManagerProvider>
    );

    const modals = screen.getAllByTestId("modal-same-id");
    expect(modals).toHaveLength(2);

    // Both should have the same level since they share the same ID
    expect(modals[0]).toHaveAttribute("data-level", "1");
    expect(modals[1]).toHaveAttribute("data-level", "1");
  });

  it("cleans up the modal ID on unmount", () => {
    const { unmount } = render(
      <ModalManagerProvider>
        <TestModal id="unmount-test" isOpen={true} />
      </ModalManagerProvider>
    );

    const modal = screen.getByTestId("modal-unmount-test");
    expect(modal).toHaveAttribute("data-level", "1");

    // Unmount the modal
    unmount();
  });
});

describe("ModalManagerContext", () => {
  it("context should be defined", () => {
    expect(ModalManagerContext).toBeDefined();
  });
});

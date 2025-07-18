/**
 * This context manages the state of open modals in the application, allowing modals to open and
 * close other modals on top of themselves. This allows for any arbitrary number of modals to be
 * open at the same time, with the most recently opened modal on top. The user can then close each
 * modal individually.
 *
 * This means you must supply a `testid` property to `<Modal>` if you expect to have multiple modals
 * open at the same time, so that the modal manager can track which modal is currently open.
 */

// node_modules
import { createContext, useContext, useEffect, useRef } from "react";

/**
 * The Modal Manager context tracks a stack of the IDs of currently open modals.
 * @property stackRef - A ref to the stack of open modal IDs
 */
export type ModalManagerContextType = {
  stackRef: React.MutableRefObject<string[]>;
};

/**
 * Modal Manager context for managing open modals.
 */
export const ModalManagerContext =
  createContext<ModalManagerContextType | null>(null);

/**
 * Provider component for the ModalManagerContext. It holds the *global* state of currently open modals
 * This adds a wrapper in the <App /> component to manage the modal state.
 */
export function ModalManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const stackRef = useRef<string[]>([]);

  return (
    <ModalManagerContext.Provider value={{ stackRef }}>
      {children}
    </ModalManagerContext.Provider>
  );
}

/**
 * Custom hook to open a modal, and to know to close a modal either from user action or because
 * another modal has opened.
 * @param isOpen - True if the modal is open
 * @param id - Unique identifier for the modal
 */
export function useModalManager(isOpen: boolean, id: string): number {
  // Global stack of open modal IDs; shared by all open modals.
  const context = useContext(ModalManagerContext);
  if (!context) {
    throw new Error(
      "useModalManager must be used within a ModalManagerProvider"
    );
  }
  const { stackRef } = context;

  // Add the modal's ID to the stack when transitioning to open, if it isn't already in the stack.
  if (isOpen && !stackRef.current.includes(id)) {
    stackRef.current.push(id);
  }

  // Remove the modal's ID from the stack when transitioning to closed.
  useEffect(() => {
    if (!isOpen) {
      stackRef.current = stackRef.current.filter((x) => x !== id);
    }

    // Remove the modal's ID from the stack when unmounting the modal.
    return () => {
      stackRef.current = stackRef.current.filter((x) => x !== id);
    };
  }, [isOpen, id]);

  // Return the index of the modal's ID in the stack, or 0 if not in the stack. This value
  // determines the z-index of the modal in the `<Modal>` component. The first modal has index 1,
  // the second has index 2, etc.
  const index = stackRef.current.indexOf(id);
  return index === -1 ? 0 : index + 1;
}

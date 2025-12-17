/**
 * Import the <Modal> component to have modal dialogs appear. The general method looks like this:
 *
 * <Modal isOpen={isOpenState} onClose={() => { setOpenState(false) }}>
 *  <Modal.Header>
 *   <h2>My Modal</h2>
 *  </Modal.Header>
 *  <Modal.Body>
 *   <p>This is the body of my modal.</p>
 *  </Modal.Body>
 *  <Modal.Footer>
 *   <button>Close</button>
 *  </Modal.Footer>
 * </Modal>
 *
 * You can skip any of the child <Modal> components. Each can accept either primitives or JSX as
 * child elements. The Modal component itself handles closing the modal when the user clicks the
 * backdrop or types the ESC key.
 */

// node_modules
import { Dialog } from "@headlessui/react";
import { Children } from "react";
import { twMerge } from "tailwind-merge";
// components
import CloseButton from "./close-button";
import { useModalManager } from "./modal-manager";

/**
 * Maps the modal level to Tailwind CSS z-index classes. This ensures that modals stack
 * correctly based on how many are open at the same time. The first item is an empty string
 * because modal levels start at 1; level 0 means we have no visible modal open.
 */
const modalLevelClasses = [
  "",
  "z-50 [&>div:first-child]:bg-modal-backdrop",
  "z-60",
  "z-70",
  "z-80",
  "z-90",
] as const;

/**
 * Maps the modal level to Tailwind CSS width classes. This allows you to control the width
 * of the modal based on how many are open at the same time.
 */
const modalLevelWidthClasses = [
  "w-4/5",
  "w-7/10",
  "w-3/5",
  "w-1/2",
  "w-2/5",
  "w-3/10",
] as const;

/**
 * Main component for modal dialogs.
 * @param isOpen - True if the modal is open
 * @param onClose - Function to call when the modal should be closed
 * @param widthClasses - Tailwind CSS classes to set the width of the modal
 * @param testid - Data-testid attribute for testing purposes
 */
export default function Modal({
  isOpen,
  onClose,
  widthClasses = "",
  testid = "",
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  widthClasses?: string;
  testid?: string;
  children: React.ReactNode;
}) {
  // Use the modal manager to get the current stacked modal level.
  const modalLevel = useModalManager(isOpen, testid);
  const modalLevelClass = modalLevelClasses[modalLevel] || "z-50";
  const modalLevelWidthClass =
    widthClasses || modalLevelWidthClasses[modalLevel] || "w-4/5";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={`relative ${modalLevelClass} text-black dark:text-white`}
      data-testid={testid}
    >
      <div className="fixed inset-0" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <Dialog.Panel
          className={`border-modal-border mx-auto my-5 max-w-360 overflow-hidden rounded-xl border bg-white drop-shadow-lg/50 xl:my-20 dark:bg-gray-900 ${modalLevelWidthClass}`}
        >
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

/**
 * Displays the header, typically containing a title and an optional close button on the right side
 * if provided. If you supply a string or number as the only child of <Modal.Header>, it gets
 * wrapped in an <h2> tag. If you instead supply JSX elements or React components, they get
 * rendered as is, though within a flex container so that the optional close box still gets
 * rendered.
 * @param onClose - Function to call when the close button is clicked
 * @param closeLabel - Accessible label for the close button
 * @param className - Tailwind CSS classes to apply to the header
 */
function Header({
  onClose = null,
  closeLabel = "Close dialog",
  className = "",
  children,
}: {
  onClose?: (() => void) | null;
  closeLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  // If the children is a single string or number, wrap it in an <h2>. Otherwise the children
  // comprise one or more JSX elements, in which case we just render them within the header <div>
  // as is.
  let headerChildren = children;
  if (Children.count(children) === 1) {
    const childrenArray = Children.toArray(children);
    const firstChildType = typeof childrenArray[0];
    if (firstChildType === "string") {
      // `children` comprises a single string or number, so wrap it in an <h2>.
      headerChildren = <h2 className="text-lg font-semibold">{children}</h2>;
    }
  }

  return (
    <div
      className={`border-modal-border flex items-center justify-between border-b p-2 ${className}`}
    >
      {headerChildren}
      {onClose ? <CloseButton label={closeLabel} onClick={onClose} /> : null}
    </div>
  );
}

/**
 * Wraps the contents of a modal to provide a standard padding. You can skip using this if you
 * don't want padding, or non-standard padding.
 */
function Body({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={twMerge("p-2", className)}>{children}</div>;
}

/**
 * Footer for the modal. This is typically used to provide an action button, or a close button.
 */
function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-modal-border flex justify-end gap-1 border-t bg-gray-50 p-1.5 dark:bg-gray-800">
      {children}
    </div>
  );
}

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

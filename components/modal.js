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
import PropTypes from "prop-types";
import { Children } from "react";
// components
import CloseButton from "./close-button";

/**
 * Main component for modal dialogs.
 */
export default function Modal({
  isOpen,
  onClose,
  widthClasses = "w-4/5",
  testid = null,
  children,
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50 text-black dark:text-white"
      data-testid={testid}
    >
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60"
        aria-hidden="true"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <Dialog.Panel
          className={`border-modal-border mx-auto my-5 max-w-4xl overflow-hidden rounded-xl border bg-white drop-shadow-lg xl:my-20 dark:bg-gray-900 ${widthClasses}`}
        >
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

Modal.propTypes = {
  // True if the modal is open
  isOpen: PropTypes.bool.isRequired,
  // Called to close the modal on click outside or ESC
  onClose: PropTypes.func.isRequired,
  // Tailwind CSS classes to set the width of the modal
  widthClasses: PropTypes.string,
  // Data-testid attribute for testing
  testid: PropTypes.string,
};

/**
 * Displays the header, typically containing a title and an optional close button on the right side
 * if provided. If you supply a string or number as the only child of <Modal.Header>, it gets
 * wrapped in an <h2> tag. If you instead supply JSX elements or React components, they get
 * rendered as is, though within a flex container so that the optional close box still gets
 * rendered.
 */
function Header({
  onClose = null,
  closeLabel = "Close dialog",
  className = "",
  children,
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

Header.propTypes = {
  // Called to close the modal when clicking the close button
  onClose: PropTypes.func,
  // Accessible label for the header close button
  closeLabel: PropTypes.string,
  // Tailwind CSS classes to add to the header
  className: PropTypes.string,
};

/**
 * Wraps the contents of a modal to provide a standard padding. You can skip using this if you
 * don't want padding, or non-standard padding.
 */
function Body({ className = "", children }) {
  return (
    <div className={className}>
      <div className="p-2">{children}</div>
    </div>
  );
}

Body.propTypes = {
  // Tailwind CSS classes to add to the body wrapper div
  className: PropTypes.string,
};

/**
 * Footer for the modal. This is typically used to provide an action button, or a close button.
 */
function Footer({ children }) {
  return (
    <div className="border-modal-border flex justify-end gap-1 border-t bg-gray-50 p-1.5 dark:bg-gray-800">
      {children}
    </div>
  );
}

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

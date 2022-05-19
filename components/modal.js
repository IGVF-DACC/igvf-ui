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
import { Dialog } from "@headlessui/react"
import { XIcon } from "@heroicons/react/solid"
import PropTypes from "prop-types"
import { Children } from "react"

/**
 * Main component for modal dialogs.
 */
const Modal = ({ isOpen, onClose, children }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 dark:text-white"
    >
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        aria-hidden="true"
      />
      <Dialog.Panel className="mx-auto my-5 w-4/5 max-w-4xl overflow-hidden rounded-xl border border-modal-border bg-white drop-shadow-lg dark:bg-gray-900 xl:my-20">
        {children}
      </Dialog.Panel>
    </Dialog>
  )
}

Modal.propTypes = {
  // True if the modal is open
  isOpen: PropTypes.bool.isRequired,
  // Called to close the modal on click outside or ESC
  onClose: PropTypes.func.isRequired,
}

/**
 * Displays the close button in the header.
 */
const HeaderCloseButton = ({ onClose, label }) => {
  return (
    <button
      type="button"
      className="h-6 w-6 rounded-full bg-gray-100 p-1 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
      onClick={onClose}
      aria-label={label}
    >
      <XIcon className="fill-gray-500" />
    </button>
  )
}

HeaderCloseButton.propTypes = {
  // Called to close the modal on click
  onClose: PropTypes.func.isRequired,
  // Accessible label for the close button
  label: PropTypes.string.isRequired,
}

/**
 * Displays the header, typically containing a title and an optional close button on the right side
 * if provided. If you supply a string or number as the only child of <Modal.Header>, it gets
 * wrapped in an <h2> tag. If you instead supply JSX elements or React components, they get
 * rendered as is, though within a flex container so that the optional close box still gets
 * rendered.
 */
const Header = ({
  onClose = null,
  closeLabel = "",
  className = "",
  children,
}) => {
  // If the children is a single string or number, wrap it in an <h2>. Otherwise the children
  // comprise one or more JSX elements, in which case we just render them within the header <div>
  // as is.
  let headerChildren = children
  if (Children.count(children) === 1) {
    const childrenArray = Children.toArray(children)
    const firstChildType = typeof childrenArray[0]
    if (firstChildType === "string" || firstChildType === "number") {
      // `children` comprises a single string or number, so wrap it in an <h2>.
      headerChildren = <h2 className="text-lg font-semibold">{children}</h2>
    }
  }

  return (
    <div
      className={`flex items-center justify-between border-b border-modal-border p-2 ${className}`}
    >
      {headerChildren}
      {onClose ? (
        <HeaderCloseButton label={closeLabel} onClose={onClose} />
      ) : null}
    </div>
  )
}

Header.propTypes = {
  // Called to close the modal when clicking the close button
  onClose: PropTypes.func,
  // Accessible label for the header close button
  closeLabel: PropTypes.string,
  // Tailwind CSS classes to add to the header
  className: PropTypes.string,
}

/**
 * Wraps the contents of a modal to provide a standard padding. You can skip using this if you
 * don't want padding, or non-standard padding.
 */
const Body = ({ children }) => {
  return <div className="p-2">{children}</div>
}

/**
 * Footer for the modal. This is typically used to provide an action button, or a close button.
 */
const Footer = ({ children }) => {
  return (
    <div className="flex justify-end gap-1 border-t border-modal-border bg-gray-50 p-1.5 dark:bg-gray-800">
      {children}
    </div>
  )
}

Modal.Header = Header
Modal.Body = Body
Modal.Footer = Footer
export default Modal

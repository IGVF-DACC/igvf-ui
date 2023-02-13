// node_modules
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import { Button } from "./form-elements";
import Modal from "./modal";

/**
 * Display pop-up instructions triggered by a help button.
 */
export default function Instruction({ title, className = null, children }) {
  // True if the instruction modal is open
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        size="md"
        label={title}
        onClick={() => setIsOpen(true)}
        hasIconOnly
      >
        <QuestionMarkCircleIcon />
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header
          closeLabel="Close instructions"
          onClose={() => setIsOpen(false)}
        >
          {title}
        </Modal.Header>
        <Modal.Body>
          <div className={className}>{children}</div>
        </Modal.Body>
      </Modal>
    </>
  );
}

Instruction.propTypes = {
  // Title for the instruction modal
  title: PropTypes.string.isRequired,
  // Tailwind CSS classes to style the instructions
  className: PropTypes.string,
};

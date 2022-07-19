// node_modules
import { QuestionMarkCircleIcon } from "@heroicons/react/solid";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import Button from "./button";
import Modal from "./modal";

/**
 * Display pop-up instructions triggered by a help button.
 */
const Instruction = ({ title, className = null, children }) => {
  // True if the instruction modal is open
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button.Icon
        type="info-outline"
        label={title}
        onClick={() => setIsOpen(true)}
      >
        <QuestionMarkCircleIcon />
      </Button.Icon>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Header onClose={() => setIsOpen(false)}>{title}</Modal.Header>
        <Modal.Body>
          <div className={className}>{children}</div>
        </Modal.Body>
      </Modal>
    </>
  );
};

Instruction.propTypes = {
  // Title for the instruction modal
  title: PropTypes.string.isRequired,
  // Tailwind CSS classes to style the instructions
  className: PropTypes.string,
};

export default Instruction;

// node_modules
import { Popover } from "@headlessui/react";
import { useState } from "react";
import { usePopper } from "react-popper";
import PropTypes from "prop-types";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";

/**
 * When the children element is clicked a panel comes up on
 * top of the page with the given text content.
 */
export default function Tooltip({ content, children }) {
  const [referenceElement, setReferenceElement] = useState();
  const [popperElement, setPopperElement] = useState();
  const { styles, attributes } = usePopper(referenceElement, popperElement);

  return (
    <Popover className="relative">
      <Popover.Button
        as="div"
        ref={setReferenceElement}
        className="cursor-pointer"
      >
        {children ? children : <QuestionMarkCircleIcon className="h-4 w-4" />}
      </Popover.Button>
      <Popover.Overlay className="fixed inset-0 bg-black opacity-30" />
      <Popover.Panel
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
        className="bg-panel z-10 absolute left-1/2 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden border border-button-secondary prose dark:prose-invert"
      >
        <div className="text-left pl-3 pt-2 pb-2 pr-3 text-sm leading-4">
          {content}
        </div>
      </Popover.Panel>
    </Popover>
  );
}

Tooltip.propTypes = {
  content: PropTypes.string,
};

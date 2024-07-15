// node_modules
import PropTypes from "prop-types";
import { useContext, useRef, useState } from "react";
// components
import { Button } from "../form-elements";
import Checkbox from "../checkbox";
import Modal from "../modal";
import SessionContext from "../session-context";
import VerticalScrollIndicators from "../vertical-scroll-indicators";
// components/report
import HiddenColumnsIndicator from "./hidden-columns-indicator";
// lib
import { MAXIMUM_VISIBLE_COLUMNS } from "../../lib/report";

/**
 * Displays the buttons to hide or show all columns at once.
 */
function ChangeAllControls({ onChangeAll }) {
  const className = "flex-grow md:flex-grow-0";
  return (
    <div className="flex gap-1">
      <Button className={className} onClick={() => onChangeAll(true)}>
        Show All
      </Button>
      <Button className={className} onClick={() => onChangeAll(false)}>
        Hide All
      </Button>
    </div>
  );
}

ChangeAllControls.propTypes = {
  // Called when the user wants to hide or show all columns at once
  onChangeAll: PropTypes.func.isRequired,
};

/**
 * Wrapper for the group of checkboxes for the user to select which columns to display and which
 * to hide.
 */
function CheckboxArea({ className = "", children }) {
  const scrollAreaRef = useRef(null);

  return (
    <div className="relative">
      <div
        ref={scrollAreaRef}
        className="scroll-area max-h-column-select-modal min-h-36 overflow-y-auto p-2"
      >
        <VerticalScrollIndicators scrollAreaRef={scrollAreaRef} />
        <fieldset
          className={`md:flex md:flex-wrap ${className}`}
          data-testid="column-checkboxes"
        >
          {children}
        </fieldset>
      </div>
    </div>
  );
}

CheckboxArea.propTypes = {
  // Tailwind CSS classes to add to the checkbox area wrapper
  className: PropTypes.string,
};

/**
 * Wrapper for advisory notes within the column-selection modal.
 */
function Note({ className = "", children }) {
  return (
    <div
      className={`text-center text-sm text-gray-500 dark:text-gray-300 md:flex-grow md:text-left ${className}`}
    >
      {children}
    </div>
  );
}

Note.propTypes = {
  // Tailwind CSS classes to add to the note wrapper
  className: PropTypes.string,
};

/**
 * Display the actuator button to display the modal for the user to select which columns to
 * display and which to hide. This also displays that modal.
 */
export default function ColumnSelector({
  allColumnSpecs,
  visibleColumnSpecs,
  onChange,
  onChangeAll,
  isNonVisibleDisabled,
}) {
  // True if the column-selection modal is open.
  const [isOpen, setIsOpen] = useState(false);
  const { profiles } = useContext(SessionContext);

  if (profiles) {
    // Determine whether any column is hidden given the current report URL. Use this to determine
    // whether to display the "hidden columns" indicator.
    const visibleColumnIds = visibleColumnSpecs.map(
      (columnSpec) => columnSpec.id
    );
    const isAnyColumnHidden = allColumnSpecs.length > visibleColumnSpecs.length;

    // Disable column selector if the config didn't match any type.
    const isColumnSelectorDisabled = allColumnSpecs.length === 0;

    return (
      <>
        <Button
          onClick={() => setIsOpen(true)}
          isDisabled={isColumnSelectorDisabled}
        >
          Columns
          <HiddenColumnsIndicator isAnyColumnHidden={isAnyColumnHidden} />
        </Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Modal.Header onClose={() => setIsOpen(false)}>
            <div className="flex items-center">
              Show / Hide Columns
              <HiddenColumnsIndicator isAnyColumnHidden={isAnyColumnHidden} />
            </div>
          </Modal.Header>

          <Modal.Body className="[&>div]:p-0">
            <div className="border-b border-modal-border p-1 md:flex md:items-center">
              <ChangeAllControls onChangeAll={onChangeAll} />
              <Note className="md:ml-2">
                The <i>ID</i> column cannot be hidden
              </Note>
            </div>
            <CheckboxArea>
              {allColumnSpecs.map((columnSpec) => {
                const isVisible = visibleColumnIds.includes(columnSpec.id);
                const isColumnCheckboxDisabled =
                  !isVisible && isNonVisibleDisabled;
                return (
                  <Checkbox
                    key={columnSpec.id}
                    id={columnSpec.id}
                    name={columnSpec.id}
                    checked={isVisible}
                    isDisabled={
                      isColumnCheckboxDisabled || columnSpec.id === "@id"
                    }
                    onClick={() => onChange(columnSpec.id, isVisible)}
                    className="my-0.5 block items-center leading-tight md:basis-1/2 lg:basis-1/3"
                  >
                    <div
                      className={`${
                        isColumnCheckboxDisabled ? "text-gray-500" : ""
                      }`}
                    >
                      {columnSpec.title || columnSpec.id}
                    </div>
                  </Checkbox>
                );
              })}
            </CheckboxArea>
          </Modal.Body>

          <Modal.Footer>
            <div className="flex w-full items-center justify-between">
              <div className="text-sm" data-testid="visible-column-count">
                {visibleColumnIds.length}{" "}
                {visibleColumnIds.length === 1 ? "column" : "columns"} shown
                {allColumnSpecs.length > MAXIMUM_VISIBLE_COLUMNS &&
                  ` of ${MAXIMUM_VISIBLE_COLUMNS} maximum`}
              </div>
              <Button type="secondary" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  // profiles hasn't yet loaded or (extremely unlikely) the report doesn't have a type= filter.
  return null;
}

ColumnSelector.propTypes = {
  // All column specs for the current report page
  allColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Visible column specs for the current report page
  visibleColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Called when the user changes individual columns to show or hide
  onChange: PropTypes.func.isRequired,
  // Called when the user wants to show or hide all columns at once
  onChangeAll: PropTypes.func.isRequired,
  // True to disable non-visible columns because of the maximum number of visible columns
  isNonVisibleDisabled: PropTypes.bool.isRequired,
};

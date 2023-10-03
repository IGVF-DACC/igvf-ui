// node_modules
import PropTypes from "prop-types";
import { useContext, useState } from "react";
// components
import { Button } from "../form-elements";
import Checkbox from "../checkbox";
import Modal from "../modal";
import SessionContext from "../session-context";
// components/report
import HiddenColumnsIndicator from "./hidden-columns-indicator";

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
  return (
    <fieldset className={`md:flex md:flex-wrap ${className}`}>
      {children}
    </fieldset>
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
    const isDisabled = allColumnSpecs.length === 0;

    return (
      <>
        <Button onClick={() => setIsOpen(true)} isDisabled={isDisabled}>
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

          <Modal.Body>
            <div className="mb-3 md:flex md:items-center">
              <ChangeAllControls onChangeAll={onChangeAll} />
              <Note className="md:ml-2">
                The <i>ID</i> column cannot be hidden
              </Note>
            </div>
            <CheckboxArea>
              {allColumnSpecs.map((columnSpec) => {
                if (columnSpec.id !== "@id") {
                  const isVisible = visibleColumnIds.includes(columnSpec.id);
                  return (
                    <Checkbox
                      key={columnSpec.id}
                      id={columnSpec.id}
                      name={columnSpec.id}
                      checked={isVisible}
                      onClick={() => onChange(columnSpec.id, isVisible)}
                      className="my-0.5 block items-center leading-tight md:basis-1/2 lg:basis-1/3"
                    >
                      {columnSpec.title || columnSpec.id}
                    </Checkbox>
                  );
                }

                // Don't include @id property; @id is always visible.
                return null;
              })}
            </CheckboxArea>
          </Modal.Body>

          <Modal.Footer>
            <Button type="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
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
};

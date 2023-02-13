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
// lib
import {
  getReportTypeColumnSpecs,
  getReportType,
  getVisibleReportColumnSpecs,
} from "../../lib/report";

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
 * Display the actuator button to display the modal for the user to select which columns to
 * display and which to hide. This also displays that modal.
 */
export default function ColumnSelector({
  searchResults,
  onChange,
  onChangeAll,
}) {
  // True if the column-selection modal is open.
  const [isOpen, setIsOpen] = useState(false);
  const { profiles } = useContext(SessionContext);

  const reportType = getReportType(searchResults);
  if (profiles && reportType) {
    // Determine whether any column is hidden given the current report URL. Use this to determine
    // whether to display the "hidden columns" indicator.
    const columnSpecs = getReportTypeColumnSpecs(reportType, profiles);
    const visibleColumnSpecs = getVisibleReportColumnSpecs(
      searchResults,
      profiles
    );
    const visibleColumnIds = visibleColumnSpecs.map(
      (columnSpec) => columnSpec.id
    );
    const isAnyColumnHidden = columnSpecs.length > visibleColumnSpecs.length;

    return (
      <>
        <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
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
              <div className="text-center text-sm text-gray-700 dark:text-gray-300 md:ml-2 md:flex-grow md:text-left">
                The <i>ID</i> column cannot be hidden
              </div>
            </div>
            <fieldset>
              <div className="md:flex md:flex-wrap">
                {columnSpecs.map((columnSpec) => {
                  if (columnSpec.id !== "@id") {
                    const isVisible = visibleColumnIds.includes(columnSpec.id);
                    return (
                      <Checkbox
                        key={columnSpec.id}
                        name={columnSpec.id}
                        checked={isVisible}
                        onChange={() => onChange(columnSpec.id, isVisible)}
                        className="block md:basis-1/2 lg:basis-1/3"
                      >
                        {columnSpec.title}
                      </Checkbox>
                    );
                  }

                  // Don't include @id property; @id is always visible.
                  return null;
                })}
              </div>
            </fieldset>
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
  // Search results for the current report page. Includes a single "type=" guaranteed
  searchResults: PropTypes.object.isRequired,
  // Called when the user changes individual columns to show or hide
  onChange: PropTypes.func.isRequired,
  // Called when the user wants to show or hide all columns at once
  onChangeAll: PropTypes.func.isRequired,
};

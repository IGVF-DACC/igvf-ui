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
import {
  auditProperties,
  MAXIMUM_VISIBLE_COLUMNS,
  visibleAuditColumnSpecsToSelectorColumnSpecs,
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
 * Wrapper for the group of checkboxes for the user to select which columns to display and which
 * to hide.
 */
function CheckboxArea({ className = "", children }) {
  const scrollAreaRef = useRef(null);

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={scrollAreaRef}
          className="max-h-column-select-modal min-h-36 overflow-y-auto"
        >
          <VerticalScrollIndicators scrollAreaRef={scrollAreaRef} />
          {children}
        </div>
      </div>
    </div>
  );
}

CheckboxArea.propTypes = {
  // Tailwind CSS classes to add to the checkbox area wrapper
  className: PropTypes.string,
};

/**
 * Wrap each section of checkboxes within the checkbox area.
 */
function CheckboxSection({ className = "", children }) {
  return (
    <div className={className}>
      <fieldset
        className="p-2 md:flex md:flex-wrap"
        data-testid="column-checkboxes"
      >
        {children}
      </fieldset>
    </div>
  );
}

CheckboxSection.propTypes = {
  // Tailwind CSS classes to add to the checkbox section wrapper
  className: PropTypes.string,
};

/**
 * Display the checkboxes for one checkbox section, i.e. the regular columns or the audit columns.
 */
function ColumnCheckboxes({
  columnSpecs,
  visibleColumnIds,
  totalVisibleColumnCount,
  columnsPerColumnSpec = 1,
  onChange,
}) {
  return (
    <>
      {columnSpecs.map((columnSpec) => {
        const isVisible = visibleColumnIds.includes(columnSpec.id);
        const isColumnCheckboxDisabled =
          !isVisible &&
          totalVisibleColumnCount + columnsPerColumnSpec >
            MAXIMUM_VISIBLE_COLUMNS;
        return (
          <Checkbox
            key={columnSpec.id}
            id={columnSpec.id}
            name={columnSpec.id}
            checked={isVisible}
            isDisabled={isColumnCheckboxDisabled || columnSpec.id === "@id"}
            onClick={() => onChange(columnSpec.id, isVisible)}
            className="my-0.5 block items-center leading-tight md:basis-1/2 lg:basis-1/3"
          >
            <div
              className={`${isColumnCheckboxDisabled ? "text-gray-500" : ""}`}
            >
              {columnSpec.title || columnSpec.id}
            </div>
          </Checkbox>
        );
      })}
    </>
  );
}

ColumnCheckboxes.propTypes = {
  // Column specs for the current section
  columnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // IDs of the currently visible columns
  visibleColumnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Total number of visible columns across all sections
  totalVisibleColumnCount: PropTypes.number.isRequired,
  // Number of columns per column spec; normally 1, but not for audit columns
  columnsPerColumnSpec: PropTypes.number,
  // Called when the user changes individual columns to show or hide
  onChange: PropTypes.func.isRequired,
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
  auditColumnSpecs,
  visibleColumnSpecs,
  visibleAuditColumnSpecs,
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

    // `auditColumnSpecs` are "real" in that they specify real audit properties and generate real
    // columns in the report view, e.g. `audit.ERROR.path`, `audit.WARNING.category`. The column
    // selector modal combines audit properties for a level (e.g. ERROR, NOT_COMPLIANT) into one
    // checkbox, so convert these to audit-selector column specs, like `audit.ERROR`, like we have
    // in `auditColumnSpecs`.
    const auditSelectorColumnSpecs =
      visibleAuditColumnSpecsToSelectorColumnSpecs(
        visibleAuditColumnSpecs,
        auditColumnSpecs
      );
    const auditSelectorColumnIds = auditSelectorColumnSpecs.map(
      (columnSpec) => columnSpec.id
    );

    // Disable column selector if the config didn't match any type.
    const isColumnSelectorDisabled = allColumnSpecs.length === 0;

    // Count the number of selected columns, both regular and audit.
    const totalVisibleColumnCount =
      visibleColumnSpecs.length + visibleAuditColumnSpecs.length;

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
              <CheckboxSection className="border-b border-modal-border">
                <ColumnCheckboxes
                  columnSpecs={allColumnSpecs}
                  visibleColumnIds={visibleColumnIds}
                  totalVisibleColumnCount={totalVisibleColumnCount}
                  onChange={onChange}
                />
              </CheckboxSection>
              <h2 className="px-2 pb-0 pt-1 font-bold">Audit Columns</h2>
              <CheckboxSection className="[&>fieldset]:pt-0">
                <ColumnCheckboxes
                  columnSpecs={auditColumnSpecs}
                  visibleColumnIds={auditSelectorColumnIds}
                  totalVisibleColumnCount={totalVisibleColumnCount}
                  columnsPerColumnSpec={auditProperties.length}
                  onChange={onChange}
                />
              </CheckboxSection>
            </CheckboxArea>
          </Modal.Body>

          <Modal.Footer>
            <div className="flex w-full items-center justify-between">
              <div className="text-sm" data-testid="visible-column-count">
                {totalVisibleColumnCount}{" "}
                {totalVisibleColumnCount === 1 ? "column" : "columns"} shown
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
  // All regular column specs for the current report page
  allColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Audit column specs for the current report page
  auditColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Visible normal column specs for the current report page
  visibleColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Visible audit column specs for the current report page
  visibleAuditColumnSpecs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Called when the user changes individual columns to show or hide
  onChange: PropTypes.func.isRequired,
  // Called when the user wants to show or hide all columns at once
  onChangeAll: PropTypes.func.isRequired,
};

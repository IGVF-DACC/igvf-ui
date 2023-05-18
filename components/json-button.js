/**
 * Button JsonViewLink and ObjectViewLink are used for switching views between object view and json format view.
 * The JsonViewLink is displayed in ObjectPageHeader when there is no format in query for object view. Click
 * JsonViewLink will switch to Json format view. The ObjectViewLink is displayed in ObjectPageHeader when the
 * query is in JSON format for JSON format view. Click ObjectViewLink will switch to object view.
 */

// node_modules
import {
  CodeBracketIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { ButtonLink } from "./form-elements";
// lib
import { removeTrailingSlash } from "../lib/general";

/**
 * This function display a button that will navigate to raw JSON view for a given object when click
 * @param {*} item the object to display
 * @returns the ButtonLink that will navigate to the raw JSON view for a given object
 */
export function JsonViewLink({ item }) {
  const jsonPath = `${removeTrailingSlash(item["@id"])}?format=json`;
  return (
    <div className="mb-1 flex justify-end">
      <ButtonLink
        label="Json view"
        href={jsonPath}
        type="secondary"
        size="sm"
        hasIconOnly
      >
        <CodeBracketIcon title="Json view" />
      </ButtonLink>
    </div>
  );
}

JsonViewLink.propTypes = {
  item: PropTypes.object.isRequired,
};

/**
 * This function display a button that will navigate to the object view for a given object when click
 * @param {*} item the object to display
 * @returns the ButtonLink that will navigate to the object view for a given object
 */
export function ObjectViewLink({ item }) {
  const objectPath = removeTrailingSlash(item["@id"]);
  return (
    <div className="mb-1 flex justify-end">
      <ButtonLink
        label="Object view"
        href={objectPath}
        type="secondary"
        size="sm"
        hasIconOnly
      >
        <DocumentMagnifyingGlassIcon title="Object view" />
      </ButtonLink>
    </div>
  );
}

ObjectViewLink.propTypes = {
  item: PropTypes.object.isRequired,
};

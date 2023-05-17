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

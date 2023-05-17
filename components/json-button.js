// node_modules
import { CodeBracketIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { ButtonLink } from "./form-elements";
// lib
import { removeTrailingSlash } from "../lib/general";

export function JsonLink({ item }) {
  const editPath = `${removeTrailingSlash(item["@id"])}?format=json`;

  return (
    <div className="mb-1 flex justify-end">
      <ButtonLink
        label="Json"
        href={editPath}
        type="secondary"
        size="sm"
        hasIconOnly
      >
        <CodeBracketIcon title="Json" />
      </ButtonLink>
    </div>
  );
}

JsonLink.propTypes = {
  item: PropTypes.object.isRequired,
};

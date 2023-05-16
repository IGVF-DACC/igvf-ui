// node_modules
import { CodeBracketIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { ButtonLink } from "./form-elements";

export function JsonLink({ item }) {
  function removeTrailingSlash(url) {
    return url.endsWith("/") ? url.slice(0, url.length - 1) : url;
  }
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

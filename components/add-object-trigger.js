/**
 * Displays a button to add an object to a collection. We might remove this depending on IGVF-261.
 */

// node_modules
import PropTypes from "prop-types";
// components
import { useAuthenticated } from "./authentication";
import { ButtonLink } from "./form-elements";

export default function AddObjectTrigger({ addSpec = null }) {
  const isAuthenticated = useAuthenticated();
  if (addSpec) {
    return (
      <>
        {isAuthenticated && (
          <div className="mb-1 flex justify-end">
            <ButtonLink
              href={`${addSpec.path}#!edit`}
              type="primary"
              className="self-stretch"
            >
              {`Add ${addSpec.label}`}
            </ButtonLink>
          </div>
        )}
      </>
    );
  }
  return null;
}

AddObjectTrigger.propTypes = {
  addSpec: PropTypes.exact({
    // Object type to append to the Add button label
    label: PropTypes.string.isRequired,
    // Path to add the object; #!edit gets appended here
    path: PropTypes.string.isRequired,
  }),
};

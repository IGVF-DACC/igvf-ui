/**
 * Displays a button to add an object to a collection. We might remove this depending on IGVF-261.
 */

// node_modules
import PropTypes from "prop-types";
// components
import { useAuthenticated } from "./authentication";
import Button from "./button";

const AddObjectTrigger = ({ addSpec = null }) => {
  const isAuthenticated = useAuthenticated();
  if (addSpec) {
    return (
      <>
        {isAuthenticated && (
          <Button.Link
            href={`${addSpec.path}#!edit`}
            type="success-outline"
            size="sm"
            className="ml-auto"
          >
            {`Add ${addSpec.label}`}
          </Button.Link>
        )}
      </>
    );
  }
  return null;
};

AddObjectTrigger.propTypes = {
  addSpec: PropTypes.exact({
    // Object type to append to the Add button label
    label: PropTypes.string.isRequired,
    // Path to add the object; #!edit gets appended here
    path: PropTypes.string.isRequired,
  }),
};

export default AddObjectTrigger;

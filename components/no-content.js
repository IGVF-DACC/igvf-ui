// node_modules
import PropTypes from "prop-types";
// components
import { DataPanel } from "./data-area";

export default function NoContent({ message }) {
  return (
    <DataPanel>
      <div className="text-center italic">{message}</div>
    </DataPanel>
  );
}

NoContent.propTypes = {
  // Message to display when we have no content
  message: PropTypes.string.isRequired,
};

// node_modules
import PropTypes from "prop-types";
// components
import Icon from "../icon";

/**
 * Display an icon showing whether any columns are hidden or not.
 */
const HiddenColumnsIndicator = ({ isAnyColumnHidden }) => {
  const className = "ml-1.5 h-4 w-4";
  return (
    <>
      {isAnyColumnHidden ? (
        <Icon.TableColumnsHidden className={className} />
      ) : (
        <Icon.TableColumnsVisible className={className} />
      )}
    </>
  );
};

HiddenColumnsIndicator.propTypes = {
  // True if at least one column is hidden
  isAnyColumnHidden: PropTypes.bool.isRequired,
};

export default HiddenColumnsIndicator;

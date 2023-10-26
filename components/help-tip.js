// node_modules
import PropTypes from "prop-types";

/**
 * Display an always-visible help tip, meaning the user doesn't click something or hover over
 * something to see it. Normally you'd put this under a control that needs explaining.
 */
export default function HelpTip({ className = "", children }) {
  return (
    <div className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </div>
  );
}

HelpTip.propTypes = {
  // Optional Tailwind CSS classes to apply to the help tip
  className: PropTypes.string,
};

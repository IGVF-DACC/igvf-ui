// node_modules
import PropTypes from "prop-types";
// components
import Spinner from "../components/spinner";

/**
 * Overlays the viewport with a semi-transparent white overlay to show something's in progress that
 * prevents the user from interacting with the page temporarily.
 */
export default function ViewportOverlay({ isEnabled, children }) {
  return (
    <div className="relative">
      {isEnabled && (
        <div
          className="fixed inset-0 z-40 bg-white opacity-70"
          data-testid="viewport-overlay"
        >
          <Spinner className="h-full" />
        </div>
      )}
      {children}
    </div>
  );
}

ViewportOverlay.propTypes = {
  // True to enable the overlay
  isEnabled: PropTypes.bool.isRequired,
};

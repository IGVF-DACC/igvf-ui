// node_modules
import PropTypes from "prop-types";

/**
 * Loading spinnner by Sam Herbert (@sherb)
 * http://samherbert.net/svg-loaders/
 */
export default function Spinner({ className = "", svgClassName = "" }) {
  return (
    <div
      className={`flex items-center justify-center stroke-gray-600 dark:stroke-gray-400 ${className}`}
    >
      <svg
        viewBox="0 0 44 44"
        xmlns="http://www.w3.org/2000/svg"
        style={{ fill: "none" }}
        className={svgClassName}
      >
        <g fillRule="evenodd" strokeWidth="2">
          <circle cx="22" cy="22" r="1">
            <animate
              attributeName="r"
              begin="0s"
              dur="1.8s"
              values="1; 20"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.165, 0.84, 0.44, 1"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="0s"
              dur="1.8s"
              values="1; 0"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.3, 0.61, 0.355, 1"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="22" cy="22" r="1">
            <animate
              attributeName="r"
              begin="-0.9s"
              dur="1.8s"
              values="1; 20"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.165, 0.84, 0.44, 1"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="-0.9s"
              dur="1.8s"
              values="1; 0"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.3, 0.61, 0.355, 1"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>
    </div>
  );
}

Spinner.propTypes = {
  // Extra Tailwind CSS classes for the wrapper div
  className: PropTypes.string,
  // Extra Tailwind CSS classes for the SVG element
  svgClassName: PropTypes.string,
};

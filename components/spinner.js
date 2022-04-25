// node_modules
import PropTypes from "prop-types"

/**
 * Loading spinnner by Sam Herbert (@sherb)
 * http://samherbert.net/svg-loaders/
 */
const Spinner = ({ className = "" }) => {
  return (
    <div
      className={`flex items-center justify-center stroke-gray-600 dark:stroke-gray-400 ${className}`}
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        xmlns="http://www.w3.org/2000/svg"
        style={{ fill: "none" }}
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
  )
}

Spinner.propTypes = {
  // Extra Tailwind CSS classes
  className: PropTypes.string,
}

export default Spinner

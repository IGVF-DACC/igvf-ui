// node_modules
import PropTypes from "prop-types";

/**
 * Display the contents of a standard error page.
 */
export default function Error({ statusCode = "ERROR", title = "" }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1
          data-testid="error-statuscode"
          className="text-2xl font-medium uppercase"
        >
          {statusCode}
        </h1>
        {title && (
          <h2
            data-testid="error-title"
            className="mt-4 border-t border-gray-300 pt-2 text-sm font-normal dark:border-gray-500"
          >
            {title}
          </h2>
        )}
      </div>
    </div>
  );
}

Error.propTypes = {
  // Error code to show as h1 of the error page
  statusCode: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  // Extra detail about the error to show as h2 of the error page
  title: PropTypes.string,
};

// node_modules
import PropTypes from "prop-types";
// components
import Error from "../components/error";

/**
 * Defines the standard error page for the application.
 * https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing
 */
export default function ErrorPage({ statusCode = "", title = "" }) {
  return <Error statusCode={statusCode} title={title} />;
}

ErrorPage.propTypes = {
  // Error code to show as h1 of the error page
  statusCode: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  // Extra detail about the error to show as h2 of the error page
  title: PropTypes.string,
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

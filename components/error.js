// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import PropTypes from "prop-types";
import { HTTP_STATUS_CODE } from "../lib/fetch-request";
// components
import { ButtonAsLink } from "./form-elements";
// lib
import { loginAuthProvider } from "../lib/authentication";

/**
 * Display the contents of a standard error page.
 */
export default function Error({ statusCode = "ERROR", title = "" }) {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  // Login help should appear if the status code is 403 and the user has not logged in.
  const isLoginHelpVisible =
    !isAuthenticated && statusCode === HTTP_STATUS_CODE.FORBIDDEN;

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1
          data-testid="error-statuscode"
          className="text-2xl font-medium uppercase"
        >
          {statusCode}
        </h1>
        {(title || isLoginHelpVisible) && (
          <div className="mt-4 border-t border-gray-300 pt-2 text-sm font-normal dark:border-gray-500">
            {title && <h2 data-testid="error-title">{title}</h2>}
            {isLoginHelpVisible && (
              <p className="mt-4" data-testid="error-login">
                Please{" "}
                <ButtonAsLink
                  onClick={() => loginAuthProvider(loginWithRedirect)}
                >
                  sign in
                </ButtonAsLink>{" "}
                if you believe you should have access to this page
              </p>
            )}
          </div>
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

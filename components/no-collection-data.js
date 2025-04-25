// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import { DataPanel } from "./data-area";
import { ButtonAsLink } from "./form-elements";
import GlobalContext from "./global-context";
import SessionContext from "./session-context";
// lib
import { loginAuthProvider } from "../lib/authentication";
import { LINK_INLINE_STYLE } from "../lib/constants";

/**
 * Display a message on a collection page indicating that no viewable collection data exists.
 */
export default function NoCollectionData({ pageTitle = "" }) {
  const { page } = useContext(GlobalContext);
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <DataPanel className="my-0.5">
      <div className="italic">No {pageTitle || page.title} to display.</div>
      {!isAuthenticated && (
        <p className="mt-4 text-sm">
          Please{" "}
          <ButtonAsLink
            onClick={() => {
              loginAuthProvider(loginWithRedirect);
            }}
          >
            sign in
          </ButtonAsLink>{" "}
          if you believe you should see {pageTitle || page.title}. See the
          instructions for{" "}
          <Link
            href="/help/general-help/accessing-unreleased-data/"
            className={LINK_INLINE_STYLE}
          >
            accessing unreleased data
          </Link>{" "}
          for more information.
        </p>
      )}
    </DataPanel>
  );
}

NoCollectionData.propTypes = {
  // Page title to display in the message if not using pageTitle props from getServerSideProps()
  pageTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

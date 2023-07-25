/**
 * Establishes the context to hold the back-end session and session-properties records for
 * the currently logged-in user. You have to do this within the <Auth0Provider> component so that
 * we can get the current Auth0 login state. The session record has only a random CSFR token while
 * logged out from the server. While logged in, it also has auth.userid with your email address.
 *
 * This module also handles signing the user into igvfd after a successful sign in to Auth0. It
 * does this by detecting the <App> level state that indicates an Auth0 authentication transition
 * from signed-out to signed in.
 */

// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { createContext, useEffect, useRef, useState } from "react";
// lib
import {
  getDataProviderUrl,
  getSession,
  getSessionProperties,
  loginDataProvider,
  logoutAuthProvider,
} from "../lib/authentication";
import getCollectionTitles from "../lib/collection-titles";
import getProfiles from "../lib/profiles";
/* istanbul ignore file */

/**
 * Establishes the context to hold the back-end session record for the currently signed-in user.
 * Other modules needing the session record can get it from this context.
 */
const SessionContext = createContext({
  session: {},
});

export default SessionContext;

/**
 * This only gets used in the <App> component to encapsulate the session context. Place this within
 * the <Auth0Provider> context so that <Session> can access the current authentication state.
 */
export function Session({ authentication, children }) {
  // Caches the back-end session object
  const [session, setSession] = useState(null);
  // Caches the session-properties object
  const [sessionProperties, setSessionProperties] = useState(null);
  // Caches the /profiles schemas
  const [profiles, setProfiles] = useState(null);
  // Caches the /collection-titles map
  const [collectionTitles, setCollectionTitles] = useState(null);
  // Caches the data provider URL
  const [dataProviderUrl, setDataProviderUrl] = useState(null);
  // Set to true once we start the process of signing into igvfd
  const isServerAuthPending = useRef(false);

  const { getAccessTokenSilently, isAuthenticated, logout } = useAuth0();
  const router = useRouter();

  // Get the data provider URL in case the user loaded a page that 404'd, in which case NextJS
  // doesn't load environment variables, leaving us unable to retrieve the session and session-
  // properties objects from igvfd. By getting the data provider URL, we can then get the session
  // and session-properties objects using the full URL instead of just the path.
  useEffect(() => {
    if (!dataProviderUrl) {
      getDataProviderUrl().then((url) => {
        setDataProviderUrl(url);
      });
    }
  }, [dataProviderUrl]);

  // Get the session object from igvfd if we don't already have it in state. We need this to get
  // the CSRF token to sign into igvfd.
  useEffect(() => {
    if (!session && dataProviderUrl) {
      getSession(dataProviderUrl).then((sessionResponse) => {
        setSession(sessionResponse);
      });
    }
  }, [dataProviderUrl, session]);

  // Get the session-properties object from igvfd if we don't already have it in state. This gives
  // us the user's name and email address, and whether they're an admin.
  useEffect(() => {
    if (!sessionProperties && dataProviderUrl) {
      getSessionProperties(dataProviderUrl).then(
        (sessionPropertiesResponse) => {
          setSessionProperties(sessionPropertiesResponse);
        },
      );
    }
  }, [dataProviderUrl, sessionProperties]);

  // Get all the schemas so that the several other places in the code that need schemas can get
  // them from this context instead of doing a request to /profiles.
  useEffect(() => {
    if (!profiles && dataProviderUrl) {
      getProfiles(dataProviderUrl).then((response) => {
        setProfiles(response);
      });
    }
  }, [profiles, dataProviderUrl]);

  // Get the mapping of @type, collection name, and schema name to corresponding human-readable
  // names.
  useEffect(() => {
    if (!collectionTitles && dataProviderUrl) {
      getCollectionTitles(dataProviderUrl).then((response) => {
        setCollectionTitles(response);
      });
    }
  }, [collectionTitles, dataProviderUrl]);

  // If we detect a transition from Auth0's logged-out state to logged-in state, log the user into
  // igvfd. The callback that auth0-react calls after a successful Auth0 login exists outside the
  // Auth0Provider context, so we have to have that callback set an <App> state and then handle the
  // sign in to igvfd here, *within* the Auth0Provider context.
  useEffect(() => {
    if (
      authentication.authTransitionPath &&
      !isServerAuthPending.current &&
      dataProviderUrl
    ) {
      // Get the logged-out session object from igvfd if we don't already have it in state. We
      // need this to get the CSRF token to sign into igvfd.
      isServerAuthPending.current = true;
      const serverSessionPromise = session
        ? Promise.resolve(session)
        : getSession(dataProviderUrl);
      serverSessionPromise
        .then((signedOutSession) => {
          // Attempt to log into igvfd.
          return loginDataProvider(signedOutSession, getAccessTokenSilently);
        })
        .then((sessionPropertiesResponse) => {
          if (
            !sessionPropertiesResponse ||
            sessionPropertiesResponse.status === "error"
          ) {
            // Auth0 authenticated successfully, but we couldn't authenticate with igvfd. Log back
            // out of Auth0 and go to an error page.
            authentication.setAuthTransitionPath("");
            logoutAuthProvider(logout, "/auth-error");
            return null;
          }

          // Auth0 and the server authenticated successfully. Set the session-properties object in
          // the session context so that any downstream component can retrieve it without doing a
          // request to /session-properties.
          setSessionProperties(sessionPropertiesResponse);
          return getSession(dataProviderUrl);
        })
        .then((signedInSession) => {
          // Set the logged-in session object in the session context so that any downstream
          // component can retrieve it without doing a request to /session. Clear the transition
          // path so we know we've completed both Auth0 and igvfd authentication.
          isServerAuthPending.current = false;
          setSession(signedInSession);
          authentication.setAuthTransitionPath("");

          // Auth0 might have redirected to the page the user had viewed when they signed in
          // before igvfd authentication completed, so the page shows only public data. In this
          // case, reload the page to get the latest data.
          const viewedPath = `${window.location.pathname}${window.location.search}`;
          if (authentication.authTransitionPath === viewedPath) {
            router.reload(viewedPath);
          }
        });
    }
  }, [
    authentication,
    dataProviderUrl,
    getAccessTokenSilently,
    isAuthenticated,
    logout,
    router,
    session,
    setSession,
  ]);

  return (
    <SessionContext.Provider
      value={{ session, sessionProperties, profiles, collectionTitles }}
    >
      {children}
    </SessionContext.Provider>
  );
}

Session.propTypes = {
  // Auth0 authentication state and transition setter
  authentication: PropTypes.exact({
    // Path to reload after successful Auth0 authentication
    authTransitionPath: PropTypes.string.isRequired,
    // Sets the `authTransitionPath` state
    setAuthTransitionPath: PropTypes.func.isRequired,
  }).isRequired,
};

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
import { createContext, useEffect, useState } from "react";
// lib
import {
  getDataProviderUrl,
  getSession,
  getSessionProperties,
  loginDataProvider,
  logoutAuthProvider,
  logoutDataProvider,
} from "../lib/authentication";
import getCollectionTitles from "../lib/collection-titles";
import { AUTH_ERROR_URI } from "../lib/constants";
import { getProfiles } from "../lib/profiles";
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
 * This context provider reacts to the user logging in or out of Auth0 by then logging in or out of
 * igvfd. It also provides other useful data retrieved from the server at page load so that child
 * modules don't need to request them again.
 *
 * This only gets used in the <App> component to encapsulate the session context. Place this within
 * the <Auth0Provider> context so that <Session> can access the current authentication state.
 */
export function Session({ postLoginRedirectUri, children }) {
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

  const { getAccessTokenSilently, isAuthenticated, isLoading, logout } =
    useAuth0();
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

  // Get the session object from the data provider before authentication completes. We need this
  // to supply the CSRF token to the server when we log in.
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
        }
      );
    }
  }, [dataProviderUrl, sessionProperties]);

  // Get all the schemas so that the several other places in the code that need schemas can get
  // them from this context instead of doing a request to /profiles.
  useEffect(() => {
    if (!profiles) {
      getProfiles().then((response) => {
        setProfiles(response);
      });
    }
  }, [profiles]);

  // Get the mapping of @type, collection name, and schema name to corresponding human-readable
  // names.
  useEffect(() => {
    if (!collectionTitles) {
      getCollectionTitles().then((response) => {
        setCollectionTitles(response);
      });
    }
  }, [collectionTitles]);

  // If we detect a transition from Auth0's logged-out state to logged-in state, log the user into
  // igvfd. The callback that auth0-react calls after a successful Auth0 login exists outside the
  // Auth0Provider context, so we have to have that callback set an <App> state and then handle the
  // sign in to igvfd here, *within* the Auth0Provider context.
  useEffect(() => {
    if (isAuthenticated && session && !session["auth.userid"]) {
      loginDataProvider(session, getAccessTokenSilently)
        .then((sessionPropertiesResponse) => {
          if (
            !sessionPropertiesResponse ||
            sessionPropertiesResponse.status === "error"
          ) {
            // Auth0 authenticated successfully, but we couldn't authenticate with igvfd. Log back
            // out of Auth0 and go to an error page.
            logoutAuthProvider(logout, AUTH_ERROR_URI);
            return null;
          }
          return sessionPropertiesResponse;
        })
        .then((sessionPropertiesResponse) => {
          // Save /session-properties in state so that child components can access it. Then get a
          // new logged-in session object that includes the user's email address.
          setSessionProperties(sessionPropertiesResponse);
          return getSession(dataProviderUrl);
        })
        .then((signedInSession) => {
          setSession(signedInSession);

          // Auth0 might have redirected to the page the user had viewed when they signed in
          // before igvfd authentication completed, so the page shows only public data. In this
          // case, reload the page to get the latest data.
          if (postLoginRedirectUri) {
            router.replace(postLoginRedirectUri);
          }
        });
    }
  }, [isAuthenticated, session]);

  useEffect(() => {
    // Detect that the user has logged out of Auth0. Respond by logging them out of igvfd.
    if (!isAuthenticated && !isLoading) {
      getDataProviderUrl()
        .then((url) => {
          return getSessionProperties(url);
        })
        .then((sessionPropertiesResponse) => {
          if (sessionPropertiesResponse?.["auth.userid"]) {
            return logoutDataProvider();
          }
          return null;
        })
        .then((logoutSessionProperties) => {
          if (logoutSessionProperties) {
            router.push("/");
          }
        });
    }
  }, [isAuthenticated, isLoading]);

  return (
    <SessionContext.Provider
      value={{
        session,
        sessionProperties,
        profiles,
        collectionTitles,
        dataProviderUrl,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

Session.propTypes = {
  // The URL to redirect to after the user logs in
  postLoginRedirectUri: PropTypes.string,
};

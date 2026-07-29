/**
 * Establishes the context to hold the back-end session and session-properties records for
 * the currently logged-in user. You have to do this within the <Auth0Provider> component so that
 * we can get the current Auth0 login state. The session record has only a random CSRF token while
 * logged out from the server. While logged in, it also has auth.userid with your email address.
 *
 * This module also handles signing the user into igvfd after a successful sign in to Auth0. It
 * does this by detecting the <App> level state that indicates an Auth0 authentication transition
 * from signed-out to signed in.
 */

// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import {
  createContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
  useCallback,
} from "react";
// components
import { Button } from "./form-elements";
import Modal from "./modal";
// lib
import {
  createUnverifiedAccount,
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
import type {
  CollectionTitles,
  Profiles,
  SessionObject,
  SessionPropertiesObject,
} from "../globals";
import { isErrorObject } from "../lib/fetch-request";

/**
 * The value of the session context. This is what gets passed to the <SessionContext.Provider> and
 * is what child modules can get from the <SessionContext.Consumer> or useContext(SessionContext).
 *
 * @property session - Session object from the server. This has only a random CSRF token while
 *                     logged out, and also has auth.userid with your email address while logged in.
 * @property sessionProperties - Session-properties object from the server. This has your name and
 *                     email address, and whether you're an admin.
 * @property profiles - /profiles schemas from the server.
 * @property collectionTitles - Mapping of @type, collection name, and schema name to corresponding
 *                              human-readable names.
 * @property dataProviderUrl - URL of the data provider (igvfd) server.
 */
export interface SessionContextValue {
  session: SessionObject | null;
  sessionProperties: SessionPropertiesObject | null;
  profiles: Profiles | null;
  collectionTitles: CollectionTitles | null;
  dataProviderUrl: string | null;
}

/**
 * The props for the <Session> component. This is what gets passed to the <Session> component
 * when it is used in the <App> component.
 *
 * @property postLoginRedirectUri - URI to redirect to after a successful login. This is used to
 *                                  redirect the user to the page they were on before they logged
 *                                  in.
 * @property children - Child components that will have access to the session context.
 */
interface SessionProps {
  postLoginRedirectUri?: string;
  children?: ReactNode;
}

/**
 * The phases of the login process. This is used to track the state of the login process and to
 * display the appropriate UI to the user.
 */
type LoginPhase =
  | "idle"
  | "logging-in"
  | "offer-account"
  | "creating-account"
  | "complete"
  | "error";

/**
 * Establishes the context to hold the back-end session record for the currently signed-in user.
 * Other modules needing the session record can get it from this context.
 */
const SessionContext = createContext<SessionContextValue>({
  session: null,
  sessionProperties: null,
  profiles: null,
  collectionTitles: null,
  dataProviderUrl: null,
});

export default SessionContext;

export function OfferCreateAccountModal({
  open,
  isSubmitting,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (open) {
    return (
      <Modal isOpen onClose={onCancel} testid="offer-create-account-modal">
        <Modal.Header>
          <h2>Create an IGVF Portal Account</h2>
        </Modal.Header>
        <Modal.Body>
          <p>
            Create an account to save your preferences and other work, and
            access them whenever you sign in including from another browser or
            device. You can continue exploring released data without an account.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button type="secondary" onClick={onCancel} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="primary" onClick={onConfirm} isDisabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
  return null;
}

/**
 * This context provider reacts to the user logging in or out of Auth0 by then logging in or out of
 * igvfd. It also provides other useful data retrieved from the server at page load so that child
 * modules don't need to request them again.
 *
 * This only gets used in the <App> component to encapsulate the session context. Place this within
 * the <Auth0Provider> context so that <Session> can access the current authentication state.
 */
export function Session({ postLoginRedirectUri, children }: SessionProps) {
  // Caches the back-end session object
  const [session, setSession] = useState<SessionObject | null>(null);
  // Caches the session-properties object
  const [sessionProperties, setSessionProperties] =
    useState<SessionPropertiesObject | null>(null);
  // Caches the /profiles schemas
  const [profiles, setProfiles] = useState<Profiles | null>(null);
  // Caches the /collection-titles map
  const [collectionTitles, setCollectionTitles] =
    useState<CollectionTitles | null>(null);
  // Caches the data provider URL
  const [dataProviderUrl, setDataProviderUrl] = useState<string | null>(null);
  // Tracks the current phase of the login process
  const [loginPhase, setLoginPhase] = useState<LoginPhase>("idle");
  // Tracks whether a login is in progress to prevent multiple simultaneous login attempts
  const loginInProgress = useRef(false);

  const { getAccessTokenSilently, isAuthenticated, isLoading, logout } =
    useAuth0();
  const router = useRouter();

  // Get the data provider URL in case the user loaded a page that 404'd, in which case NextJS
  // doesn't load environment variables, leaving us unable to retrieve the session and session-
  // properties objects from igvfd. By getting the data provider URL, we can then get the session
  // and session-properties objects using the full URL instead of just the path.
  useEffect(() => {
    if (!dataProviderUrl) {
      void getDataProviderUrl().then((url) => {
        setDataProviderUrl(url);
      });
    }
  }, [dataProviderUrl]);

  // Get the session object from the data provider before authentication completes. We need this
  // to supply the CSRF token to the server when we log in.
  useEffect(() => {
    if (!session && dataProviderUrl) {
      void getSession(dataProviderUrl).then((sessionResponse) => {
        setSession(sessionResponse);
      });
    }
  }, [dataProviderUrl, session]);

  // Get the session-properties object from igvfd if we don't already have it in state. This gives
  // us the user's name and email address, and whether they're an admin.
  useEffect(() => {
    if (!sessionProperties && dataProviderUrl) {
      void getSessionProperties(dataProviderUrl).then(
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
      void getProfiles().then((response) => {
        setProfiles(response);
      });
    }
  }, [profiles]);

  // Get the mapping of @type, collection name, and schema name to corresponding human-readable
  // names.
  useEffect(() => {
    if (!collectionTitles) {
      void getCollectionTitles().then((response) => {
        setCollectionTitles(response);
      });
    }
  }, [collectionTitles]);

  function declineAccountCreation() {
    logoutAuthProvider(logout, "/");
  }

  // Callback to finish the login process after a successful login to igvfd. This sets the session
  // and session-properties objects in state, and redirects to the post-login URI if provided.
  const finishLogin = useCallback(
    async (sessionPropertiesResponse) => {
      setSessionProperties(sessionPropertiesResponse);

      // Now that we have logged into the backend, get the session object from the backend to get
      // the CSRF token and auth.userid.
      const signedInSession = await getSession(dataProviderUrl);
      setSession(signedInSession);

      // Go back to the page the user viewed before logging in.
      if (postLoginRedirectUri) {
        await router.replace(postLoginRedirectUri);
      }

      setLoginPhase("complete");
    },
    [dataProviderUrl, postLoginRedirectUri, router]
  );

  // Attempt to log in to igvfd using the current Auth0 session. This is called when the user clicks
  // the "Log in" button on the "Offer Account" page, or when the user clicks the "Create Account"
  // button on the same page.
  const attemptDatabaseLogin = useCallback(async () => {
    /* istanbul ignore if -- Defensive guard; login phases prevent concurrent UI calls. */
    if (loginInProgress.current) {
      return;
    }

    loginInProgress.current = true;
    setLoginPhase("logging-in");

    try {
      const response = await loginDataProvider(session, getAccessTokenSilently);

      if (isErrorObject(response)) {
        if (
          response.code === 403 &&
          response["@type"].includes("LoginDenied")
        ) {
          // Refresh the session from the data provider. A rejected login from the data provider
          // invalidates the session cookie, so we need to refresh the session to get a new CSRF
          // token to create a new data provider account.
          const refreshedSession = await getSession(dataProviderUrl);
          if (!refreshedSession) {
            throw new Error("Unable to refresh the backend session");
          }

          // Auth0 knows the identity, but our application does not.
          setSession(refreshedSession);
          setLoginPhase("offer-account");
          return;
        }

        throw new Error(response.description ?? "Application login failed");
      }

      if (!response) {
        throw new Error("Application login returned no response");
      }

      await finishLogin(response);
    } catch (error) {
      console.error(error);
      setLoginPhase("error");
      logoutAuthProvider(logout, AUTH_ERROR_URI);
    } finally {
      loginInProgress.current = false;
    }
  }, [session, getAccessTokenSilently, finishLogin, logout, dataProviderUrl]);

  // Create an account with reduced privileges, then retry the normal igvfd login flow now that the
  // Auth0 identity has a corresponding account.
  const createAccount = useCallback(async () => {
    setLoginPhase("creating-account");

    // Create a new unverified account in the data provider. This is used when a user logs in with
    // Auth0 but does not have an account in the data provider. The user will be prompted to create
    // an account in the data provider after logging in with Auth0.
    try {
      /* istanbul ignore if -- The modal opens only after a non-null session refresh. */
      if (!session) {
        throw new Error("No backend session available for account creation");
      }

      const response = await createUnverifiedAccount(
        session,
        getAccessTokenSilently
      );
      if (isErrorObject(response)) {
        throw new Error(response.description ?? "Account creation failed");
      }

      // Now that the account has been created, attempt to log in to igvfd again.
      await attemptDatabaseLogin();
    } catch (error) {
      console.error(error);
      setLoginPhase("error");
      logoutAuthProvider(logout, AUTH_ERROR_URI);
    }
  }, [attemptDatabaseLogin, getAccessTokenSilently, logout, session]);

  // If the user is authenticated with Auth0 but not yet authenticated with igvfd, attempt to log in
  // to igvfd. This is called when the user clicks the "Log in" button on the "Offer Account" page,
  // or when the user clicks the "Create Account" button on the same page.
  useEffect(() => {
    const needsDatabaseLogin =
      isAuthenticated &&
      session &&
      !session["auth.userid"] &&
      loginPhase === "idle";
    if (needsDatabaseLogin) {
      void attemptDatabaseLogin();
    }
  }, [isAuthenticated, session, loginPhase, attemptDatabaseLogin]);

  useEffect(() => {
    // Detect that the user has logged out of Auth0. Respond by logging them out of igvfd.
    if (!isAuthenticated && !isLoading) {
      void getDataProviderUrl()
        .then(async (url) => {
          return getSessionProperties(url);
        })
        .then(async (sessionPropertiesResponse) => {
          if (sessionPropertiesResponse?.["auth.userid"]) {
            return logoutDataProvider();
          }
          return null;
        })
        .then((logoutSessionProperties) => {
          if (logoutSessionProperties) {
            window.location.replace("/");
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
      <OfferCreateAccountModal
        open={
          loginPhase === "offer-account" || loginPhase === "creating-account"
        }
        isSubmitting={loginPhase === "creating-account"}
        onConfirm={createAccount}
        onCancel={declineAccountCreation}
      />
    </SessionContext.Provider>
  );
}

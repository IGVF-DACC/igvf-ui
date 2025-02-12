// node_modules
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { XCircleIcon } from "@heroicons/react/20/solid";
import Head from "next/head";
import Script from "next/script";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
// lib
import {
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_ISSUER_BASE_DOMAIN,
  BRAND_COLOR,
  SITE_TITLE,
} from "../lib/constants";
import DarkModeManager from "../lib/dark-mode-manager";
// components
import Error from "../components/error";
import GlobalContext from "../components/global-context";
import NavigationSection from "../components/navigation";
import { Session } from "../components/session-context";
import ViewportOverlay from "../components/viewport-overlay";
// CSS
import "../styles/globals.css";

/**
 * List of domains for servers that contain test data and should display a warning banner to users,
 * as well as the corresponding server title to display in the banner.
 */
const testServerDomains = [
  {
    domain: "staging.igvf.org",
    title: "Staging",
  },
  {
    domain: "sandbox.igvf.org",
    title: "Sandbox",
  },
  {
    domain: "localhost",
    title: "local",
  },
];

/**
 * Display a warning banner to users when they browse a test server that could have its files
 * automatically deleted after a short time. Allow the user to close the banner if they choose to.
 */
function TestServerWarning() {
  // Title of the test server to display in the warning banner; empty string to hide banner
  const [testDomainTitle, setTestDomainTitle] = useState("");

  useEffect(() => {
    const matchingTestDomain = testServerDomains.find((testDomain) => {
      return window.location.hostname === testDomain.domain;
    });
    if (matchingTestDomain) {
      setTestDomainTitle(matchingTestDomain.title);
    }
  }, []);

  if (testDomainTitle) {
    return (
      <div className="flex justify-center gap-1 border-b border-red-700 bg-red-600 p-1 text-sm text-white dark:border-red-700 dark:bg-red-800 dark:text-gray-100">
        <div>
          This is the IGVF {testDomainTitle} server for testing submissions. All
          files submitted here will be deleted after 30 days.
        </div>
        <button
          onClick={() => setTestDomainTitle("")}
          aria-label="Close test-server warning banner"
        >
          <XCircleIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }
}

function Site({ Component, pageProps, postLoginRedirectUri }) {
  // Flag to indicate if <Link> components should cause page reload
  const [isLinkReloadEnabled, setIsLinkReloadEnabled] = useState(false);
  const { isLoading } = useAuth0();
  // Keep track of current dark mode settings
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Install the dark-mode event listener to react to dark-mode changes.
    const darkModeManager = new DarkModeManager(setIsDarkMode);
    darkModeManager.installDarkModeListener();
    darkModeManager.setCurrentDarkMode();

    return () => {
      darkModeManager.removeDarkModeListener();
    };
  }, []);

  const globalContext = useMemo(() => {
    return {
      site: {
        title: SITE_TITLE,
      },
      page: {
        title: pageProps.pageContext?.title || "",
      },
      linkReload: {
        isEnabled: isLinkReloadEnabled,
        setIsEnabled: setIsLinkReloadEnabled,
      },
      darkMode: {
        enabled: isDarkMode,
      },
    };
  }, [pageProps.pageContext?.title, isLinkReloadEnabled, isDarkMode]);

  return (
    <ViewportOverlay isEnabled={isLoading}>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta
          name="description"
          content="Portal for the Impact of Genomic Variation on Function consortium"
        />
        <meta name="theme-color" content={BRAND_COLOR} />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
      </Head>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-E2PEXFFGYR"
      />
      <Script id="google-analytics-4-script">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-E2PEXFFGYR');
        `}
      </Script>
      <TestServerWarning />
      <div className="md:container">
        <GlobalContext.Provider value={globalContext}>
          <Session postLoginRedirectUri={postLoginRedirectUri}>
            <div className="md:flex">
              <NavigationSection />
              <div className="min-w-0 shrink grow px-3 py-2 @container/main md:px-8">
                {pageProps.serverSideError ? (
                  <Error
                    statusCode={pageProps.serverSideError.code}
                    title={pageProps.serverSideError.description}
                  />
                ) : (
                  <Component {...pageProps} />
                )}
              </div>
            </div>
          </Session>
        </GlobalContext.Provider>
      </div>
    </ViewportOverlay>
  );
}

Site.propTypes = {
  // Component to render for the page, as determined by nextjs router
  Component: PropTypes.elementType.isRequired,
  // Properties associated with the page to pass to `Component`
  pageProps: PropTypes.object.isRequired,
  // URL to redirect to after the user logs in
  postLoginRedirectUri: PropTypes.string,
};

export default function App(props) {
  const [postLoginRedirectUri, setPostLoginRedirectUri] = useState("/");
  // const router = useRouter();

  /**
   * Called after the user signs in and auth0 redirects back to the application. We set the
   * `appState` parameter with the URL the user viewed when they logged in, so we can redirect
   * them back to that page after they log in here.
   * @param {object} appState Contains the URL to redirect to after signing in
   */
  function onRedirectCallback(appState) {
    if (appState?.returnTo) {
      setPostLoginRedirectUri(appState.returnTo);
    }
  }

  // Handle stand-alone pages. They need no navigation nor authentication.
  if (props.pageProps.isStandalonePage) {
    return <props.Component {...props.pageProps} />;
  }

  return (
    <Auth0Provider
      domain={AUTH0_ISSUER_BASE_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: typeof window !== "undefined" && window.location.origin,
        audience: AUTH0_AUDIENCE,
      }}
    >
      <Site {...props} postLoginRedirectUri={postLoginRedirectUri} />
    </Auth0Provider>
  );
}

App.propTypes = {
  // Component to render for the page, as determined by nextjs router
  Component: PropTypes.elementType.isRequired,
  // Properties associated with the page to pass to `Component`
  pageProps: PropTypes.object.isRequired,
  // URL to redirect to after the user logs in
  postLoginRedirectUri: PropTypes.string,
};

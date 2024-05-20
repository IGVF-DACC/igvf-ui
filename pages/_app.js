// node_modules
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import Head from "next/head";
import { useRouter } from "next/router";
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
import ScrollToTop from "../components/scroll-to-top";
import { Session } from "../components/session-context";
import ViewportOverlay from "../components/viewport-overlay";
// CSS
import "../styles/globals.css";

function Site({ Component, pageProps, authentication }) {
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
        type: pageProps.pageContext?.type || "",
      },
      breadcrumbs: pageProps.breadcrumbs || [],
      linkReload: {
        isEnabled: isLinkReloadEnabled,
        setIsEnabled: setIsLinkReloadEnabled,
      },
      darkMode: {
        enabled: isDarkMode,
      },
    };
  }, [
    pageProps.breadcrumbs,
    pageProps.pageContext?.title,
    pageProps.pageContext?.type,
    isLinkReloadEnabled,
    isDarkMode,
  ]);

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
      <div className="md:container">
        <ScrollToTop />
        <GlobalContext.Provider value={globalContext}>
          <Session authentication={authentication}>
            <div className="md:flex">
              <NavigationSection />
              <div className="min-w-0 shrink grow px-3 py-2 md:px-8">
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
  // Auth0 authentication state and transition setter
  authentication: PropTypes.exact({
    // True if Auth0 has authenticated but we haven't yet logged into igvfd
    authTransitionPath: PropTypes.string.isRequired,
    // Sets the `authTransitionPath` state
    setAuthTransitionPath: PropTypes.func.isRequired,
  }).isRequired,
};

export default function App(props) {
  // Path user viewed when they logged in; also indicates Auth0 has auth'd but igvfd hasn't yet
  const [authTransitionPath, setAuthTransitionPath] = useState("");

  const router = useRouter();

  /**
   * Called after the user signs in and auth0 redirects back to the application. We set the
   * `appState` parameter with the URL the user viewed when they logged in, so we can redirect
   * them back to that page after they log in here.
   * @param {object} appState Contains the URL to redirect to after signing in
   */
  function onRedirectCallback(appState) {
    if (appState?.returnTo) {
      router.replace(appState.returnTo);
    }

    // Indicate that Auth0 has completed authentication so Session context can log into igvfd, and
    // reload this path if needed to see the authenticated content.
    setAuthTransitionPath(appState?.returnTo || "");
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
      <Site
        {...props}
        authentication={{
          authTransitionPath,
          setAuthTransitionPath,
        }}
      />
    </Auth0Provider>
  );
}

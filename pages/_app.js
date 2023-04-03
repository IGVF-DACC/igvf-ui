// node_modules
import { Auth0Provider } from "@auth0/auth0-react";
import Error from "next/error";
import Head from "next/head";
import Script from "next/script";
import PropTypes from "prop-types";
import { useEffect, useMemo } from "react";
// lib
import onRedirectCallback from "../lib/authentication-redirect";
import {
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_ISSUER_BASE_DOMAIN,
  BRAND_COLOR,
  SITE_TITLE,
} from "../lib/constants";
import DarkModeManager from "../lib/dark-mode-manager";
// components
import GlobalContext from "../components/global-context";
import NavigationSection from "../components/navigation";
import ScrollToTop from "../components/scroll-to-top";
import { Session } from "../components/session-context";
// CSS
import "../styles/globals.css";
import { ProfileMap } from "../components/profile-map";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Install the dark-mode event listener to react to dark-mode changes.
    const darkModeManager = new DarkModeManager();
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
    };
  }, [
    pageProps.breadcrumbs,
    pageProps.pageContext?.title,
    pageProps.pageContext?.type,
  ]);

  return (
    <>
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
      ></Script>
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
        <Auth0Provider
          domain={AUTH0_ISSUER_BASE_DOMAIN}
          clientId={AUTH0_CLIENT_ID}
          redirectUri={typeof window !== "undefined" && window.location.origin}
          audience={AUTH0_AUDIENCE}
          onRedirectCallback={onRedirectCallback}
          useRefreshTokens={true}
          cacheLocation="localstorage"
        >
          <GlobalContext.Provider value={globalContext}>
            <Session>
              <ProfileMap>
                <div className="md:flex">
                  <NavigationSection />
                  <div className="min-w-0 shrink grow px-3 py-2 text-black dark:text-white md:px-8">
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
              </ProfileMap>
            </Session>
          </GlobalContext.Provider>
        </Auth0Provider>
      </div>
    </>
  );
}

App.propTypes = {
  // Component to render for the page, as determined by nextjs router
  Component: PropTypes.elementType.isRequired,
  // Properties associated with the page to pass to `Component`
  pageProps: PropTypes.object.isRequired,
};

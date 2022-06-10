// node_modules
import { Auth0Provider } from "@auth0/auth0-react"
import Head from "next/head"
import PropTypes from "prop-types"
import { useEffect, useMemo, useState } from "react"
// libs
import { onRedirectCallback } from "../libs/authentication"
import {
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_ISSUER_BASE_DOMAIN,
  BRAND_COLOR,
  SITE_TITLE,
} from "../libs/constants"
import DarkModeManager from "../libs/dark-mode-manager"
// components
import GlobalContext from "../components/global-context"
import { Session } from "../components/session-context"
import NavigationSection from "../components/navigation"
// CSS
import "../styles/globals.css"

const App = ({ Component, pageProps }) => {
  // Server session cookie.
  const [sessionCookie, setSessionCookie] = useState("")
  const [profiles, setProfiles] = useState(null)

  useEffect(() => {
    // Install the dark-mode event listener to react to dark-mode changes.
    const darkModeManager = new DarkModeManager()
    darkModeManager.installDarkModeListener()
    darkModeManager.setCurrentDarkMode()

    return () => {
      darkModeManager.removeDarkModeListener()
    }
  }, [])

  useEffect(() => {
    // Set the session cookie if the back end has retrieved one.
    if (pageProps.sessionCookie) {
      setSessionCookie(pageProps.sessionCookie)
    }
  }, [pageProps.sessionCookie])

  useEffect(() => {
    if (pageProps.sessionCookie) {
      fetch("http://localhost:8000/profiles", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: pageProps.sessionCookie,
        },
      })
        .then((response) => {
          return response.json()
        })
        .then((profiles) => {
          setProfiles(profiles)
        })
    }
  }, [pageProps.sessionCookie])

  const globalContext = useMemo(() => {
    return {
      site: {
        title: SITE_TITLE,
      },
      page: {
        title: pageProps.pageContext?.title || "",
      },
      breadcrumbs: pageProps.breadcrumbs || [],
      sessionCookie,
      profiles,
    }
  }, [
    pageProps.pageContext?.title,
    pageProps.breadcrumbs,
    profiles,
    sessionCookie,
  ])

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
      <div className="h-screen md:container md:flex">
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
              <NavigationSection />
              <div className="min-w-0 shrink grow px-8 py-2 text-black dark:text-white">
                <Component {...pageProps} />
              </div>
            </Session>
          </GlobalContext.Provider>
        </Auth0Provider>
      </div>
    </>
  )
}

App.propTypes = {
  // Component to render for the page, as determined by nextjs router
  Component: PropTypes.elementType.isRequired,
  // Properties associated with the page to pass to `Component`
  pageProps: PropTypes.object.isRequired,
}

export default App

// node_modules
import Head from "next/head"
import PropTypes from "prop-types"
import { useEffect, useMemo } from "react"
// libs
import { BRAND_COLOR, SITE_TITLE } from "../libs/constants"
import DarkModeManager from "../libs/dark-mode-manager"
// components
import GlobalContext from "../components/global-context"
import NavigationSection from "../components/navigation"
// CSS
import "../styles/globals.css"

const App = ({ Component, pageProps }) => {
  useEffect(() => {
    // Install the dark-mode event listener to react to dark-mode changes.
    const darkModeManager = new DarkModeManager()
    darkModeManager.installDarkModeListener()
    darkModeManager.setCurrentDarkMode()

    return () => {
      darkModeManager.removeDarkModeListener()
    }
  }, [])

  const globalContext = useMemo(() => {
    return {
      site: {
        title: SITE_TITLE,
      },
      page: {
        title: pageProps.pageContext?.title || "",
      },
      breadcrumbs: pageProps.breadcrumbs || [],
    }
  }, [pageProps.pageContext?.title, pageProps.breadcrumbs])

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
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
      </Head>
      <div className="md:container md:flex">
        <GlobalContext.Provider value={globalContext}>
          <NavigationSection />
          <div className="shrink grow overflow-x-hidden px-8 py-2 text-black dark:text-white">
            <Component {...pageProps} />
          </div>
        </GlobalContext.Provider>
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

// components
import PageTitle from "./page-title"
import SiteTitle from "./site-title"

/**
 * Put this at the top of any page that needs a tab title and a page title.
 */
const PagePreamble = () => {
  return (
    <>
      <SiteTitle />
      <PageTitle />
    </>
  )
}

export default PagePreamble

// node_modules
import Head from "next/head"
import { useContext } from "react"
// libs
import { UC } from "../libs/constants"
// components
import GlobalContext from "./global-context"

const SiteTitle = () => {
  const { site, page } = useContext(GlobalContext)

  return (
    <Head>
      <title>{`${site.title}${
        page.title && `${UC.mdash} ${page.title}`
      }`}</title>
    </Head>
  )
}

export default SiteTitle

// node_modules
import Head from "next/head"
import Link from "next/link"
import PropTypes from "prop-types"
// components
import PageTitle from "../../components/page-title"
// libs
import { UC } from "../../libs/constants"
import { getCollection } from "../../libs/request"

const AwardList = ({ awards, siteContext, pageContext }) => {
  return (
    <>
      <Head>
        <title>{`${siteContext.title} ${UC.mdash} ${pageContext.title}`}</title>
      </Head>
      <PageTitle>Awards</PageTitle>
      {awards.map((award) => (
        <Link href={award["@id"]} key={award.uuid}>
          <a className="block px-2 py-4 no-underline hover:bg-slate-50 hover:dark:bg-slate-800">
            <div>{award.name}</div>
            <div>{award.title}</div>
          </a>
        </Link>
      ))}
    </>
  )
}

AwardList.propTypes = {
  // Awards to display in the list
  awards: PropTypes.array.isRequired,
  // Site context
  siteContext: PropTypes.object.isRequired,
  // Page-specific context
  pageContext: PropTypes.object.isRequired,
}

export default AwardList

export const getServerSideProps = async () => {
  const awards = await getCollection("awards")
  return {
    props: {
      awards: awards["@graph"],
      pageContext: { title: awards.title },
    },
  }
}

// node_modules
import Head from "next/head"
import Link from "next/link"
import PropTypes from "prop-types"
// components
import PageTitle from "../../components/page-title"
// libs
import { UC } from "../../libs/constants"
import { getCollection } from "../../libs/request"

const LabList = ({ labs, siteContext, pageContext }) => {
  return (
    <>
      <Head>
        <title>{`${siteContext.title} ${UC.mdash} ${pageContext.title}`}</title>
      </Head>
      <div>
        <PageTitle>Users</PageTitle>
        <div>
          {labs.map((lab) => (
            <Link href={lab["@id"]} key={lab.uuid}>
              <a className="block">{lab.title}</a>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

LabList.propTypes = {
  // Labs to display in the list
  labs: PropTypes.array.isRequired,
  // Site context
  siteContext: PropTypes.object.isRequired,
  // Page-specific context
  pageContext: PropTypes.object.isRequired,
}

export default LabList

export const getServerSideProps = async () => {
  const labs = await getCollection("lab")
  return {
    props: {
      labs: labs["@graph"],
      pageContext: { title: labs.title },
    },
  }
}

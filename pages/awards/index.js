// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import PageTitle from "../../components/page-title"
import SiteTitle from "../../components/site-title"
// libs
import { getCollection } from "../../libs/request"

const AwardList = ({ awards }) => {
  return (
    <>
      <SiteTitle />
      <PageTitle>Awards</PageTitle>
      {awards.map((award) => (
        <Link href={award["@id"]} key={award.uuid}>
          <a className="block border-b border-gray-300 p-4 px-2 no-underline last:border-b-0 hover:bg-highlight dark:border-gray-700">
            <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
              {award.name}
            </div>
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

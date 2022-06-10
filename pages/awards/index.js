// node_modules
import PropTypes from "prop-types"
import { useContext } from "react"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import { CollectionCount } from "../../components/collection"
import GlobalContext from "../../components/global-context"
import NoCollectionData from "../../components/no-collection-data"
import PagePreamble from "../../components/page-preamble"
import Report from "../../components/report"
import SortableGrid from "../../components/sortable-grid"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"
import reportColumns from "../../libs/report-columns"

const AwardList = ({ awards }) => {
  const { profiles } = useContext(GlobalContext)
  if (profiles) {
    const columns = reportColumns(profiles.Award)
    return (
      <>
        <Breadcrumbs />
        <PagePreamble />
        {awards.length > 0 ? (
          <>
            <CollectionCount count={awards.length} />
            <Report>
              <SortableGrid data={awards} columns={columns} />
            </Report>
          </>
        ) : (
          <NoCollectionData />
        )}
      </>
    )
  }
  return null
}

AwardList.propTypes = {
  // Awards to display in the list
  awards: PropTypes.array.isRequired,
}

export default AwardList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const awards = await request.getCollection("awards")
  const breadcrumbs = await buildBreadcrumbs(awards, "title")
  return {
    props: {
      awards: awards["@graph"],
      pageContext: { title: awards.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}

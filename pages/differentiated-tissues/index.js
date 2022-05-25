// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  Collection,
  CollectionCount,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection"
import NoCollectionData from "../../components/no-collection-data"
import PagePreamble from "../../components/page-preamble"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const DifferentiatedTissueList = ({ differentiatedTissues }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {differentiatedTissues.length > 0 ? (
          <>
            <CollectionCount count={differentiatedTissues.length} />
            {differentiatedTissues.map((differentiatedTissue) => (
              <CollectionItem
                key={differentiatedTissue.uuid}
                href={differentiatedTissue["@id"]}
                label={`Differentiated Tissue ${differentiatedTissue.accession}`}
                status={differentiatedTissue.status}
              >
                <CollectionItemName>
                  {differentiatedTissue.accession}
                </CollectionItemName>
                {differentiatedTissue.organism && (
                  <div>{differentiatedTissue.organism}</div>
                )}
                {differentiatedTissue.nih_institutional_certification && (
                  <div>
                    {differentiatedTissue.nih_institutional_certification}
                  </div>
                )}
              </CollectionItem>
            ))}
          </>
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  )
}

DifferentiatedTissueList.propTypes = {
  // Differentiated tissue list to display
  differentiatedTissues: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default DifferentiatedTissueList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const differentiatedTissues = await request.getCollection(
    "differentiated-tissues"
  )
  const breadcrumbs = await buildBreadcrumbs(differentiatedTissues, "title")
  return {
    props: {
      differentiatedTissues: differentiatedTissues["@graph"],
      pageContext: { title: differentiatedTissues.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}

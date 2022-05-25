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

const DifferentiatedCellList = ({ differentiatedCells }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {differentiatedCells.length > 0 ? (
          <>
            <CollectionCount count={differentiatedCells.length} />
            {differentiatedCells.map((differentiatedCell) => (
              <CollectionItem
                key={differentiatedCell.uuid}
                href={differentiatedCell["@id"]}
                label={`Tissue ${differentiatedCell.accession}`}
                status={differentiatedCell.status}
              >
                <CollectionItemName>
                  {differentiatedCell.accession}
                </CollectionItemName>
                {differentiatedCell.organism && (
                  <div>{differentiatedCell.organism}</div>
                )}
                {differentiatedCell.nih_institutional_certification && (
                  <div>
                    {differentiatedCell.nih_institutional_certification}
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

DifferentiatedCellList.propTypes = {
  // Differentiated cells list to display
  differentiatedCells: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default DifferentiatedCellList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const differentiatedCells = await request.getCollection(
    "differentiated-cells"
  )
  const breadcrumbs = await buildBreadcrumbs(differentiatedCells, "title")
  return {
    props: {
      differentiatedCells: differentiatedCells["@graph"],
      pageContext: { title: differentiatedCells.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}

// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  Collection,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection"
import NoCollectionData from "../../components/no-collection-data"
import PagePreamble from "../../components/page-preamble"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const AwardList = ({ awards }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {awards.length > 0 ? (
          awards.map((award) => (
            <CollectionItem
              key={award.uuid}
              href={award["@id"]}
              label={`Award ${award.name}`}
            >
              <CollectionItemName>{award.name}</CollectionItemName>
              <div>{award.title}</div>
            </CollectionItem>
          ))
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  )
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
    },
  }
}

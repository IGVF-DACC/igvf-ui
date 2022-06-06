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

const AwardList = ({ awards, stuff = "nothing" }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {awards.length > 0 ? (
          <>
            <CollectionCount count={awards.length} />
            <div>{stuff}</div>
            {awards.map((award) => (
              <CollectionItem
                key={award.uuid}
                href={award["@id"]}
                label={`Award ${award.name}`}
                status={award.status}
              >
                <CollectionItemName>{award.name}</CollectionItemName>
                <div>{award.title}</div>
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

AwardList.propTypes = {
  // Awards to display in the list
  awards: PropTypes.array.isRequired,
  stuff: PropTypes.string,
}

export default AwardList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const awards = await request.getCollection("awards")
  const breadcrumbs = await buildBreadcrumbs(awards, "title")
  // const stuff = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_DOMAIN
  const stuff = "dummy"
  return {
    props: {
      awards: awards["@graph"],
      stuff,
      pageContext: { title: awards.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}

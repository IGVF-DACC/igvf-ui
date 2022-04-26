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

const LabList = ({ labs }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {labs.length > 0 ? (
          labs.map((lab) => (
            <CollectionItem
              key={lab.uuid}
              href={lab["@id"]}
              label={`Lab ${lab.title}`}
            >
              <CollectionItemName>{lab.title}</CollectionItemName>
              <div>{lab.institute_label}</div>
            </CollectionItem>
          ))
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  )
}

LabList.propTypes = {
  // Labs to display in the list
  labs: PropTypes.array.isRequired,
}

export default LabList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const labs = await request.getCollection("lab")
  const breadcrumbs = await buildBreadcrumbs(labs, "title")
  return {
    props: {
      labs: labs["@graph"],
      pageContext: { title: labs.title },
      breadcrumbs,
    },
  }
}

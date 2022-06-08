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

const AssayOntologyTermList = ({ assayOntologyTerms }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {assayOntologyTerms.length > 0 ? (
          <>
            <CollectionCount count={assayOntologyTerms.length} />
            {assayOntologyTerms.map((assayOntologyTerm) => (
              <CollectionItem
                key={assayOntologyTerm.uuid}
                href={assayOntologyTerm["@id"]}
                label={`Sample ontology term ${assayOntologyTerm.term_id}`}
                status={assayOntologyTerm.status}
              >
                <CollectionItemName>{assayOntologyTerm.term_id}</CollectionItemName>
                <div>{assayOntologyTerm.term_name}</div>
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

AssayOntologyTermList.propTypes = {
  // Assay ontology terms to display in the list
  assayOntologyTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default AssayOntologyTermList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const assayOntologyTerms = await request.getCollection("assay-ontology-terms")
  const breadcrumbs = await buildBreadcrumbs(assayOntologyTerms, "title")
  return {
    props: {
      assayOntologyTerms: assayOntologyTerms["@graph"],
      pageContext: { title: assayOntologyTerms.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}

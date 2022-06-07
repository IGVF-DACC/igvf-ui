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

const DiseaseOntologyTermList = ({ diseaseOntologyTerms }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {diseaseOntologyTerms.length > 0 ? (
          <>
            <CollectionCount count={diseaseOntologyTerms.length} />
            {diseaseOntologyTerms.map((diseaseOntologyTerm) => (
              <CollectionItem
                key={diseaseOntologyTerm.uuid}
                href={diseaseOntologyTerm["@id"]}
                label={`Sample ontology term ${diseaseOntologyTerm.term_id}`}
                status={diseaseOntologyTerm.status}
              >
                <CollectionItemName>
                  {diseaseOntologyTerm.term_id}
                </CollectionItemName>
                <div>{diseaseOntologyTerm.term_name}</div>
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

DiseaseOntologyTermList.propTypes = {
  // Disease ontology terms to display in the list
  diseaseOntologyTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default DiseaseOntologyTermList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const diseaseOntologyTerms = await request.getCollection(
    "disease-ontology-terms"
  )
  const breadcrumbs = await buildBreadcrumbs(diseaseOntologyTerms, "title")
  return {
    props: {
      diseaseOntologyTerms: diseaseOntologyTerms["@graph"],
      pageContext: { title: diseaseOntologyTerms.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}

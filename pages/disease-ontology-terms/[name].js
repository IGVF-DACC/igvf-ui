// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area"
import { OntologyTermDataItems } from "../../components/common-data-items"
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
// libs
import Request from "../../libs/request"
import buildBreadcrumbs from "../../libs/breadcrumbs"

const DiseaseOntologyTerm = ({ diseaseOntologyTerm }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataPanel>
        <DataArea>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={diseaseOntologyTerm.status} />
          </DataItemValue>
        </DataArea>
        <OntologyTermDataItems ontologyTerm={diseaseOntologyTerm} />
      </DataPanel>
    </>
  )
}

DiseaseOntologyTerm.propTypes = {
  // Disease ontology term object to display
  diseaseOntologyTerm: PropTypes.object.isRequired,
}

export default DiseaseOntologyTerm

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const diseaseOntologyTerm = await request.getObject(
    `/disease-ontology-terms//${params.name}/`
  )
  if (diseaseOntologyTerm && diseaseOntologyTerm.status !== "error") {
    const breadcrumbs = await buildBreadcrumbs(diseaseOntologyTerm, "term_id")
    return {
      props: {
        diseaseOntologyTerm,
        pageContext: { title: diseaseOntologyTerm.term_id },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
      },
    }
  }
  return { notFound: true }
}

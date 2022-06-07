// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import { OntologyTermDataItems } from "../../components/common-data-items"
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area"
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
// libs
import Request from "../../libs/request"
import buildBreadcrumbs from "../../libs/breadcrumbs"

const SampleOntologyTerm = ({ sampleOntologyTerm }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataPanel>
        <DataArea>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={sampleOntologyTerm.status} />
          </DataItemValue>
          <DataItemLabel>Term Name</DataItemLabel>
          <DataItemValue>{sampleOntologyTerm.term_name}</DataItemValue>
          <OntologyTermDataItems ontologyTerm={sampleOntologyTerm}>
            {sampleOntologyTerm.organ_slims.length > 0 && (
              <>
                <DataItemLabel>Organs</DataItemLabel>
                <DataItemValue>
                  {sampleOntologyTerm.organ_slims.join(", ")}
                </DataItemValue>
              </>
            )}
            {sampleOntologyTerm.cell_slims.length > 0 && (
              <>
                <DataItemLabel>Cells</DataItemLabel>
                <DataItemValue>
                  {sampleOntologyTerm.cell_slims.join(", ")}
                </DataItemValue>
              </>
            )}
            {sampleOntologyTerm.developmental_slims.length > 0 && (
              <>
                <DataItemLabel>Developmental Slims</DataItemLabel>
                <DataItemValue>
                  {sampleOntologyTerm.developmental_slims.join(", ")}
                </DataItemValue>
              </>
            )}
            {sampleOntologyTerm.system_slims.length > 0 && (
              <>
                <DataItemLabel>System Slims</DataItemLabel>
                <DataItemValue>
                  {sampleOntologyTerm.system_slims.join(", ")}
                </DataItemValue>
              </>
            )}
          </OntologyTermDataItems>
        </DataArea>
      </DataPanel>
    </>
  )
}

SampleOntologyTerm.propTypes = {
  // Data for lab displayed on the page
  sampleOntologyTerm: PropTypes.object.isRequired,
}

export default SampleOntologyTerm

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const sampleOntologyTerm = await request.getObject(
    `/sample-ontology-terms//${params.name}/`
  )
  console.log("ENV %s", process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_DOMAIN)
  if (sampleOntologyTerm && sampleOntologyTerm.status !== "error") {
    const breadcrumbs = await buildBreadcrumbs(sampleOntologyTerm, "term_id")
    return {
      props: {
        sampleOntologyTerm,
        pageContext: { title: sampleOntologyTerm.term_id },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
      },
    }
  }
  return { notFound: true }
}

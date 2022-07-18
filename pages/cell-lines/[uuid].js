// node_modules
import PropTypes from "prop-types"
// components
import Attribution from "../../components/attribution"
import Breadcrumbs from "../../components/breadcrumbs"
import { BiosampleDataItems } from "../../components/common-data-items"
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area"
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
import TreatmentTable from "../../components/treatment-table"
import { EditableItem } from "../../components/edit"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const CellLine = ({
  cellLine,
  award,
  donors,
  lab,
  source,
  treatments,
  biosampleTerm = null,
  diseaseTerm = null,
}) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={cellLine}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={cellLine.status} />
            </DataItemValue>
            <BiosampleDataItems
              biosample={cellLine}
              source={source}
              donors={donors}
              biosampleTerm={biosampleTerm}
              diseaseTerm={diseaseTerm}
              options={{
                dateObtainedTitle: "Date Harvested",
              }}
            >
              {cellLine.passage_number && (
                <>
                  <DataItemLabel>Passage Number</DataItemLabel>
                  <DataItemValue>{cellLine.passage_number}</DataItemValue>
                </>
              )}
            </BiosampleDataItems>
          </DataArea>
        </DataPanel>
        {treatments.length > 0 && (
          <>
            <DataAreaTitle>Treatments</DataAreaTitle>
            <TreatmentTable treatments={treatments} />
          </>
        )}
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  )
}

CellLine.propTypes = {
  // Cell-line sample to display
  cellLine: PropTypes.object.isRequired,
  // Donors associated with the tissue
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Award applied to this cell line
  award: PropTypes.object.isRequired,
  // Lab that submitted this cell line
  lab: PropTypes.object.isRequired,
  // Source lab or source for this cell line
  source: PropTypes.object.isRequired,
  // List of associated treatments
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample term for this cell line
  biosampleTerm: PropTypes.object,
  // Disease term for this cell line
  diseaseTerm: PropTypes.object,
}

export default CellLine

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const cellLine = await request.getObject(`/cell-lines/${params.uuid}/`)
  if (cellLine && cellLine.status !== "error") {
    const award = await request.getObject(cellLine.award)
    const donors = await request.getMultipleObjects(cellLine.donors)
    const lab = await request.getObject(cellLine.lab)
    const source = await request.getObject(cellLine.source)
    const treatments = await request.getMultipleObjects(cellLine.treatments)
    const biosampleTerm = cellLine.biosample_term
      ? await request.getObject(cellLine.biosample_term)
      : null
    const diseaseTerm = cellLine.disease_term
      ? await request.getObject(cellLine.disease_term)
      : null
    const breadcrumbs = await buildBreadcrumbs(cellLine, "accession")
    return {
      props: {
        cellLine,
        award,
        donors,
        lab,
        source,
        treatments,
        biosampleTerm,
        diseaseTerm,
        pageContext: { title: cellLine.accession },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
        uuid: params.uuid,
      },
    }
  }
  return { notFound: true }
}

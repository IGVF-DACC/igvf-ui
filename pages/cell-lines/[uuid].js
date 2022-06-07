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
import { EditLink } from '../../components/edit-func'
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
import TreatmentTable from "../../components/treatment-table"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const CellLine = ({ cellLine, award, donors, lab, source, treatments, uuid }) => {
  return (
    <>
      <Breadcrumbs />
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
      <EditLink path={`/cell-lines/${uuid}`} item={cellLine}/>
    </>
  )
}

CellLine.propTypes = {
  // Cell-line sample to display
  cellLine: PropTypes.object.isRequired,
  // Donors associated with the tissue
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Award applied to this technical sample
  award: PropTypes.object.isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.object.isRequired,
  // Source lab or source for this technical sample
  source: PropTypes.object.isRequired,
  // List of associated treatments
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // UUID of cell line
  uuid: PropTypes.string.isRequired,
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
    const breadcrumbs = await buildBreadcrumbs(cellLine, "accession")
    return {
      props: {
        cellLine,
        award,
        donors,
        lab,
        source,
        treatments,
        pageContext: { title: cellLine.accession },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
        uuid: params.uuid,
      },
    }
  }
  return { notFound: true }
}

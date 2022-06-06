// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataAreaTitle,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "../../components/data-area"
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
import TreatmentTable from "../../components/treatment-table"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import { formatDate } from "../../libs/dates"
import Request from "../../libs/request"
import { EditLink } from '../../components/edit-func'

const CellLine = ({ sample, award, lab, source, treatments, uuid }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataArea>
        <DataItem>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={sample.status} />
          </DataItemValue>
        </DataItem>
        {sample.organism && (
          <DataItem>
            <DataItemLabel>Organism</DataItemLabel>
            <DataItemValue>{sample.organism}</DataItemValue>
          </DataItem>
        )}
        {sample.biosample_ontology && (
          <DataItem>
            <DataItemLabel>Biosample</DataItemLabel>
            <DataItemValue>{sample.biosample_ontology}</DataItemValue>
          </DataItem>
        )}
        {sample.disease_ontology && (
          <DataItem>
            <DataItemLabel>Disease</DataItemLabel>
            <DataItemValue>{sample.disease_ontology}</DataItemValue>
          </DataItem>
        )}
        {sample.product_id && (
          <DataItem>
            <DataItemLabel>Product ID</DataItemLabel>
            <DataItemValue>{sample.product_id}</DataItemValue>
          </DataItem>
        )}
        {sample.lot_id && (
          <DataItem>
            <DataItemLabel>Lot ID</DataItemLabel>
            <DataItemValue>{sample.lot_id}</DataItemValue>
          </DataItem>
        )}
        {sample.date_obtained && (
          <DataItem>
            <DataItemLabel>Obtained</DataItemLabel>
            <DataItemValue>{formatDate(sample.date_obtained)}</DataItemValue>
          </DataItem>
        )}
        {sample.life_stage && (
          <DataItem>
            <DataItemLabel>Life Stage</DataItemLabel>
            <DataItemValue>{sample.life_stage}</DataItemValue>
          </DataItem>
        )}
        {sample.age && (
          <DataItem>
            <DataItemLabel>Age</DataItemLabel>
            <DataItemValue>
              {sample.age}
              {sample.age_units ? (
                <>
                  {" "}
                  {sample.age_units}
                  {sample.age !== 1 ? "s" : ""}
                </>
              ) : (
                ""
              )}
            </DataItemValue>
          </DataItem>
        )}
        {sample.starting_amount && (
          <DataItem>
            <DataItemLabel>Starting Amount</DataItemLabel>
            <DataItemValue>
              {sample.starting_amount}
              {sample.starting_amount_units ? (
                <> {sample.starting_amount_units}</>
              ) : (
                ""
              )}
            </DataItemValue>
          </DataItem>
        )}
      </DataArea>
      <DataAreaTitle>Attribution</DataAreaTitle>
      <DataArea>
        <DataItem>
          <DataItemLabel>Award</DataItemLabel>
          <DataItemValue>
            <Link href={award["@id"]}>
              <a>{award.name}</a>
            </Link>
          </DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Lab</DataItemLabel>
          <DataItemValue>
            <Link href={lab["@id"]}>
              <a>{lab.title}</a>
            </Link>
          </DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Source</DataItemLabel>
          <DataItemValue>
            <Link href={source["@id"]}>
              <a>{lab.title}</a>
            </Link>
          </DataItemValue>
        </DataItem>
        {sample.url && (
          <DataItem>
            <DataItemValue>
              <a href={sample.url} target="_blank" rel="noreferrer">
                Additional Information
              </a>
            </DataItemValue>
          </DataItem>
        )}
      </DataArea>
      {treatments.length > 0 && (
        <>
          <DataAreaTitle>Treatments</DataAreaTitle>
          <TreatmentTable treatments={treatments} />
        </>
      )}
      <EditLink path={`/cell-lines/${uuid}`} item={sample}/>
    </>
  )
}

CellLine.propTypes = {
  // Technical sample to display
  sample: PropTypes.object.isRequired,
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
  const sample = await request.getObject(`/cell-lines/${params.uuid}/`)
  if (sample && sample.status !== "error") {
    const award = await request.getObject(sample.award)
    const lab = await request.getObject(sample.lab)
    const source = await request.getObject(sample.source)
    const treatments = await request.getMultipleObjects(sample.treatments)
    const breadcrumbs = await buildBreadcrumbs(sample, "accession")
    return {
      props: {
        sample,
        award,
        lab,
        source,
        treatments,
        pageContext: { title: sample.accession },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
        uuid: params.uuid,
      },
    }
  }
  return { notFound: true }
}

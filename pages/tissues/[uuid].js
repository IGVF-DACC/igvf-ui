// node_modules
import Link from "next/link"
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
import { DataGridContainer } from "../../components/data-grid"
import PagePreamble from "../../components/page-preamble"
import SortableGrid from "../../components/sortable-grid"
import Status from "../../components/status"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const treatmentColumns = [
  {
    id: "treatment_term_id",
    title: "Term ID",
    display: ({ source: treatment }) => {
      return (
        <Link href={treatment["@id"]}>
          <a>{treatment.treatment_term_id}</a>
        </Link>
      )
    },
  },
  {
    id: "treatment_term_name",
    title: "Term Name",
  },
  {
    id: "treatment_type",
    title: "Type",
  },
  {
    id: "purpose",
    title: "Purpose",
  },
]

const Tissue = ({ tissue, donors, award, lab, source, treatments }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataPanel>
        <DataArea>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={tissue.status} />
          </DataItemValue>
          <BiosampleDataItems
            biosample={tissue}
            source={source}
            donors={donors}
            options={{
              dateObtainedTitle: "Date Harvested",
            }}
          />
          {tissue.pmi && (
            <>
              <DataItemLabel>Post-mortem Interval</DataItemLabel>
              <DataItemValue>
                {tissue.pmi}
                {tissue.pmi_units ? (
                  <>
                    {" "}
                    {tissue.pmi_units}
                    {tissue.pmi_units === 1 ? "" : "s"}
                  </>
                ) : (
                  ""
                )}
              </DataItemValue>
            </>
          )}
          {tissue.preservation_method && (
            <>
              <DataItemLabel>Preservation Method</DataItemLabel>
              <DataItemValue>{tissue.preservation_method}</DataItemValue>
            </>
          )}
        </DataArea>
      </DataPanel>
      {treatments.length > 0 && (
        <>
          <DataAreaTitle>Treatments</DataAreaTitle>
          <DataGridContainer>
            <SortableGrid data={treatments} columns={treatmentColumns} />
          </DataGridContainer>
        </>
      )}
      <Attribution award={award} lab={lab} />
    </>
  )
}

Tissue.propTypes = {
  // Technical treatment to display
  tissue: PropTypes.object.isRequired,
  // Donors associated with the tissue
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Award applied to this technical sample
  award: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  // Source lab or source for this technical sample
  source: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  // Treatments associated with the tissue
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default Tissue

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const tissue = await request.getObject(`/tissues/${params.uuid}/`)
  if (tissue && tissue.status !== "error") {
    const award = await request.getObject(tissue.award)
    const donors = await request.getMultipleObjects(tissue.donors)
    const lab = await request.getObject(tissue.lab)
    const source = await request.getObject(tissue.source)
    const treatments = await request.getMultipleObjects(tissue.treatments)
    const breadcrumbs = await buildBreadcrumbs(tissue, "accession")
    return {
      props: {
        tissue,
        award,
        donors,
        lab,
        source,
        treatments,
        pageContext: { title: tissue.accession },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
      },
    }
  }
  return { notFound: true }
}

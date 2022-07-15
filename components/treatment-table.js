// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import { DataGridContainer } from "./data-grid"
import SortableGrid from "./sortable-grid"

const treatmentColumns = [
  {
    id: "treatment_term_id",
    title: "Term ID",
    display: ({ source }) => {
      return (
        <Link href={source["@id"]}>
          <a>{source.treatment_term_id}</a>
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
  {
    id: "amount",
    title: "Amount",
    display: ({ source }) => `${source.amount} ${source.amount_units}`,
  },
  {
    id: "duration",
    title: "Duration",
    display: ({ source }) =>
      source.duration !== undefined
        ? `${source.duration} ${source.duration_units}${
            source.duration !== 1 ? "s" : ""
          }`
        : "",
  },
]

/**
 * Display a sortable table of the given treatments.
 */
const TreatmentTable = ({ treatments }) => {
  return (
    <DataGridContainer>
      <SortableGrid
        data={treatments}
        columns={treatmentColumns}
        keyProp="treatment_term_id"
      />
    </DataGridContainer>
  )
}

TreatmentTable.propTypes = {
  // Treatments to display
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default TreatmentTable

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";

const relatedDonorsColumns = [
  {
    id: "related_donor_id",
    title: "Donor",
    display: ({ source }) => {
      return <Link href={source.donor}>{source.donor.substring(14, 28)}</Link>;
    },
  },
  {
    id: "relationship_type",
    title: "Relationship Type",
    display: ({ source }) => source.relationship_type,
  },
];

/**
 * Display a sortable table of the given donors.
 */
export default function RelatedDonorsTable({ relatedDonors }) {
  return (
    <DataGridContainer>
      <SortableGrid
        data={relatedDonors}
        columns={relatedDonorsColumns}
        keyProp="@id"
      />
    </DataGridContainer>
  );
}

RelatedDonorsTable.propTypes = {
  // Related donors to display
  relatedDonors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import SortableGrid from "./sortable-grid";

const relatedDonorsColumns = [
  {
    id: "related_donor_id",
    title: "Donor",
    display: ({ source }) => {
      return <Link href={source.donor["@id"]}>{source.donor.accession}</Link>;
    },
    sorter: (item) => item.donor.accession,
  },
  {
    id: "relationship_type",
    title: "Relationship Type",
  },
];

/**
 * Display a sortable table of the given donors.
 */
export default function RelatedDonorsTable({
  relatedDonors,
  title = "Related Donors",
}) {
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SortableGrid
        data={relatedDonors}
        columns={relatedDonorsColumns}
        pager={{}}
      />
    </>
  );
}

RelatedDonorsTable.propTypes = {
  // Related donors to display
  relatedDonors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title of the table if not "Related Donors"
  title: PropTypes.string,
};

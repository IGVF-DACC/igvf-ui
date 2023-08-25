// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components
import { DataGridContainer } from "./data-grid";
import SortableGrid from "./sortable-grid";
import SeparatedList from "./separated-list";

/**
 * Columns for multiplexed_samples
 */
const multiplexedColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => {
      return <Link href={source["@id"]}>{source.accession}</Link>;
    },
  },
  {
    id: "type",
    title: "Type",
    display: ({ source }) => source["@type"][0],
  },
  {
    id: "sample_terms",
    title: "Sample Terms",
    display: ({ source }) => {
      const termId = source.sample_terms
        ?.map((sample) => sample.term_name)
        .join(", ");
      return <>{termId}</>;
    },
  },
  {
    id: "summary",
    title: "Summary",
  },
  {
    id: "disease_terms",
    title: "Disease Terms",
    display: ({ source }) => {
      const termId = source.disease_terms
        ?.map((sample) => sample.term_name)
        .join(", ");
      return <>{termId}</>;
    },
  },
  {
    id: "donors",
    title: "Donors",
    display: ({ source }) => {
      if (source.donors) {
        return (
          <SeparatedList>
            {source.donors?.map((donor) => (
              <Link href={donor["@id"]} key={donor["@id"]}>
                {donor.accession}
              </Link>
            ))}
          </SeparatedList>
        );
      }
    },
  },
  {
    id: "status",
    title: "Status",
  },
];

/**
 * Display a sortable table of the given multiplexed_samples.
 */
export default function MultiplexedTable({ multiplexedSamples }) {
  return (
    <DataGridContainer>
      <SortableGrid
        data={multiplexedSamples}
        columns={multiplexedColumns}
        keyProp="@id"
      />
    </DataGridContainer>
  );
}

MultiplexedTable.propTypes = {
  // MultiplexedSamples to display
  multiplexedSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
};

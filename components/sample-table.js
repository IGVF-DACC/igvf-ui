// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SeparatedList from "./separated-list";
import SessionContext from "./session-context";
import SortableGrid from "./sortable-grid";

/**
 * Columns for samples
 */
const sampleColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => {
      return (
        <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
      );
    },
  },
  {
    id: "type",
    title: "Type",
    display: ({ source, meta }) => {
      const title = meta.collectionTitles
        ? meta.collectionTitles[source["@type"][0]]
        : "";
      return title || source["@type"][0];
    },
    sorter: (item) => item["@type"][0],
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
    isSortable: false,
  },
  {
    id: "summary",
    title: "Summary",
    isSortable: false,
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
    id: "construct_library_sets",
    title: "Construct Library Set",
    display: ({ source, meta }) => {
      if (source.construct_library_sets?.length > 0) {
        return (
          <SeparatedList isCollapsible>
            {source.construct_library_sets.map((id) => {
              if (meta.constructLibrarySets) {
                const matchingConstructLibrarySet =
                  meta.constructLibrarySets.find((lib) => lib["@id"] === id);

                return matchingConstructLibrarySet ? (
                  <Link href={id} key={id}>
                    {matchingConstructLibrarySet.accession}
                  </Link>
                ) : (
                  <>{id}</>
                );
              }
              return (
                <Link href={id} key={id}>
                  {id}
                </Link>
              );
            })}
          </SeparatedList>
        );
      }
      return null;
    },
  },
  {
    id: "donors",
    title: "Donors",
    display: ({ source }) => {
      if (source.donors) {
        return (
          <SeparatedList isCollapsible>
            {source.donors.map((donor) => (
              <Link href={donor["@id"]} key={donor["@id"]}>
                {donor.accession}
              </Link>
            ))}
          </SeparatedList>
        );
      }
      return null;
    },
    isSortable: false,
  },
];

/**
 * Display a sortable table of the given sample objects.
 */
export default function SampleTable({
  samples,
  reportLink = null,
  constructLibrarySets = null,
  title = "Samples",
}) {
  const { collectionTitles } = useContext(SessionContext);

  return (
    <>
      <DataAreaTitle>
        {title}
        <DataAreaTitleLink
          href={reportLink}
          label="Report of multiplexed samples that have this item as their multiplexed sample"
        >
          <TableCellsIcon className="h-4 w-4" />
        </DataAreaTitleLink>
      </DataAreaTitle>
      <SortableGrid
        data={samples}
        columns={sampleColumns}
        keyProp="@id"
        meta={{ constructLibrarySets, collectionTitles }}
        pager={{}}
      />
    </>
  );
}

SampleTable.propTypes = {
  // Samples to display
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to the report page containing the same samples as this table
  reportLink: PropTypes.string,
  // The construct libraries of the parent object
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object),
  // Title of the table if not "Samples"
  title: PropTypes.string,
};

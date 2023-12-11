// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components
import PagedDataGrid from "./paged-data-grid";
import SeparatedList from "./separated-list";
import SortableGrid from "./sortable-grid";
import Status from "./status";

/**
 * Columns for samples
 */
const sampleColumns = [
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
    display: ({ source }, { constructLibrarySetAccessions }) => {
      if (
        source.construct_library_sets &&
        source.construct_library_sets.length > 0
      ) {
        return (
          <SeparatedList>
            {source.construct_library_sets.map((id) => {
              if (constructLibrarySetAccessions) {
                const accession = constructLibrarySetAccessions.find(
                  (lib) => lib["@id"] === id
                )?.accession;

                return accession ? (
                  <Link href={id} key={id}>
                    {accession}
                  </Link>
                ) : null;
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
          <SeparatedList>
            {source.donors.map((donor) => (
              <Link href={donor["@id"]} key={donor["@id"]}>
                {donor.accession}
              </Link>
            ))}
          </SeparatedList>
        );
      }
    },
    isSortable: false,
  },
  {
    id: "status",
    title: "Status",
    display: ({ source }) => {
      return <Status status={source.status} />;
    },
  },
];

/**
 * Display a sortable table of the given multiplexed_samples.
 */
export default function SampleTable({
  samples,
  constructLibrarySetAccessions = null,
}) {
  return (
    <PagedDataGrid data={samples}>
      {(pageSamples) => {
        return (
          <SortableGrid
            data={pageSamples}
            columns={sampleColumns}
            meta={{ constructLibrarySetAccessions }}
            keyProp="@id"
          />
        );
      }}
    </PagedDataGrid>
  );
}

SampleTable.propTypes = {
  // Samples to display
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // The construct libraries of the parent object
  constructLibrarySetAccessions: PropTypes.arrayOf(PropTypes.object),
};

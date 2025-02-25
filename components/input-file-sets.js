// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import PropTypes from "prop-types";
import { useContext, useState } from "react";
// components
import AliasList from "./alias-list";
import Checkbox from "./checkbox";
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import LinkedIdAndStatusStack from "./linked-id-and-status-stack";
import SessionContext from "./session-context";
import SortableGrid from "./sortable-grid";
// lib
import { toShishkebabCase } from "../lib/general";

/**
 * Columns for the measurement sets input file sets table.
 */
const measurementSetColumns = [
  {
    id: "measurement-sets",
    title: "Measurement Sets",
    display: ({ source }) => {
      return (
        <div>
          <LinkedIdAndStatus item={source}>
            {source.accession}
          </LinkedIdAndStatus>
          {source.summary}
        </div>
      );
    },
    sorter: (item) => item.summary.toLowerCase(),
  },

  {
    id: "aliases",
    title: "Measurement Set Aliases",
    display: ({ source }) => <AliasesDisplay fileSet={source} />,
    isSortable: false,
    hide: (data, columns, meta) => !meta.isAliasesVisible,
  },

  {
    id: "samples",
    title: "Measured Samples",
    display: ({ source, meta }) => (
      <SamplesDisplay fileSet={source} samples={meta.samples} />
    ),
    sorter: (item, meta) => samplesSorter(item, meta.samples),
  },

  {
    id: "sample-aliases",
    title: "Sample Aliases",
    display: ({ source }) => <SampleAliasesDisplay samples={source.samples} />,
    isSortable: false,
    hide: (data, columns, meta) => !meta.isAliasesVisible,
  },

  {
    id: "control-file-sets",
    title: "Controls",
    display: ({ source, meta }) => (
      <FileSetsDisplay
        fileSet={source}
        embeddedFileSets={meta.controlFileSets}
        fileSetProperty="control_file_sets"
      />
    ),
    hide: (measurementSets) =>
      columnHideCondition(measurementSets, "control_file_sets"),
    isSortable: false,
  },

  {
    id: "auxiliary-sets",
    title: "Associated Auxiliary Sets",
    display: ({ source, meta }) => (
      <FileSetsDisplay
        fileSet={source}
        embeddedFileSets={meta.auxiliarySets}
        fileSetProperty="auxiliary_sets"
      />
    ),
    hide: (measurementSets) =>
      columnHideCondition(measurementSets, "auxiliary_sets"),
    isSortable: false,
  },
];

/**
 * Columns for the auxiliary sets input file sets table.
 */
const auxiliarySetColumns = [
  {
    id: "auxiliary-sets",
    title: "Auxiliary Sets",
    display: ({ source }) => {
      return (
        <div>
          <LinkedIdAndStatus item={source}>
            {source.accession}
          </LinkedIdAndStatus>
          {source.summary}
        </div>
      );
    },
    sorter: (item) => item.summary.toLowerCase(),
  },

  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesDisplay fileSet={source} />,
    isSortable: false,
    hide: (data, columns, meta) => !meta.isAliasesVisible,
  },

  {
    id: "samples",
    title: "Measured Samples",
    display: ({ source, meta }) => (
      <SamplesDisplay fileSet={source} samples={meta.samples} />
    ),
    hide: (auxiliarySets) => columnHideCondition(auxiliarySets, "samples"),
    sorter: (item, meta) => samplesSorter(item, meta.samples),
  },

  {
    id: "sample-aliases",
    title: "Sample Aliases",
    display: ({ source }) => <SampleAliasesDisplay samples={source.samples} />,
    isSortable: false,
    hide: (data, columns, meta) => !meta.isAliasesVisible,
  },

  {
    id: "measurement-sets",
    title: "Associated Measurement Sets",
    display: ({ source, meta }) => (
      <FileSetsDisplay
        fileSet={source}
        embeddedFileSets={meta.measurementSets}
        fileSetProperty="measurement_sets"
      />
    ),
    hide: (auxiliarySets) =>
      columnHideCondition(auxiliarySets, "measurement_sets"),
    isSortable: false,
  },
];

/**
 * Columns for the construct library sets input file sets table.
 */
const constructLibrarySetColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => {
      return (
        <div>
          <LinkedIdAndStatus item={source}>
            {source.accession}
          </LinkedIdAndStatus>
          {source.summary}
        </div>
      );
    },
    sorter: (item) => item.accession,
  },
  {
    id: "applied-to-samples",
    title: "Applied To Samples",
    display: ({ source, meta }) => {
      return (
        <SamplesDisplay
          fileSet={source}
          samples={meta.appliedToSamples}
          propertyName="applied_to_samples"
        />
      );
    },
    hide: (constructLibrarySets) =>
      columnHideCondition(constructLibrarySets, "applied_to_samples"),
    sorter: (item) => item.summary.toLowerCase(),
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesDisplay fileSet={source} />,
    isSortable: false,
    hide: (data, columns, meta) => !meta.isAliasesVisible,
  },
];

/**
 * Columns for a basic input file sets table.
 */
const basicColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => {
      return (
        <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
      );
    },
    sorter: (item) => item.accession,
  },
  {
    id: "summary",
    title: "Summary",
    display: ({ source }) => source.summary,
    sorter: (item) => item.summary,
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => {
      return source.aliases?.length > 0 ? (
        <AliasList aliases={source.aliases} />
      ) : null;
    },
    hide: (data, columns, meta) => !meta.isAliasesVisible,
    isSortable: false,
  },
];

/**
 * Input file set table sort order by type. When adding new file-set types, add them to this array
 * in the order that the `input_file_set` tables should appear on the page.
 */
const fileSetSortOrder = [
  "MeasurementSet",
  "AnalysisSet",
  "AuxiliarySet",
  "ConstructLibrarySet",
  "PredictionSet",
  "ModelSet",
  "CuratedSet",
];

/**
 * Map of file-set types to their table configuration. When adding new file-set types, add their
 * object @type to this map as well as the corresponding column configuration.
 */
const inputFileSetDisplayConfig = {
  AnalysisSet: basicColumns,
  AuxiliarySet: auxiliarySetColumns,
  ConstructLibrarySet: constructLibrarySetColumns,
  CuratedSet: basicColumns,
  MeasurementSet: measurementSetColumns,
  ModelSet: basicColumns,
  PredictionSet: basicColumns,
};

/**
 * Display the samples of a file set in a table cell, each with links to their pages as well as
 * their statuses.
 */
function SamplesDisplay({ fileSet, samples, propertyName = "samples" }) {
  // The embedded samples in a file set don't have enough properties to display in the table. Find
  // the corresponding samples in the meta.samples array so we have all the properties we need for
  // the table.
  const samplePaths =
    fileSet[propertyName]?.map((sample) => sample["@id"]) || [];
  let displayedSamples = samples.filter((sample) =>
    samplePaths.includes(sample["@id"])
  );

  // Sort the samples within a cell by their accessions.
  displayedSamples = _.sortBy(displayedSamples, (sample) => sample.accession);

  return (
    <div>
      {displayedSamples.map((sample) => (
        <div key={sample["@id"]} className="my-5 first:mt-0 last:mb-0">
          <LinkedIdAndStatus item={sample}>
            {sample.accession}
          </LinkedIdAndStatus>
          {sample.summary}
        </div>
      ))}
    </div>
  );
}

SamplesDisplay.propTypes = {
  // File set containing the partial samples objects to display
  fileSet: PropTypes.object.isRequired,
  // Full sample objects including those belonging to the file set
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Property of the file set that contains the partial sample objects, if not `samples`
  propertyName: PropTypes.string,
};

/**
 * Use as the sorting function for the column of samples.
 */
function samplesSorter(fileSet, samples) {
  // Sort by the summaries of the samples, each combined into a single string.
  const samplePaths = fileSet.samples?.map((sample) => sample["@id"]) || [];
  const measurementSetSamples = samples.filter((sample) =>
    samplePaths.includes(sample["@id"])
  );
  const sampleSummaries = measurementSetSamples.map((sample) =>
    sample.summary.toLowerCase()
  );

  // If there are no samples, return a string that will sort to the end.
  return sampleSummaries.length > 0 ? sampleSummaries.sort().join() : "zzzzzz";
}

/**
 * Check if any of the given objects has a value for the given property. If none of them have the
 * property, this function returns true to indicate the column should be hidden.
 * @param {object[]} data All objects for each row of a table
 * @param {string} propertyName Name of the property of `data` to check for existence
 * @returns {boolean} True if none of the data objects include the property `propertyName`
 */
function columnHideCondition(data, propertyName) {
  const embeddedData = data.reduce((acc, datum) => {
    const property = datum[propertyName];
    return property?.length > 0 ? acc.concat(property) : acc;
  }, []);
  return embeddedData.length === 0;
}

/**
 * Display the file sets of a file set in a table cell, with links to their pages as well as their
 * statuses.
 */
function FileSetsDisplay({ fileSet, embeddedFileSets, fileSetProperty }) {
  if (fileSet[fileSetProperty]?.length > 0) {
    // The embedded file sets in the given file set don't have enough properties to display in the
    // table. Find the corresponding full file-set objects in meta.controlFileSets so that we have
    // all the properties we need for the table.
    const fileSetPaths = fileSet[fileSetProperty].map(
      (controlSet) => controlSet["@id"]
    );
    const displayedFileSets = embeddedFileSets.filter((controlSet) =>
      fileSetPaths.includes(controlSet["@id"])
    );

    if (displayedFileSets.length > 0) {
      return (
        <LinkedIdAndStatusStack items={displayedFileSets}>
          {(controlSet) => controlSet.accession}
        </LinkedIdAndStatusStack>
      );
    }
  }
  return null;
}

FileSetsDisplay.propTypes = {
  // File set with the file sets to display
  fileSet: PropTypes.object.isRequired,
  // file sets including those belonging to the file set
  embeddedFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // The property of the file set that contains the file sets to display
  fileSetProperty: PropTypes.string.isRequired,
};

/**
 * Display the aliases of all samples in a file set in a table cell.
 */
function SampleAliasesDisplay({ samples = [] }) {
  const allSamplesAliases = samples.reduce((acc, sample) => {
    return sample.aliases?.length > 0 ? acc.concat(sample.aliases) : acc;
  }, []);

  return allSamplesAliases.length > 0 ? (
    <div className="min-w-32">
      <AliasList aliases={allSamplesAliases} />
    </div>
  ) : null;
}

SampleAliasesDisplay.propTypes = {
  // Samples that possibly include aliases
  samples: PropTypes.arrayOf(PropTypes.object),
};

/**
 * Display the aliases of a file set in a table cell.
 */
function AliasesDisplay({ fileSet }) {
  return fileSet.aliases?.length > 0 ? (
    <div className="min-w-32">
      <AliasList aliases={fileSet.aliases} />
    </div>
  ) : null;
}

AliasesDisplay.propTypes = {
  // File set with the aliases to display
  fileSet: PropTypes.object.isRequired,
};

/**
 * Displays a single input file sets table of any file-set type.
 */
function InputFileSetTable({
  fileSetType,
  fileSets,
  samples,
  controlFileSets,
  appliedToSamples,
  auxiliarySets,
  measurementSets,
  constructLibrarySets,
  reportLink,
  panelId = "input-file-sets",
}) {
  const { collectionTitles } = useContext(SessionContext);
  const title = collectionTitles?.[fileSetType] || fileSetType;
  const composedTitle = `${title} Input File Sets`;

  // True if the Aliases columns are visible.
  const [isAliasesVisible, setIsAliasesVisible] = useState(false);

  return (
    <>
      <DataAreaTitle id={panelId} secDirTitle={composedTitle}>
        {composedTitle}
        <div className="flex gap-1">
          <Checkbox
            id={`show-aliases-${fileSetType}`}
            checked={isAliasesVisible}
            name={`Show aliases columns for ${title}`}
            onClick={() => setIsAliasesVisible(!isAliasesVisible)}
            className="items-center [&>input]:mr-0"
          >
            <div className="order-first mr-1 text-sm">Show aliases columns</div>
          </Checkbox>
          <DataAreaTitleLink
            href={reportLink}
            label={`Report of ${fileSetType} input file sets`}
          >
            <TableCellsIcon className="h-4 w-4" />
          </DataAreaTitleLink>
        </div>
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={fileSets}
          columns={inputFileSetDisplayConfig[fileSetType] || basicColumns}
          keyProp="@id"
          pager={{}}
          meta={{
            samples,
            isAliasesVisible,
            controlFileSets,
            appliedToSamples,
            auxiliarySets,
            measurementSets,
            constructLibrarySets,
          }}
        />
      </div>
    </>
  );
}

InputFileSetTable.propTypes = {
  // Type of the file sets
  fileSetType: PropTypes.string.isRequired,
  // File sets to display
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples belonging to the file sets
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Control file sets belonging to the file sets
  controlFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Applied-to samples belonging to the file sets
  appliedToSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Auxiliary sets belonging to the file sets
  auxiliarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Measurement sets belonging to the file sets
  measurementSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Construct library sets belonging to the file sets
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Link to the report page containing the same file sets as this table
  reportLink: PropTypes.string,
  // ID of the panel containing this table for the section directory
  panelId: PropTypes.string,
};

/**
 * Display each of the types of input file sets in separate tables.
 */
export default function InputFileSets({
  thisFileSet,
  fileSets,
  samples,
  controlFileSets,
  appliedToSamples,
  auxiliarySets,
  measurementSets,
  constructLibrarySets,
}) {
  // Group the input file sets by their type and sort the groups by the order in `fileSetSortOrder`.
  const fileSetGroups = _.groupBy(fileSets, "@type[0]");
  const fileSetTypes = _.sortBy(Object.keys(fileSetGroups), (fileSetType) =>
    fileSetSortOrder.indexOf(fileSetType)
  );

  return (
    <>
      {fileSetTypes.map((fileSetType) => {
        const fileSets = fileSetGroups[fileSetType];
        return (
          <InputFileSetTable
            key={fileSetType}
            fileSetType={fileSetType}
            fileSets={fileSets}
            samples={samples}
            controlFileSets={controlFileSets}
            appliedToSamples={appliedToSamples}
            auxiliarySets={auxiliarySets}
            measurementSets={measurementSets}
            constructLibrarySets={constructLibrarySets}
            reportLink={`/multireport/?type=${fileSetType}&input_for=${thisFileSet["@id"]}`}
            panelId={toShishkebabCase(fileSetType)}
          />
        );
      })}
    </>
  );
}

InputFileSets.propTypes = {
  // The file set this page displays
  thisFileSet: PropTypes.object.isRequired,
  // File sets to display
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples belonging to the file sets
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Control file sets belonging to the file sets
  controlFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Applied-to samples belonging to the file sets
  appliedToSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Auxiliary sets belonging to the file sets
  auxiliarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Measurement sets belonging to the file sets
  measurementSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Construct library sets belonging to the file sets
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
};

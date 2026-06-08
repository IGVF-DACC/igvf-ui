// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
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
import { isDatabaseObjectArrayOfType } from "../lib/database-object";
import {
  type AuxiliarySetObject,
  type ConstructLibrarySetObject,
  type FileSetObject,
  type FileSetObjectType,
  type FileSetTypeMap,
  type MeasurementSetObject,
} from "../lib/file-sets";
import { toShishkebabCase } from "../lib/general";
import { type SampleObject } from "../lib/samples";
import { type SortableGridConfig } from "./sortable-grid";

/**
 * Meta information for the input file sets tables.
 *
 * @property samples - Full sample objects for the samples belonging to the file sets.
 * @property isAliasesVisible - True if the Aliases columns are visible.
 * @property controlFileSets - Full file set objects for the control file sets belonging to the
 *                             file sets.
 * @property auxiliarySets - Full file set objects for the auxiliary sets belonging to the file
 *                           sets.
 * @property measurementSets - Full file set objects for the measurement sets belonging to the file
 *                             sets.
 * @property constructLibrarySets - Full file set objects for the construct library sets belonging
 *                                  to the file sets.
 */
type InputFileSetTableMeta = {
  samples: SampleObject[];
  isAliasesVisible: boolean;
  controlFileSets: FileSetObject[];
  auxiliarySets: FileSetObject[];
  measurementSets: FileSetObject[];
  constructLibrarySets: FileSetObject[];
};

/**
 * Columns for the measurement sets input file sets table.
 */
const measurementSetColumns: SortableGridConfig<
  MeasurementSetObject,
  InputFileSetTableMeta
>[] = [
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
    hide: (data, columns, meta) => (meta ? !meta.isAliasesVisible : true),
  },

  {
    id: "samples",
    title: "Measured Samples",
    display: ({ source, meta }) => (
      <SamplesDisplay fileSet={source} samples={meta ? meta.samples : []} />
    ),
    sorter: (item, meta) => samplesSorter(item, meta ? meta.samples : []),
  },

  {
    id: "sample-aliases",
    title: "Sample Aliases",
    display: ({ source }) =>
      isDatabaseObjectArrayOfType(source.samples, "Sample") ? (
        <SampleAliasesDisplay samples={source.samples} />
      ) : null,
    isSortable: false,
    hide: (data, columns, meta) => (meta ? !meta.isAliasesVisible : true),
  },

  {
    id: "control-file-sets",
    title: "Controls",
    display: ({ source, meta }) =>
      meta &&
      isDatabaseObjectArrayOfType(source.control_file_sets, "FileSet") ? (
        <FileSetsDisplay
          fileSet={source}
          embeddedFileSets={meta.controlFileSets}
          fileSetProperty="control_file_sets"
        />
      ) : null,
    hide: (measurementSets) =>
      columnHideCondition(measurementSets, "control_file_sets"),
    isSortable: false,
  },

  {
    id: "auxiliary-sets",
    title: "Associated Auxiliary Sets",
    display: ({ source, meta }) =>
      meta && isDatabaseObjectArrayOfType(source.auxiliary_sets, "FileSet") ? (
        <FileSetsDisplay
          fileSet={source}
          embeddedFileSets={meta.auxiliarySets}
          fileSetProperty="auxiliary_sets"
        />
      ) : null,
    hide: (measurementSets) =>
      columnHideCondition(measurementSets, "auxiliary_sets"),
    isSortable: false,
  },
];

/**
 * Columns for the auxiliary sets input file sets table.
 */
const auxiliarySetColumns: SortableGridConfig<
  AuxiliarySetObject,
  InputFileSetTableMeta
>[] = [
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
    hide: (data, columns, meta) => (meta ? !meta.isAliasesVisible : true),
  },

  {
    id: "samples",
    title: "Measured Samples",
    display: ({ source, meta }) => (
      <SamplesDisplay fileSet={source} samples={meta ? meta.samples : []} />
    ),
    hide: (auxiliarySets) => columnHideCondition(auxiliarySets, "samples"),
    sorter: (item, meta) => samplesSorter(item, meta ? meta.samples : []),
  },

  {
    id: "sample-aliases",
    title: "Sample Aliases",
    display: ({ source }) =>
      isDatabaseObjectArrayOfType(source.samples, "Sample") ? (
        <SampleAliasesDisplay samples={source.samples} />
      ) : null,
    isSortable: false,
    hide: (data, columns, meta) => (meta ? !meta.isAliasesVisible : true),
  },

  {
    id: "measurement-sets",
    title: "Associated Measurement Sets",
    display: ({ source, meta }) =>
      meta &&
      isDatabaseObjectArrayOfType(source.measurement_sets, "FileSet") ? (
        <FileSetsDisplay
          fileSet={source}
          embeddedFileSets={meta.measurementSets}
          fileSetProperty="measurement_sets"
        />
      ) : null,
    hide: (auxiliarySets) =>
      columnHideCondition(auxiliarySets, "measurement_sets"),
    isSortable: false,
  },
];

/**
 * Columns for the construct library sets input file sets table.
 */
const constructLibrarySetColumns: SortableGridConfig<
  ConstructLibrarySetObject,
  InputFileSetTableMeta
>[] = [
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
    sorter: (item) => String(item.accession).toLowerCase(),
  },
  {
    id: "samples",
    title: "Samples",
    display: ({ source, meta }) => {
      return (
        <SamplesDisplay
          fileSet={source}
          samples={meta ? meta.samples : []}
          propertyName="samples"
        />
      );
    },
    hide: (constructLibrarySets) =>
      columnHideCondition(constructLibrarySets, "samples"),
    sorter: (item, meta) => samplesSorter(item, meta ? meta.samples : []),
  },
  {
    id: "aliases",
    title: "Aliases",
    display: ({ source }) => <AliasesDisplay fileSet={source} />,
    isSortable: false,
    hide: (data, columns, meta) => (meta ? !meta.isAliasesVisible : true),
  },
];

/**
 * Columns for a basic input file sets table.
 */
const basicColumns: SortableGridConfig<FileSetObject, InputFileSetTableMeta>[] =
  [
    {
      id: "accession",
      title: "Accession",
      display: ({ source }) => {
        return (
          <LinkedIdAndStatus item={source}>
            {source.accession}
          </LinkedIdAndStatus>
        );
      },
      sorter: (item) => String(item.accession).toLowerCase(),
    },
    {
      id: "summary",
      title: "Summary",
      display: ({ source }) => source.summary,
      sorter: (item) => String(item.summary).toLowerCase(),
    },
    {
      id: "aliases",
      title: "Aliases",
      display: ({ source }) => {
        return source.aliases && source.aliases.length > 0 ? (
          <AliasList aliases={source.aliases} />
        ) : null;
      },
      hide: (data, columns, meta) => (meta ? !meta.isAliasesVisible : true),
      isSortable: false,
    },
  ];

/**
 * Input file set table sort order by type. When adding new file-set types, add them to this array
 * in the order that the `input_file_set` tables should appear on the page.
 */
const fileSetSortOrder: FileSetObjectType[] = [
  "MeasurementSet",
  "AnalysisSet",
  "AuxiliarySet",
  "ConstructLibrarySet",
  "PredictionSet",
  "ModelSet",
  "CuratedSet",
  "PseudobulkSet",
];

/**
 * Type for the map of file-set types to their table configuration. Each file-set type maps to an
 * array of column configurations for the `SortableGrid` component that displays the file sets of
 * that type. When adding new file-set types, add their object `@type` to the `FileSetTypeMap` type as well as the corresponding column configuration to this map.
 */
type InputFileSetDisplayConfig = {
  [K in FileSetObjectType]: {
    columns: SortableGridConfig<FileSetTypeMap[K], InputFileSetTableMeta>[];
    inputForQuery: string;
  };
};

/**
 * Map of file-set types to their table configuration. When adding new file-set types, add their
 * object @type to this map as well as the corresponding column configuration.
 */
const inputFileSetDisplayConfig: InputFileSetDisplayConfig = {
  AnalysisSet: {
    columns: basicColumns,
    inputForQuery: "input_for",
  },
  AuxiliarySet: {
    columns: auxiliarySetColumns,
    inputForQuery: "input_for.@id",
  },
  ConstructLibrarySet: {
    columns: constructLibrarySetColumns,
    inputForQuery: "input_for",
  },
  CuratedSet: { columns: basicColumns, inputForQuery: "input_for" },
  MeasurementSet: {
    columns: measurementSetColumns,
    inputForQuery: "input_for.@id",
  },
  ModelSet: { columns: basicColumns, inputForQuery: "input_for" },
  PredictionSet: { columns: basicColumns, inputForQuery: "input_for" },
  PseudobulkSet: { columns: basicColumns, inputForQuery: "input_for" },
};

/**
 * Display the samples of a file set in a table cell, each with links to their pages as well as
 * their statuses.
 *
 * @param fileSet - File set containing the samples to display
 * @param samples - Full sample objects because the sample objects embedded in the file set don't
 *                  have enough properties to display in the table.
 * @param propertyName - The property of the `fileSet` that contains the sample objects to display
 */
function SamplesDisplay({
  fileSet,
  samples,
  propertyName = "samples",
}: {
  fileSet: FileSetObject;
  samples: SampleObject[];
  propertyName?: string;
}) {
  // The embedded samples in a file set don't have enough properties to display in the table. Find
  // the corresponding samples in the meta.samples array so we have all the properties we need for
  // the table.
  const embeddedSamples = fileSet[propertyName as keyof typeof fileSet] as
    | SampleObject[]
    | undefined;
  if (!isDatabaseObjectArrayOfType(embeddedSamples, "Sample")) {
    return null;
  }

  // Get the samples belonging to the file set that are also included in whole in the `samples`
  // property.
  const samplePaths = embeddedSamples.map((sample) => sample["@id"]) || [];
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

/**
 * Sort the samples of a file set by their summaries, each combined into a single string, for use in
 * sorting the samples column of the input file sets tables.
 *
 * @param fileSet - File set whose samples are being sorted
 * @param samples - Samples belonging to the file set
 */
function samplesSorter(
  fileSet: FileSetObject,
  samples: SampleObject[]
): string {
  // Sort by the summaries of the samples, each combined into a single string.
  if (isDatabaseObjectArrayOfType(fileSet.samples, "Sample")) {
    const samplePaths = fileSet.samples.map((sample) => sample["@id"]);
    const measurementSetSamples = samples.filter((sample) =>
      samplePaths.includes(sample["@id"])
    );
    const sampleSummaries = measurementSetSamples.map((sample) =>
      sample.summary.toLowerCase()
    );

    // If there are no samples, return a string that will sort to the end.
    return sampleSummaries.length > 0
      ? sampleSummaries.sort().join()
      : "\uffff";
  }
  return "";
}

/**
 * Check if any of the given objects has a value for the given property. If none of them have the
 * property, this function returns true to indicate the column should be hidden.
 *
 * @param data - All objects for each row of a table
 * @param propertyName - Name of the property of `data` to check for existence
 * @returns True if none of the data objects include the property `propertyName`
 */
function columnHideCondition(data: FileSetObject[], propertyName: string) {
  const embeddedData = data.flatMap((datum) => {
    const property = datum[propertyName as keyof typeof datum] as
      | FileSetObject[]
      | undefined;

    return property ?? [];
  });

  return embeddedData.length === 0;
}

/**
 * Display the file sets of a file set in a table cell, with links to their pages as well as their
 * statuses.
 *
 * @param fileSet - File set containing the file sets to display
 * @param embeddedFileSets - File sets including those belonging to the file set
 * @param fileSetProperty - The property of the file set that contains the file sets to display
 */
function FileSetsDisplay({
  fileSet,
  embeddedFileSets,
  fileSetProperty,
}: {
  fileSet: FileSetObject;
  embeddedFileSets: FileSetObject[];
  fileSetProperty: string;
}) {
  const referencedFileSets = fileSet[
    fileSetProperty as keyof typeof fileSet
  ] as FileSetObject[] | undefined;

  if (referencedFileSets && referencedFileSets.length > 0) {
    // The embedded file sets in the given file set don't have enough properties to display in the
    // table. Find the corresponding full file-set objects in meta.controlFileSets so that we have
    // all the properties we need for the table.
    const fileSetPaths = referencedFileSets.map(
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

/**
 * Display the aliases of all samples in a file set in a table cell.
 *
 * @param samples - Samples whose aliases to display
 */
function SampleAliasesDisplay({ samples = [] }: { samples?: SampleObject[] }) {
  if (samples.length > 0) {
    const allSamplesAliases = samples.flatMap((sample) => sample.aliases ?? []);

    return allSamplesAliases.length > 0 ? (
      <div className="min-w-32">
        <AliasList aliases={allSamplesAliases} />
      </div>
    ) : null;
  }
  return null;
}

/**
 * Display the aliases of a file set in a table cell.
 *
 * @param fileSet - File set with the aliases to display
 */
function AliasesDisplay({ fileSet }: { fileSet: FileSetObject }) {
  return fileSet.aliases && fileSet.aliases.length > 0 ? (
    <div className="min-w-32">
      <AliasList aliases={fileSet.aliases} />
    </div>
  ) : null;
}

/**
 * Displays a single input file sets table of any file-set type.
 *
 * @param fileSetType - Type of the file sets to display in the table
 * @param fileSetPath - Path of the file set whose input file sets are being displayed
 * @param fileSets - File sets to display in the table
 * @param samples - Samples belonging to the file sets
 * @param controlFileSets - Control file sets belonging to the file sets
 * @param auxiliarySets - Auxiliary sets belonging to the file sets
 * @param measurementSets - Measurement sets belonging to the file sets
 * @param constructLibrarySets - Construct library sets belonging to the file sets
 * @param isDeletedVisible - True to show deleted items in the linked report when `reportLink` is provided
 * @param panelId - ID of the panel containing this table for the section directory
 */
function InputFileSetTable<T extends FileSetObjectType>({
  fileSetType,
  fileSetPath,
  fileSets,
  samples,
  controlFileSets,
  auxiliarySets,
  measurementSets,
  constructLibrarySets,
  isDeletedVisible = false,
  panelId = "input-file-sets",
}: {
  fileSetType: T;
  fileSetPath: string;
  fileSets: FileSetTypeMap[T][];
  samples: SampleObject[];
  controlFileSets: FileSetObject[];
  auxiliarySets: FileSetObject[];
  measurementSets: FileSetObject[];
  constructLibrarySets: FileSetObject[];
  isDeletedVisible?: boolean;
  panelId?: string;
}) {
  const { collectionTitles } = useContext(SessionContext);
  const title = collectionTitles?.[fileSetType] || fileSetType;
  const composedTitle = `${title} Input File Sets`;

  // True if the Aliases columns are visible.
  const [isAliasesVisible, setIsAliasesVisible] = useState(false);

  const reportLink = `/multireport/?type=${fileSetType}&${inputFileSetDisplayConfig[fileSetType].inputForQuery}=${fileSetPath}`;

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
          {reportLink && (
            <DataAreaTitleLink
              href={reportLink}
              label={`Report of ${fileSetType} input file sets`}
              isDeletedVisible={isDeletedVisible}
            >
              <TableCellsIcon className="h-4 w-4" />
            </DataAreaTitleLink>
          )}
        </div>
      </DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={fileSets}
          columns={
            inputFileSetDisplayConfig[fileSetType].columns || basicColumns
          }
          keyProp="@id"
          meta={{
            samples,
            isAliasesVisible,
            controlFileSets,
            auxiliarySets,
            measurementSets,
            constructLibrarySets,
          }}
        />
      </div>
    </>
  );
}

/**
 * Display each of the types of input file sets in separate tables.
 *
 * @param thisFileSet - File set whose input file sets are being displayed
 * @param fileSets - File sets to display
 * @param samples - Samples belonging to the file sets
 * @param controlFileSets - Control file sets belonging to the file sets
 * @param auxiliarySets - Auxiliary sets belonging to the file sets
 * @param measurementSets - Measurement sets belonging to the file sets
 * @param constructLibrarySets - Construct library sets belonging to the file sets
 * @param excludedTypes - `@type`s of file sets to exclude from display, if any
 */
export default function InputFileSets({
  thisFileSet,
  fileSets,
  samples,
  controlFileSets,
  auxiliarySets,
  measurementSets,
  constructLibrarySets,
  excludedTypes = [],
}: {
  thisFileSet: FileSetObject;
  fileSets: FileSetObject[];
  samples: SampleObject[];
  controlFileSets: FileSetObject[];
  auxiliarySets: FileSetObject[];
  measurementSets: FileSetObject[];
  constructLibrarySets: FileSetObject[];
  excludedTypes?: FileSetObjectType[];
}) {
  // Group the input file sets by their type and sort the groups by the order in `fileSetSortOrder`.
  const fileSetGroups: Partial<Record<FileSetObjectType, FileSetObject[]>> =
    _.groupBy(fileSets, "@type[0]");

  const fileSetTypes = _.sortBy(
    Object.keys(fileSetGroups) as FileSetObjectType[],
    (fileSetType) => fileSetSortOrder.indexOf(fileSetType)
  ).filter((fileSetType) => !excludedTypes.includes(fileSetType));

  if (fileSetTypes.length > 0) {
    return (
      <>
        {fileSetTypes.map((fileSetType) => {
          const fileSets = fileSetGroups[fileSetType];
          if (fileSets) {
            return (
              <InputFileSetTable
                key={fileSetType}
                fileSetPath={thisFileSet["@id"]}
                fileSetType={fileSetType}
                fileSets={fileSets as FileSetTypeMap[FileSetObjectType][]}
                samples={samples}
                controlFileSets={controlFileSets}
                auxiliarySets={auxiliarySets}
                measurementSets={measurementSets}
                constructLibrarySets={constructLibrarySets}
                isDeletedVisible
                panelId={toShishkebabCase(fileSetType)}
              />
            );
          }
          return null;
        })}
      </>
    );
  }
  return null;
}

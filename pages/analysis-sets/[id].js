// node_modules
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import AliasList from "../../components/alias-list";
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import FileSetTable from "../../components/file-set-table";
import Checkbox from "../../components/checkbox";
import JsonDisplay from "../../components/json-display";
import LinkedIdAndStatus from "../../components/linked-id-and-status";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
import SortableGrid from "../../components/sortable-grid";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestDonors,
  requestFileSets,
  requestFiles,
  requestMeasurementSets,
  requestSamples,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { pathToType } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

/**
 * Columns for the measurement sets table.
 */
const fileSetColumns = [
  {
    id: "samples",
    title: "Measured Samples",
    display: ({ source, meta }) => {
      // The embedded samples in the measurement set don't have enough properties to display in
      // the table. Find the corresponding samples in the meta.samples array so we have all the
      // properties we need for the table.
      const measurementSetSamplePaths = source.samples.map(
        (sample) => sample["@id"]
      );
      let measurementSetSamples = meta.samples.filter((sample) =>
        measurementSetSamplePaths.includes(sample["@id"])
      );

      // Sort the samples by their accessions, though the column itself can't be sorted.
      measurementSetSamples = _.sortBy(
        measurementSetSamples,
        (sample) => sample.accession
      );

      return (
        <div>
          {measurementSetSamples.map((sample) => (
            <div key={sample["@id"]} className="my-5 first:mt-0 last:mb-0">
              <LinkedIdAndStatus item={sample}>
                {sample.accession}
              </LinkedIdAndStatus>
              {sample.summary}
            </div>
          ))}
        </div>
      );
    },
    sorter: (item, meta) => {
      // Sort by the summaries of the samples, each combined into a single string.
      const measurementSetSamplePaths = item.samples.map(
        (sample) => sample["@id"]
      );
      const measurementSetSamples = meta.samples.filter((sample) =>
        measurementSetSamplePaths.includes(sample["@id"])
      );
      const sampleSummaries = measurementSetSamples.map((sample) =>
        sample.summary.toLowerCase()
      );

      // If there are no samples, return a string that will sort to the end.
      return sampleSummaries.length > 0
        ? sampleSummaries.sort().join()
        : "zzzzzz";
    },
  },

  {
    id: "sample-aliases",
    title: "Sample Aliases",
    display: ({ source }) => {
      const allSamplesAliases = source.samples.reduce((acc, sample) => {
        return sample.aliases?.length > 0 ? acc.concat(sample.aliases) : acc;
      }, []);

      return allSamplesAliases.length > 0 ? (
        <div className="min-w-32">
          <AliasList aliases={allSamplesAliases} />
        </div>
      ) : null;
    },
    isSortable: false,
    hide: (data, columns, meta) => !meta.isAliasesVisible,
  },

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
    display: ({ source }) => {
      return source.aliases?.length > 0 ? (
        <div className="min-w-32">
          <AliasList aliases={source.aliases} />
        </div>
      ) : null;
    },
    isSortable: false,
    hide: (data, columns, meta) => !meta.isAliasesVisible,
  },

  {
    id: "controls",
    title: "Controls",
    display: ({ source, meta }) => {
      if (source.control_file_sets?.length > 0) {
        // The embedded control file sets in the measurement set don't have enough properties to
        // display in the table. Find the corresponding control file sets in the
        // meta.controlFileSets array so we have all the properties we need for the table.
        const controlFileSetPaths = source.control_file_sets.map(
          (controlSet) => controlSet["@id"]
        );
        const controlFileSets = meta.controlFileSets.filter((controlSet) =>
          controlFileSetPaths.includes(controlSet["@id"])
        );

        if (controlFileSets.length > 0) {
          return (
            <div>
              {controlFileSets.map((controlSet) => (
                <LinkedIdAndStatus item={controlSet} key={controlSet["@id"]}>
                  {controlSet.accession}
                </LinkedIdAndStatus>
              ))}
            </div>
          );
        }
      }
      return null;
    },
    isSortable: false,
  },

  {
    id: "auxiliary-sets",
    title: "Auxiliary Sets",
    display: ({ source, meta }) => {
      if (source.auxiliary_sets?.length > 0) {
        // The embedded auxiliary sets in the measurement set don't have enough properties to
        // display in the table. Find the corresponding auxiliary sets in the meta.auxiliarySets
        // array so we have all the properties we need for the table.
        const embeddedAuxiliarySetPaths = source.auxiliary_sets.map(
          (auxiliarySet) => auxiliarySet["@id"]
        );
        const auxiliarySets = meta.auxiliarySets.filter((auxiliarySet) =>
          embeddedAuxiliarySetPaths.includes(auxiliarySet["@id"])
        );

        return (
          <div>
            {auxiliarySets.map((auxiliarySet) => (
              <LinkedIdAndStatus item={auxiliarySet} key={auxiliarySet["@id"]}>
                {auxiliarySet.accession}
              </LinkedIdAndStatus>
            ))}
          </div>
        );
      }
      return null;
    },
    isSortable: false,
  },

  {
    id: "construct-library-sets",
    title: "Construct Library Sets",
    display: ({ source, meta }) => {
      if (source.samples?.length > 0) {
        // Get the embedded construct library sets in all measurement set samples. These sets don't
        // have enough properties to display in the table, so find the corresponding construct
        // library sets in the meta.constructLibrarySets array which have all the properties we
        // need for the table.
        const embeddedConstructLibrarySets = source.samples.reduce(
          (acc, sample) => {
            return sample.construct_library_sets?.length > 0
              ? acc.concat(sample.construct_library_sets)
              : acc;
          },
          []
        );
        const constructLibrarySetPaths = embeddedConstructLibrarySets.map(
          (cls) => cls["@id"]
        );
        const constructLibrarySets = meta.constructLibrarySets.filter((cls) =>
          constructLibrarySetPaths.includes(cls["@id"])
        );

        return (
          <div>
            {constructLibrarySets.map((cls) => (
              <LinkedIdAndStatus item={cls} key={cls["@id"]}>
                {cls.accession}
              </LinkedIdAndStatus>
            ))}
          </div>
        );
      }
      return null;
    },
    isSortable: false,
  },
];

/**
 * Display the input file sets MeasurementSet objects in a table.
 */
function InputFileSets({
  fileSets,
  samples,
  controlFileSets,
  auxiliarySets,
  constructLibrarySets,
}) {
  // True if the two Aliases columns are visible.
  const [isAliasesVisible, setIsAliasesVisible] = useState(false);

  return (
    <>
      <DataAreaTitle>
        Measurement Input File Sets
        <Checkbox
          id="show-aliases"
          checked={isAliasesVisible}
          name="Show aliases columns"
          onClick={() => setIsAliasesVisible(!isAliasesVisible)}
          className="items-center [&>input]:mr-0"
        >
          <div className="order-first mr-1 text-sm">Show aliases columns</div>
        </Checkbox>
      </DataAreaTitle>
      <SortableGrid
        data={fileSets}
        columns={fileSetColumns}
        keyProp="@id"
        pager={{}}
        meta={{
          samples,
          isAliasesVisible,
          controlFileSets,
          auxiliarySets,
          constructLibrarySets,
        }}
      />
    </>
  );
}

InputFileSets.propTypes = {
  // File sets to display
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples belonging to the file sets
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Control file sets belonging to the file sets
  controlFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Auxiliary sets belonging to the file sets
  auxiliarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Construct library sets belonging to the file sets
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function AnalysisSet({
  analysisSet,
  documents,
  donors,
  files,
  measurementSets,
  inputFileSetSamples,
  controlFileSets,
  auxiliarySets,
  constructLibrarySets,
  curatedSets,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={analysisSet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={analysisSet.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={analysisSet} isJsonFormat={isJson} />
        <JsonDisplay item={analysisSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              {analysisSet.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={analysisSet.aliases} />
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>File Set Type</DataItemLabel>
              <DataItemValue>{analysisSet.file_set_type}</DataItemValue>
              {analysisSet.publication_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Publication Identifiers</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList
                      dbxrefs={analysisSet.publication_identifiers}
                      isCollapsible
                    />
                  </DataItemValue>
                </>
              )}
              {donors.length > 0 && (
                <>
                  <DataItemLabel>Donors</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {donors.map((donor) => (
                        <Link href={donor["@id"]} key={donor.uuid}>
                          {donor.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {analysisSet.samples?.length > 0 && (
                <>
                  <DataItemLabel>Samples</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {analysisSet.samples.map((sample) => (
                        <Link href={sample["@id"]} key={sample["@id"]}>
                          {sample.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {analysisSet.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{analysisSet.submitter_comment}</DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>

          {measurementSets.length > 0 && (
            <InputFileSets
              fileSets={measurementSets}
              samples={inputFileSetSamples}
              controlFileSets={controlFileSets}
              auxiliarySets={auxiliarySets}
              constructLibrarySets={constructLibrarySets}
            />
          )}

          {auxiliarySets.length > 0 && (
            <FileSetTable fileSets={auxiliarySets} title="Auxiliary Sets" />
          )}

          {constructLibrarySets.length > 0 && (
            <FileSetTable
              fileSets={constructLibrarySets}
              title="Construct Library Sets"
            />
          )}

          {curatedSets.length > 0 && (
            <FileSetTable fileSets={curatedSets} title="Curated Sets" />
          )}

          {files.length > 0 && (
            <FileTable files={files} itemPath={analysisSet["@id"]} />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

AnalysisSet.propTypes = {
  analysisSet: PropTypes.object.isRequired,
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file sets to display
  measurementSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file set samples
  inputFileSetSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Control file sets to display
  controlFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // AuxiliarySets to display
  auxiliarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // ConstructLibrarySets to display
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // CuratedSets to display
  curatedSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this analysis set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this analysis set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisSet = (
    await request.getObject(`/analysis-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(analysisSet)) {
    const documents = analysisSet.documents
      ? await requestDocuments(analysisSet.documents, request)
      : [];

    const filePaths = analysisSet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

    let donors = [];
    if (analysisSet.donors) {
      const donorPaths = analysisSet.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }

    let measurementSets = [];
    if (analysisSet.input_file_sets?.length > 0) {
      // The embedded `input_file_sets` in the analysis set don't have enough properties to display
      // in the table, so we have to request them. Filter for measurement sets.
      const measurementSetPaths = analysisSet.input_file_sets
        .filter((fileSet) => pathToType(fileSet["@id"]) === "measurement-sets")
        .map((fileSet) => fileSet["@id"]);
      measurementSets = await requestMeasurementSets(
        measurementSetPaths,
        request
      );
    }

    let auxiliarySets = [];
    let controlFileSets = [];
    if (measurementSets.length > 0) {
      // Retrieve the input file sets' auxiliary sets.
      let auxiliarySetsPaths = measurementSets.reduce((acc, measurementSet) => {
        return measurementSet.auxiliary_sets?.length > 0
          ? acc.concat(
              measurementSet.auxiliary_sets.map(
                (auxiliarySet) => auxiliarySet["@id"]
              )
            )
          : acc;
      }, []);
      auxiliarySetsPaths = [...new Set(auxiliarySetsPaths)];
      auxiliarySets =
        auxiliarySetsPaths.length > 0
          ? await requestFileSets(auxiliarySetsPaths, request)
          : [];

      // Retrieve the input file sets' control file sets.
      controlFileSets = measurementSets.reduce((acc, measurementSet) => {
        return measurementSet.control_file_sets?.length > 0
          ? acc.concat(measurementSet.control_file_sets)
          : acc;
      }, []);
      let controlFileSetPaths = controlFileSets.map(
        (controlFileSet) => controlFileSet["@id"]
      );
      controlFileSetPaths = [...new Set(controlFileSetPaths)];
      controlFileSets = await requestFileSets(controlFileSetPaths, request);
    }

    const embeddedSamples = measurementSets.reduce((acc, measurementSet) => {
      return measurementSet.samples?.length > 0
        ? acc.concat(measurementSet.samples)
        : acc;
    }, []);

    let inputFileSetSamples = [];
    if (embeddedSamples.length > 0) {
      let samplePaths = embeddedSamples.map((sample) => sample["@id"]);
      samplePaths = [...new Set(samplePaths)];
      inputFileSetSamples = await requestSamples(samplePaths, request);
    }

    let constructLibrarySets = [];
    if (inputFileSetSamples.length > 0) {
      let constructLibrarySetPaths = inputFileSetSamples.reduce(
        (acc, sample) => {
          return sample.construct_library_sets?.length > 0
            ? acc.concat(sample.construct_library_sets)
            : acc;
        },
        []
      );

      if (constructLibrarySetPaths.length > 0) {
        constructLibrarySetPaths = [...new Set(constructLibrarySetPaths)];
        constructLibrarySets = await requestFileSets(
          constructLibrarySetPaths,
          request,
          ["integrated_content_files"]
        );
      }
    }

    // Curated sets come from the `file_set` properties of the files in the
    // `integrated_content_files` of the construct library sets.
    let curatedSets = [];
    if (constructLibrarySets.length > 0) {
      let integratedContentFiles = [];
      let integratedContentFilePaths = constructLibrarySets.reduce(
        (acc, constructLibrarySet) => {
          return constructLibrarySet.integrated_content_files?.length > 0
            ? acc.concat(constructLibrarySet.integrated_content_files)
            : acc;
        },
        []
      );
      if (integratedContentFilePaths.length > 0) {
        integratedContentFilePaths = [...new Set(integratedContentFilePaths)];
        integratedContentFiles = await requestFiles(
          integratedContentFilePaths,
          request
        );
      }

      if (integratedContentFiles.length > 0) {
        let fileSetPaths = integratedContentFiles
          .map((file) => file.file_set)
          .filter((fileSet) => fileSet);
        fileSetPaths = [...new Set(fileSetPaths)];
        if (fileSetPaths.length > 0) {
          curatedSets = await requestFileSets(fileSetPaths, request);
        }
      }
    }

    const breadcrumbs = await buildBreadcrumbs(
      analysisSet,
      analysisSet.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(analysisSet, req.headers.cookie);
    return {
      props: {
        analysisSet,
        documents,
        donors,
        files,
        measurementSets,
        inputFileSetSamples,
        controlFileSets,
        auxiliarySets,
        constructLibrarySets,
        curatedSets,
        pageContext: { title: analysisSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisSet);
}

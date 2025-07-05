// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
import AlternateAccessions from "../../components/alternate-accessions";
import AnalysisSetFileTable from "../../components/analysis-set-file-table";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { ConstructLibraryTable } from "../../components/construct-library-table";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueUrl,
  DataPanel,
} from "../../components/data-area";
import { DataUseLimitationSummaries } from "../../components/data-use-limitation-status";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import { FileAccessionAndDownload } from "../../components/file-download";
import { FileGraph } from "../../components/file-graph";
import FileSetTable from "../../components/file-set-table";
import InputFileSets from "../../components/input-file-sets";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
  requestPublications,
  requestQualityMetrics,
  requestSamples,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { getAllDerivedFromFiles } from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function AnalysisSet({
  analysisSet,
  publications,
  documents,
  files,
  fileFileSets,
  referenceFiles,
  derivedFromFiles,
  inputFileSets,
  inputFileSetSamples,
  inputFileSetFor,
  controlFileSets,
  controlFor,
  appliedToSamples,
  auxiliarySets,
  measurementSets,
  constructLibrarySets,
  samples,
  qualityMetrics,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={analysisSet} />
      <EditableItem item={analysisSet}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={analysisSet.alternate_accessions}
        />
        <ObjectPageHeader item={analysisSet} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={analysisSet} />
          <DataUseLimitationSummaries
            summaries={analysisSet.data_use_limitation_summaries}
          />
        </ObjectPageHeader>
        <JsonDisplay item={analysisSet} isJsonFormat={isJson}>
          <StatusPreviewDetail item={analysisSet} />
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
              {analysisSet.summary && (
                <>
                  <DataItemLabel>Summary</DataItemLabel>
                  <DataItemValue>{analysisSet.summary}</DataItemValue>
                </>
              )}
              {analysisSet.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{analysisSet.description}</DataItemValue>
                </>
              )}
              {referenceFiles.length > 0 && (
                <>
                  <DataItemLabel>Reference Files</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {referenceFiles.map((file) => (
                        <FileAccessionAndDownload
                          key={file["@id"]}
                          file={file}
                          isInline
                        />
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {analysisSet.functional_assay_mechanisms.length > 0 && (
                <>
                  <DataItemLabel>Functional Assay Mechanisms</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {analysisSet.functional_assay_mechanisms.map(
                        (phenotypeTerm) => (
                          <Link
                            href={phenotypeTerm["@id"]}
                            key={phenotypeTerm.term_id}
                          >
                            {phenotypeTerm.term_name}
                          </Link>
                        )
                      )}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {analysisSet.targeted_genes && (
                <>
                  <DataItemLabel>Targeted Genes</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {analysisSet.targeted_genes.map((gene) => (
                        <Link href={gene["@id"]} key={gene["@id"]}>
                          {gene.symbol}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {analysisSet.external_image_data_url && (
                <>
                  <DataItemLabel>External Image Data URL</DataItemLabel>
                  <DataItemValueUrl>
                    <a
                      href={analysisSet.external_image_data_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {analysisSet.external_image_data_url}
                    </a>
                  </DataItemValueUrl>
                </>
              )}
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
              {publications.length > 0 && (
                <>
                  <DataItemLabel>Publications</DataItemLabel>
                  <DataItemList isCollapsible>
                    {publications.map((publication) => (
                      <Link key={publication["@id"]} href={publication["@id"]}>
                        {publication.title}
                      </Link>
                    ))}
                  </DataItemList>
                </>
              )}
              {analysisSet.sample_summary && (
                <>
                  <DataItemLabel>Samples</DataItemLabel>
                  <DataItemValue>{analysisSet.sample_summary}</DataItemValue>
                </>
              )}
              {analysisSet.protocols?.length > 0 && (
                <>
                  <DataItemLabel>Protocols</DataItemLabel>
                  <DataItemList isCollapsible isUrlList>
                    {analysisSet.protocols.map((protocol) => (
                      <a
                        href={protocol}
                        key={protocol}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {protocol}
                      </a>
                    ))}
                  </DataItemList>
                </>
              )}
              {analysisSet.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{analysisSet.submitter_comment}</DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>

          {files.length > 0 && (
            <>
              <AnalysisSetFileTable
                files={files}
                fileSet={analysisSet}
                isDownloadable
                isFilteredVisible
              />
              <FileGraph
                fileSet={analysisSet}
                files={files}
                referenceFiles={referenceFiles}
                fileFileSets={fileFileSets}
                derivedFromFiles={derivedFromFiles}
                qualityMetrics={qualityMetrics}
              />
            </>
          )}

          {samples.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${analysisSet["@id"]}`}
              reportLabel="Report of samples in this analysis set"
              isConstructLibraryColumnVisible
            />
          )}

          {analysisSet.donors?.length > 0 && (
            <DonorTable donors={analysisSet.donors} />
          )}

          {analysisSet.construct_library_sets?.length > 0 && (
            <ConstructLibraryTable
              constructLibrarySets={analysisSet.construct_library_sets}
              title="Associated Construct Library Sets"
              panelId="associated-construct-library-sets"
            />
          )}

          {inputFileSets.length > 0 && (
            <InputFileSets
              thisFileSet={analysisSet}
              fileSets={inputFileSets}
              samples={inputFileSetSamples}
              controlFileSets={controlFileSets}
              appliedToSamples={appliedToSamples}
              auxiliarySets={auxiliarySets}
              measurementSets={measurementSets}
              constructLibrarySets={constructLibrarySets}
            />
          )}

          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${analysisSet["@id"]}`}
              reportLabel="Report of file sets that this analysis set is an input for"
              title="File Sets Using This Analysis Set as an Input"
              panelId="input-file-set-for"
            />
          )}

          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${analysisSet["@id"]}`}
              reportLabel="Report of file sets that this analysis set serves as a control for"
              title="File Sets Controlled by This Analysis Set"
              panelId="control-for"
            />
          )}

          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

AnalysisSet.propTypes = {
  analysisSet: PropTypes.object.isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that `files` refer to in their `file_sets` property
  fileFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Reference files to display
  referenceFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // All derived_from files not included in `files`
  derivedFromFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file sets to display
  inputFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file set samples
  inputFileSetSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that this analysis set is input for
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Control file sets to display
  controlFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets controlled by this analysis set
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Applied-to samples to display
  appliedToSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // AuxiliarySets to display
  auxiliarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // MeasurementSets to display
  measurementSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // ConstructLibrarySets to display
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples from analysis set `samples` property that doesn't embed enough properties to display
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Quality metrics associated with this analysis set
  qualityMetrics: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this analysis set
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
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

    // Get all reference file paths from the files in the analysis set, then request those files
    // from the server. `reference_files` has a `minItems` of 1, so just check its existence.
    const referenceFilePathsSet = files.reduce((acc, file) => {
      if (file.reference_files) {
        file.reference_files.forEach((referenceFilePath) => {
          acc.add(referenceFilePath);
        });
      }
      return acc;
    }, new Set());
    const referenceFilePaths = [...referenceFilePathsSet];
    const referenceFiles =
      referenceFilePaths.length > 0
        ? await requestFiles(referenceFilePaths, request)
        : [];

    // Get the paths of all files that are in `files`' `derived_from` array property. Combine and
    // deduplicate them, and then request them from the server. Repeat this process with those
    // files until we have no more files with `derived_from` properties.
    const derivedFromFiles = await getAllDerivedFromFiles(files, request);
    const combinedFiles = files.concat(derivedFromFiles);

    // Get all file-set objects in every file's `file_sets` property.
    let fileFileSets = [];
    if (combinedFiles.length > 0) {
      const fileSetPaths = combinedFiles.reduce((acc, file) => {
        return acc.includes(file.file_set["@id"])
          ? acc
          : acc.concat(file.file_set["@id"]);
      }, []);
      fileFileSets = await requestFileSets(fileSetPaths, request);
    }

    let inputFileSets = [];
    if (analysisSet.input_file_sets?.length > 0) {
      // The embedded `input_file_sets` in the analysis set don't have enough properties to display
      // in the table, so we have to request them.
      const inputFileSetPaths = analysisSet.input_file_sets.map(
        (fileSet) => fileSet["@id"]
      );
      inputFileSets = await requestFileSets(inputFileSetPaths, request, [
        "applied_to_samples",
        "auxiliary_sets",
        "control_file_sets",
        "measurement_sets",
      ]);
    }

    const inputFileSetFor =
      analysisSet.input_for.length > 0
        ? await requestFileSets(analysisSet.input_for, request)
        : [];

    let controlFor = [];
    if (analysisSet.control_for.length > 0) {
      const controlForPaths = analysisSet.control_for.map(
        (control) => control["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    let samples = [];
    if (analysisSet.samples?.length > 0) {
      const samplePaths = analysisSet.samples.map((sample) => sample["@id"]);
      samples = await requestSamples(samplePaths, request);
    }

    let appliedToSamples = [];
    let auxiliarySets = [];
    let controlFileSets = [];
    let measurementSets = [];
    if (inputFileSets.length > 0) {
      // Retrieve the input file sets' applied to samples.
      appliedToSamples = inputFileSets.reduce((acc, fileSet) => {
        return fileSet.applied_to_samples?.length > 0
          ? acc.concat(fileSet.applied_to_samples)
          : acc;
      }, []);
      let appliedToSamplePaths = appliedToSamples.map(
        (sample) => sample["@id"]
      );
      appliedToSamplePaths = [...new Set(appliedToSamplePaths)];
      appliedToSamples =
        appliedToSamplePaths.length > 0
          ? await requestSamples(appliedToSamplePaths, request)
          : [];

      // Retrieve the input file sets' auxiliary sets.
      let auxiliarySetsPaths = inputFileSets.reduce((acc, fileSet) => {
        return fileSet.auxiliary_sets?.length > 0
          ? acc.concat(
              fileSet.auxiliary_sets.map((auxiliarySet) => auxiliarySet["@id"])
            )
          : acc;
      }, []);
      auxiliarySetsPaths = [...new Set(auxiliarySetsPaths)];
      auxiliarySets =
        auxiliarySetsPaths.length > 0
          ? await requestFileSets(auxiliarySetsPaths, request)
          : [];

      // Retrieve the input file sets' measurement sets.
      measurementSets = inputFileSets.reduce((acc, fileSet) => {
        return fileSet.measurement_sets?.length > 0
          ? acc.concat(fileSet.measurement_sets)
          : acc;
      }, []);
      let measurementSetPaths = measurementSets.map(
        (measurementSet) => measurementSet["@id"]
      );
      measurementSetPaths = [...new Set(measurementSetPaths)];
      measurementSets =
        measurementSetPaths.length > 0
          ? await requestFileSets(measurementSetPaths, request)
          : [];

      // Retrieve the input file sets' control file sets.
      controlFileSets = inputFileSets.reduce((acc, fileSet) => {
        return fileSet.control_file_sets?.length > 0
          ? acc.concat(fileSet.control_file_sets)
          : acc;
      }, []);
      let controlFileSetPaths = controlFileSets.map(
        (controlFileSet) => controlFileSet["@id"]
      );
      controlFileSetPaths = [...new Set(controlFileSetPaths)];
      controlFileSets = await requestFileSets(controlFileSetPaths, request);
    }

    const embeddedSamples = inputFileSets.reduce((acc, inputFileSet) => {
      return inputFileSet.samples?.length > 0
        ? acc.concat(inputFileSet.samples)
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
      const embeddedConstructLibrarySets = inputFileSetSamples.reduce(
        (acc, sample) => {
          return sample.construct_library_sets?.length > 0
            ? acc.concat(sample.construct_library_sets)
            : acc;
        },
        []
      );
      let constructLibrarySetPaths = embeddedConstructLibrarySets.map(
        (constructLibrarySet) => constructLibrarySet["@id"]
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

    let publications = [];
    if (analysisSet.publications?.length > 0) {
      const publicationPaths = analysisSet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    let qualityMetrics = [];
    if (files.length > 0) {
      let qualityMetricsPaths = files.reduce((acc, file) => {
        return file.quality_metrics?.length > 0
          ? acc.concat(file.quality_metrics)
          : acc;
      }, []);
      qualityMetricsPaths = [...new Set(qualityMetricsPaths)];
      qualityMetrics =
        qualityMetricsPaths.length > 0
          ? await requestQualityMetrics(qualityMetricsPaths, request)
          : [];
    }

    const attribution = await buildAttribution(analysisSet, req.headers.cookie);
    return {
      props: {
        analysisSet,
        publications,
        documents,
        files,
        fileFileSets,
        referenceFiles,
        derivedFromFiles,
        inputFileSets,
        inputFileSetSamples,
        inputFileSetFor,
        controlFileSets,
        controlFor,
        appliedToSamples,
        auxiliarySets,
        measurementSets,
        constructLibrarySets,
        samples,
        qualityMetrics,
        pageContext: { title: analysisSet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisSet);
}

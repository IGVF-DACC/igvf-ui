// node_modules
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueUrl,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import InputFileSets from "../../components/input-file-sets";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
  requestPublications,
  requestSamples,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import SampleTable from "../../components/sample-table";

export default function AnalysisSet({
  analysisSet,
  publications,
  documents,
  files,
  inputFileSets,
  inputFileSetSamples,
  inputFileSetFor,
  controlFileSets,
  controlFor,
  appliedToSamples,
  auxiliarySets,
  measurementSets,
  constructLibrarySets,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs item={analysisSet} />
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
              {analysisSet.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{analysisSet.submitter_comment}</DataItemValue>
                </>
              )}
              {analysisSet.summary && (
                <>
                  <DataItemLabel>Summary</DataItemLabel>
                  <DataItemValue>{analysisSet.summary}</DataItemValue>
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
            </DataArea>
          </DataPanel>

          {analysisSet.samples?.length > 0 && (
            <SampleTable
              samples={analysisSet.samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${analysisSet["@id"]}`}
              reportLabel="Report of samples in this analysis set"
            />
          )}

          {analysisSet.donors?.length > 0 && (
            <DonorTable donors={analysisSet.donors} />
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
            />
          )}

          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${analysisSet["@id"]}`}
              reportLabel="Report of file sets that this analysis set serves as a control for"
              title="File Sets Controlled by This Analysis Set"
            />
          )}

          {files.length > 0 && (
            <FileTable files={files} fileSet={analysisSet} isDownloadable />
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
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
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
      analysisSet.input_file_set_for.length > 0
        ? await requestFileSets(analysisSet.input_file_set_for, request)
        : [];

    let controlFor = [];
    if (analysisSet.control_for.length > 0) {
      const controlForPaths = analysisSet.control_for.map(
        (control) => control["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
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

    let publications = [];
    if (analysisSet.publications?.length > 0) {
      const publicationPaths = analysisSet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const attribution = await buildAttribution(analysisSet, req.headers.cookie);
    return {
      props: {
        analysisSet,
        publications,
        documents,
        files,
        inputFileSets,
        inputFileSetSamples,
        inputFileSetFor,
        controlFileSets,
        controlFor,
        appliedToSamples,
        auxiliarySets,
        measurementSets,
        constructLibrarySets,
        pageContext: { title: analysisSet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisSet);
}

// node_modules
import PropTypes from "prop-types";
// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import { ConstructLibraryTable } from "../../components/construct-library-table";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { DataUseLimitationSummaries } from "../../components/data-use-limitation-status";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
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
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestDocuments,
  requestFiles,
  requestFileSets,
  requestPublications,
  requestSamples,
  requestSupersedes,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function ModelSet({
  modelSet,
  documents,
  publications,
  externalInputData,
  files,
  inputFileSets,
  inputFileSetFor,
  controlFor,
  samples,
  supersedes,
  supersededBy,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={modelSet} />
      <EditableItem item={modelSet}>
        <PagePreamble sections={sections} />
        <AlternativeIdentifiers
          alternateAccessions={modelSet.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={modelSet} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={modelSet} />
          <DataUseLimitationSummaries
            summaries={modelSet.data_use_limitation_summaries}
          />
        </ObjectPageHeader>
        <JsonDisplay item={modelSet} isJsonFormat={isJson}>
          <StatusPreviewDetail item={modelSet} />
          <DataPanel>
            <DataArea>
              <FileSetDataItems item={modelSet} publications={publications}>
                <DataItemLabel>Accession</DataItemLabel>
                <DataItemValue>{modelSet.accession}</DataItemValue>
                {modelSet.assessed_genes && (
                  <>
                    <DataItemLabel>Assessed Genes</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {modelSet.assessed_genes.map((gene) => (
                          <Link href={gene["@id"]} key={gene["@id"]}>
                            {gene.symbol}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                <DataItemLabel>Model Version</DataItemLabel>
                <DataItemValue>{modelSet.model_version}</DataItemValue>
                {modelSet.prediction_objects?.length > 0 && (
                  <>
                    <DataItemLabel>Prediction Objects</DataItemLabel>
                    <DataItemValue>
                      {modelSet.prediction_objects.join(", ")}
                    </DataItemValue>
                  </>
                )}
                {modelSet.software_versions?.length > 0 && (
                  <>
                    <DataItemLabel>Software Versions</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList>
                        {modelSet.software_versions.map((version) => (
                          <Link key={version["@id"]} href={version["@id"]}>
                            {version.summary}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {modelSet.model_zoo_location && (
                  <>
                    <DataItemLabel>Model Zoo Location</DataItemLabel>
                    <DataItemValue>
                      <a
                        href={modelSet.model_zoo_location}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {modelSet.model_zoo_location}
                      </a>
                    </DataItemValue>
                  </>
                )}
                {externalInputData && (
                  <>
                    <DataItemLabel>External Input Data</DataItemLabel>
                    <DataItemValue>
                      <Link href={externalInputData["@id"]}>
                        {externalInputData.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {modelSet.software_versions?.length > 0 && (
                  <>
                    <DataItemLabel>Software Versions</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {modelSet.software_versions.map((version) => (
                          <Link href={version["@id"]} key={version["@id"]}>
                            {version.summary}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
              </FileSetDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>

          {files.length > 0 && <FileTable files={files} fileSet={modelSet} />}

          {samples.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${modelSet["@id"]}`}
              reportLabel="Report of samples in this model set"
              isConstructLibraryColumnVisible
            />
          )}

          {modelSet.construct_library_sets?.length > 0 && (
            <ConstructLibraryTable
              constructLibrarySets={modelSet.construct_library_sets}
              title="Associated Construct Library Sets"
              panelId="associated-construct-library-sets"
            />
          )}

          {inputFileSets.length > 0 && (
            <FileSetTable
              fileSets={inputFileSets}
              title="Input File Sets"
              reportLink={`/multireport/?type=FileSet&input_for=${modelSet["@id"]}`}
              reportLabel={`View file sets used as input file sets for ${modelSet.accession}`}
              panelId="input-file-sets"
            />
          )}

          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${modelSet["@id"]}`}
              reportLabel="Report of file sets that this model set is an input for"
              title="File Sets Using This Model Set as an Input"
              panelId="input-file-set-for"
            />
          )}

          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${modelSet["@id"]}`}
              reportLabel="Report of file sets that have this model set as a control"
              title="File Sets Controlled by This Model Set"
              panelId="control-for"
            />
          )}

          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

ModelSet.propTypes = {
  // Model Set to display
  modelSet: PropTypes.object.isRequired,
  // External input data associated with this model
  externalInputData: PropTypes.object,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file sets to display
  inputFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file sets for this model set
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Control for file sets
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples associated with this model set
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this model set
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files that this file set supersedes
  supersedes: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files that supersede this file set
  supersededBy: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this measurement set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const modelSet = (
    await request.getObject(`/model-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(modelSet)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      modelSet,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const documents = modelSet.documents
      ? await requestDocuments(modelSet.documents, request)
      : [];

    let samples = [];
    if (modelSet.samples?.length > 0) {
      const samplePaths = modelSet.samples.map((sample) => sample["@id"]);
      samples = await requestSamples(samplePaths, request);
    }

    const externalInputData = modelSet.external_input_data
      ? (await request.getObject(modelSet.external_input_data)).optional()
      : null;

    const filePaths =
      modelSet.files?.length > 0
        ? modelSet.files.map((file) => file["@id"])
        : [];
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

    let inputFileSets = [];
    if (modelSet.input_file_sets) {
      const inputFileSetPaths = modelSet.input_file_sets.map(
        (inputFileSet) => inputFileSet["@id"]
      );
      inputFileSets = await requestFileSets(inputFileSetPaths, request);
    }

    const inputFileSetFor =
      modelSet.input_for?.length > 0
        ? await requestFileSets(modelSet.input_for, request)
        : [];

    let controlFor = [];
    if (modelSet.control_for?.length > 0) {
      const controlForPaths = modelSet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    let publications = [];
    if (modelSet.publications?.length > 0) {
      const publicationPaths = modelSet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const { supersedes, supersededBy } = await requestSupersedes(
      modelSet,
      "FileSet",
      request
    );

    const attribution = await buildAttribution(modelSet, req.headers.cookie);

    return {
      props: {
        modelSet,
        documents,
        publications,
        externalInputData,
        files,
        inputFileSets,
        inputFileSetFor,
        controlFor,
        samples,
        supersedes,
        supersededBy,
        pageContext: { title: modelSet.model_name },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(modelSet);
}

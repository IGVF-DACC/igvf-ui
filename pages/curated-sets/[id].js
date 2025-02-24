// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import { ConstructLibraryTable } from "../../components/construct-library-table";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestFileSets,
  requestPublications,
  requestSamples,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function CuratedSet({
  curatedSet,
  documents,
  publications,
  files,
  inputFileSetFor,
  controlFor,
  samples,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={curatedSet} />
      <EditableItem item={curatedSet}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={curatedSet.alternate_accessions}
        />
        <ObjectPageHeader item={curatedSet} isJsonFormat={isJson} />
        <JsonDisplay item={curatedSet} isJsonFormat={isJson}>
          <StatusPreviewDetail item={curatedSet} />
          <DataPanel>
            <DataArea>
              <FileSetDataItems item={curatedSet} publications={publications}>
                {curatedSet.taxa && (
                  <>
                    <DataItemLabel>Taxa</DataItemLabel>
                    <DataItemValue>{curatedSet.taxa}</DataItemValue>
                  </>
                )}
                {curatedSet.publication_identifiers?.length > 0 && (
                  <>
                    <DataItemLabel>Publication Identifiers</DataItemLabel>
                    <DataItemValue>
                      <DbxrefList
                        dbxrefs={curatedSet.publication_identifiers}
                        isCollapsible
                      />
                    </DataItemValue>
                  </>
                )}
                {curatedSet.assemblies?.length > 0 && (
                  <>
                    <DataItemLabel>Assemblies</DataItemLabel>
                    <DataItemValue>
                      {curatedSet.assemblies.join(", ")}
                    </DataItemValue>
                  </>
                )}
                {curatedSet.transcriptome_annotations?.length > 0 && (
                  <>
                    <DataItemLabel>Transcriptome Annotations</DataItemLabel>
                    <DataItemValue>
                      {curatedSet.transcriptome_annotations.join(", ")}
                    </DataItemValue>
                  </>
                )}
              </FileSetDataItems>
            </DataArea>
          </DataPanel>
          {samples.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${curatedSet["@id"]}`}
              reportLabel="Report of samples in this curated set"
              isConstructLibraryColumnVisible
            />
          )}
          {curatedSet.donors?.length > 0 && (
            <DonorTable donors={curatedSet.donors} />
          )}
          {files.length > 0 && (
            <FileTable files={files} fileSet={curatedSet} isDownloadable />
          )}
          {curatedSet.construct_library_sets?.length > 0 && (
            <ConstructLibraryTable
              constructLibrarySets={curatedSet.construct_library_sets}
              title="Associated Construct Library Sets"
              panelId="associated-construct-library-sets"
            />
          )}
          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${curatedSet["@id"]}`}
              reportLabel="Report of file sets that this curated set is an input for"
              title="File Sets Using This Curated Set as an Input"
              panelId="input-file-set-for"
            />
          )}
          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${curatedSet["@id"]}`}
              reportLabel="Report of file sets that have this curated set as a control"
              title="File Sets Controlled by This Curated Set"
              panelId="control-for"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

CuratedSet.propTypes = {
  curatedSet: PropTypes.object.isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this curated set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this curated set
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that this curated set is an input for
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that this curated set is a control for
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples associated with this curated set
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this curated set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const curatedSet = (
    await request.getObject(`/curated-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(curatedSet)) {
    const documents = curatedSet.documents
      ? await requestDocuments(curatedSet.documents, request)
      : [];

    const filePaths = curatedSet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

    const inputFileSetFor =
      curatedSet.input_for.length > 0
        ? await requestFileSets(curatedSet.input_for, request)
        : [];

    let controlFor = [];
    if (curatedSet.control_for.length > 0) {
      const controlForPaths = curatedSet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    let samples = [];
    if (curatedSet.samples?.length > 0) {
      const samplePaths = curatedSet.samples.map((sample) => sample["@id"]);
      samples = await requestSamples(samplePaths, request);
    }

    let publications = [];
    if (curatedSet.publications?.length > 0) {
      const publicationPaths = curatedSet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }
    const attribution = await buildAttribution(curatedSet, req.headers.cookie);
    return {
      props: {
        curatedSet,
        documents,
        publications,
        files,
        inputFileSetFor,
        controlFor,
        samples,
        pageContext: { title: curatedSet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(curatedSet);
}

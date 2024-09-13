// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DerivedFromTable from "../../components/derived-from-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
  requestSeqspecFiles,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function SequenceFile({
  sequenceFile,
  documents,
  derivedFrom,
  derivedFromFileSets,
  inputFileFor,
  fileFormatSpecifications,
  attribution = null,
  isJson,
  seqspecs,
  sequencingPlatform = null,
}) {
  return (
    <>
      <Breadcrumbs item={sequenceFile} />
      <EditableItem item={sequenceFile}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={sequenceFile.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={sequenceFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={sequenceFile} />
        </ObjectPageHeader>
        <JsonDisplay item={sequenceFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems item={sequenceFile} />
            </DataArea>
          </DataPanel>
          <DataAreaTitle>Sequencing Details</DataAreaTitle>
          <DataPanel>
            <DataArea>
              {sequencingPlatform && (
                <>
                  <DataItemLabel>Sequencing Platform</DataItemLabel>
                  <DataItemValue>
                    <Link href={sequencingPlatform["@id"]}>
                      {sequencingPlatform.term_name}
                    </Link>
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>Sequencing Run</DataItemLabel>
              <DataItemValue>{sequenceFile.sequencing_run}</DataItemValue>
              {sequenceFile.flowcell_id && (
                <>
                  <DataItemLabel>Flowcell ID</DataItemLabel>
                  <DataItemValue>{sequenceFile.flowcell_id}</DataItemValue>
                </>
              )}
              {sequenceFile.lane && (
                <>
                  <DataItemLabel>Lane</DataItemLabel>
                  <DataItemValue>{sequenceFile.lane}</DataItemValue>
                </>
              )}
              {sequenceFile.sequencing_kit && (
                <>
                  <DataItemLabel>Sequencing Kit</DataItemLabel>
                  <DataItemValue>{sequenceFile.sequencing_kit}</DataItemValue>
                </>
              )}
              {sequenceFile.illumina_read_type && (
                <>
                  <DataItemLabel>Illumina Read Type</DataItemLabel>
                  <DataItemValue>
                    {sequenceFile.illumina_read_type}
                  </DataItemValue>
                </>
              )}
              {sequenceFile.index && (
                <>
                  <DataItemLabel>Index</DataItemLabel>
                  <DataItemValue>{sequenceFile.index}</DataItemValue>
                </>
              )}
              {truthyOrZero(sequenceFile.mean_read_length) && (
                <>
                  <DataItemLabel>Average Read Length</DataItemLabel>
                  <DataItemValue>{sequenceFile.mean_read_length}</DataItemValue>
                </>
              )}
              {truthyOrZero(sequenceFile.read_count) && (
                <>
                  <DataItemLabel>Read Count</DataItemLabel>
                  <DataItemValue>{sequenceFile.read_count}</DataItemValue>
                </>
              )}
              {sequenceFile.base_modifications?.length > 0 && (
                <>
                  <DataItemLabel>Base Modifications</DataItemLabel>
                  <DataItemValue>
                    {sequenceFile.base_modifications.join(", ")}
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              derivedFromFileSets={derivedFromFileSets}
              reportLink={`/multireport/?type=File&input_file_for=${sequenceFile["@id"]}`}
              reportLabel={`Report of files ${sequenceFile.accession} derives from`}
              title={`Files ${sequenceFile.accession} Derives From`}
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${sequenceFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
            />
          )}
          {seqspecs.length > 0 && (
            <FileTable
              files={seqspecs}
              title="Associated seqspec Files"
              reportLink={`/multireport/?type=ConfigurationFile&seqspec_of=${sequenceFile["@id"]}`}
            />
          )}
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

SequenceFile.propTypes = {
  // SequenceFile object to display
  sequenceFile: PropTypes.object.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Filesets derived from files belong to
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.array.isRequired,
  // Attribution for this file
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
  // Linked seqspec configuration files
  seqspecs: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sequencing platform ontology term object
  sequencingPlatform: PropTypes.object,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  // Redirect to the file page if the URL is a file download link.
  if (checkForFileDownloadPath(resolvedUrl)) {
    return {
      redirect: {
        destination: convertFileDownloadPathToFilePagePath(resolvedUrl),
        permanent: false,
      },
    };
  }

  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sequenceFile = (
    await request.getObject(`/sequence-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(sequenceFile)) {
    const documents = sequenceFile.documents
      ? await requestDocuments(sequenceFile.documents, request)
      : [];
    const derivedFrom = sequenceFile.derived_from
      ? await requestFiles(sequenceFile.derived_from, request)
      : [];
    const derivedFromFileSetPaths = derivedFrom
      .map((file) => file.file_set)
      .filter((fileSet) => fileSet);
    const uniqueDerivedFromFileSetPaths = [...new Set(derivedFromFileSetPaths)];
    const derivedFromFileSets =
      uniqueDerivedFromFileSetPaths.length > 0
        ? await requestFileSets(uniqueDerivedFromFileSetPaths, request)
        : [];
    const inputFileFor =
      sequenceFile.input_file_for.length > 0
        ? await requestFiles(sequenceFile.input_file_for, request)
        : [];
    const fileFormatSpecifications = sequenceFile.file_format_specifications
      ? await requestDocuments(sequenceFile.file_format_specifications, request)
      : [];
    const seqspecs =
      sequenceFile.seqspecs?.length > 0
        ? await requestSeqspecFiles([sequenceFile], request)
        : [];
    const sequencingPlatform = sequenceFile.sequencing_platform
      ? (await request.getObject(sequenceFile.sequencing_platform)).optional()
      : null;
    const attribution = await buildAttribution(
      sequenceFile,
      req.headers.cookie
    );
    return {
      props: {
        sequenceFile,
        documents,
        derivedFrom,
        derivedFromFileSets,
        inputFileFor,
        fileFormatSpecifications,
        pageContext: { title: sequenceFile.accession },
        attribution,
        isJson,
        seqspecs,
        sequencingPlatform,
      },
    };
  }
  return errorObjectToProps(sequenceFile);
}

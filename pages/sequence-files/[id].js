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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function SequenceFile({
  sequenceFile,
  fileSet,
  documents,
  derivedFrom,
  derivedFromFileSets,
  fileFormatSpecifications,
  attribution = null,
  isJson,
  seqSpec = null,
  sequencingPlatform = null,
}) {
  return (
    <>
      <Breadcrumbs />
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
          <FileDataItems item={sequenceFile} fileSet={fileSet}></FileDataItems>
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
              {truthyOrZero(sequenceFile.read_count) && (
                <>
                  <DataItemLabel>Read Count</DataItemLabel>
                  <DataItemValue>{sequenceFile.read_count}</DataItemValue>
                </>
              )}
              {truthyOrZero(sequenceFile.mean_read_length) && (
                <>
                  <DataItemLabel>Read Length</DataItemLabel>
                  <DataItemValue>{sequenceFile.mean_read_length}</DataItemValue>
                </>
              )}
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
              {sequenceFile.illumina_read_type && (
                <>
                  <DataItemLabel>Illumina Read Type</DataItemLabel>
                  <DataItemValue>
                    {sequenceFile.illumina_read_type}
                  </DataItemValue>
                </>
              )}
              {seqSpec && (
                <>
                  <DataItemLabel>Associated seqspec File</DataItemLabel>
                  <DataItemValue>
                    <Link href={seqSpec["@id"]}>{seqSpec.accession}</Link>
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {derivedFrom?.length > 0 && (
            <>
              <DataAreaTitle>
                Files {sequenceFile.accession} derives from
              </DataAreaTitle>
              <DerivedFromTable
                derivedFrom={derivedFrom}
                derivedFromFileSets={derivedFromFileSets}
              />
            </>
          )}
          {fileFormatSpecifications.length > 0 && (
            <>
              <DataAreaTitle>File Format Specifications</DataAreaTitle>
              <DocumentTable documents={fileFormatSpecifications} />
            </>
          )}
          {documents.length > 0 && (
            <>
              <DataAreaTitle>Documents</DataAreaTitle>
              <DocumentTable documents={documents} />
            </>
          )}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

SequenceFile.propTypes = {
  // SequenceFile object to display
  sequenceFile: PropTypes.object.isRequired,
  // File set that contains this file
  fileSet: PropTypes.object,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Filesets derived from files belong to
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.array,
  // Attribution for this file
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
  // Linked seqspec configuration file
  seqSpec: PropTypes.object,
  // Sequencing platform ontology term object
  sequencingPlatform: PropTypes.object,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sequenceFile = await request.getObject(`/sequence-files/${params.id}/`);
  if (FetchRequest.isResponseSuccess(sequenceFile)) {
    const fileSet = await request.getObject(sequenceFile.file_set, null);
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
    const fileFormatSpecifications = sequenceFile.file_format_specifications
      ? await requestDocuments(sequenceFile.file_format_specifications, request)
      : [];
    const seqSpec = sequenceFile.seqspec
      ? await request.getObject(sequenceFile.seqspec, null)
      : null;
    const sequencingPlatform = sequenceFile.sequencing_platform
      ? await request.getObject(sequenceFile.sequencing_platform, null)
      : null;
    const breadcrumbs = await buildBreadcrumbs(
      sequenceFile,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      sequenceFile,
      req.headers.cookie
    );
    return {
      props: {
        sequenceFile,
        fileSet,
        documents,
        derivedFrom,
        derivedFromFileSets,
        fileFormatSpecifications,
        pageContext: { title: sequenceFile.accession },
        breadcrumbs,
        attribution,
        isJson,
        seqSpec,
        sequencingPlatform,
      },
    };
  }
  return errorObjectToProps(sequenceFile);
}

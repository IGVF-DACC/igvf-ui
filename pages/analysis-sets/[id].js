// node_modules
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
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestDonors,
  requestFiles,
  requestFileSets,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function AnalysisSet({
  analysisSet,
  documents,
  donors,
  files,
  inputFileSets,
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
                    <SeparatedList>
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

          {inputFileSets.length > 0 && (
            <FileSetTable fileSets={inputFileSets} title="Input File Sets" />
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
  inputFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
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

    let inputFileSets = [];
    if (analysisSet.input_file_sets) {
      const inputFileSetPaths = analysisSet.input_file_sets.map(
        (inputFileSet) => inputFileSet["@id"]
      );
      inputFileSets = await requestFileSets(inputFileSetPaths, request);
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
        inputFileSets,
        pageContext: { title: analysisSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisSet);
}

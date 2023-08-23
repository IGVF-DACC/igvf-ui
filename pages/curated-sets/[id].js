// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestDonors,
  requestFiles,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function CuratedSet({
  curatedSet,
  documents,
  donors,
  files,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={curatedSet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={curatedSet.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={curatedSet} isJsonFormat={isJson} />
        <JsonDisplay item={curatedSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Curated Set Type</DataItemLabel>
              <DataItemValue>{curatedSet.curated_set_type}</DataItemValue>
              {curatedSet.taxa && (
                <>
                  <DataItemLabel>Taxa</DataItemLabel>
                  <DataItemValue>{curatedSet.taxa}</DataItemValue>
                </>
              )}
              {curatedSet.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={curatedSet.aliases} />
                  </DataItemValue>
                </>
              )}
              {curatedSet.publication_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Publication Identifiers</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList dbxrefs={curatedSet.publication_identifiers} />
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
              {curatedSet.samples?.length > 0 && (
                <>
                  <DataItemLabel>Samples</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {curatedSet.samples.map((sample) => (
                        <Link href={sample["@id"]} key={sample["@id"]}>
                          {sample.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {files.length > 0 && (
            <>
              <DataAreaTitle>Files</DataAreaTitle>
              <FileTable files={files} />
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

CuratedSet.propTypes = {
  curatedSet: PropTypes.object.isRequired,
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this curated set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this curated set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const curatedSet = await request.getObject(`/curated-sets/${params.id}/`);
  if (FetchRequest.isResponseSuccess(curatedSet)) {
    const documents = curatedSet.documents
      ? await requestDocuments(curatedSet.documents, request)
      : [];
    const donors = curatedSet.donors
      ? await requestDonors(curatedSet.donors, request)
      : [];
    const filePaths = curatedSet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];
    const breadcrumbs = await buildBreadcrumbs(
      curatedSet,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(curatedSet, req.headers.cookie);
    return {
      props: {
        curatedSet,
        documents,
        donors,
        files,
        pageContext: { title: curatedSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(curatedSet);
}

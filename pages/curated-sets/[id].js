// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestDocuments, requestFiles } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function CuratedSet({
  curatedSet,
  documents,
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
              <FileSetDataItems item={curatedSet}>
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
          {files.length > 0 && (
            <FileTable files={files} fileSetPath={curatedSet["@id"]} />
          )}
          {curatedSet.samples?.length > 0 && (
            <SampleTable
              samples={curatedSet.samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${curatedSet["@id"]}`}
            />
          )}
          {curatedSet.donors?.length > 0 && (
            <DonorTable donors={curatedSet.donors} />
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
    const breadcrumbs = await buildBreadcrumbs(
      curatedSet,
      curatedSet.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(curatedSet, req.headers.cookie);
    return {
      props: {
        curatedSet,
        documents,
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

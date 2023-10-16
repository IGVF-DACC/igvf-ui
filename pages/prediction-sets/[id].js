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
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
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
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function PredictionSet({
  predictionSet,
  documents,
  donors,
  files,
  attribution = null,
  isJson,
}) {

  return (
    <>
      <Breadcrumbs />
      <EditableItem item={predictionSet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={predictionSet.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={predictionSet} isJsonFormat={isJson} />
        <JsonDisplay item={predictionSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>File Set Type</DataItemLabel>
              <DataItemValue>{predictionSet.file_set_type}</DataItemValue>
              {predictionSet.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    {predictionSet.aliases.join(", ")}
                  </DataItemValue>
                </>
              )}
              {donors?.length > 0 && (
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
              {predictionSet.samples?.length > 0 && (
                <>
                  <DataItemLabel>Samples</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {predictionSet.samples.map((sample) => (
                        <Link href={sample["@id"]} key={sample["@id"]}>
                          {sample.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {predictionSet.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{predictionSet.description}</DataItemValue>
                </>
              )}
              <DataItemLabel>Summary</DataItemLabel>
              <DataItemValue>{predictionSet.summary}</DataItemValue>
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

PredictionSet.propTypes = {
  // Prediction set to display
  predictionSet: PropTypes.object.isRequired,
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this prediction set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this prediction set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const predictionSet = await request.getObject(
    `/prediction-sets/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(predictionSet)) {
    const documents = predictionSet.documents
      ? await requestDocuments(predictionSet.documents, request)
      : [];

    let donors = [];
    if (predictionSet.donors) {
      const donorPaths = predictionSet.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }

    let files = [];
    if (predictionSet.files.length > 0) {
      const filePaths = predictionSet.files.map((file) => file["@id"]) || [];
      files = await requestFiles(filePaths, request);
    }

    const breadcrumbs = await buildBreadcrumbs(
      predictionSet,
      predictionSet.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      predictionSet,
      req.headers.cookie
    );
    return {
      props: {
        predictionSet,
        documents,
        donors,
        files,
        pageContext: { title: predictionSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(predictionSet);
}

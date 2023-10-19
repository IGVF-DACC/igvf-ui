// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import { isJsonFormat } from "../../lib/query-utils";

export default function AnalysisStep({
  analysisStep,
  documents,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={analysisStep}>
        <PagePreamble />
        <ObjectPageHeader item={analysisStep} isJsonFormat={isJson} />
        <JsonDisplay item={analysisStep} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Title</DataItemLabel>
              <DataItemValue>{analysisStep.title}</DataItemValue>
              {analysisStep.analysis_step_types?.length > 0 && (
                <>
                  <DataItemLabel>Analysis Step Types</DataItemLabel>
                  <DataItemValue>{analysisStep.analysis_step_types.join(", ")}</DataItemValue>
                </>
              )}
              {analysisStep.input_content_types?.length > 0 && (
                <>
                  <DataItemLabel>Input Content Types</DataItemLabel>
                  <DataItemValue>{analysisStep.input_content_types.join(", ")}</DataItemValue>
                </>
              )}
              {analysisStep.output_content_types?.length > 0 && (
                <>
                  <DataItemLabel>Output Content Types</DataItemLabel>
                  <DataItemValue>{analysisStep.output_content_types.join(", ")}</DataItemValue>
                </>
              )}
              {analysisStep.workflow && (
                <>
                  <DataItemLabel>Workflow</DataItemLabel>
                  <DataItemValue>
                    <Link href={analysisStep.workflow["@id"]}>
                      {analysisStep.workflow.accession}
                    </Link>
                  </DataItemValue>
                </>
              )}
              {analysisStep.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={analysisStep.aliases} />
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {documents?.length > 0 && (
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

AnalysisStep.propTypes = {
  // Analysis Step object to display
  analysisStep: PropTypes.object.isRequired,
  // Attribution for this analysis step
  attribution: PropTypes.object,
  // Documents associated with this analysis step
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisStep = await request.getObject(`/analysis-steps/${params.id}/`);
  if (FetchRequest.isResponseSuccess(analysisStep)) {
    const award = await request.getObject(analysisStep.award["@id"], null);
    const lab = await request.getObject(analysisStep.lab["@id"], null);
    const documents = analysisStep.documents
      ? await requestDocuments(analysisStep.documents, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      analysisStep,
      analysisStep.title,
      req.headers.cookie
    );
    const attribution = await buildAttribution(analysisStep, req.headers.cookie);
    return {
      props: {
        analysisStep,
        award,
        lab,
        documents,
        pageContext: { title: analysisStep.title },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisStep);
}

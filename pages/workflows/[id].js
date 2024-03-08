// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
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
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestAnalysisSteps,
  requestDocuments,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import { isJsonFormat } from "../../lib/query-utils";

export default function Workflow({
  workflow,
  analysisSteps,
  documents,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={workflow}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={workflow.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={workflow} isJsonFormat={isJson} />
        <JsonDisplay item={workflow} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Name</DataItemLabel>
              <DataItemValue>{workflow.name}</DataItemValue>
              {workflow.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{workflow.description}</DataItemValue>
                </>
              )}
              <DataItemLabel>Source URL</DataItemLabel>
              <DataItemValueUrl>
                <a
                  href={workflow.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {workflow.source_url}
                </a>
              </DataItemValueUrl>
              {workflow.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={workflow.aliases} />
                  </DataItemValue>
                </>
              )}
              {workflow.standards_page && (
                <>
                  <DataItemLabel>Standards Page</DataItemLabel>
                  <DataItemValue>
                    <Link href={workflow.standards_page["@id"]}>
                      {workflow.standards_page.title}
                    </Link>
                  </DataItemValue>
                </>
              )}
              {workflow.workflow_repositories?.length > 0 && (
                <>
                  <DataItemLabel>Workflow Repositories</DataItemLabel>
                  <DataItemList isCollapsible>
                    {workflow.workflow_repositories.map((repository) => (
                      <a
                        key={repository}
                        href={repository}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {repository}
                      </a>
                    ))}
                  </DataItemList>
                </>
              )}
              {workflow.publication_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Publication Identifiers</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList
                      dbxrefs={workflow.publication_identifiers}
                      isCollapsible
                    />
                  </DataItemValue>
                </>
              )}
              {analysisSteps.length > 0 && (
                <>
                  <DataItemLabel>Analysis Steps</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {analysisSteps.map((astep) => (
                        <Link href={astep["@id"]} key={astep["@id"]}>
                          {astep.name}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {workflow.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{workflow.submitter_comment}</DataItemValue>
                </>
              )}
              {workflow.revoke_detail && (
                <>
                  <DataItemLabel>Revoke Detail</DataItemLabel>
                  <DataItemValue>{workflow.revoke_detail}</DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {documents?.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Workflow.propTypes = {
  // Workflow object to display
  workflow: PropTypes.object.isRequired,
  // Attribution for this workflow
  attribution: PropTypes.object,
  // Analysis Steps to display
  analysisSteps: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this workflow
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const workflow = (await request.getObject(`/workflow/${params.id}/`)).union();
  if (FetchRequest.isResponseSuccess(workflow)) {
    const award = (await request.getObject(workflow.award["@id"])).optional();
    const lab = (await request.getObject(workflow.lab["@id"])).optional();
    const documents = workflow.documents
      ? await requestDocuments(workflow.documents, request)
      : [];
    const analysisSteps = workflow.analysis_steps
      ? await requestAnalysisSteps(workflow.analysis_steps, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      workflow,
      workflow.name,
      req.headers.cookie
    );
    const attribution = await buildAttribution(workflow, req.headers.cookie);
    return {
      props: {
        workflow,
        award,
        lab,
        analysisSteps,
        documents,
        pageContext: { title: workflow.name },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(workflow);
}

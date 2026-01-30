// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import AliasList from "../../components/alias-list";
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import { AnalysisStepFromVersionTable } from "../../components/analysis-step-from-version-table";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { UniformlyProcessedBadge } from "../../components/common-pill-badges";
import {
  DataArea,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueAnnotated,
  DataItemValueUrl,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import { getPreferredAssayTitleDescriptionMap } from "../../lib/ontology-terms";
import PagePreamble from "../../components/page-preamble";
import { useSecDir } from "../../components/section-directory";
import SessionContext from "../../components/session-context";
import { StatusPreviewDetail } from "../../components/status";
import { WorkflowTitle } from "../../components/workflow";
// lib
import buildAttribution from "../../lib/attribution";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestDocuments,
  requestPublications,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { workflowTextTitle } from "../../lib/workflow";

export default function Workflow({
  workflow,
  documents,
  publications,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);

  return (
    <>
      <Breadcrumbs item={workflow} />
      <EditableItem item={workflow}>
        <PagePreamble
          pageTitle={workflowTextTitle(workflow)}
          styledTitle={<WorkflowTitle workflow={workflow} />}
          sections={sections}
        />
        <AlternativeIdentifiers
          alternateAccessions={workflow.alternate_accessions}
        />
        <ObjectPageHeader item={workflow} isJsonFormat={isJson}>
          {workflow.uniform_pipeline === true && (
            <UniformlyProcessedBadge label="uniform pipeline" />
          )}
        </ObjectPageHeader>
        <JsonDisplay item={workflow} isJsonFormat={isJson}>
          <StatusPreviewDetail item={workflow} />
          <DataPanel>
            <DataArea>
              <DataItemLabel>Name</DataItemLabel>
              <DataItemValue>{workflow.name}</DataItemValue>
              {workflow.preferred_assay_titles?.length > 0 && (
                <>
                  <DataItemLabel>Preferred Assay Titles</DataItemLabel>
                  <DataItemValueAnnotated
                    externalAnnotations={preferredAssayTitleDescriptionMap}
                  >
                    {workflow.preferred_assay_titles}
                  </DataItemValueAnnotated>
                </>
              )}
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
              {publications.length > 0 && (
                <>
                  <DataItemLabel>Publications</DataItemLabel>
                  <DataItemList isCollapsible>
                    {publications.map((publication) => (
                      <Link key={publication["@id"]} href={publication["@id"]}>
                        {publication.title}
                      </Link>
                    ))}
                  </DataItemList>
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
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {workflow.analysis_step_versions?.length > 0 && (
            <AnalysisStepFromVersionTable
              analysisStepVersions={workflow.analysis_step_versions}
              reportLink={`/multireport/?type=AnalysisStepVersion&workflows.@id=${workflow["@id"]}`}
              reportLabel="Analysis Step Versions that link to this workflow"
              isDeletedVisible
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
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
  // Documents associated with this workflow
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this workflow
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const workflow = (await request.getObject(`/workflow/${params.id}/`)).union();
  if (FetchRequest.isResponseSuccess(workflow)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      workflow,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const award = (await request.getObject(workflow.award["@id"])).optional();
    const lab = (await request.getObject(workflow.lab["@id"])).optional();

    const documents = workflow.documents
      ? await requestDocuments(workflow.documents, request)
      : [];

    let publications = [];
    if (workflow.publications?.length > 0) {
      const publicationPaths = workflow.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const attribution = await buildAttribution(workflow, req.headers.cookie);
    return {
      props: {
        workflow,
        award,
        lab,
        documents,
        publications,
        pageContext: { title: workflow.name },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(workflow);
}

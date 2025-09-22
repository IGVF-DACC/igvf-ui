// node_modules
import _ from "lodash";
import { Fragment } from "react";
// components
import Attribution from "../../components/attribution";
import { AnalysisStepVersionTable } from "../../components/analysis-step-version-table";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
// lib
import { type AttributionData } from "../../lib/attribution";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import { isJsonFormat } from "../../lib/query-utils";
import {
  getAnalysisStepWorkflows,
  hasIndexedVersions,
} from "../../lib/workflow";
// root
import type { AnalysisStepObject, DatabaseObject } from "../../globals";

/**
 * Main page component to display an Analysis Step object.
 *
 * @param analysisStep - Analysis Step object to display
 * @param attribution - Attribution for this analysis step
 * @param isJson - True to display the page in JSON format
 */
export default function AnalysisStep({
  analysisStep,
  attribution,
  isJson,
}: {
  analysisStep: AnalysisStepObject;
  attribution: AttributionData | null;
  isJson: boolean;
}) {
  const sections = useSecDir({ isJson });

  // Get workflows, if any, from the analysis step.
  const workflows = getAnalysisStepWorkflows(analysisStep);

  return (
    <>
      <Breadcrumbs item={analysisStep} />
      <EditableItem item={analysisStep}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={analysisStep} isJsonFormat={isJson} />
        <JsonDisplay item={analysisStep} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Title</DataItemLabel>
              <DataItemValue>{analysisStep.title}</DataItemValue>
              {analysisStep.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{analysisStep.description}</DataItemValue>
                </>
              )}
              {analysisStep.step_label && (
                <>
                  <DataItemLabel>Step Label</DataItemLabel>
                  <DataItemValue>{analysisStep.step_label}</DataItemValue>
                </>
              )}
              <DataItemLabel>Analysis Step Types</DataItemLabel>
              <DataItemValue>
                {analysisStep.analysis_step_types.join(", ")}
              </DataItemValue>
              <DataItemLabel>Input Content Types</DataItemLabel>
              <DataItemValue>
                <SeparatedList isCollapsible>
                  {analysisStep.input_content_types.map((type) => (
                    <Fragment key={type}>{type}</Fragment>
                  ))}
                </SeparatedList>
              </DataItemValue>
              <DataItemLabel>Output Content Types</DataItemLabel>
              <DataItemValue>
                <SeparatedList isCollapsible>
                  {analysisStep.output_content_types.map((type) => (
                    <Fragment key={type}>{type}</Fragment>
                  ))}
                </SeparatedList>
              </DataItemValue>
              {analysisStep.parents?.length > 0 && (
                <>
                  <DataItemLabel>Parents</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {analysisStep.parents.map((parent) => (
                        <Link href={parent["@id"]} key={parent["@id"]}>
                          {parent.title}
                        </Link>
                      ))}
                    </SeparatedList>
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
              {analysisStep.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>
                    {analysisStep.submitter_comment}
                  </DataItemValue>
                </>
              )}
              {workflows.length > 0 && (
                <>
                  <DataItemLabel>Workflows</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {workflows.map((workflow) => (
                        <Link key={workflow["@id"]} href={workflow["@id"]}>
                          {workflow.name}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {hasIndexedVersions(analysisStep.analysis_step_versions) && (
            <AnalysisStepVersionTable
              analysisStepVersions={analysisStep.analysis_step_versions}
              reportLink={`/multireport/?type=AnalysisStepVersion&analysis_step.@id=${analysisStep["@id"]}`}
              reportLabel="Analysis Step Versions"
            />
          )}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisStep = (
    await request.getObject(`/analysis-steps/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(analysisStep)) {
    const attribution = await buildAttribution(
      analysisStep as DatabaseObject,
      req.headers.cookie
    );
    return {
      props: {
        analysisStep,
        pageContext: { title: analysisStep.title },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisStep);
}

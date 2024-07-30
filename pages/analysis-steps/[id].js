// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import { isJsonFormat } from "../../lib/query-utils";

export default function AnalysisStep({
  analysisStep,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs item={analysisStep} />
      <EditableItem item={analysisStep}>
        <PagePreamble />
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
              <DataItemLabel>Workflow</DataItemLabel>
              <DataItemValue>
                <Link href={analysisStep.workflow["@id"]}>
                  {analysisStep.workflow.accession}
                </Link>
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
            </DataArea>
          </DataPanel>
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
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisStep = (
    await request.getObject(`/analysis-steps/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(analysisStep)) {
    const attribution = await buildAttribution(
      analysisStep,
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

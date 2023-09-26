// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataItemValueUrl,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import { isJsonFormat } from "../../lib/query-utils";

export default function Workflow({ workflow, attribution = null, isJson }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={workflow}>
        <PagePreamble />
        <ObjectPageHeader item={workflow} isJsonFormat={isJson} />
        <JsonDisplay item={workflow} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Name</DataItemLabel>
              <DataItemValue>{workflow.name}</DataItemValue>
              <DataItemLabel>Description</DataItemLabel>
              <DataItemValue>{workflow.description}</DataItemValue>
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
                    <Link href={workflow.standards_page}>
                      {workflow.standards_page}
                    </Link>
                  </DataItemValue>
                </>
              )}
              {workflow.workflow_repositories.length > 0 && (
                <>
                  <DataItemLabel>Workflow Repositories</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
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
                    </SeparatedList>
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

Workflow.propTypes = {
  // Software object to display
  workflow: PropTypes.object.isRequired,
  // Attribution for this workflow
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const workflow = await request.getObject(`/workflow/${params.id}/`);
  if (FetchRequest.isResponseSuccess(workflow)) {
    const award = await request.getObject(workflow.award["@id"], null);
    const lab = await request.getObject(workflow.lab["@id"], null);
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
        pageContext: { title: workflow.name },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(workflow);
}

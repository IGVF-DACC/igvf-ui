// node_modules
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
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
import SoftwareVersionTable from "../../components/software-version-table";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";

export default function Software({ software }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={software}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={software.status} />
            </DataItemValue>
            <DataItemLabel>Title</DataItemLabel>
            <DataItemValue>{software.title}</DataItemValue>
            <DataItemLabel>Description</DataItemLabel>
            <DataItemValue>{software.description}</DataItemValue>
            <DataItemLabel>Source URL</DataItemLabel>
            <DataItemValue>
              <a href={software.source_url} target="_blank" rel="noreferrer">
                {software.source_url}
              </a>
            </DataItemValue>
            {software.aliases?.length > 0 && (
              <>
                <DataItemLabel>Aliases</DataItemLabel>
                <DataItemValue>
                  <AliasList aliases={software.aliases} />
                </DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>

        {software.versions?.length > 0 && (
          <>
            <DataAreaTitle>Software Versions</DataAreaTitle>
            <SoftwareVersionTable versions={software.versions} />
          </>
        )}

        <Attribution award={software.award} lab={software.lab} />
      </EditableItem>
    </>
  );
}

Software.propTypes = {
  software: PropTypes.object.isRequired,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const software = await request.getObject(`/software/${params.id}/`);
  if (FetchRequest.isResponseSuccess(software)) {
    const breadcrumbs = await buildBreadcrumbs(
      software,
      "name",
      req.headers.cookie
    );
    return {
      props: {
        software,
        pageContext: { title: software.name },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(software);
}

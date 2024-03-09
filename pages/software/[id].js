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
  DataItemValueUrl,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SoftwareVersionTable from "../../components/software-version-table";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestSoftwareVersions } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import { isJsonFormat } from "../../lib/query-utils";

export default function Software({
  software,
  versions,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={software}>
        <PagePreamble />
        <ObjectPageHeader item={software} isJsonFormat={isJson} />
        <JsonDisplay item={software} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Title</DataItemLabel>
              <DataItemValue>{software.title}</DataItemValue>
              <DataItemLabel>Description</DataItemLabel>
              <DataItemValue>{software.description}</DataItemValue>
              <DataItemLabel>Source URL</DataItemLabel>
              <DataItemValueUrl>
                <a
                  href={software.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {software.source_url}
                </a>
              </DataItemValueUrl>
              {software.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={software.aliases} />
                  </DataItemValue>
                </>
              )}
              {software.publication_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Publication Identifiers</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList
                      dbxrefs={software.publication_identifiers}
                      isCollapsible
                    />
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>

          {software.versions?.length > 0 && (
            <>
              <DataAreaTitle>Software Versions</DataAreaTitle>
              <SoftwareVersionTable versions={versions} />
            </>
          )}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Software.propTypes = {
  // Software object to display
  software: PropTypes.object.isRequired,
  // Software versions associated with this software
  versions: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this software
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const software = (await request.getObject(`/software/${params.id}/`)).union();
  if (FetchRequest.isResponseSuccess(software)) {
    const award = (await request.getObject(software.award["@id"])).optional();
    const lab = (await request.getObject(software.lab["@id"])).optional();
    const versions =
      software.versions.length > 0
        ? await requestSoftwareVersions(software.versions, request)
        : [];
    const breadcrumbs = await buildBreadcrumbs(
      software,
      software.name,
      req.headers.cookie
    );
    const attribution = await buildAttribution(software, req.headers.cookie);
    return {
      props: {
        software,
        award,
        lab,
        versions,
        pageContext: { title: software.name },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(software);
}

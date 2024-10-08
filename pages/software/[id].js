// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
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
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import { usePagePanels } from "../../components/page-panels";
import PagePreamble from "../../components/page-preamble";
import SoftwareVersionTable from "../../components/software-version-table";
// lib
import {
  requestPublications,
  requestSoftwareVersions,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import { isJsonFormat } from "../../lib/query-utils";

export default function Software({
  software,
  publications,
  versions,
  attribution = null,
  isJson,
}) {
  const pagePanels = usePagePanels(software["@id"]);

  return (
    <>
      <Breadcrumbs item={software} />
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
            </DataArea>
          </DataPanel>

          {versions?.length > 0 && (
            <SoftwareVersionTable
              versions={versions}
              pagePanels={pagePanels}
              pagePanelId="software-versions"
            />
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
  // Publications associated with this software
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
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

    let publications = [];
    if (software.publications?.length > 0) {
      const publicationPaths = software.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const attribution = await buildAttribution(software, req.headers.cookie);
    return {
      props: {
        software,
        publications,
        award,
        lab,
        versions,
        pageContext: { title: software.name },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(software);
}

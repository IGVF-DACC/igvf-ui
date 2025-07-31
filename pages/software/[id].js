// node_modules
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
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
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { useSecDir } from "../../components/section-directory";
import SoftwareVersionTable from "../../components/software-version-table";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestPublications,
  requestSoftwareVersions,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function Software({
  software,
  publications,
  versions,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={software} />
      <EditableItem item={software}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={software} isJsonFormat={isJson} />
        <JsonDisplay item={software} isJsonFormat={isJson}>
          <StatusPreviewDetail item={software} />
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
              {software.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{software.submitter_comment}</DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>

          {versions?.length > 0 && <SoftwareVersionTable versions={versions} />}
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
      software.versions?.length > 0
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

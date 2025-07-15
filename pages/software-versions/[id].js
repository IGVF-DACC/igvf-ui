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
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import { requestPublications } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function SoftwareVersion({
  softwareVersion,
  publications,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={softwareVersion} />
      <EditableItem item={softwareVersion}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={softwareVersion} isJsonFormat={isJson} />
        <JsonDisplay item={softwareVersion} isJsonFormat={isJson}>
          <StatusPreviewDetail item={softwareVersion} />
          <DataPanel>
            <DataArea>
              <DataItemLabel>Summary</DataItemLabel>
              <DataItemValue>{softwareVersion.summary}</DataItemValue>
              <DataItemLabel>Software</DataItemLabel>
              <DataItemValue>
                <Link href={softwareVersion.software["@id"]}>
                  {softwareVersion.software.title}
                </Link>
              </DataItemValue>
              {softwareVersion.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{softwareVersion.description}</DataItemValue>
                </>
              )}
              {softwareVersion.source_url && (
                <>
                  <DataItemLabel>Source URL</DataItemLabel>
                  <DataItemValueUrl>
                    <a
                      href={softwareVersion.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {softwareVersion.source_url}
                    </a>
                  </DataItemValueUrl>
                </>
              )}
              {softwareVersion.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={softwareVersion.aliases} />
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
              {softwareVersion.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>
                    {softwareVersion.submitter_comment}
                  </DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

SoftwareVersion.propTypes = {
  // Software Version object to display
  softwareVersion: PropTypes.object.isRequired,
  // Publications associated with this software version
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this software version
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const softwareVersion = (
    await request.getObject(`/software-versions/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(softwareVersion)) {
    const award = (
      await request.getObject(softwareVersion.award["@id"])
    ).optional();
    const lab = (
      await request.getObject(softwareVersion.lab["@id"])
    ).optional();

    let publications = [];
    if (softwareVersion.publications?.length > 0) {
      const publicationPaths = softwareVersion.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const attribution = await buildAttribution(
      softwareVersion,
      req.headers.cookie
    );
    return {
      props: {
        softwareVersion,
        publications,
        award,
        lab,
        pageContext: { title: softwareVersion.name },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(softwareVersion);
}

// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
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
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestPublications,
  requestSoftware,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { PageProps } from "../../lib/next-js";
// root
import type {
  PublicationObject,
  SoftwareObject,
  SoftwareVersionObject,
} from "../../globals";
import { pathsFromDatabaseObjects } from "../../lib/database-object";

/**
 * Props for the software version page component.
 *
 * @property softwareVersion - Software version object to display
 * @property publications - Publications associated with the software version
 */
interface SoftwareVersionPageProps extends PageProps {
  softwareVersion: SoftwareVersionObject;
  software: SoftwareObject;
  publications: PublicationObject[];
}

export default function SoftwareVersion({
  softwareVersion,
  software,
  publications,
  attribution = null,
  isJson,
}: SoftwareVersionPageProps) {
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
              <DataItemLabel>Software</DataItemLabel>
              {software && (
                <DataItemValue>
                  <Link href={software["@id"]}>{software.title}</Link>
                </DataItemValue>
              )}
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

export async function getServerSideProps({
  params,
  req,
  query,
  resolvedUrl,
}: GetServerSidePropsContext<{ id: string }>): Promise<
  GetServerSidePropsResult<SoftwareVersionPageProps>
> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const softwareVersion = (
    await request.getObject<SoftwareVersionObject>(
      `/software-versions/${params.id}/`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(softwareVersion)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      softwareVersion,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const [software] = await requestSoftware(
      pathsFromDatabaseObjects([softwareVersion.software]),
      request
    );

    const publications = await requestPublications(
      pathsFromDatabaseObjects(softwareVersion.publications),
      request
    );

    const attribution = await buildAttribution(
      softwareVersion,
      req.headers.cookie
    );

    return {
      props: {
        softwareVersion,
        software,
        publications,
        pageContext: { title: softwareVersion.summary },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(softwareVersion);
}

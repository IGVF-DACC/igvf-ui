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
  DataItemValueAnnotated,
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
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestPublications,
  requestSoftwareVersions,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import type { PageProps } from "../../lib/next-js";
import { isJsonFormat } from "../../lib/query-utils";
// root
import type {
  PublicationObject,
  SoftwareObject,
  SoftwareVersionObject,
} from "../../globals";
import { pathsFromDatabaseObjects } from "../../lib/database-object";

/**
 * Props to render the software object summary page.
 *
 * @property software - Software object to display
 * @property publications - Publications associated with the software object
 * @property versions - Software versions associated with the software object
 */
interface SoftwarePageProps extends PageProps {
  software: SoftwareObject;
  publications: PublicationObject[];
  versions: SoftwareVersionObject[];
}

export default function Software({
  software,
  publications,
  versions,
  attribution = null,
  isJson,
}: SoftwarePageProps) {
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
              {software.categories?.length > 0 && (
                <>
                  <DataItemLabel>Categories</DataItemLabel>
                  <DataItemValueAnnotated
                    objectType={software["@type"][0]}
                    propertyName="categories"
                  >
                    {software.categories}
                  </DataItemValueAnnotated>
                </>
              )}
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

          {versions.length > 0 && <SoftwareVersionTable versions={versions} />}
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
  GetServerSidePropsResult<SoftwarePageProps>
> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const software = (
    await request.getObject<SoftwareObject>(`/software/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(software)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      software,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const versions = await requestSoftwareVersions(
      pathsFromDatabaseObjects(software.versions),
      request
    );

    const publications = await requestPublications(
      pathsFromDatabaseObjects(software.publications),
      request
    );

    const attribution = await buildAttribution(software, req.headers.cookie);

    return {
      props: {
        software,
        publications,
        versions,
        pageContext: { title: software.title },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(software);
}

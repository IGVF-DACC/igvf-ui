// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
// components
import AliasList from "../../components/alias-list";
import AttachmentThumbnail from "../../components/attachment-thumbnail";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentAttachmentLink from "../../components/document-link";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { PillBadge } from "../../components/pill-badge";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truncateText } from "../../lib/general";
import { PageProps } from "../../lib/next-js";
import { isJsonFormat } from "../../lib/query-utils";
// root
import type { DocumentObject } from "../../globals";
import { requestSupersedes } from "../../lib/common-requests";
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";

/**
 * Document page properties, which for this case only contains the document object to be displayed.
 */
interface DocumentPageProps extends PageProps {
  document: DocumentObject;
}

/**
 * Document page component.
 *
 * @param document - Document object to be displayed on the page
 * @param supersedes - List of documents that this document supersedes
 * @param supersededBy - List of documents that supersede this document
 * @param attribution - Attribution information for the document
 * @param isJson - Flag indicating if the page is being rendered in JSON format
 */
export default function Document({
  document,
  supersedes,
  supersededBy,
  attribution = null,
  isJson,
}: DocumentPageProps) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs
        item={document}
        title={truncateText(document.description, 40)}
      />
      <EditableItem item={document}>
        <PagePreamble sections={sections} />
        <AlternativeIdentifiers
          supersedes={supersedes}
          supersededBy={supersededBy}
          property="description"
        />
        <ObjectPageHeader item={document} isJsonFormat={isJson}>
          {document.standardized_file_format && (
            <PillBadge className="bg-standardized-file-format ring-standardized-file-format">
              Standardized File Format
            </PillBadge>
          )}
        </ObjectPageHeader>
        <JsonDisplay item={document} isJsonFormat={isJson}>
          <StatusPreviewDetail item={document} />
          <DataPanel>
            <DataArea>
              <DataItemLabel>Type</DataItemLabel>
              <DataItemValue>{document.document_type}</DataItemValue>
              <DataItemLabel>Description</DataItemLabel>
              <DataItemValue>{document.description}</DataItemValue>
              {document.characterization_method && (
                <>
                  <DataItemLabel>Characterization Method</DataItemLabel>
                  <DataItemValue>
                    {document.characterization_method}
                  </DataItemValue>
                </>
              )}
              {document.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{document.submitter_comment}</DataItemValue>
                </>
              )}
              {document.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={document.aliases} />
                  </DataItemValue>
                </>
              )}
              {document.urls?.length > 0 && (
                <>
                  <DataItemLabel>Additional Information</DataItemLabel>
                  <DataItemList isCollapsible isUrlList>
                    {document.urls.map((url) => (
                      <div key={url}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {url}
                        </a>
                      </div>
                    ))}
                  </DataItemList>
                </>
              )}
              <DataItemLabel>Download</DataItemLabel>
              <DataItemValue>
                <DocumentAttachmentLink document={document} />
              </DataItemValue>
              <DataItemLabel>Thumbnail</DataItemLabel>
              <DataItemValue>
                <div className="flex w-28 items-center justify-center border p-1.5">
                  <AttachmentThumbnail
                    attachment={document.attachment}
                    ownerPath={document["@id"]}
                    alt={document.description}
                  />
                </div>
              </DataItemValue>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

/**
 * Fetches the server-side props for the document page, including the document object,
 * its supersedes and supersededBy relationships, attribution, and JSON format flag.
 *
 * @param params - Parameters object containing the request parameters, including the document ID.
 * @param req - HTTP request object.
 * @param query - Query parameters from the request URL.
 * @param resolvedUrl - The resolved URL of the request.
 */
export async function getServerSideProps({
  params,
  req,
  query,
  resolvedUrl,
}: GetServerSidePropsContext<{ id: string }>): Promise<
  GetServerSidePropsResult<DocumentPageProps>
> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const document = (
    await request.getObject<DocumentObject>(`/documents/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(document)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      document,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const { supersedes, supersededBy } = await requestSupersedes(
      document,
      "Document",
      request,
      ["description"]
    );

    const attribution = await buildAttribution(document, req.headers.cookie);

    return {
      props: {
        document,
        supersedes,
        supersededBy,
        pageContext: { title: document.description },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(document);
}

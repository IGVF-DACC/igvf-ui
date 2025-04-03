// node_modules
import PropTypes from "prop-types";
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
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truncateText } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function Document({ document, attribution = null, isJson }) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs
        item={document}
        title={truncateText(document.description, 40)}
      />
      <EditableItem item={document}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={document} isJsonFormat={isJson} />
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

Document.propTypes = {
  // Document object to display
  document: PropTypes.object.isRequired,
  // Attribution for this document
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const document = (
    await request.getObject(`/documents/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(document)) {
    const attribution = await buildAttribution(document, req.headers.cookie);
    return {
      props: {
        document,
        pageContext: { title: document.description },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(document);
}

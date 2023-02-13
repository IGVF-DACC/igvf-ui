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
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentAttachmentLink from "../../components/document-link";
import { EditableItem } from "../../components/edit";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function Document({ document, award = null, lab = null }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={document}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={document.status} />
            </DataItemValue>
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
                <DataItemValue>
                  {document.urls.map((url) => (
                    <div key={url}>
                      <a
                        className="break-all"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {url}
                      </a>
                    </div>
                  ))}
                </DataItemValue>
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
          </DataArea>
        </DataPanel>
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
}

Document.propTypes = {
  // Document object to display
  document: PropTypes.object.isRequired,
  // Award applied to this technical sample
  award: PropTypes.object,
  // Lab that submitted this technical sample
  lab: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const document = await request.getObject(`/documents/${params.id}/`);
  if (FetchRequest.isResponseSuccess(document)) {
    const award = await request.getObject(document.award, null);
    const lab = await request.getObject(document.lab, null);
    const breadcrumbs = await buildBreadcrumbs(
      document,
      "description",
      req.headers.cookie
    );
    return {
      props: {
        document,
        award,
        lab,
        pageContext: { title: document.description },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(document);
}

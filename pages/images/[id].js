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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import { UC } from "../../lib/constants";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function Image({ image, attribution = null, isJson }) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={image} />
      <EditableItem item={image}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={image} isJsonFormat={isJson} />
        <JsonDisplay item={image} isJsonFormat={isJson}>
          <StatusPreviewDetail item={image} />
          <DataPanel>
            <DataArea>
              <DataItemLabel>Type</DataItemLabel>
              <DataItemValue>{image.attachment.type}</DataItemValue>
              <DataItemLabel>Size</DataItemLabel>
              <DataItemValue>
                {image.attachment.width} {UC.times} {image.attachment.height}
              </DataItemValue>
              <DataItemLabel>md5sum</DataItemLabel>
              <DataItemValue>{image.attachment.md5sum}</DataItemValue>
              {image.summary && (
                <>
                  <DataItemLabel>Summary</DataItemLabel>
                  <DataItemValue>{image.summary}</DataItemValue>
                </>
              )}
              {image.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={image.aliases} />
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>Download</DataItemLabel>
              <DataItemValue>
                <DocumentAttachmentLink document={image} />
              </DataItemValue>
              <DataItemLabel>Thumbnail</DataItemLabel>
              <DataItemValue>
                <div className="flex w-28 items-center justify-center border bg-white p-1.5">
                  <AttachmentThumbnail
                    attachment={image.attachment}
                    ownerPath={image["@id"]}
                    alt={image.summary}
                  />
                </div>
              </DataItemValue>
              {image.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{image.submitter_comment}</DataItemValue>
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

Image.propTypes = {
  // Image object to display
  image: PropTypes.object.isRequired,
  // Attribution for this document
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const image = (await request.getObject(`/images/${params.id}/`)).union();
  if (FetchRequest.isResponseSuccess(image)) {
    const attribution = await buildAttribution(image, req.headers.cookie);
    return {
      props: {
        image,
        pageContext: { title: image.attachment.download },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(document);
}

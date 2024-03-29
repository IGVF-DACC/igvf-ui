// node_modules
import PropTypes from "prop-types";
// components
import AttachmentThumbnail from "../../components/attachment-thumbnail";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentAttachmentLink from "../../components/document-link";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function Publication({
  publication,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={publication}>
        <PagePreamble />
        <ObjectPageHeader item={publication} isJsonFormat={isJson} />
        <JsonDisplay item={publication} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Title</DataItemLabel>
              <DataItemValue>{publication.title}</DataItemValue>
              {publication.authors && (
                <>
                  <DataItemLabel>Authors</DataItemLabel>
                  <DataItemValue>{publication.authors}</DataItemValue>
                </>
              )}
              {(publication.journal || publication.date_published) && (
                <>
                  <DataItemLabel>Citation</DataItemLabel>
                  <DataItemValue>
                    {publication.journal ? <i>{publication.journal}. </i> : ""}
                    {publication.date_published ? (
                      `${publication.date_published};`
                    ) : (
                      <span>&nbsp;</span>
                    )}
                    {publication.volume ? publication.volume : ""}
                    {publication.issue ? `(${publication.issue})` : ""}
                    {publication.page ? (
                      `:${publication.page}.`
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </DataItemValue>
                </>
              )}
              {publication.abstract && (
                <>
                  <DataItemLabel>Abstract</DataItemLabel>
                  <DataItemValue>{publication.abstract}</DataItemValue>
                </>
              )}
              <DataItemLabel>Publication Identifers</DataItemLabel>
              <DataItemValue>
                <DbxrefList dbxrefs={publication.publication_identifiers} />
              </DataItemValue>
              {publication.attachment && (
                <>
                  <DataItemLabel>Download</DataItemLabel>
                  <DataItemValue>
                    <DocumentAttachmentLink document={publication} />
                  </DataItemValue>
                  <DataItemLabel>Thumbnail</DataItemLabel>
                  <DataItemValue>
                    <div className="flex w-28 items-center justify-center border p-1.5">
                      <AttachmentThumbnail
                        attachment={publication.attachment}
                        ownerPath={publication["@id"]}
                        alt={publication.title}
                      />
                    </div>
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Publication.propTypes = {
  // Publication object to display
  publication: PropTypes.object.isRequired,
  // Attribution for this publication
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const publication = (
    await request.getObject(`/publications/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(publication)) {
    const breadcrumbs = await buildBreadcrumbs(
      publication,
      publication.title,
      req.headers.cookie
    );
    const attribution = await buildAttribution(publication, req.headers.cookie);
    return {
      props: {
        publication,
        pageContext: { title: publication.title },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(publication);
}

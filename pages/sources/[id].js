// node_modules
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { StatusPreviewDetail } from "../../components/status";
// lib
import AliasList from "../../components/alias-list";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function Source({ source, isJson }) {
  return (
    <>
      <Breadcrumbs item={source} />
      <EditableItem item={source}>
        <PagePreamble />
        <ObjectPageHeader item={source} isJsonFormat={isJson} />
        <JsonDisplay item={source} isJsonFormat={isJson}>
          <StatusPreviewDetail item={source} />
          <DataPanel>
            <DataArea>
              <DataItemLabel>Title</DataItemLabel>
              <DataItemValue>{source.title}</DataItemValue>
              {source.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{source.description}</DataItemValue>
                </>
              )}
              {source.url && (
                <>
                  <DataItemLabel>URL</DataItemLabel>
                  <DataItemValue>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.url}
                    </a>
                  </DataItemValue>
                </>
              )}
              {source.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={source.aliases} />
                  </DataItemValue>
                </>
              )}
              {source.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{source.submitter_comment}</DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Source.propTypes = {
  source: PropTypes.object.isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const source = (await request.getObject(`/sources/${params.id}/`)).union();
  if (FetchRequest.isResponseSuccess(source)) {
    return {
      props: {
        source,
        pageContext: { title: source.name },
        isJson,
      },
    };
  }
  return errorObjectToProps(source);
}

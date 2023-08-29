// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import ProductInfo from "../../components/product-info";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestDocuments } from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function Modification({
  modification,
  gene,
  sources,
  documents,
  isJson,
  attribution = null,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={modification}>
        <PagePreamble />
        <ObjectPageHeader item={modification} isJsonFormat={isJson} />
        <JsonDisplay item={modification} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Modality</DataItemLabel>
              <DataItemValue>{modification.modality}</DataItemValue>
              <DataItemLabel>Cas</DataItemLabel>
              <DataItemValue>{modification.cas}</DataItemValue>
              <DataItemLabel>Cas Species</DataItemLabel>
              <DataItemValue>{modification.cas_species}</DataItemValue>
              {modification.fused_domain && (
                <>
                  <DataItemLabel>Fused Domain</DataItemLabel>
                  <DataItemValue>{modification.fused_domain}</DataItemValue>
                </>
              )}
              {modification.tagged_protein && (
                <>
                  <DataItemLabel>Tagged Protein</DataItemLabel>
                  <DataItemValue>
                    <Link href={modification.tagged_protein}>
                      {gene.symbol}
                    </Link>
                  </DataItemValue>
                </>
              )}
              {modification.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{modification.description}</DataItemValue>
                </>
              )}
              {modification.product_id && (
                <>
                  <DataItemLabel>Product ID</DataItemLabel>
                  <DataItemValue>
                    <Link
                      href={`https://www.addgene.org/${
                        modification.product_id.split(":")[1]
                      }/`}
                    >
                      {modification.product_id}
                    </Link>
                  </DataItemValue>
                </>
              )}
              {(modification.lot_id ||
                modification.product_id ||
                sources.length > 0) && (
                <>
                  <DataItemLabel>Sources</DataItemLabel>
                  <DataItemValue>
                    <ProductInfo
                      lotId={modification.lot_id}
                      productId={modification.product_id}
                      sources={sources}
                    />
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {documents.length > 0 && (
            <>
              <DataAreaTitle>Documents</DataAreaTitle>
              <DocumentTable documents={documents} />
            </>
          )}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Modification.propTypes = {
  // Modification to display
  modification: PropTypes.object.isRequired,
  // Documents treatment
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // The gene referenced by the Modification
  gene: PropTypes.object,
  // Attribution for the modification
  attribution: PropTypes.object,
  // Source lab or source for this sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const modification = await request.getObject(
    `/modifications/${params.uuid}/`
  );
  if (FetchRequest.isResponseSuccess(modification)) {
    const breadcrumbs = await buildBreadcrumbs(
      modification,
      modification.summary,
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      modification,
      req.headers.cookie
    );
    const gene = await request.getObject(modification.tagged_protein, null);
    let sources = [];
    if (modification.sources?.length > 0) {
      sources = await request.getMultipleObjects(modification.sources, null, {
        filterErrors: true,
      });
    }
    const documents = modification.documents
      ? await requestDocuments(modification.documents, request)
      : [];
    return {
      props: {
        modification,
        pageContext: {
          title: modification.summary,
        },
        breadcrumbs,
        documents,
        gene,
        attribution,
        sources,
        isJson,
      },
    };
  }
  return errorObjectToProps(modification);
}

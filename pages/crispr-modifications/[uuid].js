// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
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
import SampleTable from "../../components/sample-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestDocuments, requestSamples } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function CrisprModification({
  modification,
  gene,
  biosamplesModified,
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
              {modification.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={modification.aliases} />
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>Summary</DataItemLabel>
              <DataItemValue>{modification.summary}</DataItemValue>
            </DataArea>
          </DataPanel>
          {biosamplesModified.length > 0 && (
            <SampleTable
              samples={biosamplesModified}
              reportLink={`/multireport/?type=Biosample&modifications.@id=${modification["@id"]}`}
              reportLabel="Report of biosamples that have this modification"
              title="Biosamples modified by this Modification"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

CrisprModification.propTypes = {
  // Modification to display
  modification: PropTypes.object.isRequired,
  // Biosamples modified by the modification
  biosamplesModified: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  const modification = (
    await request.getObject(`/crispr-modifications/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(modification)) {
    const gene = modification.tagged_protein
      ? (await request.getObject(modification.tagged_protein)).optional()
      : null;

    let sources = [];
    if (modification.sources?.length > 0) {
      sources = Ok.all(
        await request.getMultipleObjects(modification.sources, {
          filterErrors: true,
        })
      );
    }

    const biosamplesModified =
      modification.biosamples_modified.length > 0
        ? await requestSamples(modification.biosamples_modified, request)
        : [];

    const documents = modification.documents
      ? await requestDocuments(modification.documents, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      modification,
      modification.summary,
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      modification,
      req.headers.cookie
    );
    return {
      props: {
        modification,
        biosamplesModified,
        documents,
        gene,
        breadcrumbs,
        sources,
        pageContext: {
          title: modification.summary,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(modification);
}

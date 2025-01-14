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
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestGenes,
  requestSamples,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function DegronModification({
  modification,
  taggedProteins,
  biosamplesModified,
  sources,
  documents,
  isJson,
  attribution = null,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={modification} />
      <EditableItem item={modification}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={modification} isJsonFormat={isJson} />
        <JsonDisplay item={modification} isJsonFormat={isJson}>
          <StatusPreviewDetail item={modification} />
          <DataPanel>
            <DataArea>
              <DataItemLabel>Summary</DataItemLabel>
              <DataItemValue>{modification.summary}</DataItemValue>
              <DataItemLabel>Degron System</DataItemLabel>
              <DataItemValue>{modification.degron_system}</DataItemValue>
              {taggedProteins.length > 0 && (
                <>
                  <DataItemLabel>Tagged Proteins</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {taggedProteins.map((protein) => (
                        <Link key={protein["@id"]} href={protein["@id"]}>
                          {protein.geneid}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {"activated" in modification && (
                <>
                  <DataItemLabel>Activated</DataItemLabel>
                  <DataItemValue>
                    {modification.activated === true ? "Yes" : "No"}
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
              {modification.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>
                    {modification.submitter_comment}
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {biosamplesModified.length > 0 && (
            <SampleTable
              samples={biosamplesModified}
              reportLink={`/multireport/?type=Biosample&modifications.@id=${modification["@id"]}`}
              reportLabel="Report of biosamples that have this item as their modification"
              title="Biosamples Modified by this Modification"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

DegronModification.propTypes = {
  // Modification to display
  modification: PropTypes.object.isRequired,
  // Biosamples modified by the modification
  biosamplesModified: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents treatment
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // The tagged proteins referenced by the modification
  taggedProteins: PropTypes.arrayOf(PropTypes.object).isRequired,
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
    await request.getObject(`/degron-modifications/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(modification)) {
    const taggedProteins = modification.tagged_proteins
      ? await requestGenes(modification.tagged_proteins, request)
      : [];

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
    const attribution = await buildAttribution(
      modification,
      req.headers.cookie
    );
    return {
      props: {
        modification,
        taggedProteins,
        biosamplesModified,
        documents,
        pageContext: {
          title: modification.summary,
        },
        attribution,
        sources,
        isJson,
      },
    };
  }
  return errorObjectToProps(modification);
}

// node_modules
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
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
import ProductInfo from "../../components/product-info";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestDocuments } from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function Treatment({
  treatment,
  documents,
  attribution,
  sources,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={treatment}>
        <PagePreamble />
        <ObjectPageHeader item={treatment} isJsonFormat={isJson} />
        <JsonDisplay item={treatment} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Treatment Term Name</DataItemLabel>
              <DataItemValue>{treatment.treatment_term_name}</DataItemValue>
              <DataItemLabel>Treatment Type</DataItemLabel>
              <DataItemValue>{treatment.treatment_type}</DataItemValue>
              {truthyOrZero(treatment.amount) && (
                <>
                  <DataItemLabel>Amount</DataItemLabel>
                  <DataItemValue>
                    {treatment.amount} {treatment.amount_units}
                    {treatment.amount === 1 ? "" : "s"}
                  </DataItemValue>
                </>
              )}
              {treatment.depletion && (
                <>
                  <DataItemLabel>Depletion</DataItemLabel>
                  <DataItemValue>True</DataItemValue>
                </>
              )}
              {truthyOrZero(treatment.duration) && (
                <>
                  <DataItemLabel>Duration</DataItemLabel>
                  <DataItemValue>
                    {treatment.duration} {treatment.duration_units}
                    {treatment.duration === 1 ? "" : "s"}
                  </DataItemValue>
                </>
              )}
              {truthyOrZero(treatment.pH) && (
                <>
                  <DataItemLabel>pH</DataItemLabel>
                  <DataItemValue>{treatment.pH}</DataItemValue>
                </>
              )}
              {treatment.purpose && (
                <>
                  <DataItemLabel>Purpose</DataItemLabel>
                  <DataItemValue>{treatment.purpose}</DataItemValue>
                </>
              )}
              {truthyOrZero(treatment.post_treatment_time) && (
                <>
                  <DataItemLabel>Post-Treatment Time</DataItemLabel>
                  <DataItemValue>
                    {treatment.post_treatment_time}{" "}
                    {treatment.post_treatment_time_units}
                    {treatment.post_treatment_time === 1 ? "" : "s"}
                  </DataItemValue>
                </>
              )}
              {truthyOrZero(treatment.temperature) && (
                <>
                  <DataItemLabel>Temperature</DataItemLabel>
                  <DataItemValue>
                    {treatment.temperature}{" "}
                    {treatment.temperature_units === "Celsius"
                      ? `${UC.deg}C`
                      : treatment.temperature_units}
                  </DataItemValue>
                </>
              )}
              {treatment.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{treatment.submitter_comment}</DataItemValue>
                </>
              )}
              {treatment.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={treatment.aliases} />
                  </DataItemValue>
                </>
              )}
              {(treatment.lot_id ||
                treatment.product_id ||
                sources.length > 0) && (
                <>
                  <DataItemLabel>Sources</DataItemLabel>
                  <DataItemValue>
                    <ProductInfo
                      lotId={treatment.lot_id}
                      productId={treatment.product_id}
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

Treatment.propTypes = {
  // Technical treatment to display
  treatment: PropTypes.object.isRequired,
  // Documents treatment
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this treatment
  attribution: PropTypes.object,
  // Source lab or source for this treatment
  sources: PropTypes.arrayOf(PropTypes.object),
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const treatment = await request.getObject(`/treatments/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(treatment)) {
    const documents = treatment.documents
      ? await requestDocuments(treatment.documents, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      treatment,
      "treatment_term_id",
      req.headers.cookie
    );
    let sources = [];
    if (treatment.sources?.length > 0) {
      const sourcePaths = treatment.sources.map((source) => source["@id"]);
      sources = await request.getMultipleObjects(sourcePaths, null, {
        filterErrors: true,
      });
    }
    const attribution = await buildAttribution(treatment, req.headers.cookie);
    return {
      props: {
        treatment,
        documents,
        sources,
        pageContext: { title: treatment.treatment_term_id },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(treatment);
}

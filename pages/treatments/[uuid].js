// node_modules
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
import ProductInfo from "../../components/product-info";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import { usePagePanels } from "../../components/page-panels";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
// lib
import buildAttribution from "../../lib/attribution";
import { requestDocuments, requestBiosamples } from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function Treatment({
  treatment,
  biosamplesTreated,
  documents,
  attribution,
  sources,
  isJson,
}) {
  const pagePanels = usePagePanels(treatment["@id"]);

  return (
    <>
      <Breadcrumbs item={treatment} />
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
              <DataItemLabel>Treatment Summary</DataItemLabel>
              <DataItemValue>{treatment.summary}</DataItemValue>
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
          {biosamplesTreated.length > 0 && (
            <SampleTable
              samples={biosamplesTreated}
              title="Treated Biosamples"
              pagePanels={pagePanels}
              pagePanelId="biosamples-treated"
            />
          )}
          {documents.length > 0 && (
            <DocumentTable
              documents={documents}
              pagePanels={pagePanels}
              pagePanelId="documents"
            />
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
  // Biosamples treated by this treatment
  biosamplesTreated: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  const treatment = (
    await request.getObject(`/treatments/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(treatment)) {
    const biosamplesTreated = treatment.biosamples_treated
      ? await requestBiosamples(treatment.biosamples_treated, request)
      : [];
    const documents = treatment.documents
      ? await requestDocuments(treatment.documents, request)
      : [];
    const treatmentId =
      treatment.treatment_type === "environmental"
        ? treatment.summary
        : treatment.treatment_term_id;
    let sources = [];
    if (treatment.sources?.length > 0) {
      const sourcePaths = treatment.sources.map((source) => source["@id"]);
      sources = Ok.all(
        await request.getMultipleObjects(sourcePaths, {
          filterErrors: true,
        })
      );
    }
    const attribution = await buildAttribution(treatment, req.headers.cookie);
    return {
      props: {
        treatment,
        biosamplesTreated,
        documents,
        sources,
        pageContext: {
          title: treatmentId,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(treatment);
}

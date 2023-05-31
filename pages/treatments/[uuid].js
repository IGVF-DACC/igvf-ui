// node_modules
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
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
import JsonDisplay from "../../components/json-display";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { UC } from "../../lib/constants";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function Treatment({ treatment, documents, isJson }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={treatment}>
        <PagePreamble />
        <JsonDisplay item={treatment} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Treatment Term Name</DataItemLabel>
              <DataItemValue>{treatment.treatment_term_name}</DataItemValue>
              <DataItemLabel>Treatment Type</DataItemLabel>
              <DataItemValue>{treatment.treatment_type}</DataItemValue>
              <DataItemLabel>Amount</DataItemLabel>
              <DataItemValue>
                {treatment.amount} {treatment.amount_units}
              </DataItemValue>
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
            </DataArea>
          </DataPanel>
          {documents.length > 0 && (
            <>
              <DataAreaTitle>Documents</DataAreaTitle>
              <DocumentTable documents={documents} />
            </>
          )}
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
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const treatment = await request.getObject(`/treatments/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(treatment)) {
    const documents = treatment.documents
      ? await request.getMultipleObjects(treatment.documents, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      treatment,
      "treatment_term_id",
      req.headers.cookie
    );
    return {
      props: {
        treatment,
        documents,
        pageContext: { title: treatment.treatment_term_id },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(treatment);
}

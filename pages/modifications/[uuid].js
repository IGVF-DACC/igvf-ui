import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import PagePreamble from "../../components/page-preamble";
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { PropTypes } from "prop-types";

export default function Modification({ modification, isJson }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={modification}>
        <PagePreamble />
        <JsonDisplay item={modification} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Modality</DataItemLabel>
              <DataItemValue>{modification.modality}</DataItemValue>
              <DataItemLabel>Cas</DataItemLabel>
              <DataItemValue>{modification.cas}</DataItemValue>
              <DataItemLabel>Fused Domain</DataItemLabel>
              <DataItemValue>{modification.fused_domain}</DataItemValue>
              {modification.tagged_protein && (
                <>
                  <DataItemLabel>Tagged Protein</DataItemLabel>
                  <DataItemValue>{modification.tagged_protein}</DataItemValue>
                </>
              )}
              <DataItemLabel>Product ID</DataItemLabel>
              <DataItemValue>{modification.product_id}</DataItemValue>
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Modification.propTypes = {
  modification: PropTypes.object.isRequired,
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
      "summary",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      modification,
      req.headers.cookie
    );
    return {
      props: {
        modification,
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(modification);
}

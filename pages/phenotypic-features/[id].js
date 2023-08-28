// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
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
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { getPhenotypicFeatureTitle } from "../../lib/phenotypic-feature";
import { isJsonFormat } from "../../lib/query-utils";

export default function PhenotypicFeature({
  phenotypicFeature,
  isJson,
  attribution = null,
}) {
  const feature = `${phenotypicFeature.feature.term_name} (${phenotypicFeature.feature.term_id})`;
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={phenotypicFeature}>
        <PagePreamble />
        <ObjectPageHeader item={phenotypicFeature} isJsonFormat={isJson} />
        <JsonDisplay item={phenotypicFeature} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Phenotypic Feature</DataItemLabel>
              <DataItemValue>
                <Link href={phenotypicFeature.feature["@id"]}>{feature}</Link>
              </DataItemValue>
              {truthyOrZero(phenotypicFeature.quantity) && (
                <>
                  <DataItemLabel>Quantity</DataItemLabel>
                  <DataItemValue>
                    {phenotypicFeature.quantity}{" "}
                    {phenotypicFeature.quantity_units}
                  </DataItemValue>
                </>
              )}
              {phenotypicFeature.observation_date && (
                <>
                  <DataItemLabel>Observation Date</DataItemLabel>
                  <DataItemValue>
                    {phenotypicFeature.observation_date}
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

PhenotypicFeature.propTypes = {
  // Data for PhenotypicFeature displayed on the page
  phenotypicFeature: PropTypes.object.isRequired,
  // Attribution for this measurement set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const phenotypicFeature = await request.getObject(
    `/phenotypic-features/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(phenotypicFeature)) {
    const attribution = await buildAttribution(
      phenotypicFeature,
      req.headers.cookie
    );
    const title = getPhenotypicFeatureTitle(phenotypicFeature);
    const breadcrumbs = await buildBreadcrumbs(
      phenotypicFeature,
      phenotypicFeature.uuid,
      req.headers.cookie
    );
    return {
      props: {
        phenotypicFeature,
        pageContext: { title },
        breadcrumbs,
        isJson,
        attribution,
      },
    };
  }
  return errorObjectToProps(phenotypicFeature);
}

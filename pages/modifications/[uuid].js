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
import { isJsonFormat } from "../../lib/query-utils";

export default function Modification({
  modification,
  gene,
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
            </DataArea>
          </DataPanel>
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Modification.propTypes = {
  // Modification to display
  modification: PropTypes.object.isRequired,
  // The gene referenced by the Modification
  gene: PropTypes.object,
  // Attribution for the modification
  attribution: PropTypes.object,
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
    return {
      props: {
        modification,
        pageContext: {
          title: modification.summary,
        },
        breadcrumbs,
        gene,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(modification);
}

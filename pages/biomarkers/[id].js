// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
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
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import { getBiomarkerTitle } from "../../lib/biomarker";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function Biomarker({
  biomarker,
  gene,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={biomarker}>
        <PagePreamble />
        <ObjectPageHeader item={biomarker} isJsonFormat={isJson} />
        <JsonDisplay item={biomarker} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Name</DataItemLabel>
              <DataItemValue>{biomarker.name}</DataItemValue>
              <DataItemLabel>Quantification</DataItemLabel>
              <DataItemValue>{biomarker.quantification}</DataItemValue>
              {biomarker.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{biomarker.description}</DataItemValue>
                </>
              )}
              {biomarker.classification && (
                <>
                  <DataItemLabel>Classification</DataItemLabel>
                  <DataItemValue>{biomarker.classification}</DataItemValue>
                </>
              )}
              {biomarker.gene && (
                <>
                  <DataItemLabel>Gene</DataItemLabel>
                  <DataItemValue>
                    <Link href={gene["@id"]}>{gene.symbol}</Link>
                  </DataItemValue>
                </>
              )}
              {biomarker.synonyms?.length > 0 && (
                <>
                  <DataItemLabel>Synonyms</DataItemLabel>
                  <DataItemValue>{biomarker.synonyms.join(", ")}</DataItemValue>
                </>
              )}
              {biomarker.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={biomarker.aliases} />
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

Biomarker.propTypes = {
  // Biomarker object to display
  biomarker: PropTypes.object.isRequired,
  // Gene that submitted this biomarker
  gene: PropTypes.object,
  // Attribution for this biomarker
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const biomarker = await request.getObject(`/biomarkers/${params.id}/`);
  if (FetchRequest.isResponseSuccess(biomarker)) {
    const gene = await request.getObject(biomarker.gene, null);
    const breadcrumbs = await buildBreadcrumbs(
      biomarker,
      "name",
      req.headers.cookie,
    );
    const attribution = await buildAttribution(biomarker, req.headers.cookie);
    const title = getBiomarkerTitle(biomarker);
    return {
      props: {
        biomarker,
        gene,
        pageContext: { title },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(biomarker);
}

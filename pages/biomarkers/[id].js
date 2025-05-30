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
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import { getBiomarkerTitle } from "../../lib/biomarker";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function Biomarker({
  biomarker,
  gene,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={biomarker} />
      <EditableItem item={biomarker}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={biomarker} isJsonFormat={isJson} />
        <JsonDisplay item={biomarker} isJsonFormat={isJson}>
          <StatusPreviewDetail item={biomarker} />
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
              {biomarker.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{biomarker.submitter_comment}</DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
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
  const biomarker = (
    await request.getObject(`/biomarkers/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(biomarker)) {
    const gene = biomarker.gene
      ? (await request.getObject(biomarker.gene)).optional()
      : null;
    const attribution = await buildAttribution(biomarker, req.headers.cookie);
    const title = getBiomarkerTitle(biomarker);
    return {
      props: {
        biomarker,
        gene,
        pageContext: { title },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(biomarker);
}

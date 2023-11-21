// node_modules
import { PropTypes } from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import humanGenomicVariantTitle from "../../lib/human-genomic-variant-title";
import { isJsonFormat } from "../../lib/query-utils";

export default function HumanGenomicVariant({ variant, isJson }) {
  // reference_sequence/refseq_id
  const [label, seqRef] = variant.refseq_id
    ? ["RefSeq Sequence Identifier", variant.refseq_id]
    : ["Reference Sequence", variant.reference_sequence];
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={variant}>
        <PagePreamble pageTitle={humanGenomicVariantTitle(variant)} />
        <ObjectPageHeader item={variant} isJsonFormat={isJson} />
        <JsonDisplay item={variant} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Assembly</DataItemLabel>
              <DataItemValue>{variant.assembly}</DataItemValue>
              <DataItemLabel>{label}</DataItemLabel>
              <DataItemValue>{seqRef}</DataItemValue>
              {variant.chromosome && (
                <>
                  <DataItemLabel>Chromosome</DataItemLabel>
                  <DataItemValue>{variant.chromosome}</DataItemValue>
                </>
              )}
              <DataItemLabel>Position</DataItemLabel>
              <DataItemValue>{variant.position}</DataItemValue>
              <DataItemLabel>Reference Allele</DataItemLabel>
              <DataItemValue>{variant.ref}</DataItemValue>
              <DataItemLabel>Alternative Allele</DataItemLabel>
              <DataItemValue>{variant.alt}</DataItemValue>
              {variant.rsid && (
                <>
                  <DataItemLabel>RS Identifier</DataItemLabel>
                  <DataItemValue>{variant.rsid}</DataItemValue>
                </>
              )}
              {variant.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>{variant.aliases.join(", ")}</DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

HumanGenomicVariant.propTypes = {
  // Variant to display
  variant: PropTypes.object.isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const variant = (
    await request.getObject(`/human-genomic-variants/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(variant)) {
    const breadcrumbs = await buildBreadcrumbs(
      variant,
      variant.position,
      req.headers.cookie
    );
    return {
      props: {
        variant,
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(variant);
}

import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { PropTypes } from "prop-types";
import { humanGenomicVariantTitle } from "../../components/search/list-renderer/human-genomic-variant";

export default function HumanGenomicVariant({ variant }) {
  // reference_sequence/refseq_id
  const [label, seqRef] = variant.refseq_id
    ? ["RefSeq Sequence Identifier", variant.refseq_id]
    : ["Reference Sequence", variant.reference_sequence];
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={variant}>
        <PagePreamble pageTitle={humanGenomicVariantTitle(variant)} />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={variant.status} />
            </DataItemValue>
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
      </EditableItem>
    </>
  );
}

HumanGenomicVariant.propTypes = {
  // Variant to display
  variant: PropTypes.object.isRequired,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const variant = await request.getObject(
    `/human-genomic-variants/${params.uuid}/`
  );
  if (FetchRequest.isResponseSuccess(variant)) {
    const breadcrumbs = await buildBreadcrumbs(
      variant,
      "position",
      req.headers.cookie
    );
    return {
      props: {
        variant,
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(variant);
}

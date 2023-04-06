// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { BiosampleDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import TreatmentTable from "../../components/treatment-table";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import buildAttribution from "../../lib/attribution";

export default function Tissue({
  tissue,
  donors,
  documents,
  source = null,
  treatments,
  biosampleTerm = null,
  diseaseTerms,
  pooledFrom,
  partOf,
  attribution = null,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={tissue}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={tissue.status} />
            </DataItemValue>
            <BiosampleDataItems
              biosample={tissue}
              source={source}
              donors={donors}
              biosampleTerm={biosampleTerm}
              diseaseTerms={diseaseTerms}
              pooledFrom={pooledFrom}
              partOf={partOf}
              options={{
                dateObtainedTitle: "Date Harvested",
              }}
            >
              {tissue.pmi && (
                <>
                  <DataItemLabel>Post-mortem Interval</DataItemLabel>
                  <DataItemValue>
                    {tissue.pmi}
                    {tissue.pmi_units ? (
                      <>
                        {" "}
                        {tissue.pmi_units}
                        {tissue.pmi_units === 1 ? "" : "s"}
                      </>
                    ) : (
                      ""
                    )}
                  </DataItemValue>
                </>
              )}
              {tissue.preservation_method && (
                <>
                  <DataItemLabel>Preservation Method</DataItemLabel>
                  <DataItemValue>{tissue.preservation_method}</DataItemValue>
                </>
              )}
            </BiosampleDataItems>
          </DataArea>
        </DataPanel>
        {treatments?.length > 0 && (
          <>
            <DataAreaTitle>Treatments</DataAreaTitle>
            <TreatmentTable treatments={treatments} />
          </>
        )}
        {documents.length > 0 && (
          <>
            <DataAreaTitle>Documents</DataAreaTitle>
            <DocumentTable documents={documents} />
          </>
        )}
        <Attribution attribution={attribution} />
      </EditableItem>
    </>
  );
}

Tissue.propTypes = {
  // Tissue sample to display
  tissue: PropTypes.object.isRequired,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Source lab or source for this sample
  source: PropTypes.object,
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample ontology for this sample
  biosampleTerm: PropTypes.object,
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample(s) Pooled From
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Part of Biosample
  partOf: PropTypes.object,
  // Attribution for this sample
  attribution: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const tissue = await request.getObject(`/tissues/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(tissue)) {
    const biosampleTerm = tissue.biosample_term
      ? await request.getObject(tissue.biosample_term["@id"], null)
      : null;
    let diseaseTerms = [];
    if (tissue.disease_terms?.length > 0) {
      const diseaseTermPaths = tissue.disease_terms.map((term) => term["@id"]);
      diseaseTerms = tissue.disease_terms
        ? await request.getMultipleObjects(diseaseTermPaths, null, {
            filterErrors: true,
          })
        : [];
    }
    const documents = tissue.documents
      ? await request.getMultipleObjects(tissue.documents, null, {
          filterErrors: true,
        })
      : [];
    const donors = tissue.donors
      ? await request.getMultipleObjects(tissue.donors, null, {
          filterErrors: true,
        })
      : [];
    const source = await request.getObject(tissue.source, null);
    const treatments = tissue.treatments
      ? await request.getMultipleObjects(tissue.treatments, null, {
          filterErrors: true,
        })
      : [];
    const pooledFrom =
      tissue.pooled_from?.length > 0
        ? await request.getMultipleObjects(tissue.pooled_from, null, {
            filterErrors: true,
          })
        : [];
    const partOf = tissue.part_of
      ? await request.getObject(tissue.part_of, null)
      : null;
    const breadcrumbs = await buildBreadcrumbs(
      tissue,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(tissue, req.headers.cookie);
    return {
      props: {
        tissue,
        documents,
        donors,
        source,
        treatments,
        biosampleTerm,
        diseaseTerms,
        pooledFrom,
        partOf,
        pageContext: {
          title: `${tissue.biosample_term.term_name} — ${tissue.accession}`,
        },
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(tissue);
}

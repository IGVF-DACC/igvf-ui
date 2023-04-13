// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { BiosampleDataItems } from "../../components/common-data-items";
import { DataArea, DataAreaTitle, DataPanel } from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import TreatmentTable from "../../components/treatment-table";
import BiomarkerTable from "../../components/biomarker-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function WholeOrganism({
  sample,
  donors,
  documents,
  source = null,
  treatments,
  biosampleTerm = null,
  diseaseTerms,
  pooledFrom,
  biomarkers,
  partOf,
  attribution = null,
}) {
  console.log(sample);
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sample}>
        <PagePreamble />
        <ObjectPageHeader item={sample} />
        <DataPanel>
          <DataArea>
            <BiosampleDataItems
              biosample={sample}
              source={source}
              donors={donors}
              biosampleTerm={biosampleTerm}
              diseaseTerms={diseaseTerms}
              pooledFrom={pooledFrom}
              partOf={partOf}
              options={{
                dateObtainedTitle: "Date Obtained",
              }}
            ></BiosampleDataItems>
          </DataArea>
        </DataPanel>
        {biomarkers.length > 0 && (
          <>
            <DataAreaTitle>Biomarkers</DataAreaTitle>
            <BiomarkerTable biomarkers={biomarkers} />
          </>
        )}
        {treatments.length > 0 && (
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

WholeOrganism.propTypes = {
  // WholeOrganism sample to display
  sample: PropTypes.object.isRequired,
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
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object),
  // Part of Biosample
  partOf: PropTypes.object,
  // Attribution for this sample
  attribution: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sample = await request.getObject(`/whole-organisms/${params.id}/`);
  if (FetchRequest.isResponseSuccess(sample)) {
    const biosampleTerm = sample.biosample_term
      ? await request.getObject(sample.biosample_term["@id"], null)
      : null;
    let diseaseTerms = [];
    if (sample.disease_terms?.length > 0) {
      const diseaseTermPaths = sample.disease_terms.map(
        (diseaseTerm) => diseaseTerm["@id"]
      );
      diseaseTerms = await request.getMultipleObjects(diseaseTermPaths, null, {
        filterErrors: true,
      });
    }
    const documents = sample.documents
      ? await request.getMultipleObjects(sample.documents, null, {
          filterErrors: true,
        })
      : [];
    const donors = sample.donors
      ? await request.getMultipleObjects(sample.donors, null, {
          filterErrors: true,
        })
      : [];
    const source = await request.getObject(sample.source["@id"], null);
    let treatments = [];
    if (sample.treatments?.length > 0) {
      const treatmentPaths = sample.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await request.getMultipleObjects(treatmentPaths, null, {
        filterErrors: true,
      });
    }
    const pooledFrom =
      sample.pooled_from?.length > 0
        ? await request.getMultipleObjects(sample.pooled_from, null, {
            filterErrors: true,
          })
        : [];
    const biomarkers =
      sample.biomarkers?.length > 0
        ? await request.getMultipleObjects(
            // Biomarkers are embedded in whole organism, so we map
            // to get as a list of IDs for the request
            sample.biomarkers.map((m) => m["@id"]),
            null,
            {
              filterErrors: true,
            }
          )
        : [];
    const partOf = sample.part_of
      ? await request.getObject(sample.part_of, null)
      : null;
    const breadcrumbs = await buildBreadcrumbs(
      sample,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(sample, req.headers.cookie);
    return {
      props: {
        sample,
        documents,
        donors,
        source,
        treatments,
        biosampleTerm,
        diseaseTerms,
        pooledFrom,
        partOf,
        biomarkers,
        pageContext: {
          title: `${biosampleTerm ? `${biosampleTerm.term_name} — ` : ""}${
            sample.accession
          }`,
        },
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(sample);
}

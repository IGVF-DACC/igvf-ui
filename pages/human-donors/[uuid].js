// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { DonorDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import ExternalResources from "../../components/external-resources";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";

export default function HumanDonor({
  donor,
  award = null,
  documents,
  lab = null,
  parents,
  phenotypicFeatures,
  phenotypeTermsList,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={donor}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={donor.status} />
            </DataItemValue>
            <DonorDataItems donor={donor} parents={parents} />
          </DataArea>
        </DataPanel>
        {phenotypicFeatures.length > 0 && (
          <>
            <DataAreaTitle>Phenotypic Features</DataAreaTitle>
            <PhenotypicFeatureTable
              phenotypicFeatures={phenotypicFeatures}
              phenotypeTermsList={phenotypeTermsList}
            />
          </>
        )}
        <ExternalResources resources={donor.external_resources} />
        {documents.length > 0 && (
          <>
            <DataAreaTitle>Documents</DataAreaTitle>
            <DocumentTable documents={documents} />
          </>
        )}
        <Attribution award={award} lab={lab} collections={donor.collections} />
      </EditableItem>
    </>
  );
}

HumanDonor.propTypes = {
  // Human donor to display
  donor: PropTypes.object.isRequired,
  // Award applied to this human donor
  award: PropTypes.object,
  // Documents associated with human donor
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this human donor
  lab: PropTypes.object,
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Phenotypic Features of this donor with the feature term embedded
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object),
  // Phenotype terms associated with the above features
  phenotypeTermsList: PropTypes.arrayOf(PropTypes.object),
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donor = await request.getObject(`/human-donors/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(donor)) {
    const award = await request.getObject(donor.award["@id"], null);
    const documents = donor.documents
      ? await request.getMultipleObjects(donor.documents, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(donor.lab["@id"], null);
    const parents = donor.parents
      ? await request.getMultipleObjects(donor.parents, null, {
          filterErrors: true,
        })
      : [];
    const phenotypicFeatures = donor.phenotypic_features
      ? await request.getMultipleObjects(donor.phenotypic_features, null, {
          filterErrors: true,
        })
      : [];
    const phenotypeTermsList =
      phenotypicFeatures.length > 0
        ? await request.getMultipleObjects([
            ...new Set(
              phenotypicFeatures.map((phenotype) => phenotype.feature)
            ),
          ])
        : [];

    const breadcrumbs = await buildBreadcrumbs(
      donor,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        donor,
        award,
        documents,
        lab,
        parents,
        pageContext: { title: donor.accession },
        phenotypicFeatures,
        phenotypeTermsList,
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(donor);
}

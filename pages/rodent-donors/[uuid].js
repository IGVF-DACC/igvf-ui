// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { DonorDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import ExternalResources from "../../components/external-resources";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const RodentDonor = ({ donor, award = null, lab = null, parents }) => {
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
            <DonorDataItems donor={donor} parents={parents}>
              <DataItemLabel>Strain</DataItemLabel>
              <DataItemValue>{donor.strain}</DataItemValue>
              {donor.strain_background && (
                <>
                  <DataItemLabel>Strain Background</DataItemLabel>
                  <DataItemValue>{donor.strain_background}</DataItemValue>
                </>
              )}
              {donor.genotype && (
                <>
                  <DataItemLabel>Genotype</DataItemLabel>
                  <DataItemValue>{donor.genotype}</DataItemValue>
                </>
              )}
            </DonorDataItems>
          </DataArea>
        </DataPanel>
        <ExternalResources resources={donor.external_resources} />
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
};

RodentDonor.propTypes = {
  // Technical sample to display
  donor: PropTypes.object.isRequired,
  // Award applied to this technical sample
  award: PropTypes.object,
  // Lab that submitted this technical sample
  lab: PropTypes.object,
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RodentDonor;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donor = await request.getObject(`/rodent-donors/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(donor)) {
    const award = await request.getObject(donor.award, null);
    const lab = await request.getObject(donor.lab, null);
    const parents = donor.parents
      ? await request.getMultipleObjects(donor.parents, null, {
          filterErrors: true,
        })
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
        lab,
        parents,
        pageContext: { title: donor.accession },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(donor);
};

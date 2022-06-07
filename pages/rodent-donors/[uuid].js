// node_modules
import PropTypes from "prop-types"
// components
import Attribution from "../../components/attribution"
import Breadcrumbs from "../../components/breadcrumbs"
import { DonorDataItems } from "../../components/common-data-items"
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area"
import { EditLink } from '../../components/edit-func'
import ExternalResources from "../../components/external-resources"
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const RodentDonor = ({ donor, award, lab, parents, uuid }) => {
  return (
    <>
      <Breadcrumbs />
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
      <EditLink path={`/rodent-donors/${uuid}`} item={donor}/>
    </>
  )
}

RodentDonor.propTypes = {
  // Technical sample to display
  donor: PropTypes.object.isRequired,
  // Award applied to this technical sample
  award: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // UUID of the current rodent donor item
  uuid: PropTypes.string.isRequired,
}

export default RodentDonor

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const donor = await request.getObject(`/rodent-donors/${params.uuid}/`)
  if (donor && donor.status !== "error") {
    const award = await request.getObject(donor.award)
    const lab = await request.getObject(donor.lab)
    const parents = await request.getMultipleObjects(donor.parents)
    const breadcrumbs = await buildBreadcrumbs(donor, "accession")
    return {
      props: {
        donor,
        award,
        lab,
        parents,
        pageContext: { title: donor.accession },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
        uuid: params.uuid,
      },
    }
  }
  return { notFound: true }
}

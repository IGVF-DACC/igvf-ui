// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataAreaTitle,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "../../components/data-area"
import ExternalResources from "../../components/external-resources"
import PagePreamble from "../../components/page-preamble"
import SeparatedList from "../../components/separated-list"
import Status from "../../components/status"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const RodentDonor = ({ donor, award, lab, parents }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataArea>
        <DataItem>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={donor.status} />
          </DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Taxa Identifier</DataItemLabel>
          <DataItemValue>{donor.taxon_id}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Sex</DataItemLabel>
          <DataItemValue>{donor.sex}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Strain</DataItemLabel>
          <DataItemValue>{donor.strain}</DataItemValue>
        </DataItem>
        {donor.strain_background && (
          <DataItem>
            <DataItemLabel>Strain Background</DataItemLabel>
            <DataItemValue>{donor.strain_background}</DataItemValue>
          </DataItem>
        )}
        {parents.length > 0 && (
          <DataItem>
            <DataItemLabel>Parents</DataItemLabel>
            <SeparatedList>
              {parents.map((parent) => (
                <Link href={parent["@id"]} key={parent.uuid}>
                  <a aria-label={`Parent Donor ${parent.accession}`}>
                    {parent.accession}
                  </a>
                </Link>
              ))}
            </SeparatedList>
          </DataItem>
        )}
      </DataArea>
      <ExternalResources resources={donor.external_resources} />
      <DataAreaTitle>Attribution</DataAreaTitle>
      <DataArea>
        <DataItem>
          <DataItemLabel>Award</DataItemLabel>
          <DataItemValue>
            <Link href={award["@id"]}>
              <a>{award.name}</a>
            </Link>
          </DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Lab</DataItemLabel>
          <DataItemValue>
            <Link href={lab["@id"]}>
              <a>{lab.title}</a>
            </Link>
          </DataItemValue>
        </DataItem>
        {donor.url && (
          <DataItem>
            <DataItemValue>
              <a href={donor.url} target="_blank" rel="noreferrer">
                Additional Information
              </a>
            </DataItemValue>
          </DataItem>
        )}
      </DataArea>
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
      },
    }
  }
  return { notFound: true }
}

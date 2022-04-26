// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "../../components/data-item"
import PagePreamble from "../../components/page-preamble"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const TechnicalSample = ({ sample, award, lab, source }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataArea>
        {sample.additional_description && (
          <DataItem>
            <DataItemLabel>Description</DataItemLabel>
            <DataItemValue>{sample.additional_description}</DataItemValue>
          </DataItem>
        )}
        <DataItem>
          <DataItemLabel>Sample Material</DataItemLabel>
          <DataItemValue>{sample.sample_material}</DataItemValue>
        </DataItem>
        {sample.product_id && (
          <DataItem>
            <DataItemLabel>Product ID</DataItemLabel>
            <DataItemValue>{sample.product_id}</DataItemValue>
          </DataItem>
        )}
        {sample.lot_id && (
          <DataItem>
            <DataItemLabel>Lot ID</DataItemLabel>
            <DataItemValue>{sample.lot_id}</DataItemValue>
          </DataItem>
        )}
        {sample.starting_amount && (
          <DataItem>
            <DataItemLabel>Starting Amount</DataItemLabel>
            <DataItemValue>
              {sample.starting_amount}
              {sample.starting_amount_units ? (
                <> {sample.starting_amount_units}</>
              ) : (
                ""
              )}
            </DataItemValue>
          </DataItem>
        )}
        {sample.technical_sample_ontology && (
          <DataItem>
            <DataItemLabel>Ontology</DataItemLabel>
            <DataItemValue>{sample.technical_sample_ontology}</DataItemValue>
          </DataItem>
        )}
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
        <DataItem>
          <DataItemLabel>Source</DataItemLabel>
          <DataItemValue>
            <Link href={source["@id"]}>
              <a>{lab.title}</a>
            </Link>
          </DataItemValue>
        </DataItem>
        {sample.url && (
          <DataItem>
            <DataItemValue>
              <a href={sample.url} target="_blank" rel="noreferrer">
                Additional Information
              </a>
            </DataItemValue>
          </DataItem>
        )}
      </DataArea>
    </>
  )
}

TechnicalSample.propTypes = {
  // Technical sample to display
  sample: PropTypes.object.isRequired,
  // Award applied to this technical sample
  award: PropTypes.object.isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.object.isRequired,
  // Source lab or source for this technical sample
  source: PropTypes.object.isRequired,
}

export default TechnicalSample

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const sample = await request.getObject(`/technical_samples/${params.uuid}/`)
  const award = await request.getObject(sample.award)
  const lab = await request.getObject(sample.lab)
  const source = await request.getObject(sample.source)
  const breadcrumbs = await buildBreadcrumbs(sample, "accession")
  return {
    props: {
      sample,
      award,
      lab,
      source,
      pageContext: { title: sample.accession },
      breadcrumbs,
    },
  }
}

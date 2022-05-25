/**
 * Use components in this module to display data common to multiple objects. Many object schemas
 * derive from others, so you would typically use these components to display properties within a
 * parent schema so that the components displaying objects for the child schemas can all display
 * the same parent properties.
 */

// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import { DataItemLabel, DataItemValue } from "./data-area"
import SeparatedList from "./separated-list"
import SourceProp from "./source-prop"
// libs
import { formatDate } from "../libs/dates"

/**
 * Display the data items common to all donor-derived objects.
 */
export const DonorDataItems = ({ donor, parents }) => {
  return (
    <>
      {donor.sex && (
        <>
          <DataItemLabel>Sex</DataItemLabel>
          <DataItemValue>{donor.sex}</DataItemValue>
        </>
      )}
      <DataItemLabel>Taxa Identifier</DataItemLabel>
      <DataItemValue>{donor.taxon_id}</DataItemValue>
      {parents.length > 0 && (
        <>
          <DataItemLabel>Parents</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {parents.map((parent) => (
                <Link href={parent["@id"]} key={parent.uuid}>
                  <a aria-label={`Parent Donor ${parent.accession}`}>
                    {parent.accession}
                  </a>
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
    </>
  )
}

DonorDataItems.propTypes = {
  // Object derived from donor.json schema
  donor: PropTypes.object.isRequired,
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
}

/**
 * Display data items common to all sample-derived objects.
 */
export const SampleDataItems = ({ sample, source = null }) => {
  return (
    <>
      {sample.product_id && (
        <>
          <DataItemLabel>Product ID</DataItemLabel>
          <DataItemValue>{sample.product_id}</DataItemValue>
        </>
      )}
      {sample.lot_id && (
        <>
          <DataItemLabel>Lot ID</DataItemLabel>
          <DataItemValue>{sample.lot_id}</DataItemValue>
        </>
      )}
      {source && (
        <>
          <DataItemLabel>Source</DataItemLabel>
          <DataItemValue>
            <SourceProp source={source} />
          </DataItemValue>
        </>
      )}
      {sample.starting_amount && (
        <>
          <DataItemLabel>Starting Amount</DataItemLabel>
          <DataItemValue>
            {sample.starting_amount}
            {sample.starting_amount_units ? (
              <> {sample.starting_amount_units}</>
            ) : (
              ""
            )}
          </DataItemValue>
        </>
      )}
      {sample.url && (
        <>
          <DataItemLabel>Additional Information</DataItemLabel>
          <DataItemValue>
            <a href={sample.url} target="_blank" rel="noreferrer">
              {sample.url}
            </a>
          </DataItemValue>
        </>
      )}
    </>
  )
}

SampleDataItems.propTypes = {
  // Object derived from the sample.json schema
  sample: PropTypes.object.isRequired,
  // Source lab or source for this sample
  source: PropTypes.object,
}

/**
 * Display data items common to all biosample-derived objects.
 */
export const BiosampleDataItems = ({
  biosample,
  source = null,
  donors = [],
  options = {
    dateObtainedTitle: "Date Obtained",
  },
}) => {
  return (
    <>
      <SampleDataItems sample={biosample} source={source} />
      {biosample.organism && (
        <>
          <DataItemLabel>Organism</DataItemLabel>
          <DataItemValue>{biosample.organism}</DataItemValue>
        </>
      )}
      {biosample.sex && (
        <>
          <DataItemLabel>Sex</DataItemLabel>
          <DataItemValue>{biosample.sex}</DataItemValue>
        </>
      )}
      {biosample.life_stage && (
        <>
          <DataItemLabel>Life Stage</DataItemLabel>
          <DataItemValue>{biosample.life_stage}</DataItemValue>
        </>
      )}
      {biosample.age && (
        <>
          <DataItemLabel>Age</DataItemLabel>
          <DataItemValue>
            {biosample.age}
            {biosample.age_units ? (
              <>
                {" "}
                {biosample.age_units}
                {biosample.age !== 1 ? "s" : ""}
              </>
            ) : (
              ""
            )}
          </DataItemValue>
        </>
      )}
      {biosample.date_obtained && (
        <>
          <DataItemLabel>{options.dateObtainedTitle}</DataItemLabel>
          <DataItemValue>{formatDate(biosample.date_obtained)}</DataItemValue>
        </>
      )}
      {biosample.biosample_ontology && (
        <>
          <DataItemLabel>Biosample</DataItemLabel>
          <DataItemValue>{biosample.biosample_ontology}</DataItemValue>
        </>
      )}
      {biosample.disease_ontology && (
        <>
          <DataItemLabel>Disease</DataItemLabel>
          <DataItemValue>{biosample.disease_ontology}</DataItemValue>
        </>
      )}
      {biosample.nih_institutional_certification && (
        <>
          <DataItemLabel>NIH Institutional Certification</DataItemLabel>
          <DataItemValue>
            {biosample.nih_institutional_certification}
          </DataItemValue>
        </>
      )}
      {donors.length > 0 && (
        <>
          <DataItemLabel>Donors</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {donors.map((donor) => (
                <Link href={donor["@id"]} key={donor.uuid}>
                  <a>{donor.accession}</a>
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
    </>
  )
}

BiosampleDataItems.propTypes = {
  // Object derived from the biosample.json schema
  biosample: PropTypes.object.isRequired,
  // Source lab or source for this biosample
  source: PropTypes.object,
  // Donors for this biosample
  donors: PropTypes.array,
  // General options to alter the display of the data items
  options: PropTypes.shape({
    // Title of date_obtained property
    dateObtainedTitle: PropTypes.string,
  }),
}

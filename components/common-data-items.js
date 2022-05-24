// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import { DataItem, DataItemLabel, DataItemValue } from "./data-area"
import SeparatedList from "./separated-list"
import SourceProp from "./source-prop"
// libs
import { formatDate } from "../libs/dates"

/**
 * Display data items common to all sample-derived objects.
 */
export const SampleDataItems = ({ sample, source = null }) => {
  return (
    <>
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
      {source && (
        <DataItem>
          <DataItemLabel>Source</DataItemLabel>
          <DataItemValue>
            <SourceProp source={source} />
          </DataItemValue>
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
      {sample.url && (
        <DataItem>
          <DataItemValue>
            <a href={sample.url} target="_blank" rel="noreferrer">
              Additional Information
            </a>
          </DataItemValue>
        </DataItem>
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
        <DataItem>
          <DataItemLabel>Organism</DataItemLabel>
          <DataItemValue>{biosample.organism}</DataItemValue>
        </DataItem>
      )}
      {biosample.sex && (
        <DataItem>
          <DataItemLabel>Sex</DataItemLabel>
          <DataItemValue>{biosample.sex}</DataItemValue>
        </DataItem>
      )}
      {biosample.life_stage && (
        <DataItem>
          <DataItemLabel>Life Stage</DataItemLabel>
          <DataItemValue>{biosample.life_stage}</DataItemValue>
        </DataItem>
      )}
      {biosample.age && (
        <DataItem>
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
        </DataItem>
      )}
      {biosample.date_obtained && (
        <DataItem>
          <DataItemLabel>{options.dateObtainedTitle}</DataItemLabel>
          <DataItemValue>{formatDate(biosample.date_obtained)}</DataItemValue>
        </DataItem>
      )}
      {biosample.biosample_ontology && (
        <DataItem>
          <DataItemLabel>Biosample</DataItemLabel>
          <DataItemValue>{biosample.biosample_ontology}</DataItemValue>
        </DataItem>
      )}
      {biosample.disease_ontology && (
        <DataItem>
          <DataItemLabel>Disease</DataItemLabel>
          <DataItemValue>{biosample.disease_ontology}</DataItemValue>
        </DataItem>
      )}
      {biosample.nih_institutional_certification && (
        <DataItem>
          <DataItemLabel>NIH Institutional Certification</DataItemLabel>
          <DataItemValue>
            {biosample.nih_institutional_certification}
          </DataItemValue>
        </DataItem>
      )}
      {donors.length > 0 && (
        <DataItem>
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
        </DataItem>
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

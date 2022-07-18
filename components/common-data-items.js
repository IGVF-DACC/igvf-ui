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
import AliasList from "./alias-list"
import { DataItemLabel, DataItemValue } from "./data-area"
import { OntologyTermId } from "./ontology"
import SeparatedList from "./separated-list"
import SourceProp from "./source-prop"
// libs
import { formatDate } from "../libs/dates"

/**
 * Display the data items common to all donor-derived objects.
 */
export const DonorDataItems = ({ donor, parents, children }) => {
  return (
    <>
      {donor.sex && (
        <>
          <DataItemLabel>Sex</DataItemLabel>
          <DataItemValue>{donor.sex}</DataItemValue>
        </>
      )}
      {donor.taxon_id && (
        <>
          <DataItemLabel>Taxa Identifier</DataItemLabel>
          <DataItemValue>{donor.taxon_id}</DataItemValue>
        </>
      )}
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
      {children}
      {donor.aliases.length > 0 && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={donor.aliases} />
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
export const SampleDataItems = ({ sample, source = null, children }) => {
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
            <a
              className="break-all"
              href={sample.url}
              target="_blank"
              rel="noreferrer"
            >
              {sample.url}
            </a>
          </DataItemValue>
        </>
      )}
      {children}
      {sample.aliases && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={sample.aliases} />
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
  biosampleTerm = null,
  diseaseTerm = null,
  options = {
    dateObtainedTitle: "Date Obtained",
  },
  children,
}) => {
  return (
    <SampleDataItems sample={biosample} source={source}>
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
      {biosampleTerm && (
        <>
          <DataItemLabel>Biosample</DataItemLabel>
          <DataItemValue>
            <Link href={biosampleTerm["@id"]}>
              <a>{biosampleTerm.term_id}</a>
            </Link>
          </DataItemValue>
        </>
      )}
      {diseaseTerm && (
        <>
          <DataItemLabel>Disease</DataItemLabel>
          <DataItemValue>
            <Link href={diseaseTerm["@id"]}>
              <a>{diseaseTerm.term_id}</a>
            </Link>
          </DataItemValue>
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
      {children}
    </SampleDataItems>
  )
}

BiosampleDataItems.propTypes = {
  // Object derived from the biosample.json schema
  biosample: PropTypes.object.isRequired,
  // Source lab or source for this biosample
  source: PropTypes.object,
  // Donors for this biosample
  donors: PropTypes.array,
  // Sample ontology for the biosample
  biosampleTerm: PropTypes.object,
  // Disease ontology for the biosample
  diseaseTerm: PropTypes.object,
  // General options to alter the display of the data items
  options: PropTypes.shape({
    // Title of date_obtained property
    dateObtainedTitle: PropTypes.string,
  }),
}

/**
 * Display data items common to all ontology-term-derived objects.
 */
export const OntologyTermDataItems = ({ ontologyTerm, children }) => {
  return (
    <>
      <DataItemLabel>Term Name</DataItemLabel>
      <DataItemValue>{ontologyTerm.term_name}</DataItemValue>
      <DataItemLabel>External Reference</DataItemLabel>
      <DataItemValue>
        <OntologyTermId termId={ontologyTerm.term_id} />
      </DataItemValue>
      {ontologyTerm.synonyms.length > 0 && (
        <>
          <DataItemLabel>Synonyms</DataItemLabel>
          <DataItemValue>{ontologyTerm.synonyms.join(", ")}</DataItemValue>
        </>
      )}
      {children}
    </>
  )
}

OntologyTermDataItems.propTypes = {
  // Ontology term object
  ontologyTerm: PropTypes.object.isRequired,
}

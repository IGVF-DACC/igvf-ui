/**
 * Use components in this module to display data common to multiple objects. Many object schemas
 * derive from others, so you would typically use these components to display properties within a
 * parent schema so that the components displaying objects for the child schemas can all display
 * the same parent properties.
 */

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AliasList from "./alias-list";
import { DataItemLabel, DataItemValue } from "./data-area";
import DbxrefList from "./dbxref-list";
import { OntologyTermId } from "./ontology";
import SeparatedList from "./separated-list";
import SourceProp from "./source-prop";
// lib
import { formatDate } from "../lib/dates";

/**
 * Display the data items common to all donor-derived objects.
 */
export function DonorDataItems({ donor, parents, children }) {
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
                <Link
                  href={parent["@id"]}
                  key={parent.uuid}
                  aria-label={`Parent Donor ${parent.accession}`}
                >
                  {parent.accession}
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
      {children}
      {donor.submitter_comment && (
        <>
          <DataItemLabel>Submitter Comment</DataItemLabel>
          <DataItemValue>{donor.submitter_comment}</DataItemValue>
        </>
      )}
      {donor.revoke_detail && (
        <>
          <DataItemLabel>Revoke Detail</DataItemLabel>
          <DataItemValue>{donor.revoke_detail}</DataItemValue>
        </>
      )}
      {donor.aliases?.length > 0 && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={donor.aliases} />
          </DataItemValue>
        </>
      )}
    </>
  );
}

DonorDataItems.propTypes = {
  // Object derived from donor.json schema
  donor: PropTypes.object.isRequired,
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Display data items common to all sample-derived objects.
 */
export function SampleDataItems({ sample, source = null, children }) {
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
      {sample.dbxrefs?.length > 0 && (
        <>
          <DataItemLabel>External Resources</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={sample.dbxrefs} />
          </DataItemValue>
        </>
      )}
      {children}
      {sample.submitter_comment && (
        <>
          <DataItemLabel>Submitter Comment</DataItemLabel>
          <DataItemValue>{sample.submitter_comment}</DataItemValue>
        </>
      )}
      {sample.revoke_detail && (
        <>
          <DataItemLabel>Revoke Detail</DataItemLabel>
          <DataItemValue>{sample.revoke_detail}</DataItemValue>
        </>
      )}
      {sample.aliases && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={sample.aliases} />
          </DataItemValue>
        </>
      )}
    </>
  );
}

SampleDataItems.propTypes = {
  // Object derived from the sample.json schema
  sample: PropTypes.object.isRequired,
  // Source lab or source for this sample
  source: PropTypes.object,
};

/**
 * Display data items common to all biosample-derived objects.
 */
export function BiosampleDataItems({
  biosample,
  source = null,
  donors = [],
  biosampleTerm = null,
  diseaseTerms,
  options = {
    dateObtainedTitle: "Date Obtained",
  },
  children,
}) {
  return (
    <SampleDataItems sample={biosample} source={source}>
      <DataItemLabel>Taxa</DataItemLabel>
      <DataItemValue>{biosample.taxa}</DataItemValue>
      {biosample.sex && (
        <>
          <DataItemLabel>Sex</DataItemLabel>
          <DataItemValue>{biosample.sex}</DataItemValue>
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
                {biosample.age !== "1" ? "s" : ""}
              </>
            ) : (
              ""
            )}
          </DataItemValue>
        </>
      )}
      {"embryonic" in biosample && (
        <>
          <DataItemLabel>Embryonic</DataItemLabel>
          <DataItemValue>
            <div className="h-5 w-5">{biosample.embryonic ? "yes" : "no"}</div>
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
          <DataItemLabel>Biosample Term</DataItemLabel>
          <DataItemValue>
            <Link href={biosampleTerm["@id"]}>{biosampleTerm.term_name}</Link>
          </DataItemValue>
        </>
      )}
      {diseaseTerms.length > 0 && (
        <>
          <DataItemLabel>Disease Terms</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {diseaseTerms.map((diseaseTerm) => (
                <Link href={diseaseTerm["@id"]} key={diseaseTerm.uuid}>
                  {diseaseTerm.term_name}
                </Link>
              ))}
            </SeparatedList>
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
                  {donor.accession}
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
      {children}
    </SampleDataItems>
  );
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
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // General options to alter the display of the data items
  options: PropTypes.shape({
    // Title of date_obtained property
    dateObtainedTitle: PropTypes.string,
  }),
};

/**
 * Display data items common to all ontology-term-derived objects.
 */
export function OntologyTermDataItems({ ontologyTerm, children }) {
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
      {ontologyTerm.submitter_comment && (
        <>
          <DataItemLabel>Submitter Comment</DataItemLabel>
          <DataItemValue>{ontologyTerm.submitter_comment}</DataItemValue>
        </>
      )}
    </>
  );
}

OntologyTermDataItems.propTypes = {
  // Ontology term object
  ontologyTerm: PropTypes.object.isRequired,
};

/**
 * Display data items common to all file-derived objects.
 */
export function FileDataItems({ file, fileSet, derivedFrom, children }) {
  return (
    <>
      <DataItemLabel>File Set</DataItemLabel>
      <DataItemValue>
        <Link
          href={fileSet["@id"]}
          aria-label={`FileSet ${fileSet.accession}`}
          key={fileSet.uuid}
        >
          {fileSet.accession}
        </Link>
      </DataItemValue>
      <DataItemLabel>File Format</DataItemLabel>
      <DataItemValue>{file.file_format}</DataItemValue>
      <DataItemLabel>Content Type</DataItemLabel>
      <DataItemValue>{file.content_type}</DataItemValue>
      <DataItemLabel>md5sum</DataItemLabel>
      <DataItemValue>{file.md5sum}</DataItemValue>
      {file.content_md5sum && (
        <>
          <DataItemLabel>Content MD5sum</DataItemLabel>
          <DataItemValue>{file.content_md5sum}</DataItemValue>
        </>
      )}
      {file.file_size && (
        <>
          <DataItemLabel>File Size</DataItemLabel>
          <DataItemValue>{file.file_size}</DataItemValue>
        </>
      )}
      {derivedFrom.length > 0 && (
        <>
          <DataItemLabel>Derived From</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {derivedFrom.map((file) => (
                <Link
                  href={file["@id"]}
                  aria-label={`file ${file.accession}`}
                  key={file.accession}
                >
                  {file.accession}
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
      {children}
      {file.aliases?.length > 0 && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={file.aliases} />
          </DataItemValue>
        </>
      )}
      {file.dbxrefs?.length > 0 && (
        <>
          <DataItemLabel>External Resources</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={file.dbxrefs} />
          </DataItemValue>
        </>
      )}
    </>
  );
}

FileDataItems.propTypes = {
  // file object common for all file types
  file: PropTypes.object.isRequired,
  // file set for this file
  fileSet: PropTypes.object.isRequired,
  // files this file is derived from
  derivedFrom: PropTypes.array.isRequired,
};

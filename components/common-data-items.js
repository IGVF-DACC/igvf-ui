/**
 * Use components in this module to display data common to multiple objects. Many object schemas
 * derive from others, so you would typically use these components to display properties within a
 * parent schema so that the components displaying objects for the child schemas can all display
 * the same parent properties.
 *
 * Each common data item renderer component in this module should include a `commonProperties`
 * property that lists the properties it displays. That lets the `UnknownTypePanel` component know
 * which remaining properties to display as generic properties. Be careful to maintain this list so
 * we don't have duplicate or missing properties for objects that don't have a custom page renderer.
 */

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AliasList from "./alias-list";
import { DataItemLabel, DataItemValue } from "./data-area";
import DbxrefList from "./dbxref-list";
import ProductInfo from "./product-info";
import SeparatedList from "./separated-list";
// lib
import { formatDate } from "../lib/dates";
import { truthyOrZero } from "../lib/general";

/**
 * Display the data items common to all donor-derived objects.
 */
export function DonorDataItems({ item, children }) {
  return (
    <>
      {item.taxa && (
        <>
          <DataItemLabel>Taxa</DataItemLabel>
          <DataItemValue>{item.taxa}</DataItemValue>
        </>
      )}
      {item.ethnicities?.length > 0 && (
        <>
          <DataItemLabel>Ethnicities</DataItemLabel>
          <DataItemValue>{item.ethnicities.join(", ")}</DataItemValue>
        </>
      )}
      {item.sex && (
        <>
          <DataItemLabel>Sex</DataItemLabel>
          <DataItemValue>{item.sex}</DataItemValue>
        </>
      )}
      {item.virtual && (
        <>
          <DataItemLabel>Virtual</DataItemLabel>
          <DataItemValue>True</DataItemValue>
        </>
      )}
      {children}
      {item.submitter_comment && (
        <>
          <DataItemLabel>Submitter Comment</DataItemLabel>
          <DataItemValue>{item.submitter_comment}</DataItemValue>
        </>
      )}
      {item.revoke_detail && (
        <>
          <DataItemLabel>Revoke Detail</DataItemLabel>
          <DataItemValue>{item.revoke_detail}</DataItemValue>
        </>
      )}
      {item.aliases?.length > 0 && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={item.aliases} />
          </DataItemValue>
        </>
      )}
      {item.references?.length > 0 && (
        <>
          <DataItemLabel>References</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.references} />
          </DataItemValue>
        </>
      )}
      {item.url && (
        <>
          <DataItemLabel>URL</DataItemLabel>
          <DataItemValue>
            <Link href={item.url}>{item.url}</Link>
          </DataItemValue>
        </>
      )}
    </>
  );
}

DonorDataItems.propTypes = {
  // Object derived from donor.json schema
  item: PropTypes.object.isRequired,
};

DonorDataItems.commonProperties = [
  "aliases",
  "ethnicities",
  "references",
  "revoke_detail",
  "sex",
  "submitter_comment",
  "taxa",
  "url",
];

/**
 * Display data items common to all sample-derived objects.
 */
export function SampleDataItems({
  item,
  sources = null,
  options = {
    dateObtainedTitle: "Date Obtained",
  },
  children,
}) {
  return (
    <>
      <DataItemLabel>Summary</DataItemLabel>
      <DataItemValue>{item.summary}</DataItemValue>
      {children}
      {(item.lot_id || sources) && (
        <>
          <DataItemLabel>Source</DataItemLabel>
          <DataItemValue>
            <ProductInfo
              lotId={item.lot_id}
              productId={item.product_id}
              sources={sources}
            />
          </DataItemValue>
        </>
      )}
      {truthyOrZero(item.starting_amount) && (
        <>
          <DataItemLabel>Starting Amount</DataItemLabel>
          <DataItemValue>
            {item.starting_amount}
            {item.starting_amount_units ? (
              <> {item.starting_amount_units}</>
            ) : (
              ""
            )}
          </DataItemValue>
        </>
      )}
      {item.date_obtained && (
        <>
          <DataItemLabel>{options.dateObtainedTitle}</DataItemLabel>
          <DataItemValue>{formatDate(item.date_obtained)}</DataItemValue>
        </>
      )}
      {item.url && (
        <>
          <DataItemLabel>Additional Information</DataItemLabel>
          <DataItemValue>
            <a
              className="break-all"
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              {item.url}
            </a>
          </DataItemValue>
        </>
      )}
      {item.dbxrefs?.length > 0 && (
        <>
          <DataItemLabel>External Resources</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.dbxrefs} />
          </DataItemValue>
        </>
      )}
      {item.submitter_comment && (
        <>
          <DataItemLabel>Submitter Comment</DataItemLabel>
          <DataItemValue>{item.submitter_comment}</DataItemValue>
        </>
      )}
      {item.revoke_detail && (
        <>
          <DataItemLabel>Revoke Detail</DataItemLabel>
          <DataItemValue>{item.revoke_detail}</DataItemValue>
        </>
      )}
      {item.aliases && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={item.aliases} />
          </DataItemValue>
        </>
      )}
    </>
  );
}

SampleDataItems.propTypes = {
  // Object derived from the sample.json schema
  item: PropTypes.object.isRequired,
  // Source lab or source for this sample
  source: PropTypes.object,
  // General options to alter the display of the data items
  options: PropTypes.shape({
    // Title of date_obtained property
    dateObtainedTitle: PropTypes.string,
  }),
};

SampleDataItems.commonProperties = [
  "aliases",
  "date_obtained",
  "dbxrefs",
  "lot_id",
  "revoke_detail",
  "starting_amount",
  "starting_amount_units",
  "summary",
  "url",
  "submitter_comment",
];

/**
 * Display data items common to all biosample-derived objects.
 */
export function BiosampleDataItems({
  item,
  sources = null,
  donors = null,
  sampleTerms = null,
  diseaseTerms = null,
  pooledFrom = null,
  partOf = null,
  classification = null,
  children,
}) {
  return (
    <SampleDataItems item={item} sources={sources}>
      {item.taxa && (
        <>
          <DataItemLabel>Taxa</DataItemLabel>
          <DataItemValue>{item.taxa}</DataItemValue>
        </>
      )}
      {sampleTerms?.length > 0 && (
        <>
          <DataItemLabel>Sample Term(s)</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {sampleTerms.map((sample_term) => (
                <Link href={sample_term["@id"]} key={sample_term["@id"]}>
                  {sample_term.term_name}
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
      {classification && (
        <>
          <DataItemLabel>Classification</DataItemLabel>
          <DataItemValue>{classification}</DataItemValue>
        </>
      )}
      {item.sex && (
        <>
          <DataItemLabel>Sex</DataItemLabel>
          <DataItemValue>{item.sex}</DataItemValue>
        </>
      )}
      <>
        <DataItemLabel>Age</DataItemLabel>
        <DataItemValue>
          {item.age === "unknown"
            ? item.embryonic
              ? "Embryonic"
              : "unknown"
            : item.embryonic
            ? `Embryonic ${item.age}`
            : item.age}
          {item.age_units ? (
            <>
              {" "}
              {item.age_units}
              {item.age !== "1" ? "s" : ""}
            </>
          ) : (
            ""
          )}
        </DataItemValue>
      </>
      {pooledFrom?.length > 0 && (
        <>
          <DataItemLabel>Biosample(s) Pooled From</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {pooledFrom.map((biosample) => (
                <Link href={biosample["@id"]} key={biosample["@id"]}>
                  {biosample.accession}
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
      {partOf && (
        <>
          <DataItemLabel>Part of Biosample</DataItemLabel>
          <DataItemValue>
            <Link href={partOf["@id"]}>{partOf.accession}</Link>
          </DataItemValue>
        </>
      )}
      {diseaseTerms?.length > 0 && (
        <>
          <DataItemLabel>Disease Terms</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {diseaseTerms.map((diseaseTerm) => (
                <Link href={diseaseTerm["@id"]} key={diseaseTerm["@id"]}>
                  {diseaseTerm.term_name}
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
      {item.nih_institutional_certification && (
        <>
          <DataItemLabel>NIH Institutional Certification</DataItemLabel>
          <DataItemValue>{item.nih_institutional_certification}</DataItemValue>
        </>
      )}
      {donors?.length > 0 && (
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
  item: PropTypes.object.isRequired,
  // Source lab or source for this biosample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Donors for this biosample
  donors: PropTypes.array,
  // Sample ontology for the biosample
  sampleTerms: PropTypes.object,
  // Disease ontology for the biosample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object),
  // Biosample(s) Pooled From
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Part of Biosample
  partOf: PropTypes.object,
  // Classification if this biosample has one
  classification: PropTypes.string,
};

BiosampleDataItems.commonProperties = [
  "age",
  "age_units",
  "nih_institutional_certification",
  "sex",
  "taxa",
];

/**
 * Display data items common to all ontology-term-derived objects.
 */
export function OntologyTermDataItems({ item, isA, children }) {
  return (
    <>
      <DataItemLabel>Term Name</DataItemLabel>
      <DataItemValue>{item.term_name}</DataItemValue>
      <DataItemLabel>External Reference</DataItemLabel>
      <DataItemValue>
        <DbxrefList dbxrefs={[item.term_id]} />
      </DataItemValue>
      {isA?.length > 0 && (
        <>
          <DataItemLabel>List of Term Names</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {isA.map((term) => (
                <Link href={term["@id"]} key={term.term_id}>
                  {term.term_name}
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
      {item.synonyms.length > 0 && (
        <>
          <DataItemLabel>Synonyms</DataItemLabel>
          <DataItemValue>{item.synonyms.join(", ")}</DataItemValue>
        </>
      )}
      {item.aliases?.length > 0 && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={item.aliases} />
          </DataItemValue>
        </>
      )}
      {children}
      {item.submitter_comment && (
        <>
          <DataItemLabel>Submitter Comment</DataItemLabel>
          <DataItemValue>{item.submitter_comment}</DataItemValue>
        </>
      )}
    </>
  );
}

OntologyTermDataItems.propTypes = {
  // Ontology term object
  item: PropTypes.object.isRequired,
  // List of term names
  isA: PropTypes.arrayOf(PropTypes.object),
};

OntologyTermDataItems.commonProperties = [
  "aliases",
  "submitter_comment",
  "synonyms",
  "term_id",
  "term_name",
];

/**
 * Display data items common to all file-derived objects.
 */
export function FileDataItems({
  item,
  fileSet = null,
  derivedFrom = null,
  children,
}) {
  return (
    <>
      {fileSet && (
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
        </>
      )}
      <DataItemLabel>File Format</DataItemLabel>
      <DataItemValue>{item.file_format}</DataItemValue>
      <DataItemLabel>Content Type</DataItemLabel>
      <DataItemValue>{item.content_type}</DataItemValue>
      <DataItemLabel>md5sum</DataItemLabel>
      <DataItemValue>{item.md5sum}</DataItemValue>
      {item.content_md5sum && (
        <>
          <DataItemLabel>Content MD5sum</DataItemLabel>
          <DataItemValue>{item.content_md5sum}</DataItemValue>
        </>
      )}
      {truthyOrZero(item.file_size) && (
        <>
          <DataItemLabel>File Size</DataItemLabel>
          <DataItemValue>{item.file_size}</DataItemValue>
        </>
      )}
      {derivedFrom?.length > 0 && (
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
      {item.aliases?.length > 0 && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={item.aliases} />
          </DataItemValue>
        </>
      )}
      {item.dbxrefs?.length > 0 && (
        <>
          <DataItemLabel>External Resources</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.dbxrefs} />
          </DataItemValue>
        </>
      )}
    </>
  );
}

FileDataItems.propTypes = {
  // file object common for all file types
  item: PropTypes.object.isRequired,
  // file set for this file
  fileSet: PropTypes.object,
  // files this file is derived from
  derivedFrom: PropTypes.array,
};

FileDataItems.commonProperties = [
  "aliases",
  "content_md5sum",
  "content_type",
  "dbxrefs",
  "file_format",
  "file_size",
  "md5sum",
];

/**
 * `UnknownTypePanel` uses the following data and functions to use common data item renderers based
 * on the parent type of unknown objects.
 */

/**
 * When adding a new common data item renderer component, add the @type that it handles as a key to
 * this object, and the corresponding component as the value. Keep the object keys in alphabetical
 * order to make them easier to find by visually scanning. This lets `UnknownTypePanel` find the
 * appropriate common data item renderer component for the parent type of an unknown object type.
 */
const commonDataRenderers = {
  Biosample: BiosampleDataItems,
  Donor: DonorDataItems,
  File: FileDataItems,
  OntologyTerm: OntologyTermDataItems,
};

/**
 * Data item renderer to use when no common data item renderer exists for the given unknown item's
 * parent type. It just lets `UnknownTypePanel` render all the unknown item's properties without
 * any common properties.
 */
function EmptyDataItems({ children }) {
  return <>{children}</>;
}

/**
 * Find a common data item renderer component, if any, appropriate for the given unknown item
 * object. Normally an appropriate renderer handles the unknown object's parent type. Return that
 * React component, or the `EmptyDataItems` renderer if none found.
 * @param {object} item Generic object
 * @returns {React.Component} Common data item renderer component
 */
export function findCommonDataRenderer(item) {
  const definedCommonDataTypes = Object.keys(commonDataRenderers);
  const commonDataType = item["@type"].find((type) =>
    definedCommonDataTypes.includes(type)
  );
  return commonDataType ? commonDataRenderers[commonDataType] : EmptyDataItems;
}

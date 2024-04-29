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
import { Fragment } from "react";
// components
import AliasList from "./alias-list";
import {
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueUrl,
} from "./data-area";
import DbxrefList from "./dbxref-list";
import ProductInfo from "./product-info";
import ReportLink from "./report-link";
import SeparatedList from "./separated-list";
// lib
import { formatDate } from "../lib/dates";
import { dataSize, truthyOrZero } from "../lib/general";

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
      {item.publication_identifiers?.length > 0 && (
        <>
          <DataItemLabel>Publication Identifiers</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.publication_identifiers} isCollapsible />
          </DataItemValue>
        </>
      )}
      {item.url && (
        <>
          <DataItemLabel>URL</DataItemLabel>
          <DataItemValueUrl>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.url}
            </a>
          </DataItemValueUrl>
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
  "publication_identifiers",
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
  sortedFractions,
  sources = null,
  constructLibrarySets = [],
  children,
}) {
  return (
    <>
      <DataItemLabel>Summary</DataItemLabel>
      <DataItemValue>{item.summary}</DataItemValue>
      {children}
      {constructLibrarySets.length > 0 && (
        <>
          <DataItemLabel>Construct Library Sets</DataItemLabel>
          <DataItemList isCollapsible>
            {constructLibrarySets.map((fileSet) => (
              <Fragment key={fileSet["@id"]}>
                <Link href={fileSet["@id"]}>{fileSet.accession}</Link>
                <span className="text-gray-600 dark:text-gray-400">
                  {" "}
                  {fileSet.summary}
                </span>
              </Fragment>
            ))}
          </DataItemList>
        </>
      )}
      {item.virtual && (
        <>
          <DataItemLabel>Virtual</DataItemLabel>
          <DataItemValue>True</DataItemValue>
        </>
      )}
      {item.taxa && (
        <>
          <DataItemLabel>Taxa</DataItemLabel>
          <DataItemValue>{item.taxa}</DataItemValue>
        </>
      )}
      {item.description && (
        <>
          <DataItemLabel>Description</DataItemLabel>
          <DataItemValue>{item.description}</DataItemValue>
        </>
      )}
      {(item.lot_id || sources) && (
        <>
          <DataItemLabel>Sources</DataItemLabel>
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
      {item.sorted_from && (
        <>
          <DataItemLabel>Sorted From Sample</DataItemLabel>
          <DataItemValue>
            <Link href={item.sorted_from["@id"]}>
              {item.sorted_from.accession}
            </Link>
            {item.sorted_from_detail && <> {item.sorted_from_detail}</>}
          </DataItemValue>
        </>
      )}
      {sortedFractions?.length > 0 && (
        <>
          <DataItemLabel>Sorted Fractions of Sample</DataItemLabel>
          <DataItemValue>
            <SeparatedList isCollapsible>
              {sortedFractions.map((sample) => (
                <Link href={sample["@id"]} key={sample.accession}>
                  {sample.accession}
                </Link>
              ))}
            </SeparatedList>
            <ReportLink
              href={`/multireport/?type=Sample&sorted_from.@id=${item["@id"]}`}
            />
          </DataItemValue>
        </>
      )}
      {item.multiplexed_in.length > 0 && (
        <>
          <DataItemLabel>Multiplexed In</DataItemLabel>
          <DataItemValue>
            <SeparatedList isCollapsible>
              {item.multiplexed_in.map((sample) => (
                <Link href={sample["@id"]} key={sample.accession}>
                  {sample.accession}
                </Link>
              ))}
            </SeparatedList>
            <ReportLink
              href={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${item["@id"]}`}
            />
          </DataItemValue>
        </>
      )}
      {item.date_obtained && (
        <>
          <DataItemLabel>Date Harvested</DataItemLabel>
          <DataItemValue>{formatDate(item.date_obtained)}</DataItemValue>
        </>
      )}
      {item.url && (
        <>
          <DataItemLabel>Additional Information</DataItemLabel>
          <DataItemValueUrl>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.url}
            </a>
          </DataItemValueUrl>
        </>
      )}
      {item.dbxrefs?.length > 0 && (
        <>
          <DataItemLabel>External Resources</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.dbxrefs} isCollapsible />
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
      {item.publication_identifiers && (
        <>
          <DataItemLabel>Publication Identifiers</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.publication_identifiers} isCollapsible />
          </DataItemValue>
        </>
      )}
    </>
  );
}

SampleDataItems.propTypes = {
  // Object derived from the sample.json schema
  item: PropTypes.object.isRequired,
  // Sorted fractions sample
  sortedFractions: PropTypes.arrayOf(PropTypes.object),
  // Source lab or source for this sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Construct library sets for this sample
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object),
};

SampleDataItems.commonProperties = [
  "aliases",
  "date_obtained",
  "dbxrefs",
  "description",
  "lot_id",
  "publication_identifiers",
  "revoke_detail",
  "sorted_from",
  "sorted_from_detail",
  "starting_amount",
  "starting_amount_units",
  "submitter_comment",
  "summary",
  "taxa",
  "url",
  "virtual",
];

/**
 * Display data items common to all biosample-derived objects.
 */
export function BiosampleDataItems({
  item,
  classification = null,
  constructLibrarySets = [],
  donors = null,
  diseaseTerms = null,
  partOf = null,
  parts = null,
  pooledFrom = null,
  pooledIn = null,
  sampleTerms = null,
  sortedFractions = null,
  sources = null,
  children,
}) {
  return (
    <SampleDataItems
      item={item}
      constructLibrarySets={constructLibrarySets}
      sources={sources}
      sortedFractions={sortedFractions}
    >
      {sampleTerms?.length > 0 && (
        <>
          <DataItemLabel>Sample Terms</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {sampleTerms.map((sampleTerm) => (
                <Link href={sampleTerm["@id"]} key={sampleTerm["@id"]}>
                  {sampleTerm.term_name}
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
      {item.embryonic && (
        <>
          <DataItemLabel>Embryonic</DataItemLabel>
          <DataItemValue>True</DataItemValue>
        </>
      )}
      {item.sex && (
        <>
          <DataItemLabel>Sex</DataItemLabel>
          <DataItemValue>{item.sex}</DataItemValue>
        </>
      )}
      {item.cellular_sub_pool && (
        <>
          <DataItemLabel>Cellular Sub Pool</DataItemLabel>
          <DataItemValue>{item.cellular_sub_pool}</DataItemValue>
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
          <DataItemLabel>Biosamples Pooled From</DataItemLabel>
          <DataItemValue>
            <SeparatedList isCollapsible>
              {pooledFrom.map((biosample) => (
                <Link href={biosample["@id"]} key={biosample["@id"]}>
                  {biosample.accession}
                </Link>
              ))}
            </SeparatedList>
            <ReportLink
              href={`/multireport/?type=Biosample&pooled_in=${item["@id"]}`}
            />
          </DataItemValue>
        </>
      )}
      {pooledIn?.length > 0 && (
        <>
          <DataItemLabel>Pooled In</DataItemLabel>
          <DataItemValue>
            <SeparatedList isCollapsible>
              {pooledIn.map((biosample) => (
                <Link href={biosample["@id"]} key={biosample["@id"]}>
                  {biosample.accession}
                </Link>
              ))}
            </SeparatedList>
            <ReportLink
              href={`/multireport/?type=Biosample&pooled_from=${item["@id"]}`}
            />
          </DataItemValue>
        </>
      )}
      {parts?.length > 0 && (
        <>
          <DataItemLabel>Sample Parts</DataItemLabel>
          <DataItemValue>
            <SeparatedList isCollapsible>
              {parts.map((biosample) => (
                <Link href={biosample["@id"]} key={biosample["@id"]}>
                  {biosample.accession}
                </Link>
              ))}
            </SeparatedList>
            <ReportLink
              href={`/multireport/?type=Biosample&part_of=${item["@id"]}`}
            />
          </DataItemValue>
        </>
      )}
      {partOf && (
        <>
          <DataItemLabel>Part of Sample</DataItemLabel>
          <DataItemValue>
            <Link href={partOf["@id"]}>{partOf.accession}</Link>
          </DataItemValue>
        </>
      )}
      {diseaseTerms?.length > 0 && (
        <>
          <DataItemLabel>Disease Terms</DataItemLabel>
          <DataItemValue>
            <SeparatedList isCollapsible>
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
            <SeparatedList isCollapsible>
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
  // Classification if this biosample has one
  classification: PropTypes.string,
  // Construct library sets for this biosample
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object),
  // Disease ontology for the biosample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object),
  // Donors for this biosample
  donors: PropTypes.array,
  // Part of Sample
  partOf: PropTypes.object,
  // Sample parts
  parts: PropTypes.arrayOf(PropTypes.object),
  // Pooled from sample
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Pooled in sample
  pooledIn: PropTypes.arrayOf(PropTypes.object),
  // Sample ontology for the biosample
  sampleTerms: PropTypes.arrayOf(PropTypes.object),
  // Sorted fractions sample
  sortedFractions: PropTypes.arrayOf(PropTypes.object),
  // Source lab or source for this biosample
  sources: PropTypes.arrayOf(PropTypes.object),
};

BiosampleDataItems.commonProperties = [
  "age",
  "age_units",
  "cellular_sub_pool",
  "embryonic",
  "nih_institutional_certification",
  "sex",
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
          <DataItemLabel>Is A</DataItemLabel>
          <DataItemValue>
            <SeparatedList isCollapsible>
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
export function FileDataItems({ item, fileSet = null, children }) {
  return (
    <>
      {fileSet && (
        <>
          <DataItemLabel>File Set</DataItemLabel>
          <DataItemValue>
            <div className="flex gap-1">
              <Link
                href={fileSet["@id"]}
                aria-label={`FileSet ${fileSet.accession}`}
                key={fileSet.uuid}
              >
                {fileSet.accession}
              </Link>
              ({fileSet.summary})
            </div>
          </DataItemValue>
        </>
      )}
      <DataItemLabel>File Format</DataItemLabel>
      <DataItemValue>{item.file_format}</DataItemValue>
      <DataItemLabel>Content Type</DataItemLabel>
      <DataItemValue>{item.content_type}</DataItemValue>
      {item.content_summary && (
        <>
          <DataItemLabel>Content Summary</DataItemLabel>
          <DataItemValue>{item.content_summary}</DataItemValue>
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
      {item.dbxrefs?.length > 0 && (
        <>
          <DataItemLabel>External Resources</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.dbxrefs} isCollapsible />
          </DataItemValue>
        </>
      )}
      <DataItemLabel>md5sum</DataItemLabel>
      <DataItemValue className="break-all">{item.md5sum}</DataItemValue>
      {item.content_md5sum && (
        <>
          <DataItemLabel>Content MD5sum</DataItemLabel>
          <DataItemValue>{item.content_md5sum}</DataItemValue>
        </>
      )}
      {truthyOrZero(item.file_size) && (
        <>
          <DataItemLabel>File Size</DataItemLabel>
          <DataItemValue>{dataSize(item.file_size)}</DataItemValue>
        </>
      )}
      {item.submitted_file_name && (
        <>
          <DataItemLabel>Submitted File Name</DataItemLabel>
          <DataItemValue className="break-all">
            {item.submitted_file_name}
          </DataItemValue>
        </>
      )}
      {item.validation_error_detail && (
        <>
          <DataItemLabel>Validation Error Detail</DataItemLabel>
          <DataItemValue>{item.validation_error_detail}</DataItemValue>
        </>
      )}
      {children}
    </>
  );
}

FileDataItems.propTypes = {
  // file object common for all file types
  item: PropTypes.object.isRequired,
  // file set for this file
  fileSet: PropTypes.object,
};

FileDataItems.commonProperties = [
  "aliases",
  "content_md5sum",
  "content_type",
  "content_summary",
  "dbxrefs",
  "file_format",
  "file_size",
  "md5sum",
  "submitted_file_name",
  "validation_error_detail",
];

/**
 * Display data items common to all FileSet objects.
 */
export function FileSetDataItems({ item, children }) {
  return (
    <>
      {item.file_set_type && (
        <>
          <DataItemLabel>File Set Type</DataItemLabel>
          <DataItemValue>{item.file_set_type}</DataItemValue>
        </>
      )}
      {item.summary && (
        <>
          <DataItemLabel>Summary</DataItemLabel>
          <DataItemValue>{item.summary}</DataItemValue>
        </>
      )}
      {item.description && (
        <>
          <DataItemLabel>Description</DataItemLabel>
          <DataItemValue>{item.description}</DataItemValue>
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
      {item.url && (
        <>
          <DataItemLabel>URL</DataItemLabel>
          <DataItemValueUrl>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.url}
            </a>
          </DataItemValueUrl>
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
      {item.dbxrefs?.length > 0 && (
        <>
          <DataItemLabel>External Resources</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.dbxrefs} isCollapsible />
          </DataItemValue>
        </>
      )}
      {item.publication_identifiers?.length > 0 && (
        <>
          <DataItemLabel>Publication Identifiers</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.publication_identifiers} isCollapsible />
          </DataItemValue>
        </>
      )}
    </>
  );
}

FileSetDataItems.propTypes = {
  // file object common for all file types
  item: PropTypes.object.isRequired,
};

FileSetDataItems.commonProperties = [
  "file_set_type",
  "summary",
  "description",
  "aliases",
  "url",
  "submitter_comment",
  "revoke_detail",
  "dbxrefs",
  "publication_identifiers",
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
  FileSet: FileSetDataItems,
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

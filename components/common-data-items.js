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
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import AliasList from "./alias-list";
import { CheckfilesVersion } from "./checkfiles-version";
import {
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueAnnotated,
  DataItemValueUrl,
} from "./data-area";
import DbxrefList from "./dbxref-list";
import Link from "./link-no-prefetch";
import ProductInfo from "./product-info";
import SeparatedList from "./separated-list";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { checkCheckfilesVersionVisible } from "../lib/checkfiles-version";
import { formatDate } from "../lib/dates";
import { dataSize } from "../lib/general";

/**
 * Display the data items common to all donor-derived objects.
 */
export function DonorDataItems({ item, publications = [], children }) {
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
      {item.aliases?.length > 0 && (
        <>
          <DataItemLabel>Aliases</DataItemLabel>
          <DataItemValue>
            <AliasList aliases={item.aliases} />
          </DataItemValue>
        </>
      )}
      {publications.length > 0 && (
        <>
          <DataItemLabel>Publications</DataItemLabel>
          <DataItemList isCollapsible>
            {publications.map((publication) => (
              <Link key={publication["@id"]} href={publication["@id"]}>
                {publication.title}
              </Link>
            ))}
          </DataItemList>
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
      {item.revoke_detail && (
        <>
          <DataItemLabel>Revoke Detail</DataItemLabel>
          <DataItemValue>{item.revoke_detail}</DataItemValue>
        </>
      )}
    </>
  );
}

DonorDataItems.propTypes = {
  // Object derived from donor.json schema
  item: PropTypes.object.isRequired,
  // Publications associated with this donor
  publications: PropTypes.arrayOf(PropTypes.object),
};

DonorDataItems.commonProperties = [
  "aliases",
  "ethnicities",
  "publications",
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
  constructLibrarySets = [],
  publications = [],
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
      {typeof item.time_post_library_delivery === "number" && (
        <>
          <DataItemLabel>Time Post Library Delivery</DataItemLabel>
          <DataItemValue>
            {item.time_post_library_delivery}{" "}
            {item.time_post_library_delivery !== 1
              ? `${item.time_post_library_delivery_units}s`
              : item.time_post_library_delivery_units}
          </DataItemValue>
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
      {typeof item.starting_amount === "number" && (
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
      {item.nucleic_acid_delivery && (
        <>
          <DataItemLabel>Nucleic Acid Delivery</DataItemLabel>
          <DataItemValue>{item.nucleic_acid_delivery}</DataItemValue>
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
      {publications.length > 0 && (
        <>
          <DataItemLabel>Publications</DataItemLabel>
          <DataItemList isCollapsible>
            {publications.map((publication) => (
              <Link key={publication["@id"]} href={publication["@id"]}>
                {publication.title}
              </Link>
            ))}
          </DataItemList>
        </>
      )}
      {item.protocols?.length > 0 && (
        <>
          <DataItemLabel>Protocols</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {item.protocols.map((protocol) => (
                <a
                  href={protocol}
                  key={protocol}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {protocol}
                </a>
              ))}
            </SeparatedList>
          </DataItemValue>
        </>
      )}
      {item.revoke_detail && (
        <>
          <DataItemLabel>Revoke Detail</DataItemLabel>
          <DataItemValue>{item.revoke_detail}</DataItemValue>
        </>
      )}
    </>
  );
}

SampleDataItems.propTypes = {
  // Object derived from the sample.json schema
  item: PropTypes.object.isRequired,
  // Source lab or source for this sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Construct library sets for this sample
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object),
  // Publications associated with this sample
  publications: PropTypes.arrayOf(PropTypes.object),
};

SampleDataItems.commonProperties = [
  "aliases",
  "date_obtained",
  "dbxrefs",
  "description",
  "lot_id",
  "institutional_certificates",
  "nucleic_acid_delivery",
  "publications",
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
 * Format the age display for a biosample-derived object.
 *
 * @param item - biosample item object
 * @returns Formatted age string
 */
function formatAge(item) {
  let ageDisplay;

  if (item.age === "unknown") {
    ageDisplay = item.embryonic ? "Embryonic" : "unknown";
  } else {
    ageDisplay = item.embryonic ? `Embryonic ${item.age}` : item.age;
  }

  if (item.age_units) {
    const units = item.age !== "1" ? `${item.age_units}s` : item.age_units;
    return `${ageDisplay} ${units}`;
  }

  return ageDisplay;
}

/**
 * Display data items common to all biosample-derived objects.
 */
export function BiosampleDataItems({
  item,
  classifications = [],
  constructLibrarySets = [],
  diseaseTerms = [],
  annotatedFrom = null,
  partOf = null,
  sampleTerms = [],
  sources = null,
  publications = [],
  children,
}) {
  return (
    <SampleDataItems
      item={item}
      constructLibrarySets={constructLibrarySets}
      sources={sources}
      publications={publications}
    >
      {sampleTerms.length > 0 && (
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
      {classifications.length > 0 && (
        <>
          <DataItemLabel>Classifications</DataItemLabel>
          <DataItemValueAnnotated
            objectType={item["@type"][0]}
            propertyName="classifications"
          >
            {classifications}
          </DataItemValueAnnotated>
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
      {item.originated_from && (
        <>
          <DataItemLabel>Originated From Sample</DataItemLabel>
          <DataItemValue>
            <Link href={item.originated_from["@id"]}>
              {item.originated_from.accession}
            </Link>
          </DataItemValue>
        </>
      )}
      {annotatedFrom && (
        <>
          <DataItemLabel>Annotated From</DataItemLabel>
          <DataItemValue>
            <Link href={annotatedFrom["@id"]}>{annotatedFrom.accession}</Link>
          </DataItemValue>
        </>
      )}
      <>
        <DataItemLabel>Age</DataItemLabel>
        <DataItemValue>{formatAge(item)}</DataItemValue>
      </>
      {partOf && (
        <>
          <DataItemLabel>Part of Sample</DataItemLabel>
          <DataItemValue>
            <Link href={partOf["@id"]}>{partOf.accession}</Link>
          </DataItemValue>
        </>
      )}
      {diseaseTerms.length > 0 && (
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
      {children}
    </SampleDataItems>
  );
}

BiosampleDataItems.propTypes = {
  // Object derived from the biosample.json schema
  item: PropTypes.object.isRequired,
  // Classifications if this biosample has at least one
  classifications: PropTypes.arrayOf(PropTypes.string),
  // Construct library sets for this biosample
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object),
  // Disease ontology for the biosample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object),
  // Annotated from sample
  annotatedFrom: PropTypes.object,
  // Part of Sample
  partOf: PropTypes.object,
  // Sample ontology for the biosample
  sampleTerms: PropTypes.arrayOf(PropTypes.object),
  // Publications associated with this biosample
  publications: PropTypes.arrayOf(PropTypes.object),
  // Source lab or source for this biosample
  sources: PropTypes.arrayOf(PropTypes.object),
};

BiosampleDataItems.commonProperties = [
  "age",
  "age_units",
  "annotated_from",
  "cellular_sub_pool",
  "institutional_certificates",
  "embryonic",
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
      {isA.length > 0 && (
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
      {item.synonyms?.length > 0 && (
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
      {(item.definition || item.description) && (
        <>
          <DataItemLabel>
            {item.definition ? "Definition" : "Description"}
          </DataItemLabel>
          <DataItemValue>{item.definition || item.description}</DataItemValue>
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
  "description",
  "definition",
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
  analysisStepVersion = null,
  children = null,
}) {
  const tooltipAttr = useTooltip("external-host-url");

  return (
    <>
      {typeof item.file_set === "object" && (
        <>
          <DataItemLabel>File Set</DataItemLabel>
          <DataItemValue>
            <div className="flex gap-1">
              <Link
                href={item.file_set["@id"]}
                aria-label={`FileSet ${item.file_set.accession}`}
              >
                {item.file_set.accession}
              </Link>
              ({item.file_set.summary})
            </div>
          </DataItemValue>
        </>
      )}
      <DataItemLabel>Summary</DataItemLabel>
      <DataItemValue>{item.summary}</DataItemValue>
      {item.description && (
        <>
          <DataItemLabel>Description</DataItemLabel>
          <DataItemValue>{item.description}</DataItemValue>
        </>
      )}
      {analysisStepVersion && (
        <>
          <DataItemLabel>Analysis Step Version</DataItemLabel>
          <DataItemValueUrl>
            <Link href={analysisStepVersion["@id"]}>
              {analysisStepVersion["@id"]}
            </Link>
          </DataItemValueUrl>
        </>
      )}
      <DataItemLabel>File Format</DataItemLabel>
      <DataItemValue>{item.file_format}</DataItemValue>
      {item.file_format_type && (
        <>
          <DataItemLabel>File Format Type</DataItemLabel>
          <DataItemValue>{item.file_format_type}</DataItemValue>
        </>
      )}
      <DataItemLabel>Content Type</DataItemLabel>
      <DataItemValueAnnotated
        objectType={item["@type"][0]}
        propertyName="content_type"
      >
        {item.content_type}
      </DataItemValueAnnotated>
      {item.cell_type_annotation && (
        <>
          <DataItemLabel>Cell Type Annotation</DataItemLabel>
          <DataItemValue>
            <Link href={item.cell_type_annotation["@id"]}>
              {item.cell_type_annotation.term_name}
            </Link>
          </DataItemValue>
        </>
      )}
      {item.external_host_url && (
        <>
          <DataItemLabel className="flex items-center gap-1">
            External Host URL
            <TooltipRef tooltipAttr={tooltipAttr}>
              <QuestionMarkCircleIcon className="h-4 w-4" />
            </TooltipRef>
            <Tooltip tooltipAttr={tooltipAttr}>
              Files are externally hosted. Please use the link.
            </Tooltip>
          </DataItemLabel>
          <DataItemValueUrl>
            <a
              href={item.external_host_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.external_host_url}
            </a>
          </DataItemValueUrl>
        </>
      )}
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
      {typeof item.file_size === "number" && (
        <>
          <DataItemLabel>File Size</DataItemLabel>
          <DataItemValue>{dataSize(item.file_size)}</DataItemValue>
        </>
      )}
      {item.anvil_url && (
        <>
          <DataItemLabel>AnVIL Url</DataItemLabel>
          <DataItemValue>
            <a href={item.anvil_url} target="_blank" rel="noopener noreferrer">
              {item.anvil_url}
            </a>
          </DataItemValue>
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
      {checkCheckfilesVersionVisible(item) && (
        <>
          <DataItemLabel>Checkfiles Version</DataItemLabel>
          <DataItemValue>
            <CheckfilesVersion file={item} />
          </DataItemValue>
        </>
      )}
      {item.validation_error_detail && (
        <>
          <DataItemLabel>Validation Error Detail</DataItemLabel>
          <DataItemValue>{item.validation_error_detail}</DataItemValue>
        </>
      )}
      {item.submitter_comment && (
        <>
          <DataItemLabel>Submitter Comment</DataItemLabel>
          <DataItemValue>{item.submitter_comment}</DataItemValue>
        </>
      )}
      {children}
      {item.revoke_detail && (
        <>
          <DataItemLabel>Revoke Detail</DataItemLabel>
          <DataItemValue>{item.revoke_detail}</DataItemValue>
        </>
      )}
    </>
  );
}

FileDataItems.propTypes = {
  // file object common for all file types
  item: PropTypes.object.isRequired,
  // Analysis step version for this file
  analysisStepVersion: PropTypes.object,
  // Children elements to render
  children: PropTypes.node,
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
  "revoke_detail",
  "submitter_comment",
];

/**
 * Display data items common to all FileSet objects.
 */
export function FileSetDataItems({
  item,
  publications = [],
  assayTitleDescriptionMap = {},
  preferredAssayTitleDescriptionMap = {},
  children,
}) {
  return (
    <>
      {item.file_set_type && (
        <>
          <DataItemLabel>File Set Type</DataItemLabel>
          <DataItemValueAnnotated
            objectType={item["@type"][0]}
            propertyName="file_set_type"
          >
            {item.file_set_type}
          </DataItemValueAnnotated>
        </>
      )}
      {item.control_types && (
        <>
          <DataItemLabel>Control Types</DataItemLabel>
          <DataItemValueAnnotated
            objectType={item["@type"][0]}
            propertyName="control_types"
          >
            {item.control_types}
          </DataItemValueAnnotated>
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
      {item.assay_titles?.length > 0 && (
        <>
          <DataItemLabel>Assay Term Names</DataItemLabel>
          <DataItemValueAnnotated
            externalAnnotations={assayTitleDescriptionMap}
          >
            {item.assay_titles}
          </DataItemValueAnnotated>
        </>
      )}
      {item.preferred_assay_titles?.length > 0 && (
        <>
          <DataItemLabel>Preferred Assay Titles</DataItemLabel>
          <DataItemValueAnnotated
            externalAnnotations={preferredAssayTitleDescriptionMap}
          >
            {item.preferred_assay_titles}
          </DataItemValueAnnotated>
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
      {item.dbxrefs?.length > 0 && (
        <>
          <DataItemLabel>External Resources</DataItemLabel>
          <DataItemValue>
            <DbxrefList dbxrefs={item.dbxrefs} isCollapsible />
          </DataItemValue>
        </>
      )}
      {publications.length > 0 && (
        <>
          <DataItemLabel>Publications</DataItemLabel>
          <DataItemList isCollapsible>
            {publications.map((publication) => (
              <Link key={publication["@id"]} href={publication["@id"]}>
                {publication.title}
              </Link>
            ))}
          </DataItemList>
        </>
      )}
      {item.revoke_detail && (
        <>
          <DataItemLabel>Revoke Detail</DataItemLabel>
          <DataItemValue>{item.revoke_detail}</DataItemValue>
        </>
      )}
    </>
  );
}

FileSetDataItems.propTypes = {
  // file object common for all file types
  item: PropTypes.object.isRequired,
  // Publications associated with this file set
  publications: PropTypes.arrayOf(PropTypes.object),
  // Map of assay titles to corresponding descriptions
  assayTitleDescriptionMap: PropTypes.object,
  // Map of preferred assay titles to corresponding descriptions
  preferredAssayTitleDescriptionMap: PropTypes.object,
};

FileSetDataItems.commonProperties = [
  "aliases",
  "dbxrefs",
  "control_type",
  "description",
  "file_set_type",
  "publications",
  "revoke_detail",
  "submitter_comment",
  "summary",
  "url",
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

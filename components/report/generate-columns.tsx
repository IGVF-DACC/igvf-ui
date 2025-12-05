// node_modules
import _ from "lodash";
import { ComponentType, Fragment } from "react";
// components/report
import { GeneralCellRenderer } from "./cell-renderers";
// components
import ChromosomeLocations from "../chromosome-locations";
import { FileDownload } from "../file-download";
import Link from "../link-no-prefetch";
import MarkdownSection from "../markdown-section";
import SeparatedList from "../separated-list";
import { AliasesCell } from "../table-cells";
// lib
import { attachmentToServerHref } from "../../lib/attachment";
import { API_URL } from "../../lib/constants";
import { dataSize } from "../../lib/general";
import { type ColumnSpec } from "../../lib/report";
// root
import type {
  DatabaseObject,
  DocumentObject,
  FileObject,
  FileSetObject,
  GeneLocation,
  HumanDonorObject,
  OntologyTermObject,
  PageObject,
} from "../../globals";

/**
 * The following objects define which cell-renderer components to use for each object property
 * displayed in the table. Each new cell renderer you add should go into one of these objects:
 *
 * reportPropertyRenderers: Use this for renderers for specific named properties in a specific
 * report type. The same property in a different report doesn't use this renderer. The report type
 * forms the top-level keys of this object, and the property names within the report comprise the
 * second-level keys. The values reference the cell-renderer component for the corresponding report
 * type and property. Keep this object alphabetized by report type and then by property within each
 * report type.
 *
 * propertyRenderers: Use this for renderers for specific named properties in any report type. This
 * has only one level of keys matching the property name that maps to the cell-renderer component.
 * Keep this object alphabetized by property name. You can have the same property name in both this
 * object and the `reportPropertyRenderers` object, but the `reportPropertyRenderers` object takes
 * precedence for the particular report type the property belongs to.
 */

type RenderMap = {
  [propertyName: string]: React.ComponentType<{
    id?: string;
    source: DatabaseObject;
  }>;
};

type ReportPropertyRenderers = {
  [reportType: string]: RenderMap;
};

export const reportPropertyRenderers: ReportPropertyRenderers = {
  Biosample: {
    sample_terms: SampleTerms,
  },
  HumanDonor: {
    related_donors: RelatedDonors,
  },
  Gene: {
    locations: GeneLocations,
  },
  InVitroSystem: {
    sample_terms: SampleTerms,
  },
  MultiplexedSample: {
    sample_terms: SampleTerms,
  },
  Page: {
    parent: PageParent,
  },
  PrimaryCell: {
    sample_terms: SampleTerms,
  },
  Sample: {
    sample_terms: SampleTerms,
  },
  TechnicalSample: {
    sample_terms: SampleTerms,
  },
  Tissue: {
    sample_terms: SampleTerms,
  },
  WholeOrganism: {
    sample_terms: SampleTerms,
  },
};

type PropertyRenderers = {
  [propertyName: string]: React.ComponentType<{
    id?: string;
    source: DatabaseObject;
  }>;
};

export const propertyRenderers: PropertyRenderers = {
  "@id": AtId,
  aliases: Aliases,
  attachment: Attachment,
  "audit.ERROR.detail": AuditDetail,
  "audit.WARNING.detail": AuditDetail,
  "audit.NOT_COMPLIANT.detail": AuditDetail,
  "audit.INTERNAL_ACTION.detail": AuditDetail,
  href: Href,
  "attachment.href": AttachmentHref,
  "files.href": FilesHref,
  file_size: FileSize,
  small_scale_loci_list: GeneLocations,
  submitted_file_name: NonLinkedPath,
};

/**
 * DataGrid cell renderer to display the @id of an object as a link to the object's page. This
 * works much like the `Path` renderer, but `@id` has a slightly odd schema definition, so it needs
 * its own custom renderer.
 */
function AtId({ source }: { source: DatabaseObject }) {
  return (
    <Link href={source["@id"]} data-testid="cell-type-atid">
      {source["@id"]}
    </Link>
  );
}

/**
 * DataGrid cell renderer to display the embedded `attachment` object as a link to the attachment
 * file.
 * @param source - Source object containing the attachment.
 */
function Attachment({ source }: { source: DocumentObject }) {
  if (source.attachment) {
    return (
      <a
        className="break-all"
        href={attachmentToServerHref(source.attachment, source["@id"])}
        target="_blank"
        rel="noreferrer"
        aria-label={`Download ${source.attachment.download}`}
        data-testid="cell-type-attachment"
      >
        {source.attachment.download}
      </a>
    );
  }
  return null;
}

/**
 * DataGrid cell renderer to display a vertical list of aliases and allow it to break on any
 * character to avoid making an unreasonably wide column. It seems unlikely that a cell would have
 * so many aliases that it needs a collapse/expand button.
 * @param source - Source object containing the aliases.
 */
function Aliases({ source }: { source: DatabaseObject }) {
  return (
    <div data-testid="cell-type-aliases">
      <AliasesCell source={source} />
    </div>
  );
}

/**
 * Some properties that have path values shouldn't link to the path because nothing would ever
 * exist at that path without adding other elements to the path. Render these as a path without
 * linking to the path.
 * @param id - Property name of the path in the source object
 * @param source - Source object containing the path
 */
function NonLinkedPath({ id, source }: { id: string; source: DatabaseObject }) {
  return (
    <div data-testid="cell-type-non-linked-path" className="break-all">
      {source[id] as string}
    </div>
  );
}

/**
 * DataGrid cell renderer to display a linked list of biosample sample terms, showing the sample
 * term name as the link text.
 * @param id - Property name of the sample terms in the source object.
 * @param source - Source object containing the sample terms.
 */
function SampleTerms({ id, source }: { id: string; source: DatabaseObject }) {
  const sampleTerms = source[id] as OntologyTermObject[];
  if (sampleTerms) {
    const sortedSampleTerms = _.sortBy(sampleTerms, (term) =>
      term.term_name.toLowerCase()
    );

    // Non-collapsible list of sample terms because only one term can exist in this array.
    return (
      <SeparatedList testid="cell-type-sample-terms">
        {sortedSampleTerms.map((sampleTerm) => {
          return (
            <Link key={sampleTerm["@id"]} href={sampleTerm["@id"]}>
              {sampleTerm.term_name}
            </Link>
          );
        })}
      </SeparatedList>
    );
  }
  return null;
}

/**
 * DataGrid cell renderer to display the gene locations of a gene object.
 * @param id - The property name of the gene locations in the source object
 * @param source - Object containing the gene locations
 */
function GeneLocations({ id, source }: { id: string; source: DatabaseObject }) {
  const locations = source[id] as GeneLocation[] | undefined;
  if (locations?.length > 0) {
    return (
      <div data-testid="cell-type-gene-locations">
        <ChromosomeLocations
          locations={locations}
          testid="cell-type-gene-locations"
        />
      </div>
    );
  }
}

/**
 * DataGrid cell renderer to display a file-download button along with the full download path to
 * the file.
 * @param source - FileObject containing the file download information.
 */
function Href({ source }: { source: DatabaseObject }) {
  const file = source as FileObject;

  // Wrap in a div because the cell has a flex class we don't want to inherit.
  return (
    <div data-testid="cell-type-href">
      <div className="flex">
        <FileDownload file={file} className="shrink" />
      </div>
      <div>{`${API_URL}${file.href}`}</div>
    </div>
  );
}

/**
 * DataGrid cell renderer for a Page parent link. We can't use the `Path` component because the Page
 * `parent`'s `type` property has the only array type among all schemas, so rather than messing up
 * the type detection function below for this weird case, just treat this as a special renderer for
 * this report/property type.
 * @param source - PageObject containing the parent property.
 */
function PageParent({ source }: { source: DatabaseObject }) {
  const page = source as PageObject;
  if (page.parent) {
    return (
      <Link href={page.parent} data-testid="cell-type-page-parent">
        {page.parent}
      </Link>
    );
  }
  return null;
}

/**
 * DataGrid cell renderer to display the audit details and categories for a particular audit level.
 * @param id - The audit level in the form `audit.ERROR.detail`, `audit.WARNING.detail`, etc.
 * @param source - The source object containing the audit details.
 */
function AuditDetail({ id, source }: { id: string; source: DatabaseObject }) {
  if (source.audit) {
    // Extract the audit level from the id that's in the form `audit.ERROR.detail`.
    const auditLevel = id.split(".")[1];
    if (source.audit[auditLevel]) {
      // Sort the audit level array elements by case-insensitive category, then display each
      // category and detail.
      const audits = _.sortBy(source.audit[auditLevel], [
        (audit) => audit.category.toLowerCase(),
      ]);
      return (
        <div data-testid={`cell-type-audit-${auditLevel}`}>
          {audits.map((audit, index) => {
            return (
              <div key={index} className="my-2 first:mt-0 last:mb-0">
                <MarkdownSection className="prose-p:text-sm">
                  {`**${audit.category}**: ${audit.detail}`}
                </MarkdownSection>
              </div>
            );
          })}
        </div>
      );
    }
  }
  return null;
}

/**
 * DataGrid cell renderer to display a attachment-download button along with the full download path
 * to the document or image.
 * @param source - DocumentObject containing the attachment information
 */
function AttachmentHref({ source }: { source: DatabaseObject }) {
  const document = source as DocumentObject;
  if (document.attachment) {
    const url = `${API_URL}${document["@id"]}${document.attachment.href}`;
    return (
      document.attachment?.href && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="cell-type-attachment-href"
        >
          {`${document["@id"]}${document.attachment.href}`}
        </a>
      )
    );
  }
}

/**
 * DataGrid cell renderer to display a list of full download path to the FileSet.
 * @param source - The FileSetObject containing the files.
 */
function FilesHref({ source }: { source: DatabaseObject }) {
  const fileSet = source as FileSetObject;
  const fileSetFiles = fileSet.files as FileObject[];
  const hrefs = fileSet.files
    ? fileSetFiles
        .map((file) => {
          if (file.href) {
            return `${API_URL}${file.href}`;
          }
        })
        .filter((e) => e !== undefined)
    : [];

  return <div data-testid="cell-type-files-href">{hrefs.join(", ")}</div>;
}

/**
 * DataGrid cell renderer to display a formatted file size.
 * @param id - The property name of the file size in the FileObject.
 * @param source - The FileObject containing the file size.
 */
function FileSize({ id, source }: { id: string; source: DatabaseObject }) {
  const file = source as FileObject;
  const fileSize = file[id] as number;
  if (typeof fileSize === "number") {
    return <div data-testid="cell-type-file-size">{dataSize(fileSize)}</div>;
  }
}

/**
 * Display the unique `related_donors` of a human donor object as a list of links to the related
 * donors' HumanDonor pages.
 * @param source - The HumanDonorObject containing the related donors
 */
function RelatedDonors({ source }: { source: DatabaseObject }) {
  const humanDonor = source as HumanDonorObject;
  const relatedDonors = humanDonor.related_donors;
  if (relatedDonors?.length > 0) {
    return (
      <SeparatedList testid="cell-type-related-donors">
        {relatedDonors.map((relatedDonor) => {
          const donor = relatedDonor.donor;
          return (
            <Fragment key={donor["@id"]}>
              <Link
                key={donor["@id"]}
                href={donor["@id"]}
                data-testid="cell-type-related-donor"
              >
                {donor.accession}
              </Link>
              {relatedDonor.relationship_type && (
                <span className="text-muted">
                  {` (${relatedDonor.relationship_type})`}
                </span>
              )}
            </Fragment>
          );
        })}
      </SeparatedList>
    );
  }
  return null;
}

/**
 * Given report types and column property, return a custom column renderer to display the contents
 * of the cells in the column.
 * @param types - types of the items in the report
 * @param property - Schema property name of the column to display
 * @returns React component to render the column; null if no custom renderer
 */
function getColumnRenderer(types: string[], property: string): ComponentType {
  // For columns with a renderer matching both the column's property and a specific report type.
  const matchingType = types.find((type) => {
    return (
      reportPropertyRenderers[type] && reportPropertyRenderers[type][property]
    );
  });
  if (matchingType) {
    return reportPropertyRenderers[matchingType][property];
  }

  // For columns with a renderer matching a column's property regardless of report type. This lets
  // us use the same renderer for the same property across different reports.
  if (propertyRenderers[property]) {
    return propertyRenderers[property];
  }

  // No custom renderer based on property name, so use a generic renderer appropriate for that type.
  return GeneralCellRenderer;
}

/**
 * Generate a list of report columnSpecs in a format suitable for `<SortableGrid>`. The columns to
 * display for the selected report object type can come from the "field=" query string parameter or
 * from the object's schema's `columns` property if the query string contains no "field="
 * parameters. The returned columnSpecs differ from normal columnSpecs in that they have a `display`
 * property that contains a React component to render the column's cells.
 * @param selectedTypes - Types of the items in the report
 * @param visibleColumnSpecs - ColumnSpecs for the columns to display in the report
 * @param visibleAuditColumnSpecs - ColumnSpecs for the audit columns to display in the report
 * @returns Sortable grid columns
 */
export default function generateColumns(
  selectedTypes: string[],
  visibleColumnSpecs: ColumnSpec[],
  visibleAuditColumnSpecs: ColumnSpec[]
): ColumnSpec[] {
  const mergedColumnSpecs = visibleColumnSpecs.concat(visibleAuditColumnSpecs);

  // Add a custom cell renderer to each columnSpec in which one exists.
  mergedColumnSpecs.forEach((column) => {
    const DisplayComponent = getColumnRenderer(selectedTypes, column.id);
    column.display = DisplayComponent;
  });

  return mergedColumnSpecs;
}

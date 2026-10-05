// node_modules
import _ from "lodash";
// components
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { truncateText } from "../lib/general";
// root
import type { DatabaseObject } from "../globals";

/**
 * Maximum length for displaying supersedes and superseded by lists before truncation.
 */
const MAX_SUPERSEDES_LENGTH = 40;

/**
 * Display alternative identifiers for a database object, including alternate accessions,
 * supersedes, and superseded by.
 *
 * @param alternateAccessions - Array of alternate accession strings
 * @param supersedes - DatabaseObjects that are superseded by the current object
 * @param supersededBy - DatabaseObjects that supersede the current object
 * @param property - Property of the DatabaseObject to display as the link text
 */
export function AlternativeIdentifiers({
  alternateAccessions = [],
  supersedes = [],
  supersededBy = [],
  property = "accession",
}: {
  alternateAccessions?: string[];
  supersedes?: DatabaseObject[];
  supersededBy?: DatabaseObject[];
  property?: string;
}) {
  const anyAlternativeIdentifiersExist =
    alternateAccessions?.length > 0 ||
    supersedes?.length > 0 ||
    supersededBy?.length > 0;

  if (anyAlternativeIdentifiersExist) {
    return (
      <div className="text-sm text-gray-500">
        {alternateAccessions?.length > 0 && (
          <AlternateAccessions alternateAccessions={alternateAccessions} />
        )}
        {supersedes.length > 0 && (
          <Supersedes items={supersedes} property={property} />
        )}
        {supersededBy.length > 0 && (
          <SupersededBy items={supersededBy} property={property} />
        )}
      </div>
    );
  }
}

/**
 * Display the alternate accessions.
 *
 * @param alternateAccessions - Alternate accessions
 * @param isTitleHidden - True to hide the "Alternate Accessions" title
 */
export function AlternateAccessions({
  alternateAccessions = [],
  isTitleHidden = false,
}: {
  alternateAccessions?: string[];
  isTitleHidden?: boolean;
}) {
  if (alternateAccessions.length > 0) {
    const sortedAccessions = alternateAccessions.toSorted();
    const title =
      sortedAccessions.length === 1
        ? "Alternate Accession"
        : "Alternate Accessions";

    return (
      <Wrapper>
        {!isTitleHidden && <>{title}: </>}
        {sortedAccessions.length === 1 ? (
          <>{sortedAccessions[0]}</>
        ) : (
          <>{sortedAccessions.join(", ")}</>
        )}
      </Wrapper>
    );
  }
}

/**
 * Display the accessions of the objects the current object supersedes as links to their respective
 * pages.
 *
 * @param items - Array of DatabaseObjects that are superseded by the current object
 * @param property - Property of the DatabaseObject to display as the link text (default is
 *                   "accession")
 */
function Supersedes({
  items,
  property,
}: {
  items: DatabaseObject[];
  property: string;
}) {
  if (items.length > 0) {
    return (
      <Wrapper>
        Supersedes:{" "}
        <ItemList
          items={items}
          property={property}
          maxLength={MAX_SUPERSEDES_LENGTH}
        />
      </Wrapper>
    );
  }
}

/**
 * Display the accessions of the objects that supersede the current object as links to their
 * respective pages.
 *
 * @param items - Array of DatabaseObjects that supersede the current object
 * @param property - Property of the DatabaseObject to display as the link text
 */
function SupersededBy({
  items,
  property,
}: {
  items: DatabaseObject[];
  property: string;
}) {
  if (items.length > 0) {
    return (
      <Wrapper>
        Superseded by:{" "}
        <ItemList
          items={items}
          property={property}
          maxLength={MAX_SUPERSEDES_LENGTH}
        />
      </Wrapper>
    );
  }
}

/**
 * Display a list of DatabaseObjects as link accessions to their respective pages. The list appears
 * sorted by accession if all items have accessions.
 *
 * @param items - DatabaseObjects to display
 * @param property - Property of the DatabaseObject to display as the link text
 * @param maxLength - Maximum length of the displayed text before truncation
 */
function ItemList({
  items,
  property,
  maxLength,
}: {
  items: DatabaseObject[];
  property: string;
  maxLength: number;
}) {
  // Sort them by their specified property. Items that do not have the specified property sort by
  // their "@id". Do case-insensitive sorting for string properties.
  const sortedItems = _.sortBy(
    // Sort by the property, and then return the item along with the value used for sorting.
    items.map((item) => {
      const propertyValue = item[property];
      const value =
        typeof propertyValue === "string" && propertyValue.length > 0
          ? propertyValue
          : item["@id"];

      return { item, value };
    }),
    ({ value }) => value.toLowerCase()
  );

  return (
    <SeparatedList className="inline">
      {sortedItems.map(({ item, value }) => {
        return (
          <IdentifierLink
            key={item["@id"]}
            value={value}
            href={item["@id"]}
            maxLength={maxLength}
          />
        );
      })}
    </SeparatedList>
  );
}

/**
 * Renders a link for an identifier, truncating the displayed text if it exceeds the specified
 * maximum length. If truncation occurs, a tooltip is used to show the full value.
 *
 * @param value - Value to display in a link
 * @param href - The URL to link to
 * @param maxLength - Maximum length of the displayed text before truncation
 */
function IdentifierLink({
  value,
  href,
  maxLength,
}: {
  value: string;
  href: string;
  maxLength: number;
}) {
  const tooltipAttr = useTooltip(href);

  // If the truncated value is the same as the original value, just use a regular Link component
  // without a tooltip.
  const truncatedValue = truncateText(value, maxLength);
  if (truncatedValue === value) {
    return <Link href={href}>{value}</Link>;
  }

  // The truncated value is different from the original value; use a tooltip to show the full value.
  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <Link href={href} aria-describedby={tooltipAttr.id}>
          {truncatedValue}
        </Link>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>{value}</Tooltip>
    </>
  );
}

/**
 * Wrapper component to add consistent margin around each alternative identifier section.
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className="my-1 first:mt-0 last:mb-0">{children}</div>;
}

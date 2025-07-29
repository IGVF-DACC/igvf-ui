// node_modules
import PropTypes from "prop-types";
import { Children, useContext } from "react";
// components
import AlternateAccessions from "../../alternate-accessions";
import { AuditDetail, useAudit } from "../../audit";
import Icon from "../../icon";
import QualitySection from "../../quality-section";
import SeparatedList from "../../separated-list";
import SessionContext from "../../session-context";

/**
 * Display the main contents of a search-list item including the unique identifier, title, and
 * status, and not including the data portion.
 */
export function SearchListItemMain({ children }) {
  return (
    <div className="grow" data-testid="search-list-item-main">
      {children}
    </div>
  );
}

/**
 * Displays the type of the search-list item. This just displays the item's `@type` property if we
 * can't determine the human-readable type from the schema.
 */
export function SearchListItemType({ item }) {
  const { profiles } = useContext(SessionContext);

  const type = item["@type"][0];
  const typeName = profiles?.[type]?.title || type;
  return (
    <div className="inline" data-testid="search-list-item-type">
      {typeName}
    </div>
  );
}

SearchListItemType.propTypes = {
  // Search-result item to display on a search-result list page
  item: PropTypes.object.isRequired,
};

/**
 * Display a search-list item's type and unique ID, often an accession.
 */
export function SearchListItemUniqueId({ children }) {
  // Copy the children but with a space inserted between each child (typically the type and unique
  // ID) so that you can select their text separately.
  const spacedChildren = Children.map(children, (child, i) => {
    return (
      <>
        {child}
        {i < children.length - 1 && <> </>}
      </>
    );
  });

  return (
    <div
      className="text-xs leading-tight text-gray-500 dark:text-gray-400"
      data-testid="search-list-item-unique-id"
    >
      {spacedChildren}
    </div>
  );
}

/**
 * Display an object's alternate accessions in a search-list item as a supplement.
 */
export function SearchListItemSupplementAlternateAccessions({ item }) {
  return (
    <>
      {item.alternate_accessions?.length > 0 && (
        <SearchListItemSupplementSection>
          <SearchListItemSupplementLabel>
            Alternate Accessions
          </SearchListItemSupplementLabel>
          <SearchListItemSupplementContent>
            <AlternateAccessions
              alternateAccessions={item.alternate_accessions}
              className="inline text-xs text-gray-500 dark:text-gray-400"
              isTitleHidden
            />
          </SearchListItemSupplementContent>
        </SearchListItemSupplementSection>
      )}
    </>
  );
}

SearchListItemSupplementAlternateAccessions.propTypes = {
  // Search-result item to display the alternate accessions for
  item: PropTypes.object.isRequired,
};

/**
 * Display an object's summary in a search-list item as a supplement.
 */
export function SearchListItemSupplementSummary({ item }) {
  return (
    <SearchListItemSupplementSection>
      <SearchListItemSupplementLabel>Summary</SearchListItemSupplementLabel>
      <SearchListItemSupplementContent>
        {item.summary}
      </SearchListItemSupplementContent>
    </SearchListItemSupplementSection>
  );
}

SearchListItemSupplementSummary.propTypes = {
  // Search-result item to display the summary for
  item: PropTypes.object.isRequired,
};

/**
 * Display a search-list item's title. This appears in large, bold text.
 */
export function SearchListItemTitle({ children }) {
  return (
    <div
      className="text-lg leading-tight font-semibold text-gray-600 dark:text-gray-300"
      data-testid="search-list-item-title"
    >
      {children}
    </div>
  );
}

/**
 * Displays the data line below the title in a search-list item. It separates each item with a
 * circle bullet. Each child component should include a React key.
 */
export function SearchListItemMeta({ children }) {
  return (
    <div className="mt-2" data-testid="search-list-item-meta">
      <SeparatedList
        separator={
          <Icon.Circle className="mx-1.5 inline-block h-1.5 w-1.5 self-center fill-gray-300 dark:fill-gray-600" />
        }
        className="text-sm text-gray-600 dark:text-gray-400"
      >
        {children}
      </SeparatedList>
    </div>
  );
}

/**
 * Wraps the whole supplement section of a search-list item. It contains one or more
 * `<SearchListItemSupplementSection />'s.
 */
export function SearchListItemSupplement({ children }) {
  return (
    <div
      className="mt-2 border-t border-gray-200 dark:border-gray-800"
      data-testid="search-list-item-supplement"
    >
      {children}
    </div>
  );
}

/**
 * Wraps a single section of a search-list item's supplement area. It contains a single property
 * of a search-list item including a label and the data for that property.
 */
export function SearchListItemSupplementSection({ children }) {
  return (
    <div className="mt-1.5" data-testid="search-list-item-supplement-section">
      {children}
    </div>
  );
}

/**
 * Displays the label of a search-list item's supplement section.
 */
export function SearchListItemSupplementLabel({ children }) {
  return (
    <div
      className="mr-1 text-xs font-semibold text-gray-800 uppercase dark:text-gray-200"
      data-testid="search-list-item-supplement-label"
    >
      {children}
    </div>
  );
}

/**
 * Displays the data of a search-list item's supplement section, under the label.
 */
export function SearchListItemSupplementContent({ children }) {
  return (
    <div
      className="text-xs text-gray-600 dark:text-gray-400"
      data-testid="search-list-item-supplement-content"
    >
      {children}
    </div>
  );
}

/**
 * Wraps the content area of a search-list item. That includes everything except the link to the
 * object page.
 */
export function SearchListItemContent({ children }) {
  return <div data-testid="search-list-item-content">{children}</div>;
}

/**
 * Wrapper for the status and audit information of a search-list item.
 */
export function SearchListItemQuality({ item, children = null }) {
  const auditState = useAudit();

  return (
    <>
      <div
        className="mt-2 flex flex-wrap gap-1"
        data-testid="search-list-item-quality"
      >
        <QualitySection item={item} auditState={auditState}>
          {children}
        </QualitySection>
      </div>
      <AuditDetail item={item} auditState={auditState} />
    </>
  );
}

SearchListItemQuality.propTypes = {
  // Search-result item to to display the status and audits for
  item: PropTypes.object.isRequired,
  // Additional children to display in the quality section
  children: PropTypes.node,
};

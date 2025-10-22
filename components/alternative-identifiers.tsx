// node_modules
import _ from "lodash";
// components
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
// root
import type { DatabaseObject } from "../globals";

/**
 * Display alternative identifiers for a database object, including alternate accessions,
 * supersedes, and superseded by.
 *
 * @param alternateAccessions - Array of alternate accession strings
 * @param supersedes - DatabaseObjects that are superseded by the current object
 * @param supersededBy - DatabaseObjects that supersede the current object
 */
export function AlternativeIdentifiers({
  alternateAccessions = [],
  supersedes = [],
  supersededBy = [],
}: {
  alternateAccessions?: string[];
  supersedes?: DatabaseObject[];
  supersededBy?: DatabaseObject[];
}) {
  const anyAlternativeIdentifiersExist =
    alternateAccessions?.length > 0 ||
    supersedes?.length > 0 ||
    supersededBy?.length > 0;

  if (anyAlternativeIdentifiersExist) {
    return (
      <div className="-mt-5 mb-5 text-sm text-gray-500">
        {alternateAccessions?.length > 0 && (
          <AlternateAccessions alternateAccessions={alternateAccessions} />
        )}
        {supersedes?.length > 0 && <Supersedes items={supersedes} />}
        {supersededBy?.length > 0 && <SupersededBy items={supersededBy} />}
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
 */
function Supersedes({ items }: { items: DatabaseObject[] }) {
  if (items.length > 0) {
    return (
      <Wrapper>
        Supersedes: <ItemList items={items} />
      </Wrapper>
    );
  }
}

/**
 * Display the accessions of the objects that supersede the current object as links to their
 * respective pages.
 *
 * @param items - Array of DatabaseObjects that supersede the current object
 */
function SupersededBy({ items }: { items: DatabaseObject[] }) {
  if (items.length > 0) {
    return (
      <Wrapper>
        Superseded by: <ItemList items={items} />
      </Wrapper>
    );
  }
}

/**
 * Display a list of DatabaseObjects as link accessions to their respective pages. The list appears
 * sorted by accession.
 *
 * @param items - DatabaseObjects to display
 */
function ItemList({ items }: { items: DatabaseObject[] }) {
  const sortedItems = _.sortBy(items, (item) => item.accession);

  return (
    <SeparatedList className="inline">
      {sortedItems.map((item) => (
        <Link key={item["@id"]} href={item["@id"]}>
          {item.accession}
        </Link>
      ))}
    </SeparatedList>
  );
}

/**
 * Wrapper component to add consistent margin around each alternative identifier section.
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className="my-1 first:mt-0 last:mb-0">{children}</div>;
}

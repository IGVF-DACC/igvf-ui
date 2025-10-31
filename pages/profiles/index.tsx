// node_modules
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import router from "next/router";
import { useEffect, useState } from "react";
// components
import { AddLink } from "../../components/add";
import Breadcrumbs from "../../components/breadcrumbs";
import { useSessionStorage } from "../../components/browser-storage";
import { DataPanel } from "../../components/data-area";
import {
  AttachedButtons,
  Button,
  ButtonLink,
  FormLabel,
} from "../../components/form-elements";
import HelpTip from "../../components/help-tip";
import Link from "../../components/link-no-prefetch";
import PagePreamble from "../../components/page-preamble";
import {
  SchemaSearchField,
  SchemaVersion,
  SearchAndReportType,
} from "../../components/profiles";
import SchemaIcon from "../../components/schema-icon";
import { extractSchema } from "../../lib/profiles";
import { Tooltip, TooltipRef, useTooltip } from "../../components/tooltip";
// lib
import { deprecatedSchemas } from "../../lib/constants";
import { toShishkebabCase } from "../../lib/general";
import {
  checkSearchTermSchema,
  checkSearchTermTitle,
  schemaToPath,
  type SearchMode,
} from "../../lib/profiles";
import { decodeUriElement, encodeUriElement } from "../../lib/query-encoding";
import {
  retrieveCollectionNames,
  retrieveCollectionTitles,
  retrieveProfiles,
} from "../../lib/server-objects";
// root
import type {
  CollectionTitles,
  ProfileHierarchy,
  Profiles,
  Schema,
} from "../../globals";

/**
 * Copy the given schema object and delete deprecated schemas from it.
 *
 * @param profiles - Schema object to copy and delete deprecated schemas from
 * @returns New schema object with deprecated schemas deleted
 */
function deleteDeprecatedSchemas(profiles: Profiles): Profiles {
  // Copy profiles properties except for those in `deprecatedSchemas`.
  const newProfiles: Profiles = { ...profiles };
  for (const schema of deprecatedSchemas) {
    if (newProfiles[schema]) {
      delete newProfiles[schema];
    }
  }
  return newProfiles;
}

/**
 * Returns true if the given object type is displayable in the UI. This also indicates that you
 * can add and edit objects of this type.
 *
 * @param - objectType Object @type to check
 * @param - schemas List of schemas to display in the list; directly from /profiles endpoint
 * @param - tree Top of the _hierarchy tree at this level
 * @returns True if the object type is displayable/addable/editable
 */
function isDisplayableType(
  objectType: string,
  schemas: Profiles,
  tree: ProfileHierarchy
): boolean {
  const schema: Schema | undefined = extractSchema(schemas, objectType);
  return (
    (schema?.identifyingProperties?.length ?? 0) > 0 ||
    Object.keys(tree).length > 0
  );
}

/**
 * Display a help tip for the schema search field. Its contents depend on the current search mode.
 *
 * @param searchMode - Current search mode: title or properties
 */
function SchemaSearchHelpTip({ searchMode }: { searchMode: SearchMode }) {
  return (
    <HelpTip>
      {searchMode === "SEARCH_MODE_TITLE" ? (
        <>Highlight schemas with matching titles.</>
      ) : (
        <>
          Highlight schemas with properties having matching names,{" "}
          &ldquo;title&rdquo; attributes, or an enum of those properties.
        </>
      )}
    </HelpTip>
  );
}

/**
 * Display a header above the panel of schemas. Display within it a link to the schema graph.
 */
function ProfilesHeader() {
  return (
    <div className="mb-1 flex">
      <ButtonLink href="/profiles/graph.svg" size="sm">
        Schema Graph
      </ButtonLink>
    </div>
  );
}

/**
 * Show a text field that lets the user type in a search term to filter the list of schemas.
 *
 * @param searchTerm - Current search term
 * @param setSearchTerm - Function to set the search term
 * @param searchMode - Current search mode: title or properties
 * @param setSearchMode - Function to set the search mode
 */
function SearchSection({
  searchTerm,
  setSearchTerm,
  searchMode,
  setSearchMode,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
}) {
  return (
    <section className="border-panel bg-schema-search sticky top-7 border-b px-4 py-3">
      <FormLabel htmlFor="schema-search">
        {searchMode === "SEARCH_MODE_TITLE"
          ? "Search Schema Titles"
          : "Search Schema Properties"}
      </FormLabel>
      <div className="flex gap-2">
        <AttachedButtons className="[&>button]:h-full">
          <Button
            onClick={() => setSearchMode("SEARCH_MODE_TITLE")}
            type={searchMode === "SEARCH_MODE_TITLE" ? "selected" : "secondary"}
            size="sm"
            label="Search schema titles"
            role="radio"
            isSelected={searchMode === "SEARCH_MODE_TITLE"}
          >
            Title
          </Button>
          <Button
            onClick={() => setSearchMode("SEARCH_MODE_PROPERTIES")}
            type={
              searchMode === "SEARCH_MODE_PROPERTIES" ? "selected" : "secondary"
            }
            size="sm"
            label="Search schema properties"
            role="radio"
            isSelected={searchMode === "SEARCH_MODE_PROPERTIES"}
          >
            Properties
          </Button>
        </AttachedButtons>
        <SchemaSearchField
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchMode={searchMode}
        />
      </div>
      <SchemaSearchHelpTip searchMode={searchMode} />
    </section>
  );
}

/**
 * Displays a schema element and its children. This component uses recursion, so every element at
 * different times exists as a child and a parent -- possibly a parent with no children.
 *
 * @param tree - Top of the _hierarchy tree to render at this level
 * @param objectType - Object @type for `tree`
 * @param schemas - List of schemas to display in the list; directly from /profiles endpoint
 * @param searchTerm - Current search term
 * @param searchMode - Search mode: title or properties
 * @param collectionTitles - Maps collection names to corresponding human-readable schema titles
 */
function SubTree({
  tree,
  objectType,
  schemas,
  searchTerm,
  searchMode,
  collectionTitles = null,
  collectionNames = null,
}: {
  tree: ProfileHierarchy;
  objectType: string;
  schemas: Profiles;
  searchTerm: string;
  searchMode: SearchMode;
  collectionTitles?: CollectionTitles | null;
  collectionNames?: Record<string, string> | null;
}) {
  const tooltipAttr = useTooltip(objectType);

  const title = collectionTitles?.[objectType] || objectType;
  const schema: Schema | undefined = extractSchema(schemas, objectType);
  const childObjectTypes = Object.keys(tree).filter((childObjectType) =>
    isDisplayableType(childObjectType, schemas, tree[childObjectType])
  );
  const collectionName = collectionNames?.[objectType] || "";

  let isTitleHighlighted = false;
  if (searchMode === "SEARCH_MODE_TITLE") {
    isTitleHighlighted = checkSearchTermTitle(searchTerm, title);
  } else {
    isTitleHighlighted = schema?.properties
      ? checkSearchTermSchema(searchTerm, schema.properties)
      : false;
  }

  useEffect(() => {
    if (searchTerm) {
      // Scroll the first highlighted name into view.
      const highlightedNames = document.getElementsByClassName(
        "bg-schema-name-highlight"
      );
      if (highlightedNames.length > 0) {
        highlightedNames[0].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [searchTerm]);

  // If at least one title is highlighted and the user has selected the "properties" search mode,
  // prevent the default link action and instead use the router to navigate to the schema page
  // with the search term as a hash. Idea from:
  // https://stackoverflow.com/questions/75657476/next-js-execute-onclick-event-before-href-link-routing#75658026
  async function onClick(event) {
    if (isTitleHighlighted && searchMode === "SEARCH_MODE_PROPERTIES") {
      event.preventDefault();
      await router.push(`${event.target.href}#${encodeUriElement(searchTerm)}`);
    }
  }

  return (
    <div className="my-1">
      <div
        className="flex items-center gap-1"
        data-testid={`schema-${toShishkebabCase(title)}`}
      >
        <SchemaIcon type={objectType} />
        {schema ? (
          <>
            <Link
              onClick={onClick}
              href={schemaToPath(schema)}
              aria-label={`View schema for ${title}${
                isTitleHighlighted ? " (highlighted)" : ""
              }`}
              className={`block scroll-mt-28 @xl:scroll-mt-24 ${
                isTitleHighlighted ? "bg-schema-name-highlight" : ""
              }`}
            >
              {title}
            </Link>
            <SchemaVersion schema={schema} isLinked />
            <TooltipRef tooltipAttr={tooltipAttr}>
              <button>
                <QuestionMarkCircleIcon className="h-4 w-4 cursor-pointer" />
              </button>
            </TooltipRef>
            <Tooltip tooltipAttr={tooltipAttr}>
              {schema.description || "No description available"}
            </Tooltip>
            <SearchAndReportType type={objectType} title={title} />
            <AddLink
              schema={schema}
              collectionName={collectionName}
              label={`Add ${schema.title}`}
            />
          </>
        ) : (
          <>
            {title}
            <SearchAndReportType type={objectType} title={title} />
          </>
        )}
      </div>
      {childObjectTypes.length > 0 && (
        <div className="ml-4">
          {childObjectTypes.map((childObjectType) => {
            const child = tree[childObjectType];
            return (
              <SubTree
                tree={child}
                objectType={childObjectType}
                schemas={schemas}
                searchTerm={searchTerm}
                searchMode={searchMode}
                collectionTitles={collectionTitles}
                collectionNames={collectionNames}
                key={childObjectType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Profiles({
  schemas,
  collectionTitles = null,
  collectionNames = null,
}: {
  schemas: Profiles;
  collectionTitles?: CollectionTitles | null;
  collectionNames?: Record<string, string> | null;
}) {
  // Search term for schema
  const [searchTerm, setSearchTerm] = useState("");
  // Search mode: title or properties
  const [searchMode, setSearchMode] = useSessionStorage<SearchMode>(
    "schema-search-mode",
    "SEARCH_MODE_TITLE"
  );

  const topLevelObjectTypes = Object.keys(schemas._hierarchy.Item).filter(
    (objectType) =>
      isDisplayableType(
        objectType,
        schemas,
        schemas._hierarchy.Item[objectType]
      )
  );

  useEffect(() => {
    // Rerender the page with relevant properties highlighted if we detect a search term in the URL
    // hash.
    if (window.location.hash) {
      setSearchTerm(decodeUriElement(window.location.hash.slice(1)));
      setSearchMode("SEARCH_MODE_PROPERTIES");
    }
  }, []);

  return (
    <>
      <Breadcrumbs item={schemas} />
      <PagePreamble />
      <ProfilesHeader />
      <DataPanel isPaddingSuppressed>
        <SearchSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchMode={searchMode}
          setSearchMode={setSearchMode}
        />
        <div className="px-4 py-2">
          {topLevelObjectTypes.map((objectType) => {
            const topOfTree = schemas._hierarchy.Item[objectType];
            return (
              <SubTree
                tree={topOfTree}
                objectType={objectType}
                schemas={schemas}
                searchTerm={searchTerm}
                searchMode={searchMode}
                collectionTitles={collectionTitles}
                collectionNames={collectionNames}
                key={objectType}
              />
            );
          })}
        </div>
      </DataPanel>
    </>
  );
}

export async function getServerSideProps({ req }) {
  const schemas = await retrieveProfiles(req.headers.cookie);
  if (!schemas) {
    // 404 page
    return { notFound: true };
  }

  const collectionTitles = await retrieveCollectionTitles(req.headers.cookie);
  if (!collectionTitles) {
    // 404 page
    return { notFound: true };
  }

  const collectionNames = await retrieveCollectionNames(req.headers.cookie);
  if (!collectionNames) {
    // 404 page
    return { notFound: true };
  }

  const schemasWithoutDeprecated = deleteDeprecatedSchemas(schemas);
  return {
    props: {
      schemas: schemasWithoutDeprecated,
      collectionTitles,
      collectionNames,
      pageContext: { title: "Schema Directory" },
    },
  };
}

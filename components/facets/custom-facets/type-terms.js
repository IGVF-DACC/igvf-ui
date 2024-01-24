// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import { RadioButton } from "../../form-elements";
import SessionContext from "../../session-context";
// lib
import { deprecatedSchemas } from "../../../lib/constants";
import QueryString from "../../../lib/query-string";
import { splitPathAndQueryString } from "../../../lib/query-utils";

/**
 * Convert a "type" facet term to a node we use to populate a tree structure to build the type-term
 * facet. Nodes have the form:
 *
 * {
 *   type: "WholeOrganism",
 *   parent: "Biosample",
 *   term: { // Original "type" facet-term object
 *     doc_count: 3,
 *     key: "WholeOrganism",
 *   },
 *   children: [],
 * }
 *
 * We do this conversion to find the parent type of each term so we can later use this to build a
 * tree structure for the facet terms. Root nodes have a null parent. All nodes have an empty
 * `children` array. For parent nodes, `children` gets filled in with its child nodes when we build
 * the tree structure. This function recursively descends the schema hierarchy tree to find the
 * parent type of each term.
 *
 * `schemaNode` contains a schema hierarchy. At first, this includes the entire `_hierarchy` object
 * from /profiles within its `Item` property. As we recursively descend the schema-hierarchy tree,
 * we pass only the schema-hierarchy subtree that we search for the term.
 * @param {object} term Facet term object to convert to a node
 * @param {string} parent Parent node type; null for a root node
 * @param {object} schemaNode Schema node to search for the term
 * @returns {object} Node object, or null if the term isn't found in the schema
 */
function convertTermToNode(term, parent, schemaNode) {
  const nodeTypes = Object.keys(schemaNode);
  if (nodeTypes.length > 0) {
    // Convert the term to a node if it's a direct child of this schema node's type.
    const schemaHasTerm = nodeTypes.includes(term.key);
    if (schemaHasTerm) {
      return {
        type: term.key,
        parent,
        term,
        children: [],
      };
    }

    // Term isn't a direct child of this schema node's type within the current schema hierarchy
    // subtree. Look through all children of this schema node to find the one that includes the
    // term. If found, return the converted node, which bubbles up to initial call to
    // `convertTermToNode`.
    let convertedNode = null;
    const matchingNode = nodeTypes.find((type) => {
      convertedNode = convertTermToNode(term, type, schemaNode[type]);
      return convertedNode !== null;
    });
    return matchingNode ? convertedNode : null;
  }

  // Called with a leaf in the schema hierarchy.
  return null;
}

/**
 * To make building a tree structure easier, convert an array of type-facet terms to an array of
 * nodes -- each of which includes not only a facet term object, but also the parent type of each
 * term, if any (root nodes have null for a parent).
 * @param {Array<object>} terms A single "type" facet's terms array to convert to an array of nodes
 * @param {object} schemaHierarchy Schema hierarchy to know each node's parent type
 * @returns {Array<object>} Array of nodes converted from type facet terms
 */
function convertTermsToNodes(terms, schemaHierarchy) {
  // "type" facet terms sometimes include a term for the "Item" type that doesn't help us build the
  // tree structure, so remove it from the term array.
  const termsWithoutItem = terms.filter((term) => {
    return term.key !== "Item";
  });

  return termsWithoutItem.map((term) =>
    convertTermToNode(term, null, schemaHierarchy)
  );
}

/**
 * Convert an array of nodes to a tree structure. Each node includes a initially empty `children`
 * array of child nodes, which this function fills in to form a tree structure. The tree might
 * include more than one root node if the search results come from a query string with more than
 * one "type=".
 * @param {Array<object>} nodes "type"-facet Nodes to convert to a tree structure.
 * @returns {Array<object>} Root nodes, each of which includes a `children` array of child nodes.
 */
function convertNodeArrayToTree(nodes) {
  // Build an object to easily look up nodes by their type.
  const lookup = nodes.reduce((acc, node) => {
    if (node) {
      acc[node.type] = node;
    }
    return acc;
  }, {});

  // Stores the resulting unflattened tree.
  const rootNodes = [];

  // Iterate over all nodes in the array, consequently building the entire tree. For each node,
  for (const node of nodes) {
    if (node) {
      const treeNode = lookup[node.type];
      if (node.parent === null) {
        // Node is a root node (no parent). Add it to the list of root nodes.
        rootNodes.push(treeNode);
      } else {
        // Node has a parent. Add it to its parent's children.
        lookup[node.parent].children.push(treeNode);
      }
    }
  }

  return rootNodes;
}

/**
 * Generate a hierarchy of facet terms from the "type" facet based on the `_hierarchy` object from
 * /profiles.
 *
 * Here's an example of the generated array with two top-level types ("Sample" and "FileSet"). Any
 * types with children have a `subTypes` array containing the children. Any types without children
 * have no `subTypes` property. This array of objects represents the following hierarchy:
 *
 * - Sample
 *   - Biosample
 *     - Tissue
 *     - PrimaryCell
 *   - TechnicalSample
 *   - MultiplexedSample
 * - FileSet
 *   - MeasurementSet
 *   - AnalysisSet
 *
 * Facet Hierarchy:
 * [
 *   {
 *     type: "Sample",
 *     parent: null,
 *     term: { original facet term object },
 *     children: [
 *       {
 *         type: "Biosample",
 *         parent: "Sample",
 *         term: { original facet term object },
 *         children: [
 *           {
 *             type: "Tissue",
 *             parent: "Biosample",
 *             term: { original facet term object },
 *             children: [],
 *           },
 *           {
 *             type: "PrimaryCell"
 *             parent: "Biosample",
 *             term: { original facet term object },
 *             children: [],
 *           },
 *         ]
 *       },
 *       {
 *         type: "TechnicalSample",
 *         parent: "Sample",
 *         term: { original facet term object },
 *         children: [],
 *       },
 *       {
 *         type: "MultiplexedSample",
 *         parent: "Sample",
 *         term: { original facet term object },
 *         children: [],
 *       }
 *     ]
 *   },
 *   {
 *     type: "FileSet",
 *     parent: null,
 *     term: { original facet term object },
 *     children: [
 *       {
 *         type: "MeasurementSet",
 *         parent: "FileSet",
 *         term: { original facet term object },
 *         children: [],
 *       },
 *       {
 *         type: "AnalysisSet",
 *         parent: "FileSet",
 *         term: { original facet term object },
 *         children: [],
 *       }
 *     ]
 *   }
 * ]
 *
 * @param {Array<object>} terms `terms` property of the "type" facet object from search results
 * @param {object} schemaHierarchy `_hierarchy` object from profiles that describes the hierarchy
 *   of types
 * @returns {Array<object>} Nodes converted to a tree structure; one element per root node
 */
function generateFacetHierarchy(terms, schemaHierarchy) {
  const typeNodes = convertTermsToNodes(terms, schemaHierarchy.Item);
  return convertNodeArrayToTree(typeNodes);
}

/**
 * Displays the term label for the "type" facet terms. It shows the term name at the left of the
 * space, and the count of terms on the right. Map the term name to the human-readable name.
 */
function TypeTermLabel({ term }) {
  const { collectionTitles } = useContext(SessionContext);

  return (
    <div className="flex grow items-center justify-between gap-2 text-sm font-normal leading-[1.1]">
      <div>{collectionTitles?.[term.key] || term.key}</div>
      <div>{term.doc_count}</div>
    </div>
  );
}

TypeTermLabel.propTypes = {
  // Single term from a facet from the search results
  term: PropTypes.shape({
    // Term name
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    // Number of times the term appears in the search results
    doc_count: PropTypes.number.isRequired,
    // Term name as a string when available
    key_as_string: PropTypes.string,
  }).isRequired,
};

/**
 * Filter out deprecated schemas from the facet terms.
 * @param {Array<object>} terms Facet terms to filter
 * @returns {Array<object>} Filtered facet terms
 */
function filterNonDeprecatedSchemas(terms) {
  return terms.filter((term) => {
    return !deprecatedSchemas.includes(term.key);
  });
}

function TypeTerm({ node, fieldTerms, isChecked, onClick }) {
  return (
    <li data-testid={`typeterm-${node.term.key}`}>
      <RadioButton
        checked={isChecked}
        name={`${node.term.key} with ${node.term.doc_count} ${
          node.term.doc_count === 1 ? "result" : "results"
        }`}
        onChange={() => onClick(node.term.key)}
        className="cursor-pointer rounded border border-transparent px-2 py-1 text-sm hover:border-data-border"
      >
        <TypeTermLabel term={node.term} />
      </RadioButton>
      {node.children.length > 0 && (
        <ul className="ml-4">
          {node.children.map((child) => {
            // Get the terms that are currently selected for this facet.
            const isChecked = fieldTerms.includes(child.type);

            return (
              <TypeTerm
                key={child.type}
                node={child}
                fieldTerms={fieldTerms}
                isChecked={isChecked}
                onClick={onClick}
              />
            );
          })}
        </ul>
      )}
    </li>
  );
}

TypeTerm.propTypes = {
  // Facet field the term belongs to
  node: PropTypes.object.isRequired,
  // Array of type= terms
  fieldTerms: PropTypes.array.isRequired,
  // True if the term's checkbox is checked
  isChecked: PropTypes.bool.isRequired,
  // Called when the checkbox is checked or unchecked
  onClick: PropTypes.func.isRequired,
};

/**
 * Custom facet terms renderer for the "type" facet. This facet displays a hierarchy of terms
 * based on the `_hierarchy` object from /profiles. The hierarchy is built from the "type" facet's
 * terms array.
 */
export default function TypeTerms({ searchResults, facet, updateQuery }) {
  // Generate a query based on the current URL to update once the user clicks a facet term.
  const { queryString } = splitPathAndQueryString(searchResults["@id"]);
  const query = new QueryString(queryString);

  // Get the /profiles for the schema hierarchy.
  const { profiles } = useContext(SessionContext);
  const schemaHierarchy = profiles?._hierarchy || null;

  // Convert the "type" facet terms to a hierarchy of nodes.
  const nonDeprecatedTerms = filterNonDeprecatedSchemas(facet.terms);
  let facetHierarchy = null;
  if (schemaHierarchy) {
    facetHierarchy = generateFacetHierarchy(
      nonDeprecatedTerms,
      schemaHierarchy
    );
  }

  // Get the terms currently selected for this facet.
  const fieldTerms = query.getKeyValues("type");

  /**
   * When the user clicks a facet term, add or remove it from the query string and navigate
   * to the new URL.
   * @param {string} term Term that the user clicked within a facet
   */
  function onTermClick(term) {
    query.replaceKeyValue("type", term);
    query.deleteKeyValue("from");
    updateQuery(query.format());
  }

  if (facetHierarchy) {
    return (
      <ul>
        {facetHierarchy.map((node) => {
          const isChecked = fieldTerms.includes(node.type);
          return (
            <TypeTerm
              key={node.type}
              node={node}
              fieldTerms={fieldTerms}
              isChecked={isChecked}
              onClick={onTermClick}
            />
          );
        })}
      </ul>
    );
  }
  return null;
}

TypeTerms.propTypes = {
  // Search results from data provider
  searchResults: PropTypes.object.isRequired,
  // Facet object from search results
  facet: PropTypes.shape({
    // Object property the facet displays
    field: PropTypes.string.isRequired,
    // Facet title
    title: PropTypes.string.isRequired,
    // Relevant selectable terms for the facet
    terms: PropTypes.arrayOf(
      PropTypes.shape({
        // Label for the facet term
        key: PropTypes.string.isRequired,
        // Number of results for the facet term
        doc_count: PropTypes.number,
      })
    ).isRequired,
  }).isRequired,
  // Called to return the updated query string from the facet user selection
  updateQuery: PropTypes.func.isRequired,
};

// node_modules
import type { Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Regex to match the {#named-id-1} syntax at the end of a heading text line. Use this to extract
 * the named ID from the heading text and set it as the id of the heading element in the rendered
 * HTML. To be recognized, {#named-id-1} must be:
 *
 *   * start with an open brace, a hash, the named ID you've chosen, and a closing brace
 *   * preceded by whitespace (normally a single space) to separate it from the heading text
 *   * at the end of the heading text line; no other text including whitespace can follow it
 *   * contain only alphanumeric characters and hyphens (kebab case)
 */
const regexHeadingId = /\s\{#([a-zA-Z0-9-]+)\}$/;

/**
 * Custom remark plugin to add `id` attributes to heading elements in the markdown content based on
 * the {#named-id-1} syntax at the end of a heading text line. This allows us to create anchor
 * links to specific sections of the rendered HTML by using the named ID as the `id` attribute of
 * the heading element.
 *
 * The {#named-id-1} syntax is removed from the heading text in the rendered HTML, so it does not
 * appear in the visible heading text once rendered on the page.
 *
 * The `react-markdown` library uses remark under the hood to parse markdown content, and this
 * plugin is used to extend its functionality to support named IDs for headings.
 *
 * This module currently cannot be Jest tested because the remark processor is ESM only, which Jest
 * does not support. We need to change to the Vitest testing framework to be able to test this
 * module. This function also must exist in isolation in this file so that it alone can be hidden
 * Jest.
 *
 * @returns Function for the remark processor to call to add `id` to header elements
 */
export function remarkHeadingIds() {
  return (tree: Root) => {
    visit(tree, "heading", (node) => {
      // The named ID must be at the end of the heading text line, so we only check the last child
      // of the heading node.
      const lastChild = node.children.at(-1);
      if (lastChild?.type !== "text") {
        return;
      }

      // Check if the last child text matches the {#named-id-1} syntax and extract the named ID.
      const match = regexHeadingId.exec(lastChild.value);
      if (!match) {
        return;
      }

      // Set the `id` attribute of the heading element to the extracted named ID. Do not overwrite
      // an existing `data` or `hProperties` object if they already exist; other remark plugins may
      // have added them.
      const id = match[1];
      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.id = id;

      // Remove the {#named-id-1} from the header text value.
      lastChild.value = lastChild.value.replace(regexHeadingId, "");
    });
  };
}

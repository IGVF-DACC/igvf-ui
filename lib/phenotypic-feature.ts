// lib
import { UC } from "./constants";
// type
import { DatabaseObject } from "../globals.d";

// Extend the DatabaseObject interface to include the properties of a PhenotypicFeature
interface PhenotypicFeature extends DatabaseObject {
  feature: {
    term_name: string;
  };
  quantity: number;
  quantity_units: string;
}

/**
 * Use the same title for PhenotypicFeature search page and PhenotypicFeature object page for that
 * PhenotypicFeature.
 * @param phenotypicFeature Object to get the title from
 * @returns Title for item in search list or for the given object page
 */
export function getPhenotypicFeatureTitle(item: PhenotypicFeature): string {
  return `${item.feature.term_name} ${
    item.quantity !== undefined
      ? ` ${UC.mdash} ${item.quantity} ${item.quantity_units}`
      : ""
  }`;
}

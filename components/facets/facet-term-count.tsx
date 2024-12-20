// components/facets
import { type Facet } from "./types";

/**
 * Number of pixels a single count in a facet term should take up in the count display.
 */
const PIXELS_PER_COUNT = 4;

/**
 * Displays a representation of the count of items in a facet.
 * @param facet - Facet to display
 */
export function FacetTermCount({ facet }: { facet: Facet }) {
  return (
    <div className="bg-facet-bar-blanks overflow-hidden">
      <div
        className="h-1 bg-facet-bar"
        style={{ width: facet.terms.length * PIXELS_PER_COUNT }}
      />
    </div>
  );
}

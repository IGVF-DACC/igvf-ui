// node_modules
import _ from "lodash";
import Image from "next/image";
// components
import Link from "./link-no-prefetch";
// lib
import { getCollectionPath } from "../lib/collections";

/**
 * Height and width of collection logos in pixels. PNG or JPEG files should have double this
 * resolution to appear crisp on retina displays. SVG files should keep these proportions. Many of
 * the existing SVG logos are 210px wide by 140px tall just to be a bit easier to work with in
 * Illustrator. Where possible, use SVG files to avoid the need for double-resolution PNG files,
 * and make sure they contain SVG elements, not links to external PNG files. Illustrator can help
 * determine this.
 *
 * Where possible, use SVG and PNG files with no background color, as this component displays them
 * on a white background, or very light gray in dark mode.
 *
 * The graphic within the 105x70 box should have a maximum width of 95px and a maximum height of
 * 60px.
 */
const COLLECTION_DIMENSIONS = {
  WIDTH: 105,
  HEIGHT: 70,
} as const;

/**
 * Display the collection logos for an array of collection strings. If the collection string doesn't exist
 * in the collection map, it displays as text.
 * @param collections - From `collections` property from an object
 * @param itemType - @type of item containing the collections
 */
export default function Collections({
  collections = [],
  itemType,
}: {
  collections?: string[];
  itemType: string;
}) {
  if (collections.length > 0) {
    // Make sure we show only unique collections, and sort them alphabetically.
    const uniqueCollections = [...new Set(collections)];
    const sortedCollections = _.sortBy(uniqueCollections, (collection) =>
      collection.toLowerCase()
    );

    return (
      <ul className="flex flex-wrap gap-1">
        {sortedCollections.map((collection) => {
          const collectionPath = getCollectionPath(collection);
          return (
            <li key={collection}>
              <Link
                href={`/search/?type=${itemType}&collections=${collection}`}
                className="border-data-border block overflow-hidden border bg-white no-underline dark:bg-gray-200"
                style={{
                  width: COLLECTION_DIMENSIONS.WIDTH,
                  height: COLLECTION_DIMENSIONS.HEIGHT,
                }}
              >
                {collectionPath ? (
                  <Image
                    src={collectionPath}
                    width={COLLECTION_DIMENSIONS.WIDTH}
                    height={COLLECTION_DIMENSIONS.HEIGHT}
                    alt={`${collection} collection`}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center px-1 text-xs break-all dark:text-black"
                    style={{
                      width: COLLECTION_DIMENSIONS.WIDTH,
                      height: COLLECTION_DIMENSIONS.HEIGHT,
                    }}
                  >
                    {collection}
                    <div className="sr-only"> collection</div>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
}

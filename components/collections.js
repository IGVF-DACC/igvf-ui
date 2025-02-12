// node_modules
import _ from "lodash";
import Image from "next/image";
import Link from "next/link";
import { PropTypes } from "prop-types";

/**
 * Map of collection names to their corresponding logo image file. The logo files exist in the
 * /public/collections directory.
 */
const collectionMap = {
  ACMG73: "acmg73.svg",
  ClinGen: "clingen.svg",
  ENCODE: "encode.svg",
  GREGoR: "gregor.svg",
  "IGVF_catalog_beta_v0.1": "igvf-catalog-0.1.svg",
  "IGVF_catalog_beta_v0.2": "igvf-catalog-0.2.svg",
  "IGVF_catalog_beta_v0.3": "igvf-catalog-0.3.svg",
  "IGVF_catalog_beta_v0.4": "igvf-catalog-0.4.svg",
  "IGVF_catalog_beta_v0.5": "igvf-catalog-0.5.svg",
  "IGVF phase 1": "igvf-phase-1.svg",
  MaveDB: "mave-db.svg",
  Morphic: "morphic.svg",
  MPRAbase: "mpra-base.svg",
  StanfordFCC: "stanford-fcc.svg",
  "TOPMED Freeze 8": "topmed-freeze-8.svg",
  VarChAMP: "varchamp.svg",
  Vista: "vista.svg",
  "Williams Syndrome Research": "williams-syndrome-research.svg",
};

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
const COLLECTION_WIDTH = 105;
const COLLECTION_HEIGHT = 70;

/**
 * Display the collection logos for an array of collection strings. If the collection string doesn't exist
 * in the collection map, it displays as text.
 */
export default function Collections({ collections = null, itemType }) {
  if (collections?.length > 0) {
    // Make sure we show only unique collections, and sort them alphabetically.
    const uniqueCollections = [...new Set(collections)];
    const sortedCollections = _.sortBy(uniqueCollections, (collection) =>
      collection.toLowerCase()
    );

    return (
      <div className="mb-6 flex flex-wrap gap-1">
        {sortedCollections.map((collection) => {
          const imageFile = collectionMap[collection];
          return (
            <Link
              key={collection}
              href={`/search/?type=${itemType}&collections=${collection}`}
              className="block overflow-hidden border border-data-border bg-white no-underline dark:bg-gray-200"
            >
              {imageFile ? (
                <Image
                  src={`/collections/${collectionMap[collection]}`}
                  width={COLLECTION_WIDTH}
                  height={COLLECTION_HEIGHT}
                  alt={`${collection} collection`}
                />
              ) : (
                <div className="flex h-[70px] w-[105px] items-center justify-center break-all px-1 text-xs dark:text-black">
                  {collection}
                  <div className="sr-only"> collection</div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    );
  }
  return null;
}

Collections.propTypes = {
  // Array of collection strings
  collections: PropTypes.arrayOf(PropTypes.string),
  // Item type, used for the search link
  itemType: PropTypes.string.isRequired,
};

// root
import type { FileObject } from "../globals";

/**
 * Prefix for collection names that are part of the IGVF catalog.
 */
const CATALOG_PREFIX = "IGVF_catalog_";

/**
 * Map of collection names to their corresponding logo image file. The logo files exist in the
 * /public/collections directory.
 */
const collectionMap = {
  ACMG73: "acmg73.svg",
  Benchmark: "benchmark.svg",
  "Bridge Sample": "bridge-sample.png",
  ClinGen: "clingen.svg",
  "E2G Pillar Project": "e2g-pillar.svg",
  ENCODE: "encode.svg",
  GREGoR: "gregor.svg",
  "IGVF_catalog_beta_v0.1": "igvf-catalog-0.1.svg",
  "IGVF_catalog_beta_v0.2": "igvf-catalog-0.2.svg",
  "IGVF_catalog_beta_v0.3": "igvf-catalog-0.3.svg",
  "IGVF_catalog_beta_v0.4": "igvf-catalog-0.4.svg",
  "IGVF_catalog_beta_v0.5": "igvf-catalog-0.5.svg",
  "IGVF_catalog_v1.0": "igvf-catalog-1.0.svg",
  "IGVF_catalog_v1.1": "igvf-catalog-1.1.svg",
  "IGVF_catalog_v1.2": "igvf-catalog-1.2.svg",
  "IGVF phase 1": "igvf-phase-1.svg",
  MaveDB: "mave-db.svg",
  Morphic: "morphic.svg",
  MPRAbase: "mpra-base.svg",
  "PD single cell multiomics": "pd-single-cell-multiomics.svg",
  StanfordFCC: "stanford-fcc.svg",
  "TF Perturb-seq Project": "tf-perturb-seq.svg",
  "TOPMED Freeze 8": "topmed-freeze-8.svg",
  VarChAMP: "varchamp.svg",
  Vista: "vista.svg",
  "Williams Syndrome Research": "williams-syndrome-research.svg",
} as const satisfies Record<string, string>;

/**
 * Checks whether a file is in the catalog by checking its `collections` property for any
 * collection that starts with "IGVF_catalog_".
 *
 * @param file - File to check whether it's in the catalog or not
 * @returns True if the file is in the catalog
 */
export function isFileInCatalog(file: FileObject): boolean {
  return (
    file.collections?.some((collection) =>
      collection.startsWith(CATALOG_PREFIX)
    ) ?? false
  );
}

/**
 * Get the path to the collection logo image file in the /public/collections directory. If the
 * collection name doesn't exist in the collection map, this returns an empty string.
 *
 * @param collection - Name of a collection from the object schema for `collections`
 * @returns Path to the image file in the repo, usually an SVG or PNG
 */
export function getCollectionPath(collection: string): string {
  return Object.hasOwn(collectionMap, collection)
    ? `/collections/${collectionMap[collection]}`
    : "";
}

/**
 * Get the file names of all collection image files in the /public/collections directory.
 *
 * @returns File names of all collection image files
 */
export function getCollectionLogoFileNames(): string[] {
  return Object.values(collectionMap);
}

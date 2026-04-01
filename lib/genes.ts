// node_modules
import _ from "lodash";

/**
 * Chromosome sort rank contig type domains.
 *
 *   - "A" -- numbered chromosomes
 *   - "B" -- sex chromosomes (chrX, chrY, chrM)
 *   - "C" -- unlocalized contigs (chr1_KI270706v1_random, chr4_GL000008v2_random, etc.)
 *   - "D" -- unlocalized Y contigs (chrY_*)
 *   - "E" -- unplaced contigs (chrUn_*)
 *   - "F" -- other / unknown contigs in random order
 */
const DOMAIN = {
  NUMBERED: "A",
  SEX: "B",
  UNLOCALIZED: "C",
  UNLOCALIZED_Y: "D",
  UNPLACED: "E",
  OTHER: "F",
} as const;

/**
 * Convert a chromosome contig string into the components needed to generate a sorting key that
 * will allow chromosomes to be sorted in natural / biologically meaningful order. The returned
 * components are the domain (A-F), the zero-padded chromosome number string, and the suffix string
 * (for unlocalized / unplaced / other contigs) that together form the lexicographically sortable
 * key domain|chromosomeNumber|suffix.
 *
 * @param chr - Chromosome contig
 * @returns domain, chromosome number, and suffix strings to use for the sorting key
 */
function chromosomeToElements(chr: string): {
  domain: string;
  chromosomeNumber: string;
  suffix: string;
} {
  // Handle standard numbered chromosomes (chr1, chr2, ..., chr22, etc).
  const chrNumberMatch = chr.match(/^chr(\d+)$/);
  if (chrNumberMatch) {
    const chromosomeNumber = parseInt(chrNumberMatch[1], 10)
      .toString()
      .padStart(4, "0");
    const domain = DOMAIN.NUMBERED;
    return { domain, chromosomeNumber, suffix: "" };
  }

  // Handle sex chromosomes (chrX, chrY, chrM).
  if (chr === "chrX") {
    return { domain: DOMAIN.SEX, chromosomeNumber: "1000", suffix: "" };
  }
  if (chr === "chrY") {
    return { domain: DOMAIN.SEX, chromosomeNumber: "1001", suffix: "" };
  }
  if (chr === "chrM") {
    return { domain: DOMAIN.SEX, chromosomeNumber: "1002", suffix: "" };
  }

  // Handle unlocalized contigs (chr1_KI270706v1_random, chr4_GL000008v2_random, etc.).
  const unlocalizedMatch = chr.match(/^chr(\d+)_([A-Z0-9]+v\d+)_random$/);
  if (unlocalizedMatch) {
    const chromosomeNumber = parseInt(unlocalizedMatch[1], 10)
      .toString()
      .padStart(4, "0");
    const suffix = unlocalizedMatch[2];
    return { domain: DOMAIN.UNLOCALIZED, chromosomeNumber, suffix };
  }

  // Handle unlocalized Y contigs (chrY_*).
  const unlocalizedYMatch = chr.match(/^chrY_(.+)$/);
  if (unlocalizedYMatch) {
    return {
      domain: DOMAIN.UNLOCALIZED_Y,
      chromosomeNumber: "0000",
      suffix: unlocalizedYMatch[1],
    };
  }

  // Handle unplaced contigs (chrUn_*).
  const unplacedMatch = chr.match(/^chrUn_(.+)$/);
  if (unplacedMatch) {
    return {
      domain: DOMAIN.UNPLACED,
      chromosomeNumber: "0000",
      suffix: unplacedMatch[1],
    };
  }

  // Other / unknown contigs.
  return { domain: DOMAIN.OTHER, chromosomeNumber: "0000", suffix: chr };
}

/**
 * Generate a sorting rank given a chromosome sequence identifier so that chromosomes can be sorted
 * in a natural order, e.g., chr1, chr2, ..., chrX, chrY, chrM, chr1_KI270706v1_random,
 * chrUn_KI270302v1, etc.
 *
 * The returned ranks are constant-length strings that can be used to sort chromosomes
 * lexicographically in a natural / biologically meaningful order. The returned string values
 * follow this pattern:
 *
 * domain|chromosome number|suffix
 *
 * The domain is an uppercase letter and primary sorting key:
 *   - "A" -- for numbered chromosomes
 *   - "B" -- for sex chromosomes (chrX, chrY, chrM)
 *   - "C" -- unlocalized contigs (chr1_KI270706v1_random, chr4_GL000008v2_random, etc.)
 *   - "D" -- unlocalized Y contigs (chrY_*)
 *   - "E" -- unplaced contigs (chrUn_*)
 *   - "F" -- other / unknown contigs in random order
 *
 * The chromosome number is a 0-padded four-digit numeric string that allows lexicographic sorting
 * of chromosomes in numeric order. This applies to both numbered and unlocalized contigs. For those
 * without a numeric portion, the chromosome number is "0000" and we let the domain and suffix
 * determine the sort order, except for sex chromosomes, described next.
 *
 * Sex chromosomes are assigned fixed chromosome numbers and no suffix within the "B" domain.
 *   - chrX -> "1000",
 *   - chrY -> "1001",
 *   - chrM -> "1002"
 *
 * @param chromosome - Chromosome sequence identifier e.g. "chr1" "chrX", "chrUn_KI270302v1" etc.
 * @returns Key to sort chromosomes in natural / biologically meaningful order
 */

export function generateChromosomeSortRank(chr: string): string {
  const { domain, chromosomeNumber, suffix } = chromosomeToElements(chr);
  return `${domain}|${chromosomeNumber}|${suffix}`;
}

/**
 * Genome assemblies supported for chromosomal regions.
 */
export type ChromosomalRegionAssemblies = "GRCh38" | "GRCm39";

/**
 * Identifier for a chromosomal region.
 *
 * @property name - Optional name of the chromosomal region
 * @property assembly - Genome assembly for chromosomal regions
 * @property chromosome - Chromosome identifier
 * @property start - Start position of the region on the chromosome
 * @property end - End position of the region on the chromosome
 */
export type GeneLocation = {
  name?: string;
  assembly: ChromosomalRegionAssemblies;
  chromosome: string;
  start: number;
  end: number;
};

/**
 * Sort an array of gene locations by:
 *
 *   1. assembly (lexicographically case insensitive)
 *   2. chromosome (lexicographically)
 *   3. start position (numerically ascending)
 *   4. end position (numerically ascending)
 *
 * As `name` is optional, and unlikely needed as a tiebreaker after everything else, don't include it
 * in the sort order.
 *
 * @param locations - List of gene locations to sort
 * @returns Sorted list of gene locations
 */
export function sortGeneLocations(locations: GeneLocation[]): GeneLocation[] {
  return _.orderBy(
    locations,
    [
      (loc) => loc.assembly.toLowerCase(),
      (loc) => generateChromosomeSortRank(loc.chromosome),
      (loc) => loc.start,
      (loc) => loc.end,
    ],
    ["asc", "asc", "asc", "asc"]
  );
}

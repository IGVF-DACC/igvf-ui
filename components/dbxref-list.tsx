/**
 * Displays a comma-separated list of linked external dbxrefs. This uses a global object
 * (`dbxrefPrefixMap` below) of possible dbxref URL patterns based on dbxref prefixes.
 *
 * Dbxrefs usually look like {prefix}:{id}, and this maps to a URL that includes the value in some
 * way, maybe as a REST endpoint (https://abc.com/{id}) or as part of a query string
 * (https://abc.com/?id={id}). The prefix selects which URL pattern to use.
 *
 * A URL pattern here is the URL to link to for each prefix, and with a "{0}" embedded in the
 * pattern that shows where the {id} should go. For example, if we have a dbxref "UniProtKB:1234"
 * then you can see from the dbxrefPrefixMap global that this maps to the URL pattern:
 *
 * http://www.uniprot.org/uniprot/{0}
 *
 * Because this is the simplest case that needs no more complex processing, the resulting link that
 * <DbxrefList> generates for this example is:
 *
 * http://www.uniprot.org/uniprot/1234
 *
 * If you need multiple placeholders in the URL pattern, you can use {1}, {2}, etc. and the
 * DbxrefPreprocessor can return an alternate id that is an array of values to fill in those
 * placeholders.
 *
 * PREPROCESSOR
 * ------------
 * Dbxrefs aren't always so simple and need some massaging before DbxrefList generates the URL. An
 * example:
 *
 *   "GEO:GSM1234" that should generate https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=1234
 *   "GEO:SAMN123" that should generate https://www.ncbi.nlm.nih.gov/biosample/1234
 *
 * They both use the "GEO" prefix but map to different URL patterns depending on the id after the
 * colon. To handle this, `dbxrefPrefixMap` includes a preprocessor for GEO that examines the dbxref
 * id and returns a different URL if it detects the "SAMN" string at the start of the id.
 *
 * The preprocessor callback takes the dbxref CURIE string, the prefix and id from the CURIE string
 * and an object with metadata specific to the object that has the dbxref. The preprocessor should
 * return an object with a possible alternative URL pattern and a possible alternative id.
 *
 * {
 *   altUrlPattern: String with the alternate URL pattern to use instead of the default one.
 * . altId: Dbxref id to use instead of the one in the dbxref string
 * }
 *
 * `altUrlPattern` is a URL *pattern*, so it probably should include {0} so that this component
 * replaces that with the id.
 */

// node_modules
import _ from "lodash";
// components
import SeparatedList from "./separated-list";
// lib
import Curie from "../lib/curie";

/**
 * Used for processors requiring extra data specific to a particular dbxref. For example, ENSEMBL
 * requires a `taxa` string to generate a URL, unneeded by any other dbxref at this time. Expand this
 * type with new properties as needed for future dbxref CURIE prefixes.
 */
type DbxrefMeta = {
  taxa?: string;
};

/**
 * Result returned by a DbxrefPreprocessor function.
 *
 * @property altUrlPattern - Alternate URL pattern to use instead of the one in `pattern`
 * @property altId - Alternate dbxref ID to use instead of the one in the dbxref string
 */
type DbxrefPreprocessorResult = {
  altUrlPattern?: string;
  altId?: string;
};

/**
 * Function to process the CURIE string before generating the URL for the dbxref.
 *
 * @param curie - Full dbxref CURIE string including both `prefix` and `id` (e.g., "GEO:GSM1234")
 * @param prefix - CURIE prefix (e.g., "GEO")
 * @param id - Dbxref ID part of the CURIE string (e.g., "GSM1234")
 * @param meta - Metadata specific to the dbxref
 */
type DbxrefPreprocessor = (
  curie: string,
  prefix: string,
  id: string,
  meta: DbxrefMeta
) => DbxrefPreprocessorResult;

/**
 * Configuration for a specific dbxref CURIE prefix. It's unusual not to have a pattern, but if we
 * can't know what the URL will look like until we look at the dbxref id or metadata, then we can
 * use a preprocessor to generate the URL pattern and/or the id.
 *
 * @param pattern - URL pattern for the dbxref prefix including a "{0}" where the dbxref id should go
 * @param preprocessor - Function to process the CURIE string before generating the URL
 */
type DbxrefPrefixConfig =
  | {
      pattern: string;
      preprocessor?: DbxrefPreprocessor;
    }
  | {
      pattern?: never;
      preprocessor: DbxrefPreprocessor;
    };

/**
 * Add a new property to this object to handle new dbxref CURIE prefixes. Also add a new Jest test
 * to __tests__/dbxref-list.test.js when you do this.
 */
export const dbxrefPrefixMap: Record<string, DbxrefPrefixConfig> = {
  Cellosaurus: {
    pattern: "https://web.expasy.org/cellosaurus/{0}",
  },
  DepMap: {
    pattern: "https://depmap.org/portal/cell_line/{0}",
  },
  ENSEMBL: {
    // ENSEMBL requires a { taxa: <organism scientific name> } metadata object to generate a URL.
    preprocessor: (
      _curie: string,
      _prefix: string,
      _id: string,
      meta: DbxrefMeta
    ) => {
      if (meta.taxa) {
        if (meta.taxa === "Homo sapiens") {
          return {
            altUrlPattern:
              "http://www.ensembl.org/Homo_sapiens/Gene/Summary?g={0}",
          };
        }
        if (meta.taxa === "Mus musculus") {
          return {
            altUrlPattern:
              "http://www.ensembl.org/Mus_musculus/Gene/Summary?g={0}",
          };
        }
      }

      // No metadata or no recognized taxa, so don't offer a URL for this dbxref.
      return {};
    },
  },
  doi: {
    pattern: "https://doi.org/doi:{0}",
  },
  ENCODE: {
    pattern: "https://www.encodeproject.org/{0}",
  },
  ENTREZ: {
    pattern: "https://www.ncbi.nlm.nih.gov/gene/{0}",
  },
  GeneCards: {
    pattern: "http://www.genecards.org/cgi-bin/carddisp.pl?gene={0}",
  },
  GEO: {
    pattern: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={0}",
    preprocessor: (_curie, _prefix, id) => {
      if (id.startsWith("SAMN")) {
        return { altUrlPattern: "https://www.ncbi.nlm.nih.gov/biosample/{0}" };
      }
      return {};
    },
  },
  HGNC: {
    pattern:
      "https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:{0}",
  },
  hORFeome: {
    pattern: "http://horfdb.dfci.harvard.edu/index.php?page=showdetail&orf={0}",
  },
  "IMGT/GENE-DB": {
    pattern:
      "http://www.imgt.org/IMGT_GENE-DB/GENElect?species=Homo+sapiens&query=2+{0}",
  },
  IMSR_JAX: {
    pattern: "https://www.jax.org/strain/{0}",
  },
  IGSR: {
    pattern: "https://www.internationalgenome.org/data-portal/sample/{0}",
  },
  MGI: {
    pattern: "http://www.informatics.jax.org/marker/MGI:{0}",
  },
  MIM: {
    pattern: "https://www.ncbi.nlm.nih.gov/omim/{0}",
  },
  miRBase: {
    pattern: "http://www.mirbase.org/cgi-bin/mirna_entry.pl?acc={0}",
  },
  PMCID: {
    pattern: "https://www.ncbi.nlm.nih.gov/pmc/articles/{0}",
  },
  PMID: {
    pattern: "https://www.ncbi.nlm.nih.gov/pubmed/?term={0}",
  },
  RefSeq: {
    pattern: "https://www.ncbi.nlm.nih.gov/nuccore/{0}",
  },
  UniProtKB: {
    pattern: "http://www.uniprot.org/uniprot/{0}",
  },
  Vega: {
    pattern: "http://vega.sanger.ac.uk/id/{0}",
  },
  OBI: {
    pattern:
      "https://ontobee.org/ontology/OBI?iri=http://purl.obolibrary.org/obo/OBI_{0}",
  },
  EFO: {
    pattern:
      "https://ontobee.org/ontology/EFO?iri=http://www.ebi.ac.uk/efo/EFO_{0}",
  },
  CL: {
    pattern:
      "https://ontobee.org/ontology/CL?iri=http://purl.obolibrary.org/obo/CL_{0}",
  },
  HP: {
    pattern:
      "https://ontobee.org/ontology/HP?iri=http://purl.obolibrary.org/obo/HP_{0}",
  },
  MONDO: {
    pattern:
      "https://ontobee.org/ontology/MONDO?iri=http://purl.obolibrary.org/obo/MONDO_{0}",
  },
  NCIT: {
    pattern:
      "https://ontobee.org/ontology/NCIT?iri=http://purl.obolibrary.org/obo/NCIT_{0}",
  },
  DOID: {
    pattern:
      "https://ontobee.org/ontology/DOID?iri=http://purl.obolibrary.org/obo/DOID_{0}",
  },
  OBA: {
    pattern:
      "https://ontobee.org/ontology/OBA?iri=http://purl.obolibrary.org/obo/OBA_{0}",
  },
  UBERON: {
    pattern:
      "https://ontobee.org/ontology/UBERON?iri=http://purl.obolibrary.org/obo/UBERON_{0}",
  },
  SRA: {
    pattern: "http://www.ncbi.nlm.nih.gov/Traces/sra/?run={0}",
  },
};

/**
 * Process a single dbxref string, converting it to a URL if possible.
 *
 * @param dbxref - The dbxref string to process
 * @param meta - Metadata to use for processing specific types of dbxrefs
 */
class DbxrefProcessor extends Curie {
  readonly #meta: DbxrefMeta;
  #urlCache?: string;

  constructor(dbxref: string, meta: DbxrefMeta) {
    super(dbxref);
    this.#meta = meta;
  }

  /**
   * Get the URL corresponding to the dbxref. If no URL is available, return an empty string.
   */
  get url(): string {
    if (this.#urlCache === undefined) {
      this.#urlCache = this.#calculateUrl();
    }
    return this.#urlCache;
  }

  /**
   * Calculate the URL corresponding to the dbxref based on the dbxref processor for the dbxref's
   * prefix. If no processor exists for the dbxref's prefix, return an empty URL.
   */
  #calculateUrl(): string {
    let url = "";
    const urlProcessor = dbxrefPrefixMap[this.prefix];
    if (urlProcessor) {
      let urlPattern = urlProcessor.pattern || "";
      let id = this.id;

      // Call the preprocessor (if it exists) for the prefix to replace either the URL pattern, the
      // value, or both.
      if (urlProcessor.preprocessor) {
        const { altUrlPattern, altId } = urlProcessor.preprocessor(
          this.curie,
          this.prefix,
          this.id,
          this.#meta
        );
        urlPattern = altUrlPattern || urlPattern;
        id = altId || id;
      }

      // Replace the {0} in the URL pattern with the id from the CURIE to form the final link.
      url = urlPattern
        ? urlPattern.replace(/\{0\}/g, encodeURIComponent(id))
        : "";
    }
    return url;
  }
}

/**
 * Display a single linked dbxref. If no URL is available for the dbxref, just display the dbxref
 * string.
 *
 * @param dbxref - dbxref string to display
 * @param meta - Metadata that affects certain dbxrefs
 */
export function DbxrefItem({
  dbxref,
  meta,
}: {
  dbxref: string;
  meta: DbxrefMeta;
}) {
  const dbxrefProcessor = new DbxrefProcessor(dbxref, meta);
  if (dbxrefProcessor.url) {
    return (
      <a href={dbxrefProcessor.url} target="_blank" rel="noreferrer">
        {dbxref}
      </a>
    );
  }

  // If we don't handle the dbxref prefix, just return the dbxref string without a link.
  return <>{dbxref}</>;
}

/**
 * Display a comma-separated list of linked dbxrefs.
 *
 * @param dbxrefs - List of dbxrefs to display
 * @param isCollapsible - True if the list of linked dbxrefs should be collapsible
 * @param meta - Metadata that affects certain dbxrefs
 */
export default function DbxrefList({
  dbxrefs,
  isCollapsible = false,
  meta = {},
}: {
  dbxrefs: string[];
  isCollapsible?: boolean;
  meta?: DbxrefMeta;
}) {
  return (
    <SeparatedList isCollapsible={isCollapsible}>
      {_.uniq(dbxrefs).map((dbxref) => {
        return <DbxrefItem key={dbxref} dbxref={dbxref} meta={meta} />;
      })}
    </SeparatedList>
  );
}

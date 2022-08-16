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
 * Preprocessor
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
 *   altId: Dbxref id to use instead of the one in the dbxref string
 * }
 *
 * `altUrlPattern` is a URL *pattern*, so it probably should include {0} so that this component
 * replaces that with the id.
 */

// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
// components
import SeparatedList from "./separated-list";
// lib
import Curie from "../lib/curie";

/**
 * Add a new property to this object to handle new dbxref CURIE prefixes. Also add a new Jest test
 * to __tests__/dbxref-list.test.js when you do this.
 */
export const dbxrefPrefixMap = {
  Cellosaurus: {
    pattern: "https://web.expasy.org/cellosaurus/{0}",
  },
  DepMap: {
    pattern: "https://depmap.org/portal/cell_line/{0}",
  },
  ENSEMBL: {
    // ENSEMBL requires a { taxa: <organism scientific name> } metadata object to generate a URL.
    preprocessor: (curie, prefix, id, meta) => {
      if (meta && meta.taxa) {
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
  GeneCards: {
    pattern: "http://www.genecards.org/cgi-bin/carddisp.pl?gene={0}",
  },
  GEO: {
    pattern: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={0}",
    preprocessor: (curie, prefix, id) => {
      if (id.substr(0, 4) === "SAMN") {
        return { altUrlPattern: "https://www.ncbi.nlm.nih.gov/biosample/{0}" };
      }
      return {};
    },
  },
  HGNC: {
    pattern: "https://www.genenames.org/cgi-bin/gene_symbol_report?hgnc_id={0}",
  },
  "IMGT/GENE-DB": {
    pattern:
      "http://www.imgt.org/IMGT_GENE-DB/GENElect?species=Homo+sapiens&query=2+{0}",
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
  RefSeq: {
    pattern: "https://www.ncbi.nlm.nih.gov/nuccore/{0}",
  },
  UniProtKB: {
    pattern: "http://www.uniprot.org/uniprot/{0}",
  },
  Vega: {
    pattern: "http://vega.sanger.ac.uk/id/{0}",
  },
};

/**
 * Process a single dbxref string, converting it to a URL if possible.
 * @param {string} dbxref The dbxref string to process
 * @param {object} meta Metadata to use for processing specific types of dbxrefs
 */
class DbxrefProcessor extends Curie {
  #meta;

  constructor(dbxref, meta) {
    super(dbxref);
    this.#meta = meta;
  }

  /**
   * Return the URL corresponding to the dbxref based on the dbxref processor for the dbxref's
   * prefix. If no processor exists for the dbxref's prefix, return an empty URL.
   */
  get url() {
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
 */
const DbxrefItem = ({ dbxref, meta }) => {
  const dbxrefProcessor = new DbxrefProcessor(dbxref, meta);
  if (dbxrefProcessor.url) {
    return (
      <a href={dbxrefProcessor.url} target="_blank" rel="noreferrer">
        {dbxref}
      </a>
    );
  }
  return <>{dbxref}</>;
};

DbxrefItem.propTypes = {
  // Dbxref to display as a link
  dbxref: PropTypes.string.isRequired,
  // Metadata that affects certain dbxrefs
  meta: PropTypes.object.isRequired,
};

/**
 * Display a comma-separated list of linked dbxrefs.
 */
const DbxrefList = ({ dbxrefs, meta = {} }) => {
  return (
    <SeparatedList>
      {_.uniq(dbxrefs).map((dbxref) => {
        return <DbxrefItem key={dbxref} dbxref={dbxref} meta={meta} />;
      })}
    </SeparatedList>
  );
};

DbxrefList.propTypes = {
  // Dbxrefs to display
  dbxrefs: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Metadata that affects certain dbxrefs
  meta: PropTypes.object,
};

export default DbxrefList;

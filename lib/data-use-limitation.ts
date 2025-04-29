// root
import type { DatabaseObject, SampleObject } from "../globals";

/**
 * Institutional certificate object type.
 */
export interface InstitutionalCertificateObject extends DatabaseObject {
  certificate_identifier: string;
  controlled_access: boolean;
  data_use_limitation?: string;
  data_use_limitation_modifiers?: string[];
  data_use_limitation_summary?: string;
  samples?: string[];
  summary: string;
  urls: string[];
}

/**
 * Collects all data-use limitation summaries from the given samples. The resulting array of data-
 * use limitation summaries all come from unique institutional certificates, even if multiple
 * sample refer to the same institutional certificate.
 * @param samples - Sample objects possibly containing institutional certificate objects
 * @returns Data-use limitation summaries
 */
export function collectDataUseLimitationSummariesFromSamples(
  samples: SampleObject[]
): string[] {
  // Collect all institutional certificates from the samples without duplicates.
  // Use `certificate_identifier` to identify duplicates.
  const seenIdentifiers = new Set<string>();
  const allSampleIcs = samples.reduce((acc, sample) => {
    const sampleIcs = [];
    for (const ic of (sample.institutional_certificates as
      | InstitutionalCertificateObject[]
      | undefined) ?? []) {
      if (!seenIdentifiers.has(ic.certificate_identifier)) {
        seenIdentifiers.add(ic.certificate_identifier);
        sampleIcs.push(ic);
      }
    }
    return acc.concat(sampleIcs);
  }, [] as InstitutionalCertificateObject[]);

  // While `data_use_limitation_summary` is required in the type definition, it might not
  // actually exist in institutional certificate objects, particularly those that appear in search
  // results. Collect all data-use limitation summaries from the institutional certificates. If
  // no `data_use_limitation_summary` exists, convert the `data_use_limitation` and
  // `data_use_limitation_modifiers` into a summary.
  const allDuls = allSampleIcs.map((ic) => {
    if (ic.data_use_limitation_summary) {
      return ic.data_use_limitation_summary;
    }
    return composeDataUseLimitationSummary(
      ic.data_use_limitation,
      ic.data_use_limitation_modifiers
    );
  });

  // If multiple ICs have the same DULs, remove duplicates from the data-use limitation summaries.
  return [...new Set(allDuls)];
}

/**
 * Composes a data-use limitation summary from the given limitation and modifiers. We don't often
 * need to do this because the back end should do this for us, but some cases exist where the data-
 * use limitation summary doesn't get embedded in an institutional certificate object.
 * @param limitation - `data_use_limitation` property from an institutional certificate
 * @param modifiers - `data_use_limitation_modifiers` property from an institutional certificate
 * @returns Data-use limitation summary
 */
export function composeDataUseLimitationSummary(
  limitation: string = "",
  modifiers: string[] = []
): string {
  return `${limitation}${
    modifiers.length > 0 ? `-${modifiers.join("-")}` : ""
  }`;
}

/**
 * Data use limitations can come in the form of a string for the limitation and an array of strings
 * for the modifiers, but they can also come as a summary -- a single string that includes both the
 * limitation and the modifiers. This function decomposes the summary into its separate limitation
 * and modifiers. If no modifiers exist, the modifiers array is empty. If `summary` is empty, the
 * limitation is an empty string and the modifiers array is empty.
 * @param summary - Data-use limitation summary that includes limitation and modifiers
 * @returns limitation and modifiers as separate strings
 */
export function decomposeDataUseLimitationSummary(summary: string = ""): {
  limitation: string;
  modifiers: string[];
} {
  if (summary) {
    const [limitation, modifiers] = summary.split(/-(.+)/);
    return { limitation, modifiers: modifiers ? modifiers.split("-") : [] };
  }
  return { limitation: "", modifiers: [] };
}

// lib
import { requestOntologyTerms } from "./common-requests";
import { type InstitutionalCertificateObject } from "./data-use-limitation";
import {
  isDatabaseObjectArrayOfType,
  pathsFromDatabaseObjects,
} from "./database-object";
import FetchRequest from "./fetch-request";
import { type FileSetObject } from "./file-sets";
// Note: circular import type with ./modifications.ts. This is a deliberate, safe choice.
import { type ModificationObject } from "./modifications";
import { type SampleTermObject } from "./ontology-terms";
import { type LinkTo, type LinkToArray } from "./types";
// root
import type {
  BiomarkerObject,
  DatabaseObject,
  DocumentObject,
  DonorObject,
  FileObject,
  LabObject,
  PhenotypicFeatureObject,
  PublicationObject,
  SourceObject,
  TreatmentObject,
} from "../globals";

/**
 * Base type for sample and biosample objects (Sample @type).
 */
export interface SampleObject extends DatabaseObject {
  aliases?: string[];
  classifications?: string[];
  construct_delivery_methods?: string[];
  construct_library_sets?: LinkToArray<FileSetObject>;
  date_obtained?: string;
  dbxrefs?: string[];
  file_sets?: LinkToArray<FileSetObject>;
  institutional_certificates?: LinkToArray<InstitutionalCertificateObject>;
  is_on_anvil?: boolean;
  moi?: number;
  multiplexed_in?: LinkToArray<SampleObject>;
  notes?: string;
  origin_of?: LinkToArray<SampleObject>;
  part_of?: LinkTo<BiosampleObject>;
  parts?: LinkToArray<SampleObject>;
  protocols?: string[];
  publications?: LinkToArray<PublicationObject>;
  sample_terms?: LinkToArray<SampleTermObject>;
  selection_conditions?: string[];
  sorted_fractions?: LinkToArray<SampleObject>;
  sorted_from?: LinkTo<SampleObject>;
  sorted_from_detail?: string;
  sources?: LinkToArray<SourceObject | LabObject>;
  starting_amount?: number;
  starting_amount_units?: string;
  taxa?: string;
  time_post_library_delivery?: number;
  time_post_library_delivery_units?: string;
  treatments?: LinkToArray<TreatmentObject>;
  url?: string;
  virtual?: boolean;
}

/**
 * Base type for biosample objects (Biosample @type).
 */
export interface BiosampleObject extends SampleObject {
  age?: string;
  age_units?: string;
  annotated_from?: LinkTo<SampleObject>;
  biomarkers?: LinkToArray<BiomarkerObject>;
  cellular_sub_pool?: string;
  donors?: LinkToArray<DonorObject>;
  embryonic: boolean;
  lot_id?: string;
  lower_bound_age?: number;
  lower_bound_age_in_hours?: number;
  modifications?: LinkToArray<ModificationObject>;
  originated_from?: LinkTo<SampleObject>;
  phenotypic_features?: LinkToArray<PhenotypicFeatureObject>;
  pooled_from?: LinkToArray<BiosampleObject>;
  pooled_in?: LinkToArray<BiosampleObject>;
  product_id?: string;
  sex?: string;
  upper_bound_age?: number;
  upper_bound_age_in_hours?: number;
}

/**
 * Type for in-vitro system objects (InVitroSystem @type).
 */
export interface InVitroSystemObject extends BiosampleObject {
  biosample_qualifiers?: string[];
  cell_fate_change_protocol?: LinkTo<DocumentObject>;
  demultiplexed_from?: LinkTo<SampleObject>;
  demultiplexed_to?: LinkToArray<SampleObject>;
  growth_medium?: string;
  passage_number?: number;
  targeted_sample_term?: LinkTo<SampleTermObject>;
  time_post_change?: number;
  time_post_change_units?: string;
  time_post_culture?: number;
  time_post_culture_units?: string;
}

/**
 * Type for primary cell objects (PrimaryCell @type).
 */
export interface PrimaryCellObject extends BiosampleObject {
  biosample_qualifiers?: string[];
  passage_number?: number;
}

/**
 * Type for tissue/organ objects (Tissue @type).
 */
export interface TissueOrganObject extends BiosampleObject {
  pmi?: number;
  pmi_units?: string;
  preservation_method?: string;
}

/**
 * Type for whole organism objects (WholeOrganismSample @type).
 */
export interface WholeOrganismSampleObject extends BiosampleObject {}

/**
 * Type for multiplexed sample objects (MultiplexedSample @type).
 */
export interface MultiplexedSampleObject extends SampleObject {
  barcode_map?: LinkTo<FileObject>;
  biomarkers?: LinkToArray<BiomarkerObject>;
  cellular_sub_pool?: string;
  demultiplexed_to?: LinkToArray<SampleObject>;
  donors?: LinkToArray<DonorObject>;
  modifications?: LinkToArray<ModificationObject>;
  multiplexed_samples?: LinkToArray<SampleObject>;
  multiplexing_methods?: string[];
  phenotypic_features?: LinkToArray<PhenotypicFeatureObject>;
  targeted_sample_terms?: LinkToArray<SampleTermObject>;
}

/**
 * Type for technical sample objects (TechnicalSample @type).
 */
export interface TechnicalSampleObject extends SampleObject {
  lot_id?: string;
  originated_from?: LinkTo<SampleObject>;
  product_id?: string;
  sample_material?: string;
}

/**
 * Given an array of sample objects, request the ontology term objects corresponding to the sample
 * terms linked to by those samples.
 *
 * @param samples - Sample objects from which to extract ontology terms
 * @param request - FetchRequest object to use for the request
 * @returns Ontology term objects corresponding to the sample terms linked to by the given samples
 */
export async function getSamplesTerms(
  samples: SampleObject[],
  request: FetchRequest
): Promise<SampleTermObject[]> {
  if (!isDatabaseObjectArrayOfType(samples, "Sample")) {
    return [];
  }

  // Collect unique paths for all the samples' `sample_terms` properties. We want to fetch all the sample terms in a single request, so we need to collect all the unique paths to those sample terms.
  const termPaths = new Set<string>();
  samples.forEach((sample) => {
    const paths = pathsFromDatabaseObjects(sample.sample_terms);
    paths.forEach((path) => termPaths.add(path));
  });

  // Fetch the sample terms for all the collected paths in a single request and return them as an array.
  return termPaths.size > 0
    ? await requestOntologyTerms(Array.from(termPaths), request)
    : [];
}

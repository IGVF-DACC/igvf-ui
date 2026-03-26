// lib
import { type InstitutionalCertificateObject } from "./data-use-limitation";
// Note: circular import type with ./modifications.ts. This is a deliberate, safe choice.
import { type ModificationObject } from "./modifications";
import { type LinkTo } from "./types";

// root
import type {
  BiomarkerObject,
  DatabaseObject,
  DocumentObject,
  DonorObject,
  FileObject,
  FileSetObject,
  LabObject,
  OntologyTermObject,
  PublicationObject,
  SourceObject,
  TreatmentObject,
} from "../globals";

export interface SampleObject extends DatabaseObject {
  aliases?: string[];
  barcode_map?: LinkTo<FileObject>;
  biomarkers?: LinkTo<BiomarkerObject>[];
  classifications?: string[];
  collections?: string[];
  construct_library_sets?: LinkTo<FileSetObject>[];
  dbxrefs?: string[];
  demultiplexed_to?: LinkTo<SampleObject>[];
  disease_terms?: LinkTo<OntologyTermObject>[];
  documents?: LinkTo<DocumentObject>[];
  donors?: LinkTo<DonorObject>[];
  file_sets?: LinkTo<FileSetObject>[];
  institutional_certificates?: LinkTo<InstitutionalCertificateObject>[];
  modifications?: LinkTo<ModificationObject>[];
  multiplexed_in?: LinkTo<SampleObject>[];
  name?: string;
  notes?: string;
  origin_of?: LinkTo<SampleObject>[];
  part_of?: LinkTo<BiosampleObject>;
  parts?: LinkTo<SampleObject>[];
  publications?: LinkTo<PublicationObject>[];
  sample_terms?: LinkTo<OntologyTermObject>[];
  sorted_fractions?: LinkTo<SampleObject>[];
  sources?: LinkTo<SourceObject | LabObject>[];
  study_sets?: string[];
  submitter_comment?: string;
  summary?: string;
  taxa?: string;
  title?: string;
  transcriptome_annotation?: string;
  treatments?: LinkTo<TreatmentObject>[];
}

export interface BiosampleObject extends SampleObject {
  annotated_from?: LinkTo<SampleObject>;
  biosample_qualifiers?: string[];
  pooled_from?: LinkTo<BiosampleObject>[];
  pooled_in?: LinkTo<BiosampleObject>[];
}

export interface InVitroSystemObject extends BiosampleObject {
  cell_fate_change_protocol?: LinkTo<DocumentObject>;
  demultiplexed_from?: LinkTo<SampleObject>;
  growth_medium?: string;
  passage_number?: number;
  targeted_sample_term?: LinkTo<OntologyTermObject>;
  time_post_change?: number;
  time_post_change_units?: string;
  time_post_culture?: number;
  time_post_culture_units?: string;
}

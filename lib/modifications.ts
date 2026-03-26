// lib
// Note: circular import type with ./samples.ts. This is a deliberate, safe choice.
import { type BiosampleObject } from "./samples";
import { type LinkTo } from "./types";
// root
import type {
  DatabaseObject,
  DocumentObject,
  GeneObject,
  LabObject,
  SourceObject,
} from "../globals";

export interface ModificationObject extends DatabaseObject {
  activated?: boolean;
  activating_agent_term_id?: string;
  activating_agent_term_name?: string;
  aliases?: string[];
  biosamples_modified?: LinkTo<BiosampleObject>[];
  description?: string;
  documents?: LinkTo<DocumentObject>[];
  lot_id?: string;
  modality: string;
  notes?: string;
  product_id?: string;
  sources?: LinkTo<SourceObject | LabObject>[];
  summary?: string;
}

export interface DegronModificationObject extends ModificationObject {
  degron_system: string;
  tagged_proteins: LinkTo<GeneObject>[];
}

export interface CrisprModificationObject extends ModificationObject {
  cas: string;
  cas_species: string;
  fused_domain?: string;
  tagged_proteins?: LinkTo<GeneObject>[];
}

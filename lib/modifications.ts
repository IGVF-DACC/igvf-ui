// lib
// Note: circular import type with ./samples.ts. This is a deliberate, safe choice.
import { type BiosampleObject } from "./samples";
import { type LinkToArray } from "./types";
// root
import type {
  DatabaseObject,
  GeneObject,
  LabObject,
  SourceObject,
} from "../globals";

/**
 * Base type for modification objects (@type Modification).
 */
export interface ModificationObject extends DatabaseObject {
  activated?: boolean;
  activating_agent_term_id?: string;
  activating_agent_term_name?: string;
  aliases?: string[];
  biosamples_modified?: LinkToArray<BiosampleObject>;
  description?: string;
  lot_id?: string;
  modality: string;
  notes?: string;
  product_id?: string;
  sources?: LinkToArray<SourceObject | LabObject>;
}

/**
 * Type for CRISPR modification objects (@type CrisprModification).
 */
export interface CrisprModificationObject extends ModificationObject {
  cas: string;
  cas_species: string;
  fused_domain?: string;
  tagged_proteins?: LinkToArray<GeneObject>;
}

/**
 * Type for degron modification objects (@type DegronModification).
 */
export interface DegronModificationObject extends ModificationObject {
  degron_system: string;
  tagged_proteins: LinkToArray<GeneObject>;
}

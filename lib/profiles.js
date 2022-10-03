// libs
import FetchRequest from "./fetch-request";

/**
 * Loads the schemas for all object types, with each key of the object being the @type for each
 * schema.
 * @param {object} session Authentication session object
 * @returns {Promise} Promise that resolves to the /profiles object
 */
const getProfiles = async (session) => {
  const request = new FetchRequest({ session });
  return request.getObject("/profiles", null);
};

export const PROFILE_COLLECTIONS = {
  "/profiles/award.json": "awards",
  "/profiles/document.json": "documents",
  "/profiles/human_donor.json": "human-donors",
  "/profiles/rodent_donor.json": "rodent-donors",
  "/profiles/gene.json": "genes",
  "/profiles/image.json": "images",
  "/profiles/lab.json": "labs",
  "/profiles/assay_term.json": "assay-terms",
  "/profiles/phenotype_term.json": "phenotype-terms",
  "/profiles/sample_term.json": "sample-terms",
  "/profiles/page.json": "pages",
  "/profiles/publication.json": "publications",
  "/profiles/cell_line.json": "cell-lines",
  "/profiles/differentiated_cell.json": "differentiated-cells",
  "/profiles/differentiated_tissue.json": "differentiated-tissues",
  "/profiles/primary_cell.json": "primary-cells",
  "/profiles/technical_sample.json": "technical-samples",
  "/profiles/tissue.json": "tissues",
  "/profiles/whole_organism.json": "whole-organisms",
  "/profiles/source.json": "sources",
  "/profiles/treatment.json": "treatments",
  "/profiles/user.json": "users",
};
Object.freeze(PROFILE_COLLECTIONS);

export default getProfiles;

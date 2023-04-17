/**
 * Compose the title of a human genomic variant.
 * @param {object} variant Human genomic variant object
 * @returns {string} Title of the human genomic variant
 */
export default function humanGenomicVariantTitle(variant) {
  const first =
    variant.chromosome || variant.refseq_id || variant.reference_sequence;
  const titleSeq = [first, variant.position, variant.ref, variant.alt];
  return titleSeq.join(":");
}

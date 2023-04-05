// lib
import FetchRequest from "./fetch-request";

/**
 * Generate the attribution data for an object page.
 * @param {object} obj Object for the displayed page
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {object} attribution data for the given page
 */
export default async function buildAttribution(obj, cookie) {
  const attribution = {};
  const request = new FetchRequest({ cookie });
  if (obj.lab) {
    const lab =
      typeof obj.lab == "string"
        ? await request.getObject(obj.lab, null)
        : await request.getObject(obj.lab["@id"], null);
    if (lab) {
      attribution.lab = lab;
    }
  }
  if (obj.award) {
    const award =
      typeof obj.award == "string"
        ? await request.getObject(obj.award, null)
        : await request.getObject(obj.award["@id"], null);
    if (award) {
      attribution.award = award;
      const contactPi = award.contact_pi
        ? await request.getObject(award.contact_pi, null)
        : null;
      if (contactPi) {
        attribution.contactPi = contactPi;
      }
      const pis = award.pis
        ? await request.getMultipleObjects(award.pis, null, {
            filterErrors: true,
          })
        : null;
      if (pis) {
        attribution.pis = pis;
      }
    }
  }
  if (obj.collections?.length > 0) {
    attribution.collections = obj.collections;
  }
  return attribution;
}

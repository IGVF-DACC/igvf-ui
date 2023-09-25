// lib
import FetchRequest from "./fetch-request";
import { requestUsers } from "./common-requests";
import { DataProviderObject } from "../globals";
import { ErrorObject } from "./fetch-request.d";
import { nullOnError } from "./general";

/**
 * An interface that for an object which can have attribution
 * information generated.
 *
 * Objects with `lab`, `award`, or `collections`, when passed to
 * `buildAttribution` will have their attribution details built.
 *
 * All properties are optional because some objects may attempt
 * to have attributions made of them when these propertis don't
 * exist, in which case the returned Attribution would be null.
 */
export interface Attributable {
  lab?: string | { "@id": string };
  award?: string | { "@id": string };
  collections?: [] | null;
}

/**
 * The Attribution of an object. Once an object has its attribution
 * built, the details are collected into an object that has this
 * interface. Attributions are then passed to the Attribution component
 * to be rendered.
 */
export interface Attribution {
  lab: DataProviderObject | null;
  award: DataProviderObject | null;
  contactPi: DataProviderObject | null;
  pis: object[] | null;
  collections: [] | null;
}

/**
 * Generate the attribution data for an object page.
 * @param {object} obj Object for the displayed page
 * @param {string} cookie Server cookie to authenticate the request
 * @returns {object} attribution data for the given page
 */
export default async function buildAttribution(
  obj: Attributable,
  cookie: string
): Promise<Attribution> {
  const request = new FetchRequest({ cookie });

  const lab = nullOnError<DataProviderObject, ErrorObject>(
    obj.lab
      ? typeof obj.lab === "string"
        ? await request.getObject(obj.lab, null)
        : await request.getObject(obj.lab["@id"], null)
      : null
  );

  const award = nullOnError<DataProviderObject, ErrorObject>(
    obj.award
      ? typeof obj.award === "string"
        ? await request.getObject(obj.award, null)
        : await request.getObject(obj.award["@id"], null)
      : null
  );

  const contactPi =
    award && award.contact_pi
      ? nullOnError<DataProviderObject, ErrorObject>(
          await request.getObject(award.contact_pi as string, null)
        )
      : null;

  const pis =
    award && award.pis
      ? nullOnError<object[], ErrorObject>(
          await requestUsers(award.pis as string[], request)
        )
      : null;

  const collections =
    obj.collections && obj.collections.length > 0 ? obj.collections : null;

  return {
    lab,
    award,
    contactPi,
    pis,
    collections,
  };
}

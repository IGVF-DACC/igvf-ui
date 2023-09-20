// lib
import FetchRequest from "./fetch-request";
import { requestUsers } from "./common-requests";
import { DataProviderObject } from "../globals";
import { ErrorObject } from "./fetch-request.d";

export interface Attributable {
  lab: string | { "@id": string };
  award: string | { "@id": string };
  collections: [] | null;
}

export interface Attribution {
  lab: DataProviderObject | null;
  award: DataProviderObject | null;
  contactPi: DataProviderObject | null;
  pis: object[] | null;
  collections: [] | null;
}

interface IsError {
  isError: true;
}

function nullOnError<T, E extends IsError>(x: T | E | null): T | null {
  if (x && typeof x === "object" && "isError" in x) {
    return null;
  }
  return x;
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
    typeof obj.lab === "string"
      ? await request.getObject(obj.lab, null)
      : await request.getObject(obj.lab["@id"], null)
  );

  const award = nullOnError<DataProviderObject, ErrorObject>(
    typeof obj.award === "string"
      ? await request.getObject(obj.award, null)
      : await request.getObject(obj.award["@id"], null)
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

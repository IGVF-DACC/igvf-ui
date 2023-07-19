/**
 * Single audit within an audit category.
 */
export interface Audit {
  category: string;
  detail: string;
  level: number;
  level_name: string;
  name: string;
  path: string;
}

/**
 * Template for the `audit` object within a database object.
 */
export interface Audits {
  ERROR?: Array<Audit>;
  INTERNAL_ACTION?: Array<Audit>;
  NOT_COMPLIANT?: Array<Audit>;
  WARNING?: Array<Audit>;
}

/**
 * Type used for any item retrieved from the data provider.
 */
export interface DataProviderObject {
  [key: string]: unknown;
}

/**
 * Actions that we can perform on a database object for logged-in users. The `actions` property of
 * data objects holds an array of these.
 */
export interface ObjectActions {
  name: string;
  title: string;
  profile: string;
  href: string;
}

/**
 * Standard properties for all objects in the database.
 */
export interface DatabaseObject {
  "@context": string;
  "@id": string;
  "@type": Array<string>;
  actions?: Array<ObjectActions>;
  audit?: Audits;
  status: string;
  uuid: string;
  [key: string]: unknown;
}

/**
 * Session object from the data provider. `auth.userid` exists if the user has logged in.
 */
export interface SessionObject {
  _csrft_: string;
  "auth.userid"?: string;
  edits: unknown[][];
}

/**
 * NextJS query object that gets passed to `getServerSideProps`.
 */
export interface NextJsServerQuery {
  [key: string]: string | string[] | undefined;
}

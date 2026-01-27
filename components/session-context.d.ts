/**
 * Temporary TypeScript definitions needed until we rewrite session-context.js in TypeScript.
 */

import type { Context } from "react";
import type {
  SessionObject,
  SessionPropertiesObject,
  Profiles,
  CollectionTitles,
} from "../globals";

export interface SessionContextValue {
  session: SessionObject | null;
  sessionProperties: SessionPropertiesObject | null;
  profiles: Profiles | null;
  collectionTitles: CollectionTitles | null;
  dataProviderUrl: string | null;
}

declare const SessionContext: Context<SessionContextValue>;
export default SessionContext;

/**
 * Temporary TypeScript definitions needed until we rewrite session-context.js in TypeScript.
 */

import type {
  SessionObject,
  SessionPropertiesObject,
  Profiles,
  CollectionTitles,
} from "../globals.d";

interface SessionContextValue {
  session: SessionObject | null;
  sessionProperties: SessionPropertiesObject | null;
  profiles: Profiles | null;
  collectionTitles: CollectionTitles | null;
  dataProviderUrl: string | null;
}

declare module "./session-context" {
  const SessionContext: React.Context<SessionContextValue>;
  export default SessionContext;
}

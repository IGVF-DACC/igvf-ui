/**
 * Temporary TypeScript definitions needed until we rewrite session-context.js in TypeScript.
 */

interface SessionContextValue {
  session: SessionPropertiesObject;
}

declare module "./session-context" {
  const SessionContext: React.Context<SessionContextValue>;
  export default SessionContext;
}

type SessionUserActionsObject = {
  id: string;
  title: string;
  href: string;
  notSubmittable: boolean;
};

export type SessionPropertiesObject = {
  admin: boolean;
  "auth.userid": string;
  user: UserObject;
  user_actions: SessionUserActionsObject[];
};

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
  user: {
    "@context": string;
    "@id": string;
    "@type": string[];
    audit: unknown;
    lab: string;
    status: string;
    submits_for: string[];
    title: string;
    uuid: string;
  };
  user_actions: SessionUserActionsObject[];
};

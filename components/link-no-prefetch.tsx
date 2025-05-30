// node_modules
import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes } from "react";

/**
 * Merges Next.js LinkProps with HTML anchor attributes.
 */
type LinkAndAnchorProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * For all places you would normally use the NextJS `<Link>` component, import this one instead.
 * This component disables prefetching to reduce the load on the NextJS server and potentially the
 * data provider. This takes the same props as the NextJS `<Link>` component.
 *
 * This component uses an unnamed default export, so you can import it like this:
 *
 * ```ts
 * import Link from "./components/link-no-prefetch";
 * ```
 *
 * This lets you use `<Link>` in your code instead of `<LinkNoPrefetch>`.
 */
export default function LinkNoPrefetch(props: LinkAndAnchorProps) {
  const { children, ...rest } = props;

  return (
    <Link {...rest} prefetch={false}>
      {children}
    </Link>
  );
}

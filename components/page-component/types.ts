// node_modules
import type { ComponentType } from "react";

/**
 * The page plugin components in this directory can take any properties, but they must all be
 * strings because the content creator enters them as text in the editor.
 */
export type PluginProps = Record<string, string>;

/**
 * The type of all page components in this directory. Each page component must be a React component
 * that takes a `PluginProps` object as its props.
 */
export type PluginComponent = ComponentType<PluginProps>;

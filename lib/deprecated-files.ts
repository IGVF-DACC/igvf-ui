// root
import type { FileObject } from "../globals";

/**
 * Use to pass properties to React components that can filter deprecated files, such as the file
 * table and file graph components. The parent component uses both `visible` and `setVisible` to
 * track visibility state itself. If those are not provided, `FileTable` and `FileGraph` use local
 * state, meaning each component owns and updates its own deprecated-file visibility with internal
 * React state.
 *
 * When you don't use `visible` and `setVisible`, the deprecated file visibility defaults to false
 * (i.e. deprecated files are hidden) unless you set `defaultVisible` to true. The label for the
 * control defaults to "Include deprecated files" but you can override it by setting `controlTitle`
 * to a custom string.
 *
 * @property visible - True to show deprecated files, false to hide them
 * @property setVisible - Function to toggle visibility of deprecated files
 * @property defaultVisible - Default deprecated file visibility if external state not provided
 * @property controlTitle - Non-default title for the control that toggles deprecated file
 *                          visibility
 */
export interface DeprecatedFileFilterProps {
  visible?: boolean;
  setVisible?: (visible: boolean) => void;
  defaultVisible?: boolean;
  controlTitle?: string;
}

/**
 * List of statuses considered deprecated. Use a set for O(1) lookups.
 */
export const deprecatedStatuses = ["archived", "revoked", "deleted"] as const;
type DeprecatedStatus = (typeof deprecatedStatuses)[number];
const deprecatedStatusSet: ReadonlySet<DeprecatedStatus> = new Set(
  deprecatedStatuses
);

/**
 * Type guard that checks if a given status is considered deprecated based on the predefined set of
 * deprecated statuses.
 *
 * @param status - Object status to check if it's considered deprecated
 * @returns True if the object status is considered deprecated
 */
export function isDeprecatedStatus(status: string): status is DeprecatedStatus {
  return deprecatedStatusSet.has(status as DeprecatedStatus);
}

/**
 * Remove files with archived, revoked, or deleted statuses if `isDeprecatedVisible` is false. Files
 * without a status get filtered out as well. If `isDeprecatedVisible` is true, all files get
 * included regardless of status.
 *
 * @param nativeFiles - Native file objects to filter
 * @param isDeprecatedVisible - True to include deprecated files in the graph
 * @returns Filtered array of file objects
 */
export function trimDeprecatedFiles(
  nativeFiles: FileObject[],
  isDeprecatedVisible: boolean
): FileObject[] {
  return isDeprecatedVisible
    ? nativeFiles
    : nativeFiles.filter(
        (file) => file.status && !isDeprecatedStatus(file.status)
      );
}

/**
 * Resolves the properties for tracking deprecated file visibility and control title, using external
 * properties if provided, or falling back to local state management if not.
 *
 * Local state here means the component keeps its own `visible` value (for example with `useState`)
 * instead of receiving a shared value from a parent. Use `externalDeprecated` when a parent
 * component should own deprecated-file visibility state for one or more child components. This
 * keeps the toggle and file visibility synchronized across views (for example, a table and graph
 * shown together), while still allowing local state when shared control is not needed.
 *
 * @param fallbackDeprecated - Fallback local properties for deprecated state and title
 * @param [externalDeprecated] - Parent-provided deprecated visibility state and control metadata
 * @returns An object containing the resolved properties for tracking deprecated state and title.
 */
export function resolveDeprecatedFileProps(
  fallbackDeprecated: DeprecatedFileFilterProps,
  externalDeprecated?: DeprecatedFileFilterProps
): DeprecatedFileFilterProps {
  if (externalDeprecated) {
    return {
      visible: externalDeprecated.visible ?? fallbackDeprecated.visible,
      setVisible:
        externalDeprecated.setVisible ?? fallbackDeprecated.setVisible,
      defaultVisible:
        externalDeprecated.defaultVisible ?? fallbackDeprecated.defaultVisible,
      controlTitle:
        externalDeprecated.controlTitle ??
        fallbackDeprecated.controlTitle ??
        "Include deprecated files",
    };
  }

  // Without external overrides, return the fallback properties unchanged.
  return fallbackDeprecated;
}

/**
 * Computes the files to display and whether to show the deprecated-files toggle.
 *
 * @param files - All files we could possibly display
 * @param deprecated - State and title for a deprecated file visibility control
 * @returns Object containing files that should be visible based on the deprecated visibility
 *          state and a boolean indicating whether the deprecated toggle should be shown
 */
export function computeFileDisplayData(
  files: FileObject[],
  deprecated: DeprecatedFileFilterProps
): {
  visibleFiles: FileObject[];
  showDeprecatedToggle: boolean;
} {
  // If the user has chosen to show deprecated files, include all files.
  if (deprecated.visible) {
    return {
      visibleFiles: files,
      showDeprecatedToggle: files.some((file) =>
        isDeprecatedStatus(file.status)
      ),
    };
  }

  // Otherwise, filter out deprecated files and determine if the toggle should be shown based on
  // whether any deprecated files were filtered out.
  const nonDeprecatedFiles = files.filter(
    (file) => !isDeprecatedStatus(file.status)
  );
  return {
    visibleFiles: nonDeprecatedFiles,
    showDeprecatedToggle: nonDeprecatedFiles.length < files.length,
  };
}

/**
 * Returns a query parameter string to filter for or against deprecated statuses based on the provided
 * operator.
 *
 * @param operator - Either = or !=; != is default
 * @returns Query parameter string to filter for or against deprecated statuses
 */
export function deprecatedStatusQueryParam(
  operator: "!=" | "=" = "!="
): string {
  return deprecatedStatuses
    .map((s) => `status${operator}${encodeURIComponent(s)}`)
    .join("&");
}

/**
 * Use this in components with a deprecated file filter control, like `<FileGraph>` and
 * `<FileTable>`. Pass the `hasDeprecatedOption` and `externalDeprecated` props, and this function
 * returns the default visibility to use for local deprecated visibility state.
 *
 * You should pass `externalDeprecated` when the parent needs to define the initial value or share
 * visibility behavior across sibling components. If omitted, each component falls back to its own
 * local default behavior, where that component alone controls deprecated visibility.
 *
 * @param hasDeprecatedOption - Pass the `hasDeprecatedOption` property
 * @param externalDeprecated  - Optional parent-owned deprecated visibility defaults and controls
 * @returns Default visibility to use for local deprecated visibility state
 */
export function computeDefaultDeprecatedVisibility(
  hasDeprecatedOption?: boolean,
  externalDeprecated?: DeprecatedFileFilterProps
): boolean {
  return !hasDeprecatedOption || externalDeprecated?.defaultVisible || false;
}

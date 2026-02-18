// root
import type { FileObject } from "../globals";

/**
 * Use to pass properties to React components that can filter deprecated files, such as the file
 * table and file graph components.
 *
 * @property visible - True to show deprecated files, false to hide them
 * @property setVisible - Function to toggle visibility of deprecated files
 * @property controlTitle - Non-default title for the control that toggles deprecated file
 *                          visibility
 */
export interface DeprecatedFileFilterProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  controlTitle?: string;
}

/**
 * List of statuses considered deprecated. A set for O(1) lookups.
 */
const deprecatedStatusSet = new Set(["archived", "revoked", "deleted"]);

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
        (file) => file.status && !deprecatedStatusSet.has(file.status)
      );
}

/**
 * Resolves the properties for tracking deprecated file visibility and control title, using external
 * properties if provided, or falling back to local state management if not. This allows components
 * to either manage their own deprecated file state or receive it from a parent component, while
 * ensuring consistent control titles and behavior.
 *
 * @param externalDeprecated - External properties for tracking deprecated state and title
 * @param localDeprecated - Local properties for tracking deprecated state and title
 * @returns An object containing the resolved properties for tracking deprecated state and title.
 */
export function resolveDeprecatedFileProps(
  externalDeprecated?: DeprecatedFileFilterProps,
  localDeprecated = {
    deprecatedVisible: false,
    setDeprecatedVisible: () => {},
  }
): DeprecatedFileFilterProps {
  if (externalDeprecated) {
    return {
      visible: externalDeprecated.visible,
      setVisible: externalDeprecated.setVisible,
      controlTitle:
        externalDeprecated.controlTitle || "Include deprecated files",
    };
  }

  // Return local state and default title.
  return {
    visible: localDeprecated.deprecatedVisible,
    setVisible: localDeprecated.setDeprecatedVisible,
    controlTitle: "Include deprecated files",
  };
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
        deprecatedStatusSet.has(file.status)
      ),
    };
  }

  // Otherwise, filter out deprecated files and determine if the toggle should be shown based on
  // whether any deprecated files were filtered out.
  const nonDeprecatedFiles = files.filter(
    (file) => !deprecatedStatusSet.has(file.status)
  );
  return {
    visibleFiles: nonDeprecatedFiles,
    showDeprecatedToggle: nonDeprecatedFiles.length < files.length,
  };
}

// root
import { FileObject } from "../globals.d";

/**
 * Display the checkfiles version of a file, linked to the corresponding GitHub checkfiles release
 * page, or the GitHub checkfiles release root page if the version is not available.
 * @param file - File object that might contain a checkfiles version
 */
export function CheckfilesVersion({ file }: { file: FileObject }) {
  const className =
    "border-checkfiles-version bg-checkfiles-version inline-block border px-1 text-xs font-semibold text-schema-version";

  if (file.checkfiles_version) {
    return (
      <a
        href={`https://github.com/IGVF-DACC/checkfiles/releases/tag/${file.checkfiles_version}`}
        className={`${className} rounded-xs no-underline`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {file.checkfiles_version}
      </a>
    );
  }

  if (file.upload_status === "validation exempted") {
    return <div className={className}>No version due to exemption</div>;
  }

  if (
    file.upload_status === "validated" ||
    file.upload_status === "invalidated"
  ) {
    return (
      <a
        href="https://github.com/IGVF-DACC/checkfiles/tags"
        className={`${className} rounded-xs no-underline`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Legacy version of checkfiles
      </a>
    );
  }

  // Show nothing for file that are not validated, invalidated, or exempted.
}

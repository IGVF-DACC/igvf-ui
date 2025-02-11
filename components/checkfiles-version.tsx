// node_modules
import Link from "next/link";
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
      <Link
        href={`https://github.com/IGVF-DACC/checkfiles/releases/tag/${file.checkfiles_version}`}
        className={`${className} rounded-sm no-underline`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {file.checkfiles_version}
      </Link>
    );
  }

  if (file.upload_status === "validation exempted") {
    return <div className={className}>No version due to exemption</div>;
  }

  return (
    <Link
      href="https://github.com/IGVF-DACC/checkfiles/tags"
      className={`${className} rounded-sm no-underline`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Legacy version of checkfiles
    </Link>
  );
}

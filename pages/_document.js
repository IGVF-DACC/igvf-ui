// node_modules
import { Html, Head, Main, NextScript } from "next/document";
import { DropdownPortalRoot } from "../components/dropdown";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-background text-black dark:text-white">
        <Main />
        <NextScript />
        <DropdownPortalRoot />
      </body>
    </Html>
  );
}

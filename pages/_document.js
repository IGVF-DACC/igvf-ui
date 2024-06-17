// node_modules
import { Html, Head, Main, NextScript } from "next/document";
// components
import { DropdownPortalRoot } from "../components/dropdown";
import { TooltipPortalRoot } from "../components/tooltip";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-background text-black dark:text-white">
        <Main />
        <NextScript />
        <DropdownPortalRoot />
        <TooltipPortalRoot />
      </body>
    </Html>
  );
}

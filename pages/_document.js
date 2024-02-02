// node_modules
import { Html, Head, Main, NextScript } from "next/document";
import { DropdownPortalRoot } from "../components/dropdown";
import { TooltipPortalRoot } from "../components/tooltip";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-background">
        <Main />
        <NextScript />
        <DropdownPortalRoot />
        <TooltipPortalRoot />
      </body>
    </Html>
  );
}

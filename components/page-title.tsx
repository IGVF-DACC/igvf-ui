// node_modules
import { useContext } from "react";
// components
import GlobalContext from "./global-context";
import { SecDir, type SectionList } from "./section-directory";

/**
 * Show a standard page title for the top of any page as well as the section directory menu.
 * Usually you don't need to provide `pageTitle` because this gets the page title from the global
 * context, which in turn gets the title from the page's `getServerSideProps()`. But in cases where
 * the Next.js server can't provide the title, the page's default component can pass a `pageTitle`
 * prop to this component to set the title.
 * @param pageTitle - Title of page's <h1> element; either text or a React element
 * @param sections - Section information for the page; used in the section directory
 * @param className - Additional Tailwind CSS classes to apply to the title wrapper div
 */
export default function PageTitle({
  pageTitle,
  sections,
  className = "",
  children,
}: {
  pageTitle?: string | React.ReactElement;
  sections?: SectionList;
  className?: string;
  children?: React.ReactNode;
}) {
  const { page } = useContext(GlobalContext);
  const title = pageTitle || page?.title || "";

  return (
    <div
      className={`border-data-border sticky top-0 z-20 mb-0.5 border-b ${className}`}
    >
      <div className="bg-background flex items-end justify-between gap-2">
        <h1 className="text-3xl font-medium text-gray-700 dark:text-gray-300">
          {title || "Content"}
        </h1>
        {children}
        {sections && <SecDir sections={sections} />}
      </div>
    </div>
  );
}
